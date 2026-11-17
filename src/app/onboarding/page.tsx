"use client";
import Link from "next/link";
import { Scissors, User } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col justify-center items-center p-6 text-white font-sans">
      
      {/* Logo */}
      <div className="w-20 h-20 bg-[#D4AF37] rounded-full flex items-center justify-center mb-8">
        <Scissors className="text-black w-10 h-10" />
      </div>

      {/* Headings */}
      <h1 className="text-3xl font-bold mb-2">Welcome to Mo3idi</h1>
      <p className="text-gray-400 mb-10 text-center">How do you want to use the app?</p>

      {/* Role Selection Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Link 
          href="/sign-up-login-screen?role=customer" 
          className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl flex items-center gap-4 hover:border-[#D4AF37] transition-all"
        >
          <User className="w-8 h-8 text-[#D4AF37]" />
          <div>
            <h2 className="text-lg font-bold">I am a Customer</h2>
            <p className="text-xs text-gray-400">Find and book barbers</p>
          </div>
        </Link>
        
        <Link 
          href="/sign-up-login-screen?role=barber" 
          className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl flex items-center gap-4 hover:border-[#D4AF37] transition-all"
        >
          <Scissors className="w-8 h-8 text-[#D4AF37]" />
          <div>
            <h2 className="text-lg font-bold">I am a Barber</h2>
            <p className="text-xs text-gray-400">Manage your shop & bookings</p>
          </div>
        </Link>
      </div>

      {/* 👇 الروابط القانونية (سياسة الخصوصية والشروط) 👇 */}
      <div className="mt-12 text-xs text-gray-500 flex gap-4 text-center">
        <Link href="/privacy" className="hover:text-[#D4AF37] underline">
          Privacy Policy
        </Link>
        <span>•</span>
        <Link href="/terms" className="hover:text-[#D4AF37] underline">
          Terms of Service
        </Link>
      </div>

    </div>
  );
}