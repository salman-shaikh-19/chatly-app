import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import CommonAvatar from "./CommonAvatar";

const ProfileDropdown = ({ username,avatar, logoutFunction }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2  py-0 bg-teal-950 rounded hover:bg-teal-950 hover:cursor-pointer focus:outline-none"
      >
    <CommonAvatar
      avatar={avatar}
      avatarClassName="h-10 w-10"
      />
        
        {/* <FontAwesomeIcon icon={faUser} /> */}
      </button>
{open && (
  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
    <div className="px-4 py-2 text-black  font-medium">{username || 'unknown'}</div>
    <button
      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
      onClick={logoutFunction}
    >
      Logout
    </button>
  </div>
)}

    </div>
  );
};

export default ProfileDropdown;
