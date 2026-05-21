import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard.api';
import { StatCard } from '../../components/ui/Card';

const PRESETS = [
  { label: 'Tout', from: '', to: '' },
  { label: 'Aujourd\'hui', from: 'today', to: 'today' },
  { label: 'Ce mois', from: 'month', to: 'month' },
  { label: 'Cette année', from: 'year', to: 'year' },
];

function resolvePreset(key: string): { fromDate?: string; toDate?: string } {
  const now = new Date();
  if (key === 'today') {
    const d = now.toISOString().slice(0, 10);
    return { fromDate: d + ' 00:00:00', toDate: d + ' 23:59:59' };
  }
  if (key === 'month') {
    const y = now.getFullYear(), m = String(now.getMonth() + 1).padStart(2, '0');
    const last = new Date(y, now.getMonth() + 1, 0).getDate();
    return { fromDate: `${y}-${m}-01 00:00:00`, toDate: `${y}-${m}-${last} 23:59:59` };
  }
  if (key === 'year') {
    const y = now.getFullYear();
    return { fromDate: `${y}-01-01 00:00:00`, toDate: `${y}-12-31 23:59:59` };
  }
  return {};
}

export default function DashboardPage() {
  const [preset, setPreset]     = useState('');
  const [customFrom, setFrom]   = useState('');
  const [customTo, setTo]       = useState('');
  const [useCustom, setCustom]  = useState(false);

  const { fromDate, toDate } = useCustom
    ? { fromDate: customFrom ? customFrom + ' 00:00:00' : undefined, toDate: customTo ? customTo + ' 23:59:59' : undefined }
    : resolvePreset(preset);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', fromDate, toDate],
    queryFn: () => dashboardApi.getStats(fromDate, toDate).then(r => r.data),
    refetchInterval: 30_000,
  });

  const cards = [
    {
      title: 'Total Clients',
      value: data?.totalClients ?? 0,
      color: 'blue' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: 'Invitations disponibles',
      value: data?.totalInvitations ?? 0,
      color: 'purple' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      title: 'Billets vendus',
      value: data?.totalTickets ?? 0,
      color: 'yellow' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
    },
    {
      title: 'Hôtels réservés',
      value: data?.totalHotels ?? 0,
      color: 'green' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'Visa accordées',
      value: data?.visaGranted ?? 0,
      color: 'emerald' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <h1 className="page-title">Tableau de bord</h1>
      <p className="page-subtitle">Vue d'ensemble de l'activité</p>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <span className="text-sm font-medium text-gray-600 shrink-0">Période :</span>
        <div className="flex gap-1">
          {PRESETS.map(p => (
            <button key={p.label}
              onClick={() => { setPreset(p.from); setCustom(false); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !useCustom && preset === p.from
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setCustom(true)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              useCustom ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            Personnalisé
          </button>
        </div>
        {useCustom && (
          <div className="flex items-center gap-2 ml-2">
            <input type="date" value={customFrom} onChange={e => setFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <span className="text-gray-400 text-sm">→</span>
            <input type="date" value={customTo} onChange={e => setTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {cards.map(card => (
            <StatCard key={card.title} title={card.title} value={card.value}
              color={card.color} icon={card.icon} />
          ))}
        </div>
      )}
    </div>
  );
}
