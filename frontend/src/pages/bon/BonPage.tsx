import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { bonsApi } from '../../api/bons.api';

const AGENTS = ['Bilal', 'Riyadh', 'Salah'];

function today() {
  return new Date().toLocaleDateString('fr-DZ', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmt(n: number) {
  return Number(n).toLocaleString('fr-DZ');
}

export default function BonPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    date:       today(),
    firstName:  '',
    lastName:   '',
    phone:      '',
    motif:      '',
    total:      '',
    paid:       '',
    agent:      'Bilal',
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  const total     = Number(form.total)  || 0;
  const paid      = Number(form.paid)   || 0;
  const remaining = total - paid;

  const saveMut = useMutation({
    mutationFn: () => bonsApi.create({
      date:       form.date,
      first_name: form.firstName,
      last_name:  form.lastName,
      phone:      form.phone || undefined,
      motif:      form.motif || undefined,
      total,
      paid,
      agent:      form.agent,
    }),
    onSuccess: () => setSaved(true),
  });

  function handlePrint() {
    window.print();
  }

  function handleSaveAndGo() {
    saveMut.mutate(undefined, { onSuccess: () => navigate('/bon-archive') });
  }

  const inputCls = 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div>
      <h1 className="page-title">BON de paiement</h1>
      <p className="page-subtitle">Générer et imprimer un reçu client</p>

      <div className="flex gap-6 items-start">

        {/* ── LEFT : Aperçu / BON imprimable ─────────────────── */}
        <div className="flex-1 min-w-0">
          <div id="bon-print" className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-sm"
            style={{ fontFamily: 'Arial, sans-serif' }}>

            {/* En-tête */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-800">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-wide">Ultra Travel</h2>
                <p className="text-sm text-gray-500">Agence de voyage</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Reçu de paiement</p>
                <p className="text-sm font-semibold text-gray-700">{form.date}</p>
              </div>
            </div>

            {/* Titre */}
            <div className="text-center mb-6">
              <span className="inline-block bg-blue-700 text-white text-sm font-bold uppercase tracking-widest px-6 py-2 rounded-full">
                BON DE PAIEMENT
              </span>
            </div>

            {/* Info client */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Informations client</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Nom complet :</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {form.firstName || form.lastName
                      ? `${form.firstName} ${form.lastName}`.trim()
                      : <span className="text-gray-300 italic">—</span>}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Téléphone :</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {form.phone || <span className="text-gray-300 italic">—</span>}
                  </span>
                </div>
              </div>
            </div>

            {/* Motif */}
            {form.motif && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Motif / Service</p>
                <p className="text-sm font-semibold text-blue-900">{form.motif}</p>
              </div>
            )}

            {/* Montants */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Prix total</p>
                <p className="text-lg font-bold text-gray-900">{total > 0 ? fmt(total) : '—'} <span className="text-sm font-normal">DA</span></p>
              </div>
              <div className="border border-green-200 bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Versé</p>
                <p className="text-lg font-bold text-green-700">{paid > 0 ? fmt(paid) : '—'} <span className="text-sm font-normal">DA</span></p>
              </div>
              <div className={`border rounded-xl p-3 text-center ${remaining > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Reste à payer</p>
                <p className={`text-lg font-bold ${remaining > 0 ? 'text-orange-600' : 'text-green-700'}`}>
                  {total > 0 ? fmt(remaining) : '—'} <span className="text-sm font-normal">DA</span>
                </p>
              </div>
            </div>

            {/* Agent + Cachet */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Agent responsable</p>
                <p className="text-base font-bold text-gray-900">{form.agent}</p>
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

            {/* Pied */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">Ce document constitue un reçu officiel de l'agence Ultra Travel</p>
            </div>
          </div>

          {/* Bouton imprimer */}
          <button onClick={handlePrint}
            className="mt-4 w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 no-print">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer le BON
          </button>
        </div>

        {/* ── RIGHT : Formulaire ──────────────────────────────── */}
        <div className="w-80 shrink-0 no-print">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-semibold text-gray-900">Détails du reçu</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Date</label>
                <input value={form.date} onChange={e => set('date', e.target.value)}
                  className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Prénom *</label>
                  <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
                    className={inputCls} placeholder="Prénom" />
                </div>
                <div>
                  <label className={labelCls}>Nom *</label>
                  <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
                    className={inputCls} placeholder="Nom" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Tél. Client</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                  className={inputCls} placeholder="0558..." />
              </div>

              <div>
                <label className={labelCls}>Motif / Service</label>
                <textarea rows={2} value={form.motif} onChange={e => set('motif', e.target.value)}
                  className={inputCls} placeholder="ex: Traitement de dossier visa France affaire..." />
              </div>

              <div>
                <label className={labelCls}>Prix total (DA) *</label>
                <input type="number" min="0" value={form.total} onChange={e => set('total', e.target.value)}
                  className={inputCls} placeholder="0" />
              </div>

              <div>
                <label className={labelCls}>Montant versé (DA)</label>
                <input type="number" min="0" value={form.paid} onChange={e => set('paid', e.target.value)}
                  className={inputCls} placeholder="0" />
              </div>

              {/* Reste calculé */}
              <div className={`rounded-xl p-3 text-center ${remaining > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
                <p className="text-xs text-gray-500 mb-0.5">Reste à payer</p>
                <p className={`text-xl font-bold ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {fmt(remaining)} DA
                </p>
              </div>

              <div>
                <label className={labelCls}>Agent</label>
                <select value={form.agent} onChange={e => set('agent', e.target.value)} className={inputCls}>
                  {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <button onClick={handlePrint}
                  className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimer
                </button>
                <button onClick={handleSaveAndGo} disabled={saveMut.isPending || !form.firstName}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Enregistrer
                </button>
              </div>
              {saved && <p className="text-green-600 text-xs text-center font-medium">BON enregistré !</p>}
            </div>
          </div>
        </div>
      </div>

      {/* CSS impression : cache tout sauf le BON */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #bon-print, #bon-print * { visibility: visible; }
          #bon-print { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
