export const showBrowserNotification = (title, body) => {
  if (!("Notification" in window)) return;

  const iconUrl = '/notifyIcon.png'; // relative to public

  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: iconUrl });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body, icon: iconUrl });
      }
    });
  }
};
