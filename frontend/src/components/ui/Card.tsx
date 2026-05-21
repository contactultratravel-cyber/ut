import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export function Card({ children, className = '', title, action }: Props) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  subtitle?: string;
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-700'   },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-700'  },
  yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100 text-yellow-700'},
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-700'},
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-700'    },
};

export function StatCard({ title, value, icon, color = 'blue', subtitle }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl p-5 ${c.bg} border border-gray-100`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${c.icon}`}>{icon}</div>
      </div>
    </div>
  );
}
