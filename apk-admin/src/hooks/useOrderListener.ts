import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LocalNotifications } from '@capacitor/local-notifications';

export const useOrderListener = () => {
  useEffect(() => {
    // Request permission on mount
    const requestPermission = async () => {
      const status = await LocalNotifications.checkPermissions();
      if (status.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
    };

    requestPermission();

    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload: any) => {
          console.log('New Order Received:', payload);

          await LocalNotifications.schedule({
            notifications: [
              {
                title: "💰 Pesanan Baru Masuk!",
                body: `Total: Rp ${payload.new.total_price?.toLocaleString() || '0'} - Ketuk untuk detail`,
                id: Math.floor(Math.random() * 10000),
                sound: 'beep.wav',
                extra: { orderId: payload.new.id }
              }
            ]
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
