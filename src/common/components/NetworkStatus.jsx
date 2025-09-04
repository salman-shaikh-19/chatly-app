import { useEffect } from "react";
import Swal from "sweetalert2";

export default function NetworkStatus() {
  useEffect(() => {
    const showOffline = () => {
      Swal.fire({
        icon: "error",
        title: "Offline",
        text: "⚠️ You are offline. Check your connection.",
        toast: true,
        position: "bottom",
        showConfirmButton: false,
        timer: 3000
      });
    };

    const showOnline = () => {
      Swal.fire({
        icon: "success",
        title: "Back Online",
        toast: true,
        position: "bottom",
        showConfirmButton: false,
        timer: 2000
      });
    };

    window.addEventListener("offline", showOffline);
    window.addEventListener("online", showOnline);

    return () => {
      window.removeEventListener("offline", showOffline);
      window.removeEventListener("online", showOnline);
    };
  }, []);

  return null; // no UI needed
}
