"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole: "customer" | "barber";
}

export default function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // 1. إلا كان مامسجلش، كنوجهوه لشاشة الترحيب
        router.replace("/onboarding");
        return;
      }

      try {
        // 2. كنشوفو واش عندو حساب فـ Firestore وشنو هو الدور ديالو
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userRole = userDoc.data().role;
          
          if (userRole === allowedRole) {
            // 3. إلا كان الدور صحيح (مثلاً حلاق كيحاول يدخل للداشبورد ديالو)
            setIsAuthorized(true);
          } else {
            // 4. إلا كان الدور خاطئ (مثلاً زبون كيحاول يدخل للداشبورد ديال الحلاق)
            router.replace(userRole === "barber" ? "/barber-admin-dashboard" : "/customer-booking");
          }
        } else {
          // إلا كان الحساب موجود فـ Auth ولكن مالقيناش البيانات فـ Firestore
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("Auth error:", error);
        router.replace("/onboarding");
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, allowedRole]);

  // شاشة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-[#D4AF37]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  // كيعرض الصفحة غير إلا كان المستخدم مسجل وعندو الدور الصحيح
  return isAuthorized ? <>{children}</> : null;
}