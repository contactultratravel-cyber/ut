import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Invitation } from '../../types';
import { Button } from '../../components/ui/Button';

type FormValues = {
  nom_invitation: string;
  pays: string;
  date_invitation: string;
  link: string;
  prix_invitation: number;
  prix_b2c: number;
  note: string;
};

interface Props {
  invitation?: Invitation;
  loading?: boolean;
  onSubmit: (data: Omit<Invitation, 'id' | 'created_by' | 'created_at'>) => Promise<unknown>;
}

export default function InvitationForm({ invitation, loading, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    if (invitation) {
      reset({
        nom_invitation:  invitation.nom_invitation,
        pays:            invitation.pays,
        date_invitation: invitation.date_invitation?.slice(0, 10) ?? '',
        link:            invitation.link ?? '',
        prix_invitation: invitation.prix_invitation,
        prix_b2c:        invitation.prix_b2c,
        note:            invitation.note ?? '',
      });
    }
  }, [invitation, reset]);

  async function submit(values: FormValues) {
    await onSubmit({
      nom_invitation:  values.nom_invitation,
      pays:            values.pays,
      date_invitation: values.date_invitation || undefined,
      link:            values.link || undefined,
      prix_invitation: Number(values.prix_invitation),
      prix_b2c:        Number(values.prix_b2c),
      note:            values.note || undefined,
    });
    reset();
  }

  const inputCls = 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const errCls   = 'text-xs text-red-500 mt-0.5';

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Nom d'invitation *</label>
          <input {...register('nom_invitation', { required: true })} className={inputCls} />
          {errors.nom_invitation && <p className={errCls}>Champ requis</p>}
        </div>
        <div>
          <label className={labelCls}>Pays *</label>
          <input {...register('pays', { required: true })} className={inputCls} />
          {errors.pays && <p className={errCls}>Champ requis</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Prix invitation (DZD) *</label>
          <input type="number" min="0" {...register('prix_invitation', { required: true, min: 0 })} className={inputCls} />
          {errors.prix_invitation && <p className={errCls}>Champ requis</p>}
        </div>
        <div>
          <label className={labelCls}>Prix B2C (DZD) *</label>
          <input type="number" min="0" {...register('prix_b2c', { required: true, min: 0 })} className={inputCls} />
          {errors.prix_b2c && <p className={errCls}>Champ requis</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Date d'invitation</label>
          <input type="date" {...register('date_invitation')} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Lien (URL)</label>
          <input type="url" placeholder="https://..." {...register('link')} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Note</label>
        <textarea rows={3} {...register('note')} className={inputCls} />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        {invitation ? 'Enregistrer les modifications' : 'Ajouter l\'invitation'}
      </Button>
    </form>
  );
}
