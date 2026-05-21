import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { AuthUser } from '../../types';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

type CreateForm = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
};

export default function UsersPage() {
  const { user: me } = useAuth();
  const [showCreate, setShowCreate] = useState(false);

  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authApi.getUsers().then((r) => r.data),
    enabled: me?.role === 'ADMIN',
  });

  const createMut = useMutation({
    mutationFn: authApi.createUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowCreate(false); },
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) => authApi.toggleUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => authApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<CreateForm>();

  const roleLabels: Record<string, string> = {
    ADMIN: 'Admin', EMPLOYEE: 'Employé', ACCOUNTANT: 'Comptable',
  };

  const columns = [
    { key: 'email',     header: 'Email' },
    { key: 'first_name', header: 'Prénom' },
    { key: 'last_name',  header: 'Nom' },
    { key: 'role', header: 'Rôle', render: (row: AuthUser) => (
      <Badge variant={row.role === 'ADMIN' ? 'purple' : row.role === 'ACCOUNTANT' ? 'green' : 'blue'}>
        {roleLabels[row.role] ?? row.role}
      </Badge>
    )},
    { key: 'is_active', header: 'Statut', render: (row: AuthUser & { is_active: boolean; verification_code?: string }) => (
      row.verification_code
        ? <Badge variant="yellow">En attente d'activation</Badge>
        : <Badge variant={row.is_active ? 'green' : 'red'}>{row.is_active ? 'Actif' : 'Inactif'}</Badge>
    )},
    { key: 'verification_code', header: 'Code activation', render: (row: AuthUser & { verification_code?: string }) => (
      row.verification_code
        ? <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg text-sm tracking-widest">{row.verification_code}</span>
        : <span className="text-gray-300 text-xs">—</span>
    )},
    { key: 'actions', header: '', render: (row: AuthUser) => (
      row.id !== me?.id ? (
        <div className="flex gap-2">
          <Button size="sm" variant="outline"
            loading={toggleMut.isPending}
            onClick={() => toggleMut.mutate(row.id)}>
            {(row as AuthUser & { is_active: boolean }).is_active ? 'Désactiver' : 'Activer'}
          </Button>
          <Button size="sm" variant="danger"
            loading={deleteMut.isPending}
            onClick={() => { if (confirm('Supprimer ce compte ?')) deleteMut.mutate(row.id); }}>
            Supprimer
          </Button>
        </div>
      ) : <span className="text-xs text-gray-400">Vous</span>
    )},
  ];

  if (me?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Accès réservé aux administrateurs.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">{users.length} compte(s) enregistré(s)</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel utilisateur
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={users as unknown as Record<string, unknown>[]}
          loading={isLoading}
          emptyMessage="Aucun utilisateur."
        />
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouvel utilisateur">
        <form onSubmit={handleSubmit((data) => createMut.mutateAsync(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom *" error={errors.firstName?.message}
              {...register('firstName', { required: 'Requis' })} />
            <Input label="Nom *" error={errors.lastName?.message}
              {...register('lastName', { required: 'Requis' })} />
          </div>
          <Input label="Email *" type="email" error={errors.email?.message}
            {...register('email', { required: 'Requis' })} />
          <Input label="Mot de passe *" type="password" error={errors.password?.message}
            {...register('password', { required: 'Requis', minLength: { value: 8, message: '8 caractères min' } })} />
          <Select label="Rôle *"
            options={[
              { value: 'EMPLOYEE',   label: 'Employé'    },
              { value: 'ACCOUNTANT', label: 'Comptable'  },
              { value: 'ADMIN',      label: 'Admin'      },
            ]}
            error={errors.role?.message}
            {...register('role', { required: 'Requis' })}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={createMut.isPending}>Créer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
