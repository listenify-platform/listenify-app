
type NotificationType = 'default' | 'success' | 'warning' | 'error';

interface NotificationOptions {
  type: NotificationType;
  text: string;
  title?: string;
}

export function useNotifications() {
  const { notify } = useNotification();

  function showNotification(options: NotificationOptions) {
    return notify(options);
  }

  return {
    showNotification
  }
}