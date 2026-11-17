import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface UserLocation {
  lat: number;
  lng: number;
}

export async function getUserCurrentLocation(): Promise<UserLocation | null> {
  try {
    // 1. إلا كنا فـ المتصفح (Web)
    if (!Capacitor.isNativePlatform()) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.warn('Web GPS Error:', error);
            // إلا رفض المستخدم الإذن، كنعطيوه إحداثيات الرياض كحل احتياطي
            resolve({ lat: 24.7136, lng: 46.6753 });
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }

    // 2. إلا كنا فـ الموبايل (Capacitor)
    const permission = await Geolocation.checkPermissions();
    if (permission.location !== 'granted') {
      const request = await Geolocation.requestPermissions();
      if (request.location !== 'granted') return null;
    }

    const coordinates: Position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    return {
      lat: coordinates.coords.latitude,
      lng: coordinates.coords.longitude,
    };
  } catch (error) {
    console.error('GPS Error:', error);
    // حل احتياطي إلا وقع أي خطأ
    return { lat: 24.7136, lng: 46.6753 };
  }
}