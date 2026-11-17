"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export default function BackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // هاد الكود كيخدم غير فـ التطبيق (Android/iOS) ماشي فـ المتصفح
    if (!Capacitor.isNativePlatform()) return;

    const backButtonListener = App.addListener("backButton", ({ canGoBack }) => {
      // ليستة بالصفحات الرئيسية (Root Pages)
      const rootPaths = [
        "/onboarding",
        "/customer-booking",
        "/barber-admin-dashboard",
        "/sign-up-login-screen",
        "/"
      ];

      // إلا كان المستخدم فـ صفحة رئيسية، سد التطبيق
      if (rootPaths.includes(pathname)) {
        App.exitApp();
      } else {
        // إلا كان فـ صفحة داخلية (بحال الحجز)، رجع للصفحة اللي قبل
        router.back();
      }
    });

    return () => {
      backButtonListener.then((listener) => listener.remove());
    };
  }, [router, pathname]);

  return null; // هاد المكون ماكيوري حتى شي حاجة فـ الشاشة، غير كيسمع لزر الرجوع
}