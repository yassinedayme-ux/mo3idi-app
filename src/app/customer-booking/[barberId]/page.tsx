import BarberBookingClient from './BarberBookingClient';

// هاد الدالة كتخدم غير فـ السيرفر باش تمر البناء (Build)
export function generateStaticParams() {
  return [{ barberId: '1' }]; 
}

// هنا زدنا async وبدلنا الـ params باش تكون Promise
export default async function Page({ params }: { params: Promise<{ barberId: string }> }) {
  // كنسناو الـ params تحل باش ناخدو منها barberId
  const resolvedParams = await params;
  
  return <BarberBookingClient barberId={resolvedParams.barberId} />;
}