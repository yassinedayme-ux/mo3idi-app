"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteAccountButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "هل أنت متأكد؟ سيتم حذف حسابك وجميع بياناتك نهائياً ولا يمكن استرجاعها."
    );
    
    if (!confirmDelete) return;
    setIsDeleting(true);

    try {
      const user = auth.currentUser;
      if (user) {
        // 1. حذف البيانات من Firestore
        try {
          await deleteDoc(doc(db, "users", user.uid));
        } catch (e) {
          console.log("Doc might not exist or already deleted", e);
        }
        
        // 2. حذف الحساب من Firebase Auth
        await deleteUser(user);
        
        toast.success("تم حذف الحساب بنجاح.");
        router.replace("/onboarding");
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/requires-recent-login") {
        toast.error("لأسباب أمنية، يرجى تسجيل الخروج ثم الدخول مجدداً قبل حذف الحساب.");
      } else {
        toast.error("حدث خطأ أثناء محاولة الحذف. يرجى المحاولة لاحقاً.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full flex items-center justify-center gap-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 py-4 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
    >
      {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
      {isDeleting ? "جاري الحذف..." : "حذف الحساب نهائياً"}
    </button>
  );
}