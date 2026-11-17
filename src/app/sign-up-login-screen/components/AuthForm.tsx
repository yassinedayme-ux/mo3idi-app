'use client';

import React, { useState, useEffect } from 'react'; 
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation'; 
import {
  Eye, EyeOff, Mail, Lock, User, Phone, Globe,
  Scissors, ChevronRight, Loader2,
} from 'lucide-react';
import type { AuthLang, AuthMode, AuthRole } from './AuthClient';
import { auth, db } from "@/lib/firebase"; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface LoginValues {
  email: string;
  password: string;
}

interface SignupValues {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  role: AuthRole;
}

interface Props {
  lang: AuthLang;
  setLang: (l: AuthLang) => void;
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  isRtl: boolean;
}

export default function AuthForm({ lang, setLang, mode, setMode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AuthRole>('barber');

  const loginForm = useForm<LoginValues>();
  const signupForm = useForm<SignupValues>({ defaultValues: { role: 'barber' } });

  useEffect(() => {
    const urlRole = searchParams.get('role');
    if (urlRole === 'barber' || urlRole === 'customer') {
      setSelectedRole(urlRole as AuthRole);
      signupForm.setValue('role', urlRole as AuthRole);
      setMode('signup'); 
    }
  }, [searchParams, setMode, signupForm]);

  // 🔥 دالة تسجيل الدخول (تم إصلاح مشكل User data incomplete)
  const onLogin = async (data: LoginValues) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        toast.success(lang === 'ar' ? `مرحباً! جاري التوجيه...` : `Welcome back! Redirecting...`);
        
        if (userRole === 'barber') {
          router.push('/barber-admin-dashboard');
        } else {
          router.push('/customer-booking');
        }
      } else {
        // 🚨 الحل: إذا الحساب كاين ف Auth ولكن مالقيناش الداتا ف Firestore
        // كنصايبو ملف افتراضي باش ما يتبلوكاش المستخدم
        const defaultProfile = {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName || user.email?.split('@')[0] || "User",
          phone: "",
          role: "customer", // كنفترضو أنه زبون
          createdAt: new Date(),
        };
        
        await setDoc(userDocRef, defaultProfile);
        
        toast.success(lang === 'ar' ? 'تم استرجاع حسابك بنجاح!' : 'Account recovered successfully!');
        router.push('/customer-booking');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(lang === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials');
      loginForm.setError('email', { message: lang === 'ar' ? 'الإيميل أو الباسورد غالط' : 'Invalid email or password' });
    }
  };

  // 🔥 دالة إنشاء حساب
  const onSignup = async (data: SignupValues) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // ✅ زدنا await هنا باش نضمنو أن البيانات تسجلت قبل التوجيه
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        role: data.role,
        createdAt: new Date(),
      });

      toast.success(lang === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!');
      
      if (data.role === 'barber') {
        router.push('/barber-admin-dashboard');
      } else {
        router.push('/customer-booking');
      }

    } catch (error: any) {
      console.error(error);
      
      if (error.code === 'auth/email-already-in-use') {
        signupForm.setError('email', { message: lang === 'ar' ? 'هذا الإيميل مستخدم بالفعل' : 'Email already in use' });
      } else if (error.code === 'auth/weak-password') {
        signupForm.setError('password', { message: lang === 'ar' ? 'كلمة المرور ضعيفة (6 حروف على الأقل)' : 'Password too weak (min 6 chars)' });
      } else {
        toast.error(lang === 'ar' ? 'حدث خطأ أثناء إنشاء الحساب' : 'Error creating account');
      }
    }
  };

  const t = {
    en: {
      welcome: 'Welcome back', welcomeSub: 'Sign in to your Mo3idi account',
      createAccount: 'Create your account', createSub: 'Join Mo3idi — free for barbers & customers',
      email: 'Email Address', password: 'Password', fullName: 'Full Name', phone: 'Phone Number',
      role: 'I am a', barber: 'Barber', customer: 'Customer', signIn: 'Sign In', signUp: 'Create Account',
      noAccount: "Don't have an account?", hasAccount: 'Already have an account?',
      signUpLink: 'Sign up', signInLink: 'Sign in',
      emailPlaceholder: 'ahmed@mo3idi.sa', passwordPlaceholder: '••••••••',
      namePlaceholder: 'Mohammed Al-Rashid', phonePlaceholder: '+966 5X XXX XXXX',
    },
    ar: {
      welcome: 'مرحباً بعودتك', welcomeSub: 'سجّل دخولك إلى حساب موعدي',
      createAccount: 'أنشئ حسابك', createSub: 'انضم إلى موعدي — مجاني للحلاقين والعملاء',
      email: 'البريد الإلكتروني', password: 'كلمة المرور', fullName: 'الاسم الكامل', phone: 'رقم الجوال',
      role: 'أنا', barber: 'حلاق', customer: 'عميل', signIn: 'تسجيل الدخول', signUp: 'إنشاء حساب',
      noAccount: 'ليس لديك حساب؟', hasAccount: 'لديك حساب بالفعل؟',
      signUpLink: 'سجّل الآن', signInLink: 'سجّل دخولك',
      emailPlaceholder: 'ahmed@mo3idi.sa', passwordPlaceholder: '••••••••',
      namePlaceholder: 'محمد الراشد', phonePlaceholder: '+966 5X XXX XXXX',
    },
  }[lang];

  const inputBase = { background: 'hsl(0 0% 9%)', border: '1px solid hsl(0 0% 20%)', color: 'white' };
  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'hsl(43 52% 54%)';
    e.currentTarget.style.boxShadow = '0 0 0 2px hsl(43 52% 54% / 0.15)';
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'hsl(0 0% 20%)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex lg:hidden items-center justify-center gap-2 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(35 42% 42%), hsl(43 62% 67%))' }}>
          <Scissors size={18} className="text-black" />
        </div>
        <span className="text-xl font-bold" style={{ color: 'hsl(43 62% 67%)' }}>{lang === 'ar' ? 'موعدي' : 'Mo3idi'}</span>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: 'hsl(0 0% 13%)', border: '1px solid hsl(0 0% 20%)', color: 'hsl(43 62% 67%)' }}>
          <Globe size={13} /> {lang === 'en' ? 'عربي' : 'EN'}
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white">{mode === 'login' ? t.welcome : t.createAccount}</h2>
        <p className="text-sm mt-1" style={{ color: 'hsl(0 0% 50%)' }}>{mode === 'login' ? t.welcomeSub : t.createSub}</p>
      </div>

      <div className="flex rounded-xl p-1" style={{ background: 'hsl(0 0% 10%)', border: '1px solid hsl(0 0% 18%)' }}>
        {(['login', 'signup'] as AuthMode[]).map((m) => (
          <button key={`tab-${m}`} onClick={() => setMode(m)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all" style={{ background: mode === m ? 'linear-gradient(135deg, hsl(35 42% 42%), hsl(43 52% 54%))' : 'transparent', color: mode === m ? '#0f0f0f' : 'hsl(0 0% 50%)' }}>
            {m === 'login' ? t.signIn : t.signUp}
          </button>
        ))}
      </div>

      {/* LOGIN FORM */}
      {mode === 'login' && (
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 animate-fade-in">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white flex items-center gap-1.5"><Mail size={13} style={{ color: 'hsl(43 52% 54%)' }} /> {t.email}</label>
            <input {...loginForm.register('email', { required: true })} type="email" placeholder={t.emailPlaceholder} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={inputBase} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white flex items-center gap-1.5"><Lock size={13} style={{ color: 'hsl(43 52% 54%)' }} /> {t.password}</label>
            <div className="relative">
              <input {...loginForm.register('password', { required: true })} type={showPassword ? 'text' : 'password'} placeholder={t.passwordPlaceholder} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-11" style={inputBase} onFocus={inputFocus} onBlur={inputBlur} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 -translate-y-1/2 right-3 transition-all" style={{ color: 'hsl(0 0% 40%)' }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          <button type="submit" disabled={loginForm.formState.isSubmitting} className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-black bg-[#D4AF37] hover:bg-[#c29f32]">
            {loginForm.formState.isSubmitting ? <><Loader2 size={16} className="animate-spin" /> {lang === 'ar' ? 'جاري الدخول...' : 'Signing in...'}</> : <>{t.signIn} <ChevronRight size={16} /></>}
          </button>
        </form>
      )}

      {/* SIGNUP FORM */}
      {mode === 'signup' && (
        <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4 animate-fade-in">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white">{t.role}</label>
            <div className="grid grid-cols-2 gap-3">
              {(['barber', 'customer'] as AuthRole[]).map((role) => (
                <button key={`role-${role}`} type="button" onClick={() => { setSelectedRole(role); signupForm.setValue('role', role); }} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all" style={{ background: selectedRole === role ? 'hsl(43 52% 54% / 0.12)' : 'hsl(0 0% 10%)', border: `1px solid ${selectedRole === role ? 'hsl(43 52% 54%)' : 'hsl(0 0% 20%)'}`, color: selectedRole === role ? 'hsl(43 62% 67%)' : 'hsl(0 0% 55%)' }}>
                  {role === 'barber' ? <Scissors size={15} /> : <User size={15} />} {role === 'barber' ? t.barber : t.customer}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white flex items-center gap-1.5"><User size={13} style={{ color: 'hsl(43 52% 54%)' }} /> {t.fullName}</label>
            <input {...signupForm.register('fullName', { required: true })} type="text" placeholder={t.namePlaceholder} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={inputBase} onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white flex items-center gap-1.5"><Phone size={13} style={{ color: 'hsl(43 52% 54%)' }} /> {t.phone}</label>
            <input {...signupForm.register('phone', { required: true })} type="tel" placeholder={t.phonePlaceholder} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={inputBase} onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white flex items-center gap-1.5"><Mail size={13} style={{ color: 'hsl(43 52% 54%)' }} /> {t.email}</label>
            <input {...signupForm.register('email', { required: true })} type="email" placeholder={t.emailPlaceholder} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={inputBase} onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white flex items-center gap-1.5"><Lock size={13} style={{ color: 'hsl(43 52% 54%)' }} /> {t.password}</label>
            <div className="relative">
              <input {...signupForm.register('password', { required: true, minLength: 6 })} type={showPassword ? 'text' : 'password'} placeholder={t.passwordPlaceholder} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-11" style={inputBase} onFocus={inputFocus} onBlur={inputBlur} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 -translate-y-1/2 right-3 transition-all" style={{ color: 'hsl(0 0% 40%)' }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>

          <button type="submit" disabled={signupForm.formState.isSubmitting} className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-black bg-[#D4AF37] hover:bg-[#c29f32]">
            {signupForm.formState.isSubmitting ? <><Loader2 size={16} className="animate-spin" /> {lang === 'ar' ? 'جاري الإنشاء...' : 'Creating account...'}</> : <>{t.signUp} <ChevronRight size={16} /></>}
          </button>
        </form>
      )}
    </div>
  );
}