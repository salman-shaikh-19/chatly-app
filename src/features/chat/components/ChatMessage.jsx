import { faBan, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import React from "react";

const ChatMessage = ({ msg, isEditableAndDeletable, loggedInUserId, handleEditMsg, handleDeleteMessage }) => {
  const msgDate = dayjs(msg.timestamp);
  return (
    <div className="flex flex-col items-center">
     <div className={`p-2 rounded max-w-xs break-words ${
  msg.senderId === loggedInUserId ? "bg-teal-950 text-white self-end" : "bg-gray-300 text-black self-start"
}`}>
  <div>
    {msg.isDeleted ? (
      <span className="italic text-gray-400"><FontAwesomeIcon icon={faBan} /> Message has been deleted</span>
    ) : (
      msg.message
    )}
  </div>
  <div className="text-xs text-gray-400 mt-1">
    {msgDate.format("hh:mm A")}
    {!msg.isDeleted && msg.senderId === loggedInUserId && isEditableAndDeletable && (
      <>
        <FontAwesomeIcon
          icon={faTrashAlt}
          className="cursor-pointer ms-1"
          onClick={() => handleDeleteMessage(msg)}
        />
        {isEditableAndDeletable && msg.senderId === loggedInUserId && (
          <FontAwesomeIcon 
            icon={faEdit} 
            className="cursor-pointer ms-1"
            onClick={() => handleEditMsg(msg)}
          />
        )}
      </>
    )}
    {msg?.updatedAt && !msg.isDeleted && " Edited"}
  </div>
</div>

    </div>
  );
};

export default React.memo(ChatMessage);
