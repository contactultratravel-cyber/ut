export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'ACCOUNTANT';
export type ClientStatus = 'NEW' | 'PROCESSING' | 'COMPLETED' | 'DELIVERED';
export type VisaType = 'Tourist Visa' | 'Business Visa' | 'Study Visa' | 'Family Visit Visa';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED';
export type RouteCode = 'FRA_ORN' | 'FRA_ALG' | 'FRA_COS' | 'FRA_ANBA';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  job?: string;
  invitation_name?: string;
  country: string;
  visa_type: VisaType;
  route_code?: RouteCode;
  total_price: number;
  amount_paid: number;
  remaining_amount: number;
  status: ClientStatus;
  appointment_date?: string;
  appointment_status?: AppointmentStatus;
  whatsapp?: string;
  passport_photo?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Bon {
  id: string;
  date: string;
  first_name: string;
  last_name: string;
  phone?: string;
  motif?: string;
  total: number;
  paid: number;
  agent?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Dossier {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  total_price: number;
  note?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  client_name: string;
  phone: string;
  destination: string;
  price: number;
  created_by?: string;
  created_at: string;
}

export interface Hotel {
  id: string;
  client_name: string;
  phone: string;
  hotel_name: string;
  price: number;
  created_by?: string;
  created_at: string;
}

export interface DashboardStats {
  totalClients: number;
  totalInvitations: number;
  totalTickets: number;
  totalHotels: number;
}

export interface Statistics {
  ticketsRevenue: number;
  hotelsRevenue: number;
  clientsRevenue: number;
  invitationsRevenue: number;
  totalRevenue: number;
  restePaiement: number;
  net: number;
  fromDate: string;
  toDate: string;
}

export interface Invitation {
  id: string;
  nom_invitation: string;
  pays: string;
  date_invitation?: string;
  link?: string;
  prix_invitation: number;
  prix_b2c: number;
  note?: string;
  created_by?: string;
  created_at: string;
}

export const COUNTRIES = [
  'France','Germany','Netherlands','Canada','England',
  'Norway','Portugal','Spain','USA','Greece',
  'Hungary','Malta','Austria','Qatar','Azerbaijan','China',
] as const;

export const VISA_TYPES: VisaType[] = [
  'Tourist Visa','Business Visa','Study Visa','Family Visit Visa',
];

export const ROUTE_CODES: RouteCode[] = ['FRA_ORN','FRA_ALG','FRA_COS','FRA_ANBA'];
