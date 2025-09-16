import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const commonActionStyle = "flex items-center text-white border p-0.5 rounded-sm hover:text-gray-500 cursor-pointer";


const ChatHeaderAction = ({ 
  className = "", onClick, 
  title = "default title", 
  icon, children 
}) => {
  return (
    <div className={`${commonActionStyle} ${className}`}
      onClick={onClick}  title={title} >
      <FontAwesomeIcon icon={icon} />
      {children && <span className="ml-1">{children}</span>}
    </div>
  );
};

export default React.memo(ChatHeaderAction);
