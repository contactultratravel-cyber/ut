import { useForm } from 'react-hook-form';
import { Hotel } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

type FormData = { clientName: string; phone: string; hotelName: string; price: number };

interface Props {
  hotel?: Hotel;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

export default function HotelForm({ hotel, onSubmit, loading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: hotel ? {
      clientName: hotel.client_name,
      phone:      hotel.phone,
      hotelName:  hotel.hotel_name,
      price:      hotel.price,
    } : {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nom du client *" error={errors.clientName?.message}
        {...register('clientName', { required: 'Requis' })} />
      <Input label="Téléphone *" error={errors.phone?.message}
        {...register('phone', { required: 'Requis' })} />
      <Input label="Nom de l'hôtel *" error={errors.hotelName?.message}
        {...register('hotelName', { required: 'Requis' })} />
      <Input label="Prix (DZD) *" type="number" min="0" step="0.01"
        error={errors.price?.message}
        {...register('price', { required: 'Requis', min: { value: 0, message: 'Min 0' } })} />
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {hotel ? 'Enregistrer' : 'Créer la réservation'}
        </Button>
      </div>
    </form>
  );
}
