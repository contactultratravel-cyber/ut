import { Request } from 'express';

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'ACCOUNTANT';
export type ClientStatus = 'NEW' | 'PROCESSING' | 'COMPLETED';
export type VisaType = 'Tourist Visa' | 'Business Visa' | 'Study Visa' | 'Family Visit Visa';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED';
export type RouteCode = 'FRA_ORN' | 'FRA_ALG' | 'FRA_COS' | 'FRA_ANBA';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
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
  status: ClientStatus;
  appointment_date?: Date;
  appointment_status?: AppointmentStatus;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Ticket {
  id: string;
  client_name: string;
  phone: string;
  destination: string;
  price: number;
  created_by?: string;
  created_at: Date;
}

export interface Hotel {
  id: string;
  client_name: string;
  phone: string;
  hotel_name: string;
  price: number;
  created_by?: string;
  created_at: Date;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
