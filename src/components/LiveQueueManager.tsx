"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Users, UserPlus, UserMinus, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function LiveQueueManager() {
  const [queueData, setQueueData] = useState({ isBusy: false, queueCount: 0, avgServiceTime: 30 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      if (!auth.currentUser) return;
      const docRef = doc(db, "barbers", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setQueueData({
          isBusy: data.isBusy || false,
          queueCount: data.queueCount || 0,
          avgServiceTime: data.avgServiceTime || 30,
        });
      }
      setIsLoading(false);
    };
    fetchQueue();
  }, []);

  const updateQueue = async (updates: any) => {
    if (!auth.currentUser) return;
    try {
      // تحديث الداتا فـ Firebase
      await updateDoc(doc(db, "barbers", auth.currentUser.uid), updates);
      // تحديث الشاشة ديال الحلاق دغيا
      setQueueData((prev) => ({ ...prev, ...updates }));
      toast.success("تم تحديث حالة الطابور");
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#D4AF37]" /></div>;

  return (
    <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-white/5 mb-6">
      
      {/* حالة الصالون (مشغول / خاوي) */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2 text-white">
          <Zap className="text-[#D4AF37] w-5 h-5" /> حالة الصالون
        </h3>
        <button 
          onClick={() => updateQueue({ isBusy: !queueData.isBusy })}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            queueData.isBusy 
              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
              : 'bg-green-500/10 text-green-500 border border-green-500/20'
          }`}
        >
          {queueData.isBusy ? "مشغول (Busy)" : "خاوي (Available)"}
        </button>
      </div>

      {/* إدارة الطابور */}
      <div className="flex items-center justify-between bg-[#0B0B0B] p-4 rounded-xl border border-white/5">
        <div>
          <p className="text-sm text-gray-400 mb-1">الناس اللي واقفين فالطابور</p>
          <p className="text-3xl font-bold text-white">{queueData.queueCount}</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => updateQueue({ queueCount: Math.max(0, queueData.queueCount - 1) })}
            className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all"
          >
            <UserMinus size={20} />
          </button>
          <button 
            onClick={() => updateQueue({ queueCount: queueData.queueCount + 1 })}
            className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center hover:bg-green-500/20 active:scale-95 transition-all"
          >
            <UserPlus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}