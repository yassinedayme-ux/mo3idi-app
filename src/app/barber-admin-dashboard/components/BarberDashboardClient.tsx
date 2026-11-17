'use client';

import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner'; // حيدنا toast حيت مكنستعملوهش هنا

// استيراد جميع المكونات (زدنا اللي كانو ناقصين)
import DashboardHeader from './DashboardHeader';
import AvailabilityToggle from './AvailabilityToggle';
import LiveQueueManager from '@/components/LiveQueueManager'; // 👈 هادا كان ناقص
import DashboardStats from './DashboardStats'; // 👈 هادا كان ناقص
import AppointmentTimeline from './AppointmentTimeline';
import WeeklyChart from './WeeklyChart';
import ServicesManager from './ServicesManager';

// Firebase Imports
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export type DashLang = 'en' | 'ar';

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  service: string;
  serviceAr: string;
  time: string;
  duration: number;
  price: number;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  createdAt?: any; // زدنا هادي باش نتفاداو مشكل الترتيب
}

export interface AdminService {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  duration: number;
  active: boolean;
}

export default function BarberDashboardClient() {
  const [lang, setLang] = useState<DashLang>('en');
  const [isAvailable, setIsAvailable] = useState(true);
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isRtl = lang === 'ar';

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 1. جلب الحجوزات
        const qAppointments = query(
          collection(db, "bookings"), 
          where("barberId", "==", user.uid)
        );
        
        const unsubAppointments = onSnapshot(qAppointments, (snapshot) => {
          const realAppointments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              customerName: data.customerName || 'Customer',
              customerPhone: data.phone || '+966 5X XXX XXXX',
              service: data.serviceName || 'Haircut',
              serviceAr: data.serviceAr || 'قصة شعر',
              time: data.time || '00:00',
              duration: data.duration || 30,
              price: data.price || 0,
              status: data.status?.toLowerCase() || 'upcoming',
              createdAt: data.createdAt,
            } as Appointment;
          });
          
          // ترتيب الحجوزات (الأحدث فوق) مع معالجة مشكل صيغة التاريخ
          realAppointments.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
          });
          
          setAppointments(realAppointments);
        });

        // 2. جلب الخدمات
        const qServices = query(
          collection(db, "services"), 
          where("barberId", "==", user.uid)
        );
        
        const unsubServices = onSnapshot(qServices, (snapshot) => {
          const realServices = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || 'Service',
              nameAr: data.nameAr || 'خدمة',
              price: data.price || 0,
              duration: data.duration || 30,
              active: data.isActive ?? true,
            } as AdminService;
          });
          setServices(realServices);
          setIsLoading(false);
        });

        return () => {
          unsubAppointments();
          unsubServices();
        };
      } else {
        window.location.href = "/barber-login";
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-[#D4AF37]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen" style={{ background: '#0f0f0f' }}>
      <Toaster position="top-center" theme="dark" richColors />
      
      {/* Header */}
      <DashboardHeader lang={lang} setLang={setLang} isRtl={isRtl} />

      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Availability Toggle */}
        <AvailabilityToggle
          isAvailable={isAvailable}
          setIsAvailable={setIsAvailable}
          isRtl={isRtl}
          lang={lang}
        />

        {/* 🔥 كارت الطابور المباشر */}
        <LiveQueueManager />

        {/* Stats */}
        <DashboardStats appointments={appointments} isRtl={isRtl} lang={lang} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Appointments */}
          <div className="xl:col-span-2">
            <AppointmentTimeline
              appointments={appointments}
              setAppointments={setAppointments} 
              isRtl={isRtl}
              lang={lang}
            />
          </div>
          {/* Weekly Chart */}
          <div>
            <WeeklyChart isRtl={isRtl} lang={lang} />
          </div>
        </div>

        {/* Services Manager */}
        <ServicesManager
          services={services}
          setServices={setServices} 
          isRtl={isRtl}
          lang={lang}
        />
      </main>
    </div>
  );
}