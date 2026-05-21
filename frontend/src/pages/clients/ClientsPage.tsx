import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../../api/clients.api';
import { Client, ClientStatus } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import ClientForm from './ClientForm';
import api from '../../api/axios';

const TABS: { label: string; value: string; color: string; badge: string }[] = [
  { label: 'Tous',     value: '',          color: 'text-gray-700  bg-white',           badge: 'bg-gray-100  text-gray-600'  },
  { label: 'Nouveaux', value: 'NEW',       color: 'text-blue-700  bg-blue-50',         badge: 'bg-blue-100  text-blue-700'  },
  { label: 'En cours', value: 'PROCESSING',color: 'text-amber-700 bg-amber-50',        badge: 'bg-amber-100 text-amber-700' },
  { label: 'Terminés', value: 'COMPLETED', color: 'text-green-700 bg-green-50',        badge: 'bg-green-100 text-green-700' },
  { label: 'Livrés',   value: 'DELIVERED', color: 'text-purple-700 bg-purple-50',      badge: 'bg-purple-100 text-purple-700'},
];

function fmt(n: number) { return Number(n).toLocaleString('fr-DZ'); }
function fmtDate(d?: string) {
  if (!d) return '—';
  // "YYYY-MM-DD" → add T12:00:00 to avoid UTC day-shift
  // "YYYY-MM-DD HH:MM:SS" (SQLite) → replace space with T
  const normalized = d.length === 10 ? d + 'T12:00:00' : d.replace(' ', 'T');
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ClientDetailsModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const remaining = Number(client.total_price) - Number(client.amount_paid);

  function downloadDoc(type: 'invoice' | 'contract' | 'voucher') {
    api.get(`/documents/clients/${client.id}/${type}`, { responseType: 'blob' })
      .then(({ data, headers }) => {
        const url = URL.createObjectURL(new Blob([data as BlobPart]));
        const a = document.createElement('a');
        a.href = url;
        const cd = headers['content-disposition'] as string ?? '';
        a.download = cd.match(/filename="(.+?)"/)?.[1] ?? `${type}-${client.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  return (
    <Modal open onClose={onClose} title="Détails du client" size="lg">
      <div className="space-y-5">
        {/* Status */}
        <div className="flex items-center gap-3">
          <StatusBadge status={client.status} />
          {client.appointment_status && <StatusBadge status={client.appointment_status} />}
        </div>

        {/* Personal info */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Informations personnelles</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Row label="Prénom"       value={client.first_name} />
            <Row label="Nom"          value={client.last_name} />
            <Row label="Téléphone"    value={client.phone} />
            <Row label="Email"        value={client.email} />
            {client.whatsapp && (
              <div className="flex gap-2 text-sm col-span-2">
                <span className="text-gray-500 w-28 shrink-0">WhatsApp :</span>
                <a href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="text-green-600 font-medium hover:underline">{client.whatsapp}</a>
              </div>
            )}
            <Row label="Profession"   value={client.job} />
            <Row label="Nom invitant" value={client.invitation_name} />
          </div>
        </div>

        {/* Visa info */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Informations visa</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Row label="Pays"         value={client.country} />
            <Row label="Type de visa" value={client.visa_type} />
            {client.route_code && <Row label="Code de route" value={client.route_code} />}
          </div>
        </div>

        {/* Appointment — always shown when status is set */}
        {(client.appointment_date || client.appointment_status) && (
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rendez-vous</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Row label="Date RDV"   value={fmtDate(client.appointment_date)} />
              <Row label="Statut RDV" value={
                client.appointment_status === 'CONFIRMED' ? 'Confirmé' :
                client.appointment_status === 'PENDING'   ? 'En attente' : '—'
              } />
            </div>
          </div>
        )}

        {/* Payment */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Paiement</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="font-bold text-gray-900">{fmt(client.total_price)} DZD</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Payé</p>
              <p className="font-bold text-green-700">{fmt(client.amount_paid)} DZD</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${remaining > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
              <p className="text-xs text-gray-500 mb-1">Reste</p>
              <p className={`font-bold ${remaining > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                {fmt(remaining)} DZD
              </p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="text-xs text-gray-400 flex gap-6 pt-1 border-t border-gray-100">
          <span>Créé le : {fmtDate(client.created_at)}</span>
          <span>Modifié le : {fmtDate(client.updated_at)}</span>
        </div>

        {/* Documents */}
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={() => downloadDoc('invoice')}>📄 Facture</Button>
          <Button size="sm" variant="outline" onClick={() => downloadDoc('contract')}>📝 Contrat</Button>
          <Button size="sm" variant="outline" onClick={() => downloadDoc('voucher')}>🎫 Bon</Button>
        </div>
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 w-28 shrink-0">{label} :</span>
      <span className="text-gray-900 font-medium">{value || '—'}</span>
    </div>
  );
}

export default function ClientsPage() {
  const [tab, setTab]               = useState('');
  const [search, setSearch]         = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing]       = useState<Client | null>(null);
  const [details, setDetails]       = useState<Client | null>(null);
  const [apptClient,  setApptClient]  = useState<Client | null>(null);
  const [apptDate,    setApptDate]    = useState('');
  const [apptStatus,  setApptStatus]  = useState('PENDING');
  const [step1Client, setStep1Client] = useState<Client | null>(null);
  const [s1Date,      setS1Date]      = useState('');
  const [s1Status,    setS1Status]    = useState('PENDING');

  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['clients'] });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list().then(r => r.data),
  });

  const createMut  = useMutation({ mutationFn: clientsApi.create,  onSuccess: () => { invalidate(); setShowCreate(false); } });
  const updateMut  = useMutation({ mutationFn: (d: { id: string; data: Partial<Client> }) => clientsApi.update(d.id, d.data), onSuccess: () => { invalidate(); setEditing(null); } });
  const step1Mut   = useMutation({
    mutationFn: (id: string) => clientsApi.validateStep1(id, s1Date || undefined, s1Status),
    onSuccess: () => { invalidate(); setStep1Client(null); },
  });
  const finalMut   = useMutation({ mutationFn: (id: string) => clientsApi.finalValidation(id), onSuccess: invalidate });
  const deliverMut = useMutation({ mutationFn: (id: string) => clientsApi.deliver(id), onSuccess: invalidate });
  const apptMut    = useMutation({ mutationFn: (id: string) => clientsApi.updateAppointment(id, { appointmentDate: apptDate || undefined, appointmentStatus: apptStatus }), onSuccess: () => { invalidate(); setApptClient(null); } });
  const deleteMut  = useMutation({ mutationFn: clientsApi.delete, onSuccess: invalidate });

  const urgentAppts = clients.filter(c => {
    if (c.status !== 'PROCESSING' || !c.appointment_date) return false;
    const apptMs = new Date(c.appointment_date.includes('T') ? c.appointment_date : c.appointment_date + 'T12:00:00').getTime();
    const nowMs  = Date.now();
    return apptMs >= nowMs && apptMs - nowMs <= 3 * 24 * 60 * 60 * 1000;
  });

  const filtered = clients
    .filter(c => !tab || c.status === tab)
    .filter(c => !search || `${c.first_name} ${c.last_name} ${c.phone}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.appointment_date && b.appointment_date)
        return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
      if (a.appointment_date) return -1;
      if (b.appointment_date) return 1;
      return 0;
    });

  const counts = {
    '':           clients.length,
    NEW:          clients.filter(c => c.status === 'NEW').length,
    PROCESSING:   clients.filter(c => c.status === 'PROCESSING').length,
    COMPLETED:    clients.filter(c => c.status === 'COMPLETED').length,
    DELIVERED:    clients.filter(c => c.status === 'DELIVERED').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{clients.length} client(s) enregistré(s)</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau client
        </Button>
      </div>

      {/* Urgent appointment alerts */}
      {urgentAppts.length > 0 && (
        <div className="mb-4 space-y-2">
          {urgentAppts.map(c => {
            const apptMs   = new Date(c.appointment_date!.includes('T') ? c.appointment_date! : c.appointment_date! + 'T12:00:00').getTime();
            const diffDays = Math.ceil((apptMs - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={c.id} className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span className="text-sm text-orange-800 font-medium">
                  Alerte : Le rendez-vous de <strong>{c.first_name} {c.last_name}</strong> est
                  {diffDays === 0 ? " aujourd'hui" : diffDays === 1 ? ' demain' : ` dans ${diffDays} jour(s)`}
                  {' '}({fmtDate(c.appointment_date)}) — à finaliser au plus vite.
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {TABS.map(t => (
            <button key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${tab === t.value ? `${t.color} shadow` : 'text-gray-500 hover:text-gray-800 bg-transparent'}`}>
              {t.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t.value ? t.badge : 'bg-gray-200 text-gray-500'}`}>
                {counts[t.value as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher nom, téléphone..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Aucun client trouvé.</div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr className="border-b-2 border-gray-200">
                {['Client', 'Téléphone', 'WhatsApp', 'Statut', 'Date RDV', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => (
                <tr key={client.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                  {/* Client */}
                  <td className="px-3 py-2.5 border-r border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm">{client.first_name} {client.last_name}</p>
                    {client.email && <p className="text-xs text-gray-400">{client.email}</p>}
                  </td>
                  {/* Tel */}
                  <td className="px-3 py-2.5 border-r border-gray-100 text-sm text-gray-700 whitespace-nowrap">{client.phone}</td>
                  {/* WhatsApp */}
                  <td className="px-3 py-2.5 border-r border-gray-100">
                    {client.whatsapp ? (
                      <a href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium whitespace-nowrap">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {client.whatsapp}
                      </a>
                    ) : <span className="text-gray-300 text-sm">—</span>}
                  </td>
                  {/* Statut */}
                  <td className="px-3 py-2.5 border-r border-gray-100"><StatusBadge status={client.status} /></td>
                  {/* Date RDV */}
                  <td className="px-3 py-2.5 border-r border-gray-100 text-xs font-medium whitespace-nowrap">
                    {client.appointment_date
                      ? <span className="text-blue-700">{fmtDate(client.appointment_date)}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  {/* Actions */}
                  <td className="px-3 py-2.5">
                    <div className="flex flex-nowrap gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => setDetails(client)}>Détails</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(client)}>Modifier</Button>
                      {client.status === 'NEW' && (
                        <Button size="sm" variant="secondary"
                          onClick={() => { setStep1Client(client); setS1Date(''); setS1Status('PENDING'); }}>
                          → En cours
                        </Button>
                      )}
                      {client.status === 'PROCESSING' && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => { setApptClient(client); setApptDate(client.appointment_date?.slice(0,10) ?? ''); setApptStatus(client.appointment_status ?? 'PENDING'); }}>
                            RDV
                          </Button>
                          <Button size="sm" variant="primary" loading={finalMut.isPending}
                            onClick={() => finalMut.mutate(client.id)}>
                            → Terminé
                          </Button>
                        </>
                      )}
                      {client.status === 'COMPLETED' && (
                        <Button size="sm" variant="primary" loading={deliverMut.isPending}
                          onClick={() => deliverMut.mutate(client.id)}
                          className="bg-purple-600 hover:bg-purple-700">
                          → Livré
                        </Button>
                      )}
                      <Button size="sm" variant="danger" loading={deleteMut.isPending}
                        onClick={() => confirm('Supprimer ce client ?') && deleteMut.mutate(client.id)}>
                        ✕
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details modal */}
      {details && <ClientDetailsModal client={details} onClose={() => setDetails(null)} />}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouveau client" size="lg">
        <ClientForm loading={createMut.isPending}
          onSubmit={d => createMut.mutateAsync(d as Parameters<typeof clientsApi.create>[0])} />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier le client" size="lg">
        {editing && (
          <ClientForm client={editing} loading={updateMut.isPending}
            onSubmit={d => updateMut.mutateAsync({ id: editing.id, data: d as Partial<Client> })} />
        )}
      </Modal>

      {/* Appointment update modal (PROCESSING clients) */}
      <Modal open={!!apptClient} onClose={() => setApptClient(null)} title="Mettre à jour le rendez-vous">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date du rendez-vous</label>
            <input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut RDV</label>
            <select value={apptStatus} onChange={e => setApptStatus(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="PENDING">En attente</option>
              <option value="CONFIRMED">Confirmé</option>
            </select>
          </div>
          <Button loading={apptMut.isPending} onClick={() => apptMut.mutate(apptClient!.id)} className="w-full">
            Enregistrer
          </Button>
        </div>
      </Modal>

      {/* Step1 modal — NEW → PROCESSING with appointment */}
      <Modal open={!!step1Client} onClose={() => setStep1Client(null)}
        title={`Passer "${step1Client?.first_name} ${step1Client?.last_name}" en cours`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Sélectionnez la date et le statut du rendez-vous pour ce client.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date du rendez-vous *</label>
            <input type="date" value={s1Date} onChange={e => setS1Date(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut du rendez-vous</label>
            <select value={s1Status} onChange={e => setS1Status(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="PENDING">En attente</option>
              <option value="CONFIRMED">Confirmé</option>
            </select>
          </div>
          <Button loading={step1Mut.isPending}
            onClick={() => step1Mut.mutate(step1Client!.id)}
            className="w-full">
            Confirmer → En cours
          </Button>
        </div>
      </Modal>
    </div>
  );
}
