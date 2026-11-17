"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, limit, orderBy,doc} from "firebase/firestore";
import { getUserCurrentLocation, UserLocation } from "@/services/location";
import { calculateDistance } from "@/lib/distance";
import { MapPin, Star, Clock, Scissors, User, CalendarDays, Search } from "lucide-react";

interface Barber {
  id: string;
  fullName: string;
  shopName: string;
  lat: number;
  lng: number;
  distance?: number;
}

export default function CustomerDashboardPage() {
  const [userName, setUserName] = useState("Customer");
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [nextBooking, setNextBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/onboarding";
        return;
      }

      // جلب اسم الزبون من قاعدة البيانات
      const userDocRef = doc(db, "users", user.uid);
      // (تقدر تجيب الاسم من الداتابيز هنا، أو نستعملو الإيميل كحل مؤقت)
      setUserName(user.displayName || user.email?.split('@')[0] || "Customer");

      try {
        // 1. جلب أقرب الحلاقين
        const location = await getUserCurrentLocation();
        const barbersSnapshot = await getDocs(collection(db, "barbers"));
        let barbersData = barbersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Barber[];

        if (location) {
          barbersData.forEach(b => {
            b.distance = calculateDistance(location.lat, location.lng, b.lat, b.lng);
          });
          barbersData.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
        setBarbers(barbersData);

        // 2. جلب الحجز القادم للزبون
        const q = query(
          collection(db, "bookings"),
          where("customerId", "==", user.uid),
          where("status", "in", ["upcoming", "confirmed"]),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const bookingSnapshot = await getDocs(q);
        if (!bookingSnapshot.empty) {
          setNextBooking(bookingSnapshot.docs[0].data());
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-[#D4AF37]">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white pb-20 font-sans">
      
      {/* Header */}
      <div className="p-6 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">أهلاً بك، {userName} 👋</h1>
          <p className="text-gray-400 text-sm mt-1">فين باغي تحلق اليوم؟</p>
        </div>
        <Link href="/profile" className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center border border-white/5 hover:border-[#D4AF37] transition-colors">
          <User className="w-6 h-6 text-[#D4AF37]" />
        </Link>
      </div>

      {/* Next Booking Card */}
      {nextBooking && (
        <div className="px-6 mb-6">
          <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#1A1A1A] border border-[#D4AF37]/30 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-[#D4AF37] font-bold mb-1 flex items-center gap-1"><CalendarDays size={12} /> موعدك القادم</p>
              <p className="font-bold text-white">{nextBooking.barberName}</p>
              <p className="text-sm text-gray-300">{nextBooking.date} • {nextBooking.time}</p>
            </div>
            <Link href="/my-bookings" className="bg-[#D4AF37] text-black text-xs font-bold px-4 py-2 rounded-lg">
              التفاصيل
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-6 flex gap-3 mb-8">
        <Link href="/my-bookings" className="flex-1 bg-[#1A1A1A] border border-white/5 py-3 rounded-xl flex flex-col items-center gap-2 hover:border-[#D4AF37]/50 transition-colors">
          <Clock className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-xs font-semibold">حجوزاتي</span>
        </Link>
        <div className="flex-1 bg-[#1A1A1A] border border-white/5 py-3 rounded-xl flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
          <Search className="w-5 h-5 text-gray-400" />
          <span className="text-xs font-semibold">بحث متقدم (قريباً)</span>
        </div>
      </div>

      {/* Nearest Barbers Title */}
      <div className="px-6 flex justify-between items-end mb-4">
        <h2 className="text-lg font-bold">أقرب الحلاقين إليك</h2>
      </div>

      {/* Barbers List (Compact Version) */}
      <div className="px-6 space-y-4">
        {barbers.slice(0, 5).map(barber => (
          <Link key={barber.id} href={`/customer-booking/${barber.id}`} className="block">
            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 flex gap-4 hover:border-[#D4AF37]/50 transition-colors">
              <div className="w-16 h-16 bg-[#0B0B0B] rounded-xl flex items-center justify-center shrink-0">
                <Scissors className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{barber.shopName}</h3>
                <p className="text-sm text-gray-400">{barber.fullName}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-300">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {barber.distance} km</span>
                  <span className="flex items-center gap-1"><Star size={12} className="text-[#D4AF37]" /> 4.8</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}