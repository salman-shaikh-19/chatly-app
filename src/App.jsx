import NetworkStatus from "./common/components/NetworkStatus"
import AppRoutes from "./routes"


function App() {
// register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((reg) => {
      console.log("Service Worker registered:", reg);
    })
    .catch((err) => console.error("SW registration failed:", err));
}

  return (
    <>
    <NetworkStatus />
   <AppRoutes />
    </>
  )
}

export default App
