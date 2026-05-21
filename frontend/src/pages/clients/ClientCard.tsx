import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Client } from '../../types';
import { clientsApi } from '../../api/clients.api';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import ClientForm from './ClientForm';
import api from '../../api/axios';

interface Props {
  client: Client;
}

export default function ClientCard({ client }: Props) {
  const [showEdit, setShowEdit]           = useState(false);
  const [showAppt, setShowAppt]           = useState(false);
  const [apptDate, setApptDate]           = useState('');
  const [apptStatus, setApptStatus]       = useState('PENDING');

  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['clients'] });

  const editMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => clientsApi.update(client.id, data),
    onSuccess: () => { invalidate(); setShowEdit(false); },
  });

  const step1Mut = useMutation({
    mutationFn: () => clientsApi.validateStep1(client.id),
    onSuccess: invalidate,
  });

  const finalMut = useMutation({
    mutationFn: () => clientsApi.finalValidation(client.id),
    onSuccess: invalidate,
  });

  const apptMut = useMutation({
    mutationFn: () => clientsApi.updateAppointment(client.id, {
      appointmentDate: apptDate || undefined,
      appointmentStatus: apptStatus,
    }),
    onSuccess: () => { invalidate(); setShowAppt(false); },
  });

  const deleteMut = useMutation({
    mutationFn: () => clientsApi.delete(client.id),
    onSuccess: invalidate,
  });

  const remaining = Number(client.total_price) - Number(client.amount_paid);

  function downloadDoc(type: 'invoice' | 'contract' | 'voucher') {
    api.get(`/documents/clients/${client.id}/${type}`, { responseType: 'blob' })
      .then(({ data, headers }) => {
        const url = URL.createObjectURL(new Blob([data as BlobPart]));
        const a   = document.createElement('a');
        a.href    = url;
        const cd  = headers['content-disposition'] as string ?? '';
        const fn  = cd.match(/filename="(.+?)"/)?.[1] ?? `${type}-${client.id}.pdf`;
        a.download = fn;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {client.first_name} {client.last_name}
            </p>
            <p className="text-xs text-gray-500">{client.phone}</p>
          </div>
          <StatusBadge status={client.status} />
        </div>

        {/* Details */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-medium w-16 shrink-0">Pays:</span>
            <span>{client.country}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-medium w-16 shrink-0">Visa:</span>
            <span>{client.visa_type}</span>
          </div>
          {client.route_code && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium w-16 shrink-0">Route:</span>
              <span className="font-mono">{client.route_code}</span>
            </div>
          )}
        </div>

        {/* Payment */}
        <div className={`rounded-lg px-3 py-2 text-xs mb-3 ${remaining > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-semibold">{Number(client.total_price).toLocaleString()} DZD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Reste:</span>
            <span className={`font-semibold ${remaining > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
              {remaining.toLocaleString()} DZD
            </span>
          </div>
        </div>

        {/* Appointment (PROCESSING only) */}
        {client.status === 'PROCESSING' && client.appointment_date && (
          <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs mb-3">
            <p className="text-blue-800 font-medium">
              RDV: {new Date(client.appointment_date).toLocaleDateString('fr-DZ')}
            </p>
            <StatusBadge status={client.appointment_status ?? 'PENDING'} />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => setShowEdit(true)}>
            Modifier
          </Button>

          {client.status === 'NEW' && (
            <Button size="sm" variant="outline" loading={step1Mut.isPending}
              onClick={() => step1Mut.mutate()}>
              → En cours
            </Button>
          )}

          {client.status === 'PROCESSING' && (
            <>
              <Button size="sm" variant="outline" onClick={() => setShowAppt(true)}>
                RDV
              </Button>
              <Button size="sm" variant="primary" loading={finalMut.isPending}
                onClick={() => finalMut.mutate()}>
                → Terminé
              </Button>
            </>
          )}

          {/* Documents */}
          <div className="flex gap-1 mt-1 w-full">
            {(['invoice','contract','voucher'] as const).map((type) => (
              <Button key={type} size="sm" variant="secondary" onClick={() => downloadDoc(type)}>
                {type === 'invoice' ? 'Facture' : type === 'contract' ? 'Contrat' : 'Bon'}
              </Button>
            ))}
          </div>

          <Button size="sm" variant="danger" loading={deleteMut.isPending}
            onClick={() => confirm('Supprimer ce client ?') && deleteMut.mutate()}>
            Supprimer
          </Button>
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)}
        title="Modifier le client" size="lg">
        <ClientForm
          client={client}
          loading={editMut.isPending}
          onSubmit={(data) => editMut.mutateAsync(data as Record<string, unknown>)}
        />
      </Modal>

      {/* Appointment modal */}
      <Modal open={showAppt} onClose={() => setShowAppt(false)} title="Mettre à jour le rendez-vous">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date du rendez-vous</label>
            <input type="datetime-local" value={apptDate} onChange={(e) => setApptDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select value={apptStatus} onChange={(e) => setApptStatus(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="PENDING">En attente</option>
              <option value="CONFIRMED">Confirmé</option>
            </select>
          </div>
          <Button loading={apptMut.isPending} onClick={() => apptMut.mutate()} className="w-full">
            Enregistrer
          </Button>
        </div>
      </Modal>
    </>
  );
}
