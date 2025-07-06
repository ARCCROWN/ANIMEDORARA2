import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';

const NOTIFICATION_VERSION = 1;

const defaultNotifications: Notification[] = [
  { 
    id: 1, 
    title: "New Feature Added!", 
    message: "You can now request new anime to be added to our collection", 
    date: new Date(Date.now() - 259200000).toISOString(), 
    read: false 
  },
  { 
    id: 2, 
    title: "Platform in Testing Phase", 
    message: "Welcome to the early release of our web platform! Please be aware that this site is currently in V1 testing, and many features are still under development. At the moment, we're only integrated with the Dailymotion model. Your feedback is invaluable—if you encounter any issues or missing functionality, please let us know so we can improve. In the next testing phase, we plan to introduce an enhanced model and additional capabilities. Thank you for helping us build a better experience!", 
    date: new Date().toISOString(), 
    image: "https://i.pinimg.com/originals/e3/ee/f0/e3eef0b4441925a54923dc00f7ef7d36.gif", 
    read: false 
  },
  { 
    id: 3, 
    title: "Report Link Section Added", 
    message: "I have fixed the issue with the report link not working and added the entire section. It is now working properly. Thank you!", 
    date: new Date().toISOString(), 
    read: false 
  }
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const saveNotifications = useCallback((notificationList: Notification[]) => {
    localStorage.setItem('notifications', JSON.stringify(notificationList));
    setNotifications(notificationList);
  }, []);

  const initNotifications = useCallback(() => {
    try {
      const storedRaw = localStorage.getItem('notifications');
      const stored = storedRaw ? JSON.parse(storedRaw) : [];
      
      const readMap: { [key: number]: boolean } = {};
      stored.forEach((n: Notification) => { readMap[n.id] = n.read; });
      const custom = stored.filter((n: Notification) => !defaultNotifications.some(bi => bi.id === n.id));

      const mergedBuiltIns = defaultNotifications.map(bi => ({
        ...bi,
        read: readMap[bi.id] !== undefined ? readMap[bi.id] : bi.read
      }));

      const combined = [...mergedBuiltIns, ...custom];

      localStorage.setItem('notification_version', NOTIFICATION_VERSION.toString());
      saveNotifications(combined);
    } catch (error) {
      console.error('Error initializing notifications:', error);
      saveNotifications(defaultNotifications);
    }
  }, [saveNotifications]);

  useEffect(() => {
    initNotifications();
  }, [initNotifications]);

  const addNotification = useCallback((title: string, message: string, image?: string) => {
    const newNotification: Notification = { 
      id: Date.now(), 
      title, 
      message, 
      image, 
      date: new Date().toISOString(), 
      read: false 
    };
    
    const updated = [newNotification, ...notifications];
    saveNotifications(updated);
    return newNotification;
  }, [notifications, saveNotifications]);

  const markAsRead = useCallback((id: number) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    initNotifications
  };
};