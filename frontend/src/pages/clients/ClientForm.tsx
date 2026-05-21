import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Client, COUNTRIES, VISA_TYPES, ROUTE_CODES } from '../../types';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

type FormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  job: string;
  invitationName: string;
  country: string;
  visaType: string;
  routeCode: string;
  totalPrice: number;
  amountPaid: number;
  whatsapp: string;
};

interface Props {
  client?: Client;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

export default function ClientForm({ client, onSubmit, loading }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: client ? {
      firstName:      client.first_name,
      lastName:       client.last_name,
      phone:          client.phone,
      email:          client.email ?? '',
      job:            client.job ?? '',
      invitationName: client.invitation_name ?? '',
      country:        client.country,
      visaType:       client.visa_type,
      routeCode:      client.route_code ?? '',
      totalPrice:     client.total_price,
      amountPaid:     client.amount_paid,
      whatsapp:       client.whatsapp ?? '',
    } : { amountPaid: 0, totalPrice: 0, whatsapp: '' },
  });

  const country    = watch('country');
  const totalPrice = watch('totalPrice') ?? 0;
  const amountPaid = watch('amountPaid') ?? 0;
  const remaining  = Number(totalPrice) - Number(amountPaid);

  useEffect(() => {
    if (country !== 'France') setValue('routeCode', '');
  }, [country, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Prénom *" error={errors.firstName?.message}
          {...register('firstName', { required: 'Requis' })} />
        <Input label="Nom *" error={errors.lastName?.message}
          {...register('lastName', { required: 'Requis' })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Téléphone *" error={errors.phone?.message}
          {...register('phone', { required: 'Requis' })} />
        <Input label="Email" type="email" {...register('email')} />
      </div>

      <Input label="WhatsApp (numéro avec indicatif, ex: 213558...)" {...register('whatsapp')}
        placeholder="213558123456" />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Profession" {...register('job')} />
        <Input label="Nom de l'invitant" {...register('invitationName')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Pays *"
          options={COUNTRIES.map((c) => ({ value: c, label: c }))}
          placeholder="Sélectionner un pays"
          error={errors.country?.message}
          {...register('country', { required: 'Requis' })}
        />
        <Select
          label="Type de visa *"
          options={VISA_TYPES.map((v) => ({ value: v, label: v }))}
          placeholder="Sélectionner"
          error={errors.visaType?.message}
          {...register('visaType', { required: 'Requis' })}
        />
      </div>

      {country === 'France' && (
        <Select
          label="Code de route"
          options={ROUTE_CODES.map((r) => ({ value: r, label: r }))}
          placeholder="Sélectionner un code"
          {...register('routeCode')}
        />
      )}

      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Paiement</p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Montant total (DZD) *"
            type="number"
            min="0"
            step="0.01"
            error={errors.totalPrice?.message}
            {...register('totalPrice', { required: 'Requis', min: { value: 0, message: 'Min 0' } })}
          />
          <Input
            label="Montant payé (DZD) *"
            type="number"
            min="0"
            step="0.01"
            error={errors.amountPaid?.message}
            {...register('amountPaid', { required: 'Requis', min: { value: 0, message: 'Min 0' } })}
          />
        </div>
        <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${remaining > 0 ? 'bg-yellow-50 text-yellow-800' : 'bg-green-50 text-green-800'}`}>
          Reste à payer: {remaining.toFixed(2)} DZD
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {client ? 'Enregistrer les modifications' : 'Créer le client'}
        </Button>
      </div>
    </form>
  );
}
