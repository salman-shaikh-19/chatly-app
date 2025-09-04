import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

const ChatActionDropdown = ({ children }) => {
  const [openAction, setOpenAction] = useState(false);
  const actionDropdownRef = useRef(null);

  // close dropdown when clicking outside or pressing esc key 
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        actionDropdownRef.current &&
        !actionDropdownRef.current.contains(e.target)
      ) {
        setOpenAction(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpenAction(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="relative z-50" ref={actionDropdownRef}>
      <button
        onClick={() => setOpenAction((prev) => !prev)}
        title="More actions"
        aria-haspopup="true"
        aria-expanded={openAction}
        className="flex items-center justify-center p-1 hover:bg-teal-900 focus:outline-none hover:cursor-pointer"
      >
        <FontAwesomeIcon icon={faEllipsisV} className="text-white  text-lg" />
      </button>

      {openAction && (
        <div className="absolute right-6 bottom-3  flex flex-col-reverse bg-white border rounded-lg shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
};

export default React.memo(ChatActionDropdown);
