import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import CommonAvatar from "./CommonAvatar";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../../../common/commonSlice";

const ProfileDropdown = ({ username,avatar, logoutFunction }) => {
  const [open, setOpen] = useState(false);
  const theme=useSelector(state=>state.common.theme);
  const dispatch = useDispatch();
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
  <div className={`absolute right-0 mt-2 w-40  border rounded shadow-lg z-50 ${theme==='dark'?'bg-gray-800 text-white border-gray-700':'bg-white text-black border-gray-200'}`}>
    <div className="px-4 py-2  font-medium">{username || 'unknown'}</div>
   <div className="px-2 py-2 flex items-center justify-between">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={theme === "dark"}
          onChange={() => dispatch(setTheme(theme === "dark" ? "light" : "dark"))}
          className="sr-only peer"
        />
        <div className="w-14 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 dark:bg-gray-600 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-300"></div>
        <span className="absolute left-1 top-0.5 bg-white w-5 h-5 rounded-full transition-all duration-300 peer-checked:translate-x-7.5"></span>
      </label>

      <span className={`ml-3 text-sm font-medium ${theme==='dark'?'text-gray-300':'text-gray-700'}`}>
        {theme === "dark" ? "Dark Mode" : "Light Mode"}
      </span>
    </div>
    <hr className={`my-1 ${theme==='dark'?'border-gray-700':'border-gray-200'}`} />
    <button
      className={`block w-full text-left px-4 py-2 cursor-pointer ${theme==='dark'?'hover:bg-gray-700':'hover:bg-gray-200'} `}
      onClick={logoutFunction}
    >
      Logout
    </button>
  </div>
)}

    </div>
  );
};

export default React.memo(ProfileDropdown);
