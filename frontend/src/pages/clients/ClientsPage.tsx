import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../../api/clients.api';
import { Client, ClientStatus, CAPAGO_CENTERS } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import ClientForm from './ClientForm';
import api from '../../api/axios';

const TABS = [
  { label: 'Tous',          value: '',            on: 'bg-white text-gray-800 shadow',               off: 'bg-gray-50 text-gray-500 hover:bg-gray-100',         badge: 'bg-gray-200 text-gray-600'      },
  { label: 'Nouveaux',      value: 'NEW',         on: 'bg-blue-100 text-blue-800 shadow',             off: 'bg-blue-50 text-blue-600 hover:bg-blue-100',          badge: 'bg-blue-200 text-blue-700'      },
  { label: 'En cours',      value: 'PROCESSING',  on: 'bg-amber-100 text-amber-800 shadow',           off: 'bg-amber-50 text-amber-600 hover:bg-amber-100',       badge: 'bg-amber-200 text-amber-700'    },
  { label: 'Terminés',      value: 'COMPLETED',   on: 'bg-green-100 text-green-800 shadow',           off: 'bg-green-50 text-green-600 hover:bg-green-100',       badge: 'bg-green-200 text-green-700'    },
  { label: 'Livrés',        value: 'DELIVERED',   on: 'bg-purple-100 text-purple-800 shadow',         off: 'bg-purple-50 text-purple-600 hover:bg-purple-100',    badge: 'bg-purple-200 text-purple-700'  },
  { label: 'Visa accordé',  value: 'VISA_GRANTED',on: 'bg-emerald-100 text-emerald-800 shadow',       off: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100', badge: 'bg-emerald-200 text-emerald-700'},
];

function fmt(n: number) { return Number(n).toLocaleString('fr-DZ'); }
function fmtDate(d?: string) {
  if (!d) return '—';
  const normalized = d.length === 10 ? d + 'T12:00:00' : d.replace(' ', 'T');
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ClientDetailsModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const qc = useQueryClient();
  const remaining = Number(client.total_price) - Number(client.amount_paid);
  const [passportPhoto, setPassportPhoto] = useState<string | null>(client.passport_photo ?? null);
  const [visaPhoto,     setVisaPhoto]     = useState<string | null>(client.visa_photo ?? null);
  const fileRef    = useRef<HTMLInputElement>(null);
  const visaFileRef = useRef<HTMLInputElement>(null);

  const uploadMut = useMutation({
    mutationFn: (photo: string) => clientsApi.uploadPassport(client.id, photo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });

  const deletePpMut = useMutation({
    mutationFn: () => clientsApi.deletePassport(client.id),
    onSuccess: () => { setPassportPhoto(null); qc.invalidateQueries({ queryKey: ['clients'] }); },
  });

  const uploadVisaMut = useMutation({
    mutationFn: (photo: string) => clientsApi.uploadVisaPhoto(client.id, photo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });

  const deleteVisaMut = useMutation({
    mutationFn: () => clientsApi.deleteVisaPhoto(client.id),
    onSuccess: () => { setVisaPhoto(null); qc.invalidateQueries({ queryKey: ['clients'] }); },
  });

  function handleVisaFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1600;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        setVisaPhoto(base64);
        uploadVisaMut.mutate(base64);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function downloadVisaJpg() {
    if (!visaPhoto) return;
    const a = document.createElement('a');
    a.href = visaPhoto;
    a.download = `visa-${client.first_name}-${client.last_name}.jpg`;
    a.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1400;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.82);
        setPassportPhoto(base64);
        uploadMut.mutate(base64);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function downloadDoc(type: 'invoice' | 'contract' | 'voucher') {
    api.get(`/documents/clients/${client.id}/${type}`, { responseType: 'blob' })
      .then(({ data, headers }) => {
        const url = URL.createObjectURL(new Blob([data as BlobPart]));
        const a = document.createElement('a');
        a.href = url;
        const cd = headers['content-disposition'] as string ?? '';
        a.download = cd.match(/filename="(.+?)"/)?.[1] ?? `${type}-${client.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  return (
    <Modal open onClose={onClose} title="Détails du client" size="lg">
      <div className="space-y-5">
        {/* Status */}
        <div className="flex items-center gap-3">
          <StatusBadge status={client.status} />
          {client.appointment_status && <StatusBadge status={client.appointment_status} />}
        </div>

        {/* Personal info */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Informations personnelles</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Row label="Prénom"       value={client.first_name} />
            <Row label="Nom"          value={client.last_name} />
            <Row label="Téléphone"    value={client.phone} />
            <Row label="Email"        value={client.email} />
            {client.whatsapp && (
              <div className="flex gap-2 text-sm col-span-2">
                <span className="text-gray-500 w-28 shrink-0">WhatsApp :</span>
                <a href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="text-green-600 font-medium hover:underline">{client.whatsapp}</a>
              </div>
            )}
            <Row label="Profession"   value={client.job} />
            <Row label="Nom invitant" value={client.invitation_name} />
          </div>
        </div>

        {/* Visa info */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Informations visa</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Row label="Pays"         value={client.country} />
            <Row label="Type de visa" value={client.visa_type} />
            {client.route_code && (() => {
              const center = CAPAGO_CENTERS.find(c => c.value === client.route_code);
              const colorMap: Record<string, string> = {
                blue:   'bg-blue-100 text-blue-800 border-blue-200',
                green:  'bg-green-100 text-green-800 border-green-200',
                amber:  'bg-amber-100 text-amber-800 border-amber-200',
                purple: 'bg-purple-100 text-purple-800 border-purple-200',
              };
              return (
                <div className="flex gap-2 text-sm col-span-2">
                  <span className="text-gray-500 w-28 shrink-0">Centre Capago :</span>
                  {center
                    ? <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorMap[center.color]}`}>
                        {center.label}
                      </span>
                    : <span className="text-gray-900 font-medium">{client.route_code}</span>}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Appointment */}
        {(client.appointment_date || client.appointment_status) && (
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rendez-vous</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Row label="Date RDV"   value={fmtDate(client.appointment_date)} />
              <Row label="Statut RDV" value={
                client.appointment_status === 'CONFIRMED' ? 'Confirmé' :
                client.appointment_status === 'PENDING'   ? 'En attente' : '—'
              } />
            </div>
          </div>
        )}

        {/* Payment */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Paiement</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="font-bold text-gray-900">{fmt(client.total_price)} DZD</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Payé</p>
              <p className="font-bold text-green-700">{fmt(client.amount_paid)} DZD</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${remaining > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
              <p className="text-xs text-gray-500 mb-1">Reste</p>
              <p className={`font-bold ${remaining > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                {fmt(remaining)} DZD
              </p>
            </div>
          </div>
        </div>

        {/* Passport photo */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Photo du passeport</h4>
          {passportPhoto ? (
            <div className="space-y-2">
              <img src={passportPhoto} alt="Passeport"
                className="rounded-xl border border-gray-200 max-h-56 w-full object-contain bg-gray-50 cursor-pointer"
                onClick={() => window.open(passportPhoto, '_blank')} />
              <Button size="sm" variant="danger" loading={deletePpMut.isPending}
                onClick={() => { if (confirm('Supprimer la photo du passeport ?')) deletePpMut.mutate(); }}>
                Supprimer la photo
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center space-y-2">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <p className="text-sm text-gray-400">Aucune photo du passeport</p>
              <Button size="sm" variant="outline" loading={uploadMut.isPending}
                onClick={() => fileRef.current?.click()}>
                📷 Télécharger le passeport
              </Button>
              <p className="text-xs text-gray-300">JPEG, PNG — compressé automatiquement</p>
            </div>
          )}
        </div>

        {/* Visa photo */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Photo du visa</h4>
          {visaPhoto ? (
            <div className="space-y-2">
              <img src={visaPhoto} alt="Visa"
                className="rounded-xl border border-emerald-200 max-h-56 w-full object-contain bg-emerald-50 cursor-pointer"
                onClick={() => window.open(visaPhoto, '_blank')} />
              <div className="flex gap-2">
                <button onClick={downloadVisaJpg}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Télécharger JPG
                </button>
                <Button size="sm" variant="danger" loading={deleteVisaMut.isPending}
                  onClick={() => { if (confirm('Supprimer la photo du visa ?')) deleteVisaMut.mutate(); }}>
                  Supprimer
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-emerald-200 rounded-xl p-5 text-center space-y-2">
              <input ref={visaFileRef} type="file" accept="image/*" onChange={handleVisaFile} className="hidden" />
              <p className="text-sm text-gray-400">Aucune photo du visa</p>
              <Button size="sm" variant="outline" loading={uploadVisaMut.isPending}
                onClick={() => visaFileRef.current?.click()}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                🛂 Télécharger le visa
              </Button>
              <p className="text-xs text-gray-300">JPEG, PNG — compressé automatiquement</p>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="text-xs text-gray-400 flex gap-6 pt-1 border-t border-gray-100">
          <span>Créé le : {fmtDate(client.created_at)}</span>
          <span>Modifié le : {fmtDate(client.updated_at)}</span>
        </div>

        {/* Documents */}
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={() => downloadDoc('invoice')}>📄 Facture</Button>
          <Button size="sm" variant="outline" onClick={() => downloadDoc('contract')}>📝 Contrat</Button>
          <Button size="sm" variant="outline" onClick={() => downloadDoc('voucher')}>🎫 Bon</Button>
        </div>
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 w-28 shrink-0">{label} :</span>
      <span className="text-gray-900 font-medium">{value || '—'}</span>
    </div>
  );
}

export default function ClientsPage() {
  const [tab, setTab]               = useState('');
  const [search, setSearch]         = useState('');
  const [visaFrom, setVisaFrom]     = useState('');
  const [visaTo,   setVisaTo]       = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing]       = useState<Client | null>(null);
  const [details, setDetails]       = useState<Client | null>(null);
  const [apptClient,  setApptClient]  = useState<Client | null>(null);
  const [apptDate,    setApptDate]    = useState('');
  const [apptStatus,  setApptStatus]  = useState('PENDING');
  const [step1Client, setStep1Client] = useState<Client | null>(null);
  const [s1Date,      setS1Date]      = useState('');
  const [s1Status,    setS1Status]    = useState('PENDING');

  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['clients'] });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list().then(r => r.data),
  });

  const createMut  = useMutation({ mutationFn: clientsApi.create,  onSuccess: () => { invalidate(); setShowCreate(false); } });
  const updateMut  = useMutation({ mutationFn: (d: { id: string; data: Partial<Client> }) => clientsApi.update(d.id, d.data), onSuccess: () => { invalidate(); setEditing(null); } });
  const step1Mut   = useMutation({
    mutationFn: (id: string) => clientsApi.validateStep1(id, s1Date || undefined, s1Status),
    onSuccess: () => { invalidate(); setStep1Client(null); },
  });
  const finalMut   = useMutation({ mutationFn: (id: string) => clientsApi.finalValidation(id), onSuccess: invalidate });
  const deliverMut = useMutation({ mutationFn: (id: string) => clientsApi.deliver(id), onSuccess: invalidate });
  const apptMut    = useMutation({ mutationFn: (id: string) => clientsApi.updateAppointment(id, { appointmentDate: apptDate || undefined, appointmentStatus: apptStatus }), onSuccess: () => { invalidate(); setApptClient(null); } });
  const deleteMut   = useMutation({ mutationFn: clientsApi.delete, onSuccess: invalidate });
  const grantVisaMut = useMutation({ mutationFn: (id: string) => clientsApi.grantVisa(id), onSuccess: invalidate });

  const urgentAppts = clients.filter(c => {
    if (c.status !== 'PROCESSING' || !c.appointment_date) return false;
    const apptMs = new Date(c.appointment_date.includes('T') ? c.appointment_date : c.appointment_date + 'T12:00:00').getTime();
    const nowMs  = Date.now();
    return apptMs >= nowMs && apptMs - nowMs <= 3 * 24 * 60 * 60 * 1000;
  });

  const filtered = clients
    .filter(c => !tab || c.status === tab)
    .filter(c => !search || `${c.first_name} ${c.last_name} ${c.phone}`.toLowerCase().includes(search.toLowerCase()))
    .filter(c => {
      if (tab !== 'VISA_GRANTED' || (!visaFrom && !visaTo)) return true;
      const d = c.visa_granted_at ?? c.created_at;
      if (!d) return true;
      const t = new Date(d.replace(' ', 'T')).getTime();
      const from = visaFrom ? new Date(visaFrom).getTime() : 0;
      const to   = visaTo   ? new Date(visaTo + 'T23:59:59').getTime() : Infinity;
      return t >= from && t <= to;
    })
    .sort((a, b) => {
      if (a.appointment_date && b.appointment_date)
        return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
      if (a.appointment_date) return -1;
      if (b.appointment_date) return 1;
      return 0;
    });

  const counts = {
    '':            clients.length,
    NEW:           clients.filter(c => c.status === 'NEW').length,
    PROCESSING:    clients.filter(c => c.status === 'PROCESSING').length,
    COMPLETED:     clients.filter(c => c.status === 'COMPLETED').length,
    DELIVERED:     clients.filter(c => c.status === 'DELIVERED').length,
    VISA_GRANTED:  clients.filter(c => c.status === 'VISA_GRANTED').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{clients.length} client(s) enregistré(s)</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau client
        </Button>
      </div>

      {/* Urgent appointment alerts */}
      {urgentAppts.length > 0 && (
        <div className="mb-4 space-y-2">
          {urgentAppts.map(c => {
            const apptMs   = new Date(c.appointment_date!.includes('T') ? c.appointment_date! : c.appointment_date! + 'T12:00:00').getTime();
            const diffDays = Math.ceil((apptMs - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={c.id} className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span className="text-sm text-orange-800 font-medium">
                  Alerte : Le rendez-vous de <strong>{c.first_name} {c.last_name}</strong> est
                  {diffDays === 0 ? " aujourd'hui" : diffDays === 1 ? ' demain' : ` dans ${diffDays} jour(s)`}
                  {' '}({fmtDate(c.appointment_date)}) — à finaliser au plus vite.
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex flex-wrap gap-1 bg-gray-200 p-1 rounded-xl">
          {TABS.map(t => (
            <button key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === t.value ? t.on : t.off}`}>
              {t.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${t.badge}`}>
                {counts[t.value as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher nom, téléphone..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Date filter — Visa accordé only */}
      {tab === 'VISA_GRANTED' && (
        <div className="flex items-center gap-2 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-emerald-700 shrink-0">Filtrer par date :</span>
          <input type="date" value={visaFrom} onChange={e => setVisaFrom(e.target.value)}
            className="border border-emerald-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
          <span className="text-emerald-400 text-sm">→</span>
          <input type="date" value={visaTo} onChange={e => setVisaTo(e.target.value)}
            className="border border-emerald-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
          {(visaFrom || visaTo) && (
            <button onClick={() => { setVisaFrom(''); setVisaTo(''); }}
              className="text-xs text-emerald-600 hover:text-emerald-800 underline ml-1">
              Effacer
            </button>
          )}
        </div>
      )}
      {tab !== 'VISA_GRANTED' && <div className="mb-4" />}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Aucun client trouvé.</div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr className="border-b-2 border-gray-200">
                {['Client', 'Pays', 'WhatsApp', 'Statut', 'Date RDV', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => (
                <tr key={client.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                  {/* Client */}
                  <td className="px-3 py-2.5 border-r border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm">{client.first_name} {client.last_name}</p>
                    {client.email && <p className="text-xs text-gray-400">{client.email}</p>}
                    <p className="text-xs text-gray-500 font-medium">{client.phone}</p>
                  </td>
                  {/* Pays */}
                  <td className="px-3 py-2.5 border-r border-gray-100 whitespace-nowrap">
                    <p className="text-sm text-gray-700">{client.country}</p>
                    {client.route_code && (() => {
                      const center = CAPAGO_CENTERS.find(c => c.value === client.route_code);
                      if (!center) return null;
                      const pill: Record<string, string> = {
                        blue:   'bg-blue-100   text-blue-700',
                        green:  'bg-green-100  text-green-700',
                        amber:  'bg-amber-100  text-amber-700',
                        purple: 'bg-purple-100 text-purple-700',
                      };
                      return (
                        <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${pill[center.color]}`}>
                          {center.label}
                        </span>
                      );
                    })()}
                  </td>
                  {/* WhatsApp */}
                  <td className="px-3 py-2.5 border-r border-gray-100">
                    {client.whatsapp ? (
                      <a href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium whitespace-nowrap">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {client.whatsapp}
                      </a>
                    ) : <span className="text-gray-300 text-sm">—</span>}
                  </td>
                  {/* Statut */}
                  <td className="px-3 py-2.5 border-r border-gray-100"><StatusBadge status={client.status} /></td>
                  {/* Date RDV */}
                  <td className="px-3 py-2.5 border-r border-gray-100 text-xs font-medium whitespace-nowrap">
                    {client.appointment_date
                      ? <span className="text-blue-700">{fmtDate(client.appointment_date)}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  {/* Actions */}
                  <td className="px-3 py-2.5">
                    <div className="flex flex-nowrap gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => setDetails(client)}>Détails</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(client)}>Modifier</Button>
                      {client.status === 'NEW' && (
                        <Button size="sm" variant="secondary"
                          onClick={() => { setStep1Client(client); setS1Date(''); setS1Status('PENDING'); }}>
                          → En cours
                        </Button>
                      )}
                      {client.status === 'PROCESSING' && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => { setApptClient(client); setApptDate(client.appointment_date?.slice(0,10) ?? ''); setApptStatus(client.appointment_status ?? 'PENDING'); }}>
                            RDV
                          </Button>
                          <Button size="sm" variant="primary" loading={finalMut.isPending}
                            onClick={() => finalMut.mutate(client.id)}>
                            → Terminé
                          </Button>
                        </>
                      )}
                      {client.status === 'COMPLETED' && (
                        <Button size="sm" variant="primary" loading={deliverMut.isPending}
                          onClick={() => deliverMut.mutate(client.id)}
                          className="bg-purple-600 hover:bg-purple-700">
                          → Livré
                        </Button>
                      )}
                      {client.status === 'DELIVERED' && (
                        <Button size="sm" variant="primary" loading={grantVisaMut.isPending}
                          onClick={() => grantVisaMut.mutate(client.id)}
                          className="bg-emerald-600 hover:bg-emerald-700">
                          ✓ Visa accordé
                        </Button>
                      )}
                      <Button size="sm" variant="danger" loading={deleteMut.isPending}
                        onClick={() => confirm('Supprimer ce client ?') && deleteMut.mutate(client.id)}>
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

      {/* Details modal */}
      {details && <ClientDetailsModal client={details} onClose={() => setDetails(null)} />}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouveau client" size="lg">
        <ClientForm loading={createMut.isPending}
          onSubmit={d => createMut.mutateAsync(d as Parameters<typeof clientsApi.create>[0])} />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier le client" size="lg">
        {editing && (
          <ClientForm client={editing} loading={updateMut.isPending}
            onSubmit={d => updateMut.mutateAsync({ id: editing.id, data: d as Partial<Client> })} />
        )}
      </Modal>

      {/* Appointment update modal */}
      <Modal open={!!apptClient} onClose={() => setApptClient(null)} title="Mettre à jour le rendez-vous">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date du rendez-vous</label>
            <input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut RDV</label>
            <select value={apptStatus} onChange={e => setApptStatus(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="PENDING">En attente</option>
              <option value="CONFIRMED">Confirmé</option>
            </select>
          </div>
          <Button loading={apptMut.isPending} onClick={() => apptMut.mutate(apptClient!.id)} className="w-full">
            Enregistrer
          </Button>
        </div>
      </Modal>

      {/* Step1 modal — NEW → PROCESSING */}
      <Modal open={!!step1Client} onClose={() => setStep1Client(null)}
        title={`Passer "${step1Client?.first_name} ${step1Client?.last_name}" en cours`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Sélectionnez la date et le statut du rendez-vous pour ce client.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date du rendez-vous *</label>
            <input type="date" value={s1Date} onChange={e => setS1Date(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut du rendez-vous</label>
            <select value={s1Status} onChange={e => setS1Status(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="PENDING">En attente</option>
              <option value="CONFIRMED">Confirmé</option>
            </select>
          </div>
          <Button loading={step1Mut.isPending}
            onClick={() => step1Mut.mutate(step1Client!.id)}
            className="w-full">
            Confirmer → En cours
          </Button>
        </div>
      </Modal>
    </div>
  );
}
