interface Props {
  children: React.ReactNode;
  variant?: 'blue' | 'yellow' | 'green' | 'red' | 'gray' | 'purple';
  size?: 'sm' | 'md';
}

const variantClasses = {
  blue:   'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  green:  'bg-green-100 text-green-800',
  red:    'bg-red-100 text-red-800',
  gray:   'bg-gray-100 text-gray-700',
  purple: 'bg-purple-100 text-purple-800',
};

export function Badge({ children, variant = 'gray', size = 'md' }: Props) {
  return (
    <span className={[
      'inline-flex items-center font-semibold rounded-full',
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
      variantClasses[variant],
    ].join(' ')}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: Props['variant'] }> = {
    NEW:        { label: 'Nouveau',     variant: 'blue'   },
    PROCESSING: { label: 'En cours',    variant: 'yellow' },
    COMPLETED:  { label: 'Terminé',     variant: 'green'  },
    DELIVERED:  { label: 'Livré',       variant: 'purple' },
    PENDING:    { label: 'En attente',  variant: 'yellow' },
    CONFIRMED:  { label: 'Confirmé',    variant: 'green'  },
  };
  const cfg = map[status] ?? { label: status, variant: 'gray' as Props['variant'] };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
