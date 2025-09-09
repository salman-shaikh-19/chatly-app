import { toast } from "react-toastify";

export const showBrowserNotification = (title, body) => {
  if (!("Notification" in window)) 
    {
      // toast.warning("Notification is not supported in your browser").
      // alert("Notification is not supported in your browser")
      return;}


  const iconUrl = '/notifyIcon.png'; // relative to public

  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: iconUrl });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body, icon: iconUrl });
      }else {
        toast.info("You denied browser notifications.");
      }
    });
  }
};
