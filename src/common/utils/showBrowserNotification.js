// import { toast } from "react-toastify";

// export const showBrowserNotification = (title, body) => {
//   if (!("Notification" in window)) 
//     {
//       // toast.warning("Notification is not supported in your browser").
//       // alert("Notification is not supported in your browser")
//       return;}


//   const iconUrl = '/notifyIcon.png'; // relative to public

//   if (Notification.permission === "granted") {
//     new Notification(title, { body, icon: iconUrl });
//   } else if (Notification.permission !== "denied") {
//     Notification.requestPermission().then(permission => {
//       if (permission === "granted") {
//         new Notification(title, { body, icon: iconUrl });
//       }else {
//         toast.info("You denied browser notifications.");
//       }
//     });
//   }
// };
import { toast } from "react-toastify";

export const showBrowserNotification = async (title, body) => {
  if (!("Notification" in window)) {
    toast.warning("Browser notifications are not supported on this device.");
    return;
  }
// console.log("title",title,"body:",body);
  const iconUrl = "/notifyIcon.png";

  try {
    if (Notification.permission === "granted") {
      // Prefer Service Worker notifications (works better on Android)
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          title,
          body,
        });
      } else {
        new Notification(title, { body, icon: iconUrl }); // Desktop fallback
      }
    } else {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "SHOW_NOTIFICATION",
            title,
            body,
          });
        } else {
          new Notification(title, { body, icon: iconUrl });
        }
      } else {
        toast.info("You denied browser notifications.");
      }
    }
  } catch (err) {
    console.error("Notification error:", err);
    toast.error("Unable to show notification.");
  }
};
