import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { statisticsApi } from '../../api/statistics.api';
import { StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';

const SESSION_KEY = 'stats_unlocked';

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [pwd, setPwd]     = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/statistics/verify-password', { password: pwd });
      sessionStorage.setItem(SESSION_KEY, '1');
      onUnlock();
    } catch {
      setError('Mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 w-full max-w-sm text-center">
        {/* Lock icon */}
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Accès restreint</h2>
        <p className="text-sm text-gray-500 mb-6">
          Entrez le mot de passe pour accéder aux statistiques
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pwd}
            onChange={e => { setPwd(e.target.value); setError(''); }}
            placeholder="Mot de passe"
            autoFocus
            className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-center tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-600 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading || !pwd}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
            {loading ? 'Vérification...' : 'Accéder'}
          </button>
        </form>
      </div>
    </div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(n);
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function StatisticsPage() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');
  const [active,   setActive]   = useState(false);

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['statistics', fromDate, toDate],
    queryFn: () => statisticsApi.get(fromDate || undefined, toDate || undefined).then((r) => r.data),
    enabled: true,
  });

  function handleFilter() {
    setActive(true);
    refetch();
  }

  function handleReset() {
    setFromDate('');
    setToDate('');
    setActive(false);
    refetch();
  }

  const barData = data ? [
    { name: 'Billets',  value: data.ticketsRevenue },
    { name: 'Hôtels',  value: data.hotelsRevenue  },
    { name: 'Clients', value: data.clientsRevenue },
  ] : [];

  const pieData = data ? [
    { name: 'Billets',  value: data.ticketsRevenue },
    { name: 'Hôtels',  value: data.hotelsRevenue  },
    { name: 'Clients', value: data.clientsRevenue },
  ].filter((d) => d.value > 0) : [];

  return (
    <div>
      <h1 className="page-title">Statistiques</h1>
      <p className="page-subtitle">Analyse des revenus par période</p>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Du</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Au</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleFilter} size="sm">Filtrer</Button>
            {active && <Button onClick={handleReset} size="sm" variant="secondary">Réinitialiser</Button>}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* KPI Cards — row 1 */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <StatCard title="Revenu total" value={`${fmt(data.totalRevenue)} DZD`} color="green"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>}
            />
            <StatCard title="Billets" value={`${fmt(data.ticketsRevenue)} DZD`} color="blue"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>}
            />
            <StatCard title="Hôtels" value={`${fmt(data.hotelsRevenue)} DZD`} color="purple"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>}
            />
            <StatCard title="Clients (visa)" value={`${fmt(data.clientsRevenue)} DZD`} color="yellow"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>}
            />
          </div>

          {/* KPI Cards — row 2 */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatCard title="Reste de paiement" value={`${fmt(data.restePaiement)} DZD`} color="yellow"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
            />
            <StatCard title="Net" value={`${fmt(data.net)} DZD`} color="green"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>}
            /></div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Revenus par catégorie</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                  <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${fmt(v)} DZD`, 'Revenu']} />
                  <Bar dataKey="value" radius={[6,6,0,0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Répartition des revenus</h3>
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                  Aucune donnée pour cette période
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                      dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v: number) => [`${fmt(v)} DZD`, 'Revenu']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
