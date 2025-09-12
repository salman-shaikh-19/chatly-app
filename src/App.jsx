import { useEffect } from "react";
import NetworkStatus from "./common/components/NetworkStatus"
import AppRoutes from "./routes"
import { toast } from "react-toastify";


function App() {
  // useEffect(()=>{
 useEffect(() => {
    const handleKeyDown = (e) => {
      // Block PrintScreen key
      if (e.key === "PrintScreen") {
        toast.warning("Screenshots are disabled!");
        e.preventDefault();
      }

      // Block Ctrl+P (print)
      if (e.ctrlKey && e.key === "p") {
         toast.warning("Printing is disabled!");
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
    // register service worker
 if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((reg) => {
      // console.log("Service Worker registered:", reg);
    })
    .catch((err) => console.error("SW registration failed:", err));
}

  // },[])

  return (
    <>
    <NetworkStatus />
    <AppRoutes />
    </>
  )
}

export default App
