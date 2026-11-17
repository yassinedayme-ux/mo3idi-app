// src/types/index.ts
export type UserRole = 'customer' | 'barber';

export interface AppUser {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  bio?: string;
  photoURL?: string;
  shopName?: string;
  createdAt: Date;
}

export interface QueueData {
  isBusy: boolean;
  queueCount: number;
  avgServiceTime: number;
}

export interface Barber extends QueueData {
  id: string;
  fullName: string;
  shopName: string;
  lat: number;
  lng: number;
  distance?: number;
}

export interface AdminService {
  id: string;
  barberId?: string;
  name: string;
  nameAr?: string;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt?: any;
}

export type BookingStatus = 'upcoming' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  barberId: string;
  barberName: string;
  customerId: string;
  customerName: string;
  serviceName: string;
  price: number;
  duration: number;
  date: string;
  time: string;
  status: BookingStatus;
  createdAt: any;
}