import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '../../api/tickets.api';
import { Ticket } from '../../types';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import TicketForm from './TicketForm';

type FormData = { clientName: string; phone: string; destination: string; price: number };

export default function TicketsPage() {
  const [showForm, setShowForm]         = useState(false);
  const [editing, setEditing]           = useState<Ticket | null>(null);

  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['tickets'] });

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsApi.list().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data: FormData) => ticketsApi.create(data),
    onSuccess: () => { invalidate(); setShowForm(false); },
  });

  const updateMut = useMutation({
    mutationFn: (data: FormData) => ticketsApi.update(editing!.id, data),
    onSuccess: () => { invalidate(); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => ticketsApi.delete(id),
    onSuccess: invalidate,
  });

  const columns = [
    { key: 'client_name', header: 'Client' },
    { key: 'phone',       header: 'Téléphone' },
    { key: 'destination', header: 'Destination' },
    { key: 'price',       header: 'Prix (DZD)', render: (row: Ticket) =>
      <span className="font-medium">{Number(row.price).toLocaleString()}</span> },
    { key: 'created_at',  header: 'Date', render: (row: Ticket) =>
      new Date(row.created_at).toLocaleDateString('fr-DZ') },
    {
      key: 'actions', header: '', render: (row: Ticket) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(row)}>Modifier</Button>
          <Button size="sm" variant="danger"
            onClick={() => confirm('Supprimer ?') && deleteMut.mutate(row.id)}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  const totalRevenue = tickets.reduce((s, t) => s + Number(t.price), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Billets</h1>
          <p className="page-subtitle">
            {tickets.length} billet(s) — Total: {totalRevenue.toLocaleString()} DZD
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau billet
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={tickets as unknown as Record<string, unknown>[]}
          loading={isLoading}
          emptyMessage="Aucun billet enregistré."
        />
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nouveau billet">
        <TicketForm loading={createMut.isPending} onSubmit={(data) => createMut.mutateAsync(data)} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier le billet">
        {editing && (
          <TicketForm
            ticket={editing}
            loading={updateMut.isPending}
            onSubmit={(data) => updateMut.mutateAsync(data)}
          />
        )}
      </Modal>
    </div>
  );
}
