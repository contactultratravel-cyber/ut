import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { dossiersApi } from '../../api/dossiers.api';
import { Dossier, COUNTRIES } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

function fmt(n: number) { return Number(n).toLocaleString('fr-DZ'); }
function fmtDate(d?: string) {
  if (!d) return '—';
  const normalized = d.length === 10 ? d + 'T12:00:00' : d.replace(' ', 'T');
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

type FormData = {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  total_price: number;
  note: string;
};

function DossierForm({ dossier, onSubmit, loading }: {
  dossier?: Dossier;
  onSubmit: (data: FormData) => Promise<unknown>;
  loading?: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: dossier ? {
      first_name:  dossier.first_name,
      last_name:   dossier.last_name,
      phone:       dossier.phone,
      country:     dossier.country,
      total_price: dossier.total_price,
      note:        dossier.note ?? '',
    } : { total_price: 0 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Prénom *" error={errors.first_name?.message}
          {...register('first_name', { required: 'Requis' })} />
        <Input label="Nom *" error={errors.last_name?.message}
          {...register('last_name', { required: 'Requis' })} />
      </div>
      <Input label="Téléphone *" error={errors.phone?.message}
        {...register('phone', { required: 'Requis' })} />
      <Select
        label="Pays *"
        options={COUNTRIES.map(c => ({ value: c, label: c }))}
        placeholder="Sélectionner un pays"
        error={errors.country?.message}
        {...register('country', { required: 'Requis' })}
      />
      <Input
        label="Prix total (DA) *"
        type="number"
        min="0"
        step="0.01"
        error={errors.total_price?.message}
        {...register('total_price', { required: 'Requis', min: { value: 0, message: 'Min 0' } })}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <textarea rows={2} {...register('note')}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Remarques..." />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {dossier ? 'Enregistrer' : 'Créer le dossier'}
        </Button>
      </div>
    </form>
  );
}

export default function DossiersPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing]       = useState<Dossier | null>(null);
  const [search, setSearch]         = useState('');

  const { data: dossiers = [], isLoading } = useQuery({
    queryKey: ['dossiers'],
    queryFn: () => dossiersApi.list().then(r => r.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['dossiers'] });

  const createMut = useMutation({
    mutationFn: (d: FormData) => dossiersApi.create({
      first_name:  d.first_name,
      last_name:   d.last_name,
      phone:       d.phone,
      country:     d.country,
      total_price: Number(d.total_price),
      note:        d.note || undefined,
    }).then(r => r.data),
    onSuccess: () => { invalidate(); setShowCreate(false); },
  });

  const updateMut = useMutation({
    mutationFn: (d: FormData) => dossiersApi.update(editing!.id, {
      first_name:  d.first_name,
      last_name:   d.last_name,
      phone:       d.phone,
      country:     d.country,
      total_price: Number(d.total_price),
      note:        d.note || undefined,
    }).then(r => r.data),
    onSuccess: () => { invalidate(); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: dossiersApi.delete,
    onSuccess: invalidate,
  });

  const filtered = dossiers.filter(d =>
    !search || `${d.first_name} ${d.last_name} ${d.phone} ${d.country}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = dossiers.reduce((s, d) => s + Number(d.total_price), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title">Traitement de dossiers</h1>
          <p className="page-subtitle">{dossiers.length} dossier(s) · Total : {fmt(totalRevenue)} DA</p>
        </div>
        <div className="flex gap-3">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Button onClick={() => setShowCreate(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau dossier
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Aucun dossier trouvé.</div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr className="border-b-2 border-gray-200">
                {['Client', 'Téléphone', 'Pays', 'Prix total', 'Note', 'Créé le', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                  <td className="px-3 py-2.5 border-r border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm whitespace-nowrap">{d.first_name} {d.last_name}</p>
                  </td>
                  <td className="px-3 py-2.5 border-r border-gray-100 text-sm text-gray-600 whitespace-nowrap">{d.phone}</td>
                  <td className="px-3 py-2.5 border-r border-gray-100 text-sm text-gray-900">{d.country}</td>
                  <td className="px-3 py-2.5 border-r border-gray-100 text-sm font-medium text-gray-900 whitespace-nowrap">{fmt(d.total_price)} DA</td>
                  <td className="px-3 py-2.5 border-r border-gray-100 text-sm text-gray-500 max-w-xs truncate">{d.note || '—'}</td>
                  <td className="px-3 py-2.5 border-r border-gray-100 text-xs text-gray-400 whitespace-nowrap">{fmtDate(d.created_at)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1.5 flex-nowrap">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(d)}>Modifier</Button>
                      <Button size="sm" variant="danger" loading={deleteMut.isPending}
                        onClick={() => confirm('Supprimer ce dossier ?') && deleteMut.mutate(d.id)}>
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouveau dossier">
        <DossierForm loading={createMut.isPending}
          onSubmit={d => createMut.mutateAsync(d)} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier le dossier">
        {editing && (
          <DossierForm dossier={editing} loading={updateMut.isPending}
            onSubmit={d => updateMut.mutateAsync(d)} />
        )}
      </Modal>
    </div>
  );
}
