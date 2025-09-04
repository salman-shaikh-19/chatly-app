import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null; // nothing when online 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 ">
      <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg text-center max-w-md mx-10">
        <FontAwesomeIcon icon={faWarning} fade className="text-3xl mb-2" />
        <h2 className="text-xl font-bold mb-2">You are offline</h2>
        <p className="text-sm">Check your internet connection to continue using the app.</p>
      </div>
    </div>
  );
}
