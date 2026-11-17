"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scissors, Phone, Lock, User, Store, MapPin, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// إحداثيات المدن
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  "casablanca": { lat: 33.5731, lng: -7.5898 },
  "rabat": { lat: 34.0209, lng: -6.8416 },
  "marrakech": { lat: 31.6295, lng: -7.9811 },
  "riyadh-olaya": { lat: 24.7136, lng: 46.6753 },
  "jeddah": { lat: 21.4858, lng: 39.1925 },
  "dubai": { lat: 25.2048, lng: 55.2708 },
  "paris": { lat: 48.8566, lng: 2.3522 },
  "london": { lat: 51.5074, lng: -0.1278 },
};

export default function BarberPortalPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    shopName: "",
    phone: "",
    email: "",
    location: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        // تسجيل الدخول
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        router.push("/barber-admin-dashboard");
      } else {
        // إنشاء حساب جديد
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // جلب الإحداثيات بناءً على المدينة المختارة
        const coords = cityCoordinates[formData.location] || { lat: 0, lng: 0 };

        // حفظ البيانات فـ Firestore
        await setDoc(doc(db, "barbers", user.uid), {
          uid: user.uid,
          fullName: formData.fullName,
          shopName: formData.shopName,
          phone: formData.phone,
          email: formData.email,
          location: formData.location,
          lat: coords.lat,
          lng: coords.lng,
          createdAt: new Date(),
        });

        router.push("/barber-admin-dashboard");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("هاد الإيميل مسجل من قبل. جرب تسجل الدخول.");
      } else if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setError("الإيميل أو كلمة المرور غالطة.");
      } else if (err.code === "auth/weak-password") {
        setError("كلمة المرور ضعيفة، خاصها تكون 6 حروف أو أرقام على الأقل.");
      } else {
        setError(err.message || "حدث خطأ ما. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col justify-center px-6 py-10 font-sans text-white">
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-[#D4AF37] rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          <Scissors className="text-black w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full border border-[#D4AF37]/20">
            BARBER PORTAL
          </span>
        </div>
        <h1 className="text-2xl font-bold text-center">
          {isLogin ? "Barber Login" : "Join as a Barber"}
        </h1>
        <p className="text-gray-400 text-sm mt-2 text-center">
          {isLogin 
            ? "Sign in to manage your bookings and schedule." 
            : "Register your shop and start receiving bookings today."}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name (e.g. Ahmed Ali)"
              required
              className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
        )}

        {!isLogin && (
          <div className="relative">
            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              placeholder="Barbershop Name"
              required
              className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
        )}

        {!isLogin && (
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number (+212...)"
              required
              className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors text-left"
              dir="ltr"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors text-left"
            dir="ltr"
          />
        </div>

        {!isLogin && (
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none"
            >
              <option value="" disabled>Select your city / district</option>
              <optgroup label="Morocco 🇲🇦">
                <option value="casablanca">Casablanca</option>
                <option value="rabat">Rabat</option>
                <option value="marrakech">Marrakech</option>
              </optgroup>
              <optgroup label="Saudi Arabia 🇸🇦">
                <option value="riyadh-olaya">Riyadh - Al Olaya</option>
                <option value="jeddah">Jeddah</option>
              </optgroup>
              <optgroup label="UAE 🇦🇪">
                <option value="dubai">Dubai</option>
              </optgroup>
              <optgroup label="Europe 🇪🇺">
                <option value="paris">Paris</option>
                <option value="london">London</option>
              </optgroup>
            </select>
          </div>
        )}

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        {isLogin && (
          <div className="flex justify-end pt-2">
            <button type="button" className="text-[#D4AF37] text-sm font-medium hover:underline">
              Forgot Password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#D4AF37] text-black font-bold text-lg rounded-xl py-4 mt-6 flex items-center justify-center gap-2 hover:bg-[#c29f32] transition-colors shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Please wait..." : (isLogin ? "Sign In to Dashboard" : "Create Barber Account")}
          {!isLoading && <ArrowRight className="w-5 h-5" />}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          {isLogin ? "Want to join Mo3idi?" : "Already registered?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#D4AF37] font-bold ml-2 hover:underline focus:outline-none"
          >
            {isLogin ? "Register your shop" : "Login here"}
          </button>
        </p>
      </div>

      {!isLogin && (
        <div className="mt-8 bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
          <h3 className="text-sm font-bold text-white mb-3">Why join Mo3idi?</h3>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Manage your bookings easily
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Get discovered by new customers
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Showcase your portfolio and reviews
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}