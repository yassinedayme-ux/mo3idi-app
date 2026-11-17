"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, X, Loader2, CheckCircle2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { ServiceFormValues, ServiceSchema } from '@/lib/validations';
import { AdminService } from '@/types'; // تأكد أنك درتي هاد الـ Interface فـ types/index.ts

interface Props {
  services: AdminService[];
  isRtl: boolean;
  lang: string;
}

export default function ServicesManager({ services, isRtl, lang }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // إعداد react-hook-form مع Zod
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ServiceFormValues>({
    resolver: zodResolver(ServiceSchema) as any, // 👈 زدنا as any باش نحلو مشكل TypeScript نهائياً
    defaultValues: { 
      name: '', 
      price: 0, 
      duration: 30, 
      isActive: true 
    }
  });

  const t = {
    en: { title: 'Services Management', add: 'Add Service', service: 'SERVICE', price: 'PRICE', duration: 'DURATION', status: 'STATUS', actions: 'ACTIONS', active: 'Active', inactive: 'Inactive', save: 'Save Service', empty: 'No services added yet.' },
    ar: { title: 'إدارة الخدمات', add: 'إضافة خدمة', service: 'الخدمة', price: 'السعر', duration: 'المدة', status: 'الحالة', actions: 'الإجراءات', active: 'نشط', inactive: 'غير نشط', save: 'حفظ الخدمة', empty: 'لا توجد خدمات مضافة بعد.' }
  }[lang === 'ar' ? 'ar' : 'en'];

  // 1. إضافة خدمة (مع Zod Validation)
  const onSubmit = async (data: ServiceFormValues) => {
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, "services"), {
        barberId: auth.currentUser.uid,
        name: data.name,
        price: data.price,
        duration: data.duration,
        isActive: true,
        createdAt: serverTimestamp()
      });
      
      toast.success(lang === 'ar' ? 'تمت إضافة الخدمة بنجاح' : 'Service added successfully');
      setShowModal(false);
      reset(); // مسح الفورم
    } catch (error) {
      console.error(error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء الإضافة' : 'Error adding service');
    }
  };

  // 2. حذف خدمة
  const handleDeleteService = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Are you sure you want to delete this service?')) return;
    
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "services", id));
      toast.success(lang === 'ar' ? 'تم حذف الخدمة' : 'Service deleted');
    } catch (error) {
      console.error(error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Error deleting service');
    } finally {
      setDeletingId(null);
    }
  };

  // 3. تغيير الحالة (نشط / غير نشط)
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "services", id), { isActive: !currentStatus });
      toast.success(lang === 'ar' ? 'تم تحديث الحالة' : 'Status updated');
    } catch (error) {
      console.error(error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Error updating status');
    }
  };

  return (
    <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
          {t.title}
        </h3>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#D4AF37] text-black px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#c29f32] transition-colors shadow-lg shadow-[#D4AF37]/20"
        >
          <Plus size={16} /> {t.add}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left" dir={isRtl ? 'rtl' : 'ltr'}>
          <thead>
            <tr className="text-gray-400 text-sm border-b border-white/5">
              <th className="pb-3 font-medium">{t.service}</th>
              <th className="pb-3 font-medium">{t.price}</th>
              <th className="pb-3 font-medium">{t.duration}</th>
              <th className="pb-3 font-medium">{t.status}</th>
              <th className="pb-3 font-medium text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {services.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">{t.empty}</td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-4 font-medium text-white">{service.name}</td>
                  <td className="py-4 text-[#D4AF37]">{service.price} SAR</td>
                  <td className="py-4 text-gray-400">{service.duration} min</td>
                  <td className="py-4">
                    <button 
                      onClick={() => handleToggleStatus(service.id, service.isActive)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        service.isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${service.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      {service.isActive ? t.active : t.inactive}
                    </button>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg"><Edit size={16} /></button>
                      <button 
                        onClick={() => handleDeleteService(service.id)} 
                        disabled={deletingId === service.id}
                        className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 rounded-lg"
                      >
                        {deletingId === service.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] rounded-2xl w-full max-w-md border border-white/10 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{t.add}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            
            {/* 👇 الفورم مربوط مع Zod */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Service Name (EN)</label>
                <input 
                  {...register('name')}
                  type="text" 
                  className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]" 
                  placeholder="e.g. Haircut" 
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">{t.price} (SAR)</label>
                  <input 
                    {...register('price', { valueAsNumber: true })}
                    type="number" 
                    className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]" 
                    placeholder="40" 
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">{t.duration} (min)</label>
                  <input 
                    {...register('duration', { valueAsNumber: true })}
                    type="number" 
                    className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]" 
                    placeholder="30" 
                  />
                  {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                </div>
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#D4AF37] text-black font-bold rounded-xl py-3 mt-4 hover:bg-[#c29f32] transition-colors flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : t.save}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}