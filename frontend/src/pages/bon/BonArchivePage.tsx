import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bonsApi } from '../../api/bons.api';
import { Bon } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

const AGENTS = ['Bilal', 'Riyadh', 'Salah'];

function fmt(n: number) { return Number(n).toLocaleString('fr-DZ'); }
function fmtDate(d?: string) {
  if (!d) return '—';
  const normalized = d.length === 10 ? d + 'T12:00:00' : d.replace(' ', 'T');
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'long', year: 'numeric' });
}

/* ── Print preview overlay ─────────────────────────────────────── */
function PrintPreview({ bon, onClose }: { bon: Bon; onClose: () => void }) {
  const remaining = bon.total - bon.paid;

  return (
    <>
      {/* Overlay (hidden during print) */}
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6 no-print">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 no-print">
            <h2 className="font-semibold text-gray-900">Aperçu du BON</h2>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimer
              </button>
              <button onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors">
                Fermer
              </button>
            </div>
          </div>

          {/* BON receipt */}
          <div className="p-6">
            <div id="bon-print" className="bg-white border-2 border-gray-200 rounded-2xl p-8"
              style={{ fontFamily: 'Arial, sans-serif' }}>

              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-800">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-wide">Ultra Travel</h2>
                  <p className="text-sm text-gray-500">Agence de voyage</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Reçu de paiement</p>
                  <p className="text-sm font-semibold text-gray-700">{fmtDate(bon.date)}</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <span className="inline-block bg-blue-700 text-white text-sm font-bold uppercase tracking-widest px-6 py-2 rounded-full">
                  BON DE PAIEMENT
                </span>
              </div>

              {/* Client info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Informations client</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Nom complet :</span>
                    <span className="ml-2 font-semibold text-gray-900">{bon.first_name} {bon.last_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Téléphone :</span>
                    <span className="ml-2 font-semibold text-gray-900">{bon.phone || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Motif */}
              {bon.motif && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Motif / Service</p>
                  <p className="text-sm font-semibold text-blue-900">{bon.motif}</p>
                </div>
              )}

              {/* Amounts */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="border border-gray-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Prix total</p>
                  <p className="text-lg font-bold text-gray-900">{fmt(bon.total)} <span className="text-sm font-normal">DA</span></p>
                </div>
                <div className="border border-green-200 bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Versé</p>
                  <p className="text-lg font-bold text-green-700">{fmt(bon.paid)} <span className="text-sm font-normal">DA</span></p>
                </div>
                <div className={`border rounded-xl p-3 text-center ${remaining > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Reste à payer</p>
                  <p className={`text-lg font-bold ${remaining > 0 ? 'text-orange-600' : 'text-green-700'}`}>
                    {fmt(remaining)} <span className="text-sm font-normal">DA</span>
                  </p>
                </div>
              </div>

              {/* Agent + Stamp */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Agent responsable</p>
                  <p className="text-base font-bold text-gray-900">{bon.agent || '—'}</p>
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400">Signature</p>
                    <div className="h-10" />
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Cachet de l'agence</p>
                  <div className="h-16 border border-dashed border-gray-300 rounded-lg" />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">Ce document constitue un reçu officiel de l'agence Ultra Travel</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #bon-print, #bon-print * { visibility: visible; }
          #bon-print { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  );
}

/* ── Edit modal ────────────────────────────────────────────────── */
function EditBonModal({ bon, onClose }: { bon: Bon; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    date:       bon.date,
    first_name: bon.first_name,
    last_name:  bon.last_name,
    phone:      bon.phone ?? '',
    motif:      bon.motif ?? '',
    total:      String(bon.total),
    paid:       String(bon.paid),
    agent:      bon.agent ?? 'Bilal',
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  const total     = Number(form.total) || 0;
  const paid      = Number(form.paid)  || 0;
  const remaining = total - paid;

  const updateMut = useMutation({
    mutationFn: () => bonsApi.update(bon.id, {
      date:       form.date,
      first_name: form.first_name,
      last_name:  form.last_name,
      phone:      form.phone || undefined,
      motif:      form.motif || undefined,
      total,
      paid,
      agent:      form.agent,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bons'] }); onClose(); },
  });

  const inputCls = 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <Modal open onClose={onClose} title="Modifier le BON">
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Date</label>
          <input value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Prénom *</label>
            <input value={form.first_name} onChange={e => set('first_name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Nom *</label>
            <input value={form.last_name} onChange={e => set('last_name', e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Téléphone</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Motif / Service</label>
          <textarea rows={2} value={form.motif} onChange={e => set('motif', e.target.value)} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Prix total (DA)</label>
            <input type="number" min="0" value={form.total} onChange={e => set('total', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Montant versé (DA)</label>
            <input type="number" min="0" value={form.paid} onChange={e => set('paid', e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className={`rounded-xl p-3 text-center ${remaining > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
          <p className="text-xs text-gray-500 mb-0.5">Reste à payer</p>
          <p className={`text-lg font-bold ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {fmt(remaining)} DA
          </p>
        </div>
        <div>
          <label className={labelCls}>Agent</label>
          <select value={form.agent} onChange={e => set('agent', e.target.value)} className={inputCls}>
            {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <Button loading={updateMut.isPending} onClick={() => updateMut.mutate()} className="w-full">
          Enregistrer les modifications
        </Button>
      </div>
    </Modal>
  );
}

/* ── Main page ─────────────────────────────────────────────────── */
export default function BonArchivePage() {
  const qc = useQueryClient();
  const [editing,  setEditing]  = useState<Bon | null>(null);
  const [printing, setPrinting] = useState<Bon | null>(null);
  const [search,   setSearch]   = useState('');

  const { data: bons = [], isLoading } = useQuery({
    queryKey: ['bons'],
    queryFn: () => bonsApi.list().then(r => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: bonsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bons'] }),
  });

  const filtered = bons.filter(b =>
    !search || `${b.first_name} ${b.last_name} ${b.phone ?? ''} ${b.motif ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title">Archive des BONs</h1>
          <p className="page-subtitle">{bons.length} BON(s) enregistré(s)</p>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:ring-2 focus:ring-blue-500 outline-none"
        />
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
          <div className="text-center py-12 text-gray-400 text-sm">Aucun BON trouvé.</div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr className="border-b-2 border-gray-200">
                {['Date', 'Client', 'Téléphone', 'Motif', 'Total', 'Versé', 'Reste', 'Agent', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(bon => {
                const remaining = bon.total - bon.paid;
                return (
                  <tr key={bon.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-2.5 border-r border-gray-100 text-sm text-gray-600 whitespace-nowrap">{fmtDate(bon.date)}</td>
                    <td className="px-3 py-2.5 border-r border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm whitespace-nowrap">{bon.first_name} {bon.last_name}</p>
                    </td>
                    <td className="px-3 py-2.5 border-r border-gray-100 text-sm text-gray-600 whitespace-nowrap">{bon.phone || '—'}</td>
                    <td className="px-3 py-2.5 border-r border-gray-100 text-sm text-gray-600 max-w-xs truncate">{bon.motif || '—'}</td>
                    <td className="px-3 py-2.5 border-r border-gray-100 text-sm font-medium text-gray-900 whitespace-nowrap">{fmt(bon.total)} DA</td>
                    <td className="px-3 py-2.5 border-r border-gray-100 text-sm text-green-700 font-medium whitespace-nowrap">{fmt(bon.paid)} DA</td>
                    <td className="px-3 py-2.5 border-r border-gray-100 whitespace-nowrap">
                      <span className={`text-sm font-medium ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {fmt(remaining)} DA
                      </span>
                    </td>
                    <td className="px-3 py-2.5 border-r border-gray-100 text-sm text-gray-600">{bon.agent || '—'}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1.5 flex-nowrap">
                        <button
                          onClick={() => setPrinting(bon)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Imprimer
                        </button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(bon)}>Modifier</Button>
                        <Button size="sm" variant="danger" loading={deleteMut.isPending}
                          onClick={() => confirm('Supprimer ce BON ?') && deleteMut.mutate(bon.id)}>
                          ✕
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {printing && <PrintPreview bon={printing} onClose={() => setPrinting(null)} />}
      {editing  && <EditBonModal bon={editing}  onClose={() => setEditing(null)} />}
    </div>
  );
}
