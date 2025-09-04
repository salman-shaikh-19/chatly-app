import { faBan, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import React, { useState } from "react";
import ChatActionDropdown from "./ChatActionDropdown";
import { useLongPress } from "use-long-press";

const ChatMessage = ({ msg, isEditableAndDeletable,isSelected, toggleSelect,
   loggedInUserId, handleEditMsg, handleDeleteMessage }) => {
  const msgDate = dayjs(msg.timestamp);
  const isOwnMessage = msg.senderId === loggedInUserId;

const longPressForSelect = useLongPress(toggleSelect, {
    threshold: isSelected ? 0 : 500,
    captureEvent: true,
    cancelOnMovement: true,
  });


   // console.log( "isSelected:", isSelected);
  
  return (
    <div
      className={`flex mb-2 ${isOwnMessage ? "justify-end" : "justify-start"} p-1 rounded ${
        isSelected ? "bg-[#DCF8C6]/50" : ""

        }`} 
         {...longPressForSelect()}
        >
      <div
        className={`relative p-2 pr-6 rounded max-w-xs
           break-words
            ${isOwnMessage ? "bg-[#DCF8C6] text-black p-2 rounded-lg max-w-xs break-words ml-auto" :
            "bg-white text-black p-2 rounded-lg max-w-xs break-words mr-auto"}`}>
              {!msg.isDeleted && isOwnMessage && isEditableAndDeletable && (
                <div className="absolute bottom-1  right-1">
                  <ChatActionDropdown>
                    <button className="block w-full text-center p-2  text-black  hover:bg-gray-200 hover:cursor-pointer"
                      onClick={() => handleDeleteMessage(msg)}
                      title="Delete from all"
                      >
                      <FontAwesomeIcon icon={faTrashAlt} className="" /> 
                    </button>
                    <button className="block w-full text-center p-2  text-black  hover:bg-gray-200 hover:cursor-pointer"
                      onClick={() => handleEditMsg(msg)} 
                      title="Edit"
                      >
                      <FontAwesomeIcon icon={faEdit} className="" /> 
                    </button>
                  </ChatActionDropdown>
                </div>
              )}


        <div className={`text-left `}
       
      >

          {msg.isDeleted ? (
            <span className="italic text-gray-400">
              <FontAwesomeIcon icon={faBan} /> Message has been deleted
            </span>
          ) : (msg.message)
          }
        </div>

        <div className="text-xs text-gray-400 mt-1">
          {msgDate.format("hh:mm A")}
          {msg?.updatedAt && !msg.isDeleted && " Edited"}
        </div>
      </div>
    </div>
  );
};

// export default React.memo(ChatMessage);
export default React.memo(ChatMessage, (prev, next) => {
  return (
    prev.msg == next.msg &&
    prev.isEditableAndDeletable === next.isEditableAndDeletable &&
    prev.loggedInUserId === next.loggedInUserId &&
    prev.isSelected === next.isSelected
    //  && // message changed only if id changes
    // prev.lastMsgTime === next.lastMsgTime
  );
});
