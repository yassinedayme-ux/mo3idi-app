import { redirect } from 'next/navigation';

export default function Home() {
  // كنوجهو المستخدم ديريكت لشاشة الترحيب
  redirect('/onboarding');
}