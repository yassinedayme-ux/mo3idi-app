"use client";

import { useEffect, useState } from "react";
import { Network } from "@capacitor/network";
import { Capacitor } from "@capacitor/core";
import { WifiOff, RotateCw } from "lucide-react";

export default function NetworkGuard({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 1. التحقق الأولي من حالة الاتصال
    const checkInitialStatus = async () => {
      if (Capacitor.isNativePlatform()) {
        const status = await Network.getStatus();
        setIsOffline(!status.connected);
      } else {
        // إذا كنا في المتصفح
        setIsOffline(!navigator.onLine);
      }
      setIsChecking(false);
    };

    checkInitialStatus();

    // 2. الاستماع لتغيرات الاتصال (سواء في التطبيق أو المتصفح)
    let listenerHandle: any;

    if (Capacitor.isNativePlatform()) {
      Network.addListener("networkStatusChange", (status) => {
        setIsOffline(!status.connected);
      }).then((handle) => {
        listenerHandle = handle;
      });
    } else {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }

    return () => {
      if (listenerHandle) listenerHandle.remove();
    };
  }, []);

  const handleRetry = () => {
    window.location.reload(); // إعادة تحميل التطبيق لمحاولة الاتصال مجدداً
  };

  // شاشة التحميل الأولية
  if (isChecking) {
    return <div className="min-h-screen bg-[#0B0B0B]"></div>;
  }

  // 🚨 شاشة انقطاع الإنترنت (بتمنع المستخدم من استخدام التطبيق)
  if (isOffline) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#0B0B0B] flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-6 border border-white/5">
          <WifiOff className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-center">No Internet Connection</h1>
        <p className="text-gray-400 text-sm text-center mb-8 max-w-xs">
          Mo3idi needs an active internet connection to fetch bookings, manage services, and connect with barbers.
        </p>

        <button
          onClick={handleRetry}
          className="bg-[#D4AF37] text-black font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-[#c29f32] transition-colors"
        >
          <RotateCw size={18} />
          Try Again
        </button>
      </div>
    );
  }

  // إذا كان الاتصال سليماً، اعرض محتوى التطبيق الطبيعي
  return <>{children}</>;
}