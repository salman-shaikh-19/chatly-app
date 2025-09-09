
// Install event
self.addEventListener("install", () => {
  self.skipWaiting(); // activate immediately
});

// Activate event
self.addEventListener("activate", () => {
  self.clients.claim(); // take control of all clients
});

// Listen for messages from the app
self.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    const { title, body } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: "/notifyIcon.png",
      badge: "/notifyIcon.png",
    });
  }
});
