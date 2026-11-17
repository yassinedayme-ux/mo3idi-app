import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';

export const sendLocalNotification = async (title: string, body: string) => {
  try {
    // 1. طلب الإذن (لأول مرة فقط)
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // 2. تحضير الإشعار
    const notification: LocalNotificationSchema = {
      title: title,
      body: body,
      id: Math.floor(Math.random() * 10000),
      schedule: { at: new Date(Date.now() + 5000) }, // بعد 5 ثواني
      // حيدنا sound: null حيت كتسبب مشكل فـ TypeScript
    };

    // 3. إرسال الإشعار
    await LocalNotifications.schedule({
      notifications: [notification]
    });
    
    console.log("Notification scheduled successfully!");
  } catch (error) {
    console.error("Notification error:", error);
  }
};