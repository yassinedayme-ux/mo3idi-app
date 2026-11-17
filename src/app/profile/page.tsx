"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { User, Store, Phone, Mail, LogOut, ChevronLeft, Save, Edit, Lock, MessageCircle, Globe } from "lucide-react";
import { toast } from "sonner";
import DeleteAccountButton from "@/components/DeleteAccountButton";

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // State for Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [editForm, setEditForm] = useState({ fullName: "", phone: "", shopName: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/onboarding");
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setEditForm({
            fullName: data.fullName || "",
            phone: data.phone || "",
            shopName: data.shopName || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const updateData: any = {
        fullName: editForm.fullName,
        phone: editForm.phone,
      };
      
      if (userData.role === "barber") {
        updateData.shopName = editForm.shopName;
      }

      await updateDoc(doc(db, "users", user.uid), updateData);
      
      setUserData({ ...userData, ...updateData });
      setIsEditing(false);
      toast.success("تم تحديث البيانات بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    
    setIsChangingPassword(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        toast.success("تم تغيير كلمة المرور بنجاح!");
        setShowPasswordModal(false);
        setNewPassword("");
      }
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error("لأسباب أمنية، يرجى تسجيل الخروج ثم الدخول مجدداً لتغيير كلمة المرور.");
      } else {
        toast.error("حدث خطأ أثناء تغيير كلمة المرور.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/onboarding");
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-[#D4AF37]">جاري التحميل...</div>;
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white pb-20 font-sans relative">
      
      {/* Header */}
      <div className="flex items-center gap-4 p-6 bg-[#1A1A1A] border-b border-white/5 rounded-b-3xl">
        <button onClick={() => router.back()} className="w-10 h-10 bg-[#0B0B0B] rounded-full flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">الإعدادات (Settings)</h1>
        <div className="flex-1"></div>
        <button onClick={() => setIsEditing(!isEditing)} className="text-[#D4AF37] font-semibold flex items-center gap-1">
          {isEditing ? "إلغاء" : <><Edit size={16} /> تعديل</>}
        </button>
      </div>

      <div className="p-6 max-w-md mx-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-[#D4AF37] rounded-full flex items-center justify-center text-black mb-4 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            {userData.role === "barber" ? <Store size={40} /> : <User size={40} />}
          </div>
          <span className={`px-4 py-1 rounded-full text-xs font-bold ${userData.role === "barber" ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "bg-blue-500/20 text-blue-400"}`}>
            {userData.role === "barber" ? "BARBER ACCOUNT" : "CUSTOMER ACCOUNT"}
          </span>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5">
            <label className="text-xs text-gray-400 mb-1 block">الاسم الكامل (Full Name)</label>
            {isEditing ? (
              <input type="text" value={editForm.fullName} onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg p-2 text-white" />
            ) : (
              <p className="text-lg font-semibold">{userData.fullName}</p>
            )}
          </div>

          {userData.role === "barber" && (
            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5">
              <label className="text-xs text-gray-400 mb-1 block">اسم الصالون (Shop Name)</label>
              {isEditing ? (
                <input type="text" value={editForm.shopName} onChange={(e) => setEditForm({...editForm, shopName: e.target.value})} className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg p-2 text-white" />
              ) : (
                <p className="text-lg font-semibold text-[#D4AF37]">{userData.shopName || "No shop name set"}</p>
              )}
            </div>
          )}

          <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5">
            <label className="text-xs text-gray-400 mb-1 block">رقم الهاتف (Phone)</label>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray-400" />
              {isEditing ? (
                <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-[#0B0B0B] border border-white/10 rounded-lg p-2 text-white" dir="ltr" />
              ) : (
                <p className="font-semibold" dir="ltr">{userData.phone}</p>
              )}
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5">
            <label className="text-xs text-gray-400 mb-1 block">البريد الإلكتروني (Email)</label>
            <div className="flex items-center gap-2 text-gray-400">
              <Mail size={16} />
              <p className="text-sm" dir="ltr">{userData.email}</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <button onClick={handleSave} className="w-full mt-6 bg-[#D4AF37] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#c29f32]">
            <Save size={18} /> حفظ التغييرات
          </button>
        )}

        {/* Action Buttons */}
        {!isEditing && (
          <div className="mt-8 space-y-3">
            
            {/* Change Password Button */}
            <button onClick={() => setShowPasswordModal(true)} className="w-full bg-[#1A1A1A] border border-white/5 py-4 rounded-xl flex items-center justify-center gap-2 font-semibold hover:border-[#D4AF37]/50 transition-colors">
              <Lock size={18} className="text-[#D4AF37]" /> تغيير كلمة المرور
            </button>

            {/* Contact Support (WhatsApp) */}
            <a href="https://wa.me/212600000000" target="_blank" rel="noreferrer" className="w-full bg-[#1A1A1A] border border-white/5 py-4 rounded-xl flex items-center justify-center gap-2 font-semibold hover:border-green-500/50 transition-colors">
              <MessageCircle size={18} className="text-green-500" /> تواصل مع الدعم
            </a>

            <button onClick={handleLogout} className="w-full bg-[#1A1A1A] border border-white/5 py-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-red-400 hover:text-red-300 transition-colors mt-4">
              <LogOut size={18} /> تسجيل الخروج
            </button>

            <div className="pt-4 border-t border-white/5 mt-4">
               <DeleteAccountButton />
            </div>

            <div className="mt-6 flex justify-center gap-6 text-xs text-gray-500 mb-4">
              <Link href="/privacy" className="hover:text-[#D4AF37]">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#D4AF37]">Terms of Service</Link>
            </div>
            
            <p className="text-center text-xs text-gray-600 pb-4">Mo3idi v1.0.0</p>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="text-xl font-bold mb-4 text-white">تغيير كلمة المرور</h3>
            <form onSubmit={handleChangePassword}>
              <input 
                type="password" 
                placeholder="كلمة المرور الجديدة" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl p-3 text-white mb-4"
                required
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 bg-[#0B0B0B] text-gray-400 py-3 rounded-xl font-bold">إلغاء</button>
                <button type="submit" disabled={isChangingPassword} className="flex-1 bg-[#D4AF37] text-black py-3 rounded-xl font-bold">
                  {isChangingPassword ? "جاري التغيير..." : "تأكيد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}