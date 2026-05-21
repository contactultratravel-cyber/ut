import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationsApi } from '../../api/invitations.api';
import { Invitation } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import InvitationForm from './InvitationForm';

function fmt(n: number) { return Number(n).toLocaleString('fr-DZ'); }
function fmtDate(d?: string) {
  if (!d) return '—';
  const date = new Date(d.includes('T') ? d : d + 'T12:00:00');
  return date.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function InvitationsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing]       = useState<Invitation | null>(null);
  const [search, setSearch]         = useState('');
  const [filterYear,  setFilterYear]  = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState<number | null>(null);

  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['invitations'] });

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: () => invitationsApi.list().then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: invitationsApi.create,
    onSuccess: () => { invalidate(); setShowCreate(false); },
  });

  const updateMut = useMutation({
    mutationFn: (d: { id: string; data: Partial<Invitation> }) => invitationsApi.update(d.id, d.data),
    onSuccess: () => { invalidate(); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: invitationsApi.delete,
    onSuccess: invalidate,
  });

  const filtered = invitations
    .filter(inv => {
      if (!search) return true;
      return inv.nom_invitation.toLowerCase().includes(search.toLowerCase()) ||
             inv.pays.toLowerCase().includes(search.toLowerCase());
    })
    .filter(inv => {
      if (filterMonth === null) return true;
      if (!inv.date_invitation) return false;
      const d = new Date(inv.date_invitation.includes('T') ? inv.date_invitation : inv.date_invitation + 'T12:00:00');
      return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
    });

  // Count invitations per month for the current year
  const countByMonth = MONTHS.map((_, i) =>
    invitations.filter(inv => {
      if (!inv.date_invitation) return false;
      const d = new Date(inv.date_invitation.includes('T') ? inv.date_invitation : inv.date_invitation + 'T12:00:00');
      return d.getMonth() === i && d.getFullYear() === filterYear;
    }).length
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title">Invitations</h1>
          <p className="page-subtitle">{invitations.length} invitation(s)</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle invitation
        </Button>
      </div>

      {/* Month calendar filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        {/* Year navigation */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setFilterYear(y => y - 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-bold text-gray-800">{filterYear}</span>
          <button onClick={() => setFilterYear(y => y + 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Month buttons */}
        <div className="grid grid-cols-6 gap-2">
          {MONTHS.map((label, i) => {
            const isActive  = filterMonth === i;
            const hasItems  = countByMonth[i] > 0;
            return (
              <button key={i}
                onClick={() => setFilterMonth(isActive ? null : i)}
                className={[
                  'relative py-2 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : hasItems
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100',
                ].join(' ')}>
                {label}
                {hasItems && (
                  <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold
                    ${isActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                    {countByMonth[i]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filterMonth !== null && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-blue-700 font-medium">
              Filtré : {MONTHS[filterMonth]} {filterYear} — {filtered.length} résultat(s)
            </span>
            <button onClick={() => setFilterMonth(null)}
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              Tout afficher
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex justify-end mb-4">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher nom, pays..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Aucune invitation trouvée.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["Nom d'invitation", 'Pays', 'Date', 'Prix invitation', 'Prix B2C', 'Lien', 'Note', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900 text-sm">{inv.nom_invitation}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{inv.pays}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(inv.date_invitation)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{fmt(inv.prix_invitation)} DZD</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-700">{fmt(inv.prix_b2c)} DZD</td>
                  <td className="px-4 py-3 text-sm">
                    {inv.link
                      ? <a href={inv.link} target="_blank" rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate max-w-[140px] block">Ouvrir</a>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-[160px]">
                    <span className="truncate block" title={inv.note ?? ''}>{inv.note || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(inv)}>Modifier</Button>
                      <Button size="sm" variant="danger" loading={deleteMut.isPending}
                        onClick={() => confirm('Supprimer cette invitation ?') && deleteMut.mutate(inv.id)}>
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

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle invitation" size="lg">
        <InvitationForm loading={createMut.isPending}
          onSubmit={d => createMut.mutateAsync(d as Parameters<typeof invitationsApi.create>[0])} />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier l'invitation" size="lg">
        {editing && (
          <InvitationForm invitation={editing} loading={updateMut.isPending}
            onSubmit={d => updateMut.mutateAsync({ id: editing.id, data: d as Partial<Invitation> })} />
        )}
      </Modal>
    </div>
  );
}
