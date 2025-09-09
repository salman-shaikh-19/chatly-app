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

  const iconUrl = "/notifyIcon.png";

  try {
    if (Notification.permission === "granted") {
      // Prefer Service Worker notifications (works on Android)
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          title,
          body,
        });
      } else {
        // Fallback: direct Notification (desktop works fine)
        new Notification(title, { body, icon: iconUrl });
      }
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
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
    } else {
      toast.info("You have previously denied browser notifications.");
    }
  } catch (err) {
    console.error("Notification error:", err);
    toast.error(`${title}: ${body}`); // fallback toast
  }
};
