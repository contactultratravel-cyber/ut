import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Input } from '../../components/ui/Input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'EMPLOYEE',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate(`/verify?email=${encodeURIComponent(form.email)}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Ultra Travel</h1>
          <p className="text-blue-200 text-sm mt-1">Créer un compte employé</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Inscription</h2>
          <p className="text-sm text-gray-500 mb-5">
            Après l'inscription, vous recevrez un code d'activation de votre responsable.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Prénom *" value={form.firstName}
                onChange={e => set('firstName', e.target.value)} required />
              <Input label="Nom *" value={form.lastName}
                onChange={e => set('lastName', e.target.value)} required />
            </div>
            <Input label="Email *" type="email" value={form.email}
              onChange={e => set('email', e.target.value)} required />
            <Input label="Mot de passe *" type="password" value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Minimum 6 caractères" required />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
              <select value={form.role} onChange={e => set('role', e.target.value)} className={inputCls}>
                <option value="EMPLOYEE">Employé</option>
                <option value="ACCOUNTANT">Comptable</option>
              </select>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors mt-2">
              {loading ? 'Inscription en cours...' : "S'inscrire"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-blue-700 font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
