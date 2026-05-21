import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function VerifyPage() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const email      = params.get('email') ?? '';

  const [code,    setCode]    = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { setError('Le code doit contenir 6 chiffres.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-code', { email, code });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch {
      setError('Code invalide ou déjà utilisé. Vérifiez avec votre responsable.');
    } finally {
      setLoading(false);
    }
  }

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
          <p className="text-blue-200 text-sm mt-1">Activation du compte</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Compte activé !</h2>
              <p className="text-sm text-gray-500">Redirection vers la connexion...</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1 text-center">Vérification du code</h2>
              <p className="text-sm text-gray-500 mb-1 text-center">
                Un code d'activation a été envoyé à votre responsable.
              </p>
              <p className="text-sm text-center mb-5">
                <span className="font-medium text-blue-700">contact.ultratravel@gmail.com</span>
              </p>
              {email && (
                <p className="text-xs text-gray-400 text-center mb-5">Compte : {email}</p>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code à 6 chiffres</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                    placeholder="000000"
                    autoFocus
                    className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-2xl text-center font-bold tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <button type="submit" disabled={loading || code.length !== 6}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
                  {loading ? 'Vérification...' : 'Activer le compte'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                <Link to="/login" className="text-blue-700 hover:underline">Retour à la connexion</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
