// public/sw.js
self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  return self.clients.claim();
});

// Listen for push events (optional, if using Push API/FCM later)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "New Message";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/notifyIcon.png",
    badge: "/notifyIcon.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Fallback: Allow manual trigger from your app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: "/notifyIcon.png",
      badge: "/notifyIcon.png",
    });
  }
});
