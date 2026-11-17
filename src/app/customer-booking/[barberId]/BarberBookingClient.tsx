"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, Clock, Scissors, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// ✅ هنا كنستقبلو barberId كـ Prop من ملف page.tsx
export default function BarberBookingClient({ barberId }: { barberId: string }) {
  const router = useRouter();
  
  const [barber, setBarber] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  // State للاختيارات ديال الزبون
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // أوقات متاحة للتجربة
  const availableTimes = ["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM", "06:30 PM"];

  useEffect(() => {
    const fetchBarberData = async () => {
      if (!barberId) return;
      try {
        // 1. جلب معلومات الحلاق
        const barberDoc = await getDoc(doc(db, "barbers", barberId as string));
        if (barberDoc.exists()) {
          setBarber({ id: barberDoc.id, ...barberDoc.data() });
        }

        // 2. جلب الخدمات ديال هاد الحلاق
        const q = query(collection(db, "services"), where("barberId", "==", barberId));
        const querySnapshot = await getDocs(q);
        const servicesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("حدث خطأ أثناء جلب البيانات");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarberData();
  }, [barberId]);

  // دالة تأكيد الحجز
  const handleConfirmBooking = async () => {
    if (!auth.currentUser) {
      toast.error("يجب تسجيل الدخول أولاً");
      router.push("/sign-up-login-screen");
      return;
    }
    if (!selectedService || !selectedTime) {
      toast.error("الرجاء اختيار الخدمة والوقت");
      return;
    }

    setIsBooking(true);
    try {
      await addDoc(collection(db, "bookings"), {
        barberId: barberId,
        barberName: barber.fullName,
        customerId: auth.currentUser.uid,
        customerName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || "Customer",
        serviceName: selectedService.name,
        serviceAr: selectedService.nameAr || selectedService.name,
        price: selectedService.price,
        duration: selectedService.duration,
        time: selectedTime,
        date: new Date().toISOString().split('T')[0], // تاريخ اليوم
        status: "upcoming",
        createdAt: serverTimestamp()
      });

      toast.success("تم الحجز بنجاح!");
      router.push("/customer-booking"); // نرجعوه للصفحة الرئيسية ديال الزبون
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("حدث خطأ أثناء الحجز");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-[#D4AF37]">جاري التحميل...</div>;
  }

  if (!barber) {
    return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-white">لم يتم العثور على الحلاق.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white p-4 pb-24 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 mt-2">
        <Link href="/customer-booking" className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h1 className="text-xl font-bold">Book Appointment</h1>
      </div>

      {/* Barber Info */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-[#0B0B0B] rounded-xl flex items-center justify-center">
          <Scissors className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{barber.fullName}</h2>
          <p className="text-[#D4AF37] text-sm">{barber.shopName}</p>
        </div>
      </div>

      {/* Select Service */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" /> 1. Select Service
        </h3>
        <div className="space-y-3">
          {services.length === 0 ? (
            <p className="text-gray-500 text-sm">No services available for this barber.</p>
          ) : (
            services.map((service) => (
              <div 
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedService?.id === service.id 
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37]' 
                    : 'bg-[#1A1A1A] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{service.name}</p>
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {service.duration} min
                    </p>
                  </div>
                  <p className="text-[#D4AF37] font-bold">{service.price} SAR</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Select Time */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#D4AF37]" /> 2. Select Time
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                selectedTime === time
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-[#1A1A1A] text-white border-white/5 hover:border-white/20'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Confirm Button (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0B0B0B] border-t border-white/5">
        <button
          onClick={handleConfirmBooking}
          disabled={isBooking || !selectedService || !selectedTime}
          className="w-full bg-[#D4AF37] text-black font-bold text-lg rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-[#c29f32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBooking ? "Booking..." : `Confirm Booking ${selectedService ? `- ${selectedService.price} SAR` : ''}`}
        </button>
      </div>

    </div>
  );
}