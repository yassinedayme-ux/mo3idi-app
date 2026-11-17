// src/data/mockBarbers.ts
export interface Barber { id: string; name: string; specialty: string; shopName: string; rating: number; lat: number; lng: number; status: 'Available' | 'Busy'; waitTime: string; image: string; }

export const mockBarbers: Barber[] = [
  { id: '1', name: 'Ahmed Al-Qahtani', specialty: 'Fade & Modern Cuts', shopName: 'Royal Cuts Riyadh', rating: 4.9, lat: 24.7136, lng: 46.6753, status: 'Available', waitTime: 'Now', image: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', name: 'Khalid Al-Dosari', specialty: 'Beard Shaping', shopName: "The Gentleman's Den", rating: 4.8, lat: 24.7236, lng: 46.6653, status: 'Available', waitTime: '~10 min', image: 'https://i.pravatar.cc/150?img=12' },
  { id: '3', name: 'Omar Bin Saleh', specialty: 'Classic Cuts', shopName: 'Heritage Barbershop', rating: 4.7, lat: 24.7336, lng: 46.6853, status: 'Busy', waitTime: '~25 min', image: 'https://i.pravatar.cc/150?img=13' },
];