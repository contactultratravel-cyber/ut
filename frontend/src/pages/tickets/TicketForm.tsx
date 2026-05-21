import { useForm } from 'react-hook-form';
import { Ticket } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

type FormData = { clientName: string; phone: string; destination: string; price: number };

interface Props {
  ticket?: Ticket;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

export default function TicketForm({ ticket, onSubmit, loading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: ticket ? {
      clientName:  ticket.client_name,
      phone:       ticket.phone,
      destination: ticket.destination,
      price:       ticket.price,
    } : {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nom du client *" error={errors.clientName?.message}
        {...register('clientName', { required: 'Requis' })} />
      <Input label="Téléphone *" error={errors.phone?.message}
        {...register('phone', { required: 'Requis' })} />
      <Input label="Destination *" error={errors.destination?.message}
        {...register('destination', { required: 'Requis' })} />
      <Input label="Prix (DZD) *" type="number" min="0" step="0.01"
        error={errors.price?.message}
        {...register('price', { required: 'Requis', min: { value: 0, message: 'Min 0' } })} />
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {ticket ? 'Enregistrer' : 'Créer le billet'}
        </Button>
      </div>
    </form>
  );
}
