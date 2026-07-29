import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { registerNotificationDevice, subscribeUserNotifications } from '../services/notificationStore';

function canUseBrowserNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

function notifyBrowser(notification) {
  if (!canUseBrowserNotifications() || Notification.permission !== 'granted') return;

  const browserNotification = new Notification(notification.title, {
    body: notification.body,
    tag: notification.id,
  });

  browserNotification.onclick = () => {
    window.focus();
    if (notification.targetPath) {
      window.location.hash = notification.targetPath;
    }
    browserNotification.close();
  };
}

export default function NotificationCenter() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [latestNotification, setLatestNotification] = useState(null);
  const [permission, setPermission] = useState(() => (canUseBrowserNotifications() ? Notification.permission : 'unsupported'));

  useEffect(() => {
    if (!auth?.user?.uid) return undefined;

    const unsubscribe = subscribeUserNotifications(
      auth.user.uid,
      (notification) => {
        setLatestNotification(notification);
        notifyBrowser(notification);
      },
      (error) => {
        console.error('Notifications subscribe failed:', error);
      },
    );

    return () => unsubscribe?.();
  }, [auth?.user?.uid]);

  useEffect(() => {
    if (!auth?.user?.uid || permission !== 'granted') return undefined;

    registerNotificationDevice(auth.user.uid)
      .catch((error) => {
        console.warn('Notification device registration failed:', error);
      });
  }, [auth?.user?.uid, permission]);

  useEffect(() => {
    if (!latestNotification) return undefined;

    const timeoutId = window.setTimeout(() => {
      setLatestNotification(null);
    }, 7000);

    return () => window.clearTimeout(timeoutId);
  }, [latestNotification]);

  const requestBrowserNotifications = async () => {
    if (!canUseBrowserNotifications()) return;
    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
  };

  const openNotification = () => {
    if (latestNotification?.targetPath) {
      navigate(latestNotification.targetPath);
    }
    setLatestNotification(null);
  };

  const shouldShowPermissionAction = canUseBrowserNotifications() && permission === 'default';

  if (!latestNotification && !shouldShowPermissionAction) return null;

  return (
    <aside className="notification-center" aria-live="polite">
      {shouldShowPermissionAction && (
        <button className="notification-permission-button" type="button" onClick={requestBrowserNotifications}>
          기기 알림 켜기
        </button>
      )}
      {latestNotification && (
        <div className="notification-toast">
          <button className="notification-close-button" type="button" onClick={() => setLatestNotification(null)} aria-label="알림 닫기">×</button>
          <strong>{latestNotification.title}</strong>
          <span>{latestNotification.body}</span>
          <button type="button" onClick={openNotification}>보기</button>
        </div>
      )}
    </aside>
  );
}
