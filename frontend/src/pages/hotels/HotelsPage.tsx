import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelsApi } from '../../api/hotels.api';
import { Hotel } from '../../types';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import HotelForm from './HotelForm';

type FormData = { clientName: string; phone: string; hotelName: string; price: number };

export default function HotelsPage() {
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Hotel | null>(null);

  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['hotels'] });

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => hotelsApi.list().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data: FormData) => hotelsApi.create(data),
    onSuccess: () => { invalidate(); setShowForm(false); },
  });

  const updateMut = useMutation({
    mutationFn: (data: FormData) => hotelsApi.update(editing!.id, data),
    onSuccess: () => { invalidate(); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => hotelsApi.delete(id),
    onSuccess: invalidate,
  });

  const columns = [
    { key: 'client_name', header: 'Client' },
    { key: 'phone',       header: 'Téléphone' },
    { key: 'hotel_name',  header: 'Hôtel' },
    { key: 'price', header: 'Prix (DZD)', render: (row: Hotel) =>
      <span className="font-medium">{Number(row.price).toLocaleString()}</span> },
    { key: 'created_at', header: 'Date', render: (row: Hotel) =>
      new Date(row.created_at).toLocaleDateString('fr-DZ') },
    {
      key: 'actions', header: '', render: (row: Hotel) => (
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

  const totalRevenue = hotels.reduce((s, h) => s + Number(h.price), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Hôtels</h1>
          <p className="page-subtitle">
            {hotels.length} réservation(s) — Total: {totalRevenue.toLocaleString()} DZD
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle réservation
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={hotels as unknown as Record<string, unknown>[]}
          loading={isLoading}
          emptyMessage="Aucune réservation hôtel enregistrée."
        />
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nouvelle réservation hôtel">
        <HotelForm loading={createMut.isPending} onSubmit={(data) => createMut.mutateAsync(data)} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier la réservation">
        {editing && (
          <HotelForm
            hotel={editing}
            loading={updateMut.isPending}
            onSubmit={(data) => updateMut.mutateAsync(data)}
          />
        )}
      </Modal>
    </div>
  );
}
