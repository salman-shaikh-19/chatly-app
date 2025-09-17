import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";

function InstallApp({ className="" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
     
      e.preventDefault();
      // save  event so it can be triggered later
      setDeferredPrompt(e);
      // show buton
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
     deferredPrompt.prompt(); // trigger install prompt
       const choiceResult = await deferredPrompt.userChoice;// wait for user to respond to prompt
    // reset the deferred prompt
    setDeferredPrompt(null);
    if (choiceResult.outcome === 'accepted') {
            setIsInstallable(false);
    //   console.log('accepted');
    } else {
    //   console.log('rejected/canceled');
    }

  };

  return (
    <>
      {isInstallable ? (
        <button
          onClick={handleInstallClick}
         className={` ${className}`}
        > Install App
          <FontAwesomeIcon icon={faDownload} className="ml-2"  />
        </button>
      )
    :
    null
    }
    </>
  );
}
export default React.memo(InstallApp);
