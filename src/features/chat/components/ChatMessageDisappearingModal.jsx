import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

const ChatMessageDisappearingModal = ({ onClose, onSelectTimer, oldTimer = "off" }) => {
  const [selectedTimer, setSelectedTimer] = useState(oldTimer);
  const modalRef = useRef();

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedTimer(value);
    if (onSelectTimer) onSelectTimer(value); 
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={modalRef}
        className="bg-white border rounded-lg shadow-lg m-2 w-full max-w-md relative"
      >

        <button
          onClick={onClose}
          title="Close"
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800 transition"
        >
          <FontAwesomeIcon icon={faX} size="lg" />
        </button>

        <h3 className="text-lg font-bold text-white bg-teal-950 p-3 rounded-t-lg select-none">
          Message Timer
        </h3>

        <div className="overflow-y-auto max-h-72 p-4 space-y-2 text-black">
          <div className="mb-4">
            <p className="text-sm mb-2 select-none">
              Select how long messages should remain visible in this chat
            </p>
          </div>
          {["24hours", "7days", "90days", "off"].map((timer) => (
            <label key={timer} className="flex items-center space-x-2">
              <input
                type="radio"
                name="disappear"
                value={timer}
                checked={selectedTimer == timer}
                onChange={handleChange}
              />
              <span className="select-none cursor-pointer">
                {timer === "24hours" ? "24 hours"
                  : timer === "7days" ? "7 days"
                  : timer === "90days"? "90 days"
                  : "Off"
                  }
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatMessageDisappearingModal);
