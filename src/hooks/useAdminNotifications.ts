import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AdminNotification } from '../types';

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Query for unread notifications
    const notificationsQuery = query(
      collection(db, 'admin_notifications'),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationsData: AdminNotification[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AdminNotification[];

        setNotifications(notificationsData);
        setUnreadCount(notificationsData.length);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching notifications:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'admin_notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      const updatePromises = notifications.map((notification) =>
        updateDoc(doc(db, 'admin_notifications', notification.id), {
          read: true,
        })
      );
      await Promise.all(updatePromises);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  };
};
