import { faBan, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import React from "react";
import ChatActionDropdown from "./ChatActionDropdown";

const ChatMessage = ({ msg, isEditableAndDeletable, loggedInUserId, handleEditMsg, handleDeleteMessage }) => {
  const msgDate = dayjs(msg.timestamp);
  const isOwnMessage = msg.senderId === loggedInUserId;

  return (
    <div
      className={`flex mb-2 ${isOwnMessage ? "justify-end" : "justify-start"}`} >
      <div
        className={`relative p-2 pr-6 rounded max-w-xs
           break-words
            ${isOwnMessage ? "bg-teal-950 text-white" :
            "bg-gray-300 text-black"}`}>
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


        <div>
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

export default React.memo(ChatMessage);
