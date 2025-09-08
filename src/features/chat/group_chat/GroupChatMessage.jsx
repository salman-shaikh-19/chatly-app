import { faBan, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import React from "react";
import { useLongPress } from "use-long-press";
import ChatActionDropdown from "../components/ChatActionDropdown";
import resolveName from "../../../common/utils/resolveName";
import { useSelector } from "react-redux";

const GroupChatMessage = ({
  msg,
  isOwnMessage,
  isSelected,
  toggleSelect,
  handleDeleteMessage,
  handleEditMsg,
  loggedInUserId,
  isEditableAndDeletable,
  selectionMode
}) => {
  const {  users } = useSelector(state => state.user);

  const msgDate = dayjs(msg.timestamp);
  const longPressForSelect = useLongPress(toggleSelect, {
    threshold: isSelected ? 0 : 500,
    captureEvent: true,
    cancelOnMovement: true,
  });

  const handleMessageClick = (e) => {
    if (selectionMode) {
      e.stopPropagation();
      toggleSelect();
    }
  };

  const handleEdit = () => {
    handleEditMsg(msg);
  };

  const handleDelete = () => {
    handleDeleteMessage(msg);
  };

  return (
   <div
  className={`flex mb-2 ${isOwnMessage ? "justify-end" : "justify-start"} p-1 rounded 
    ${isSelected ? "bg-[#DCF8C6]/50" : ""} select-none md:select-auto`}
  {...longPressForSelect()}
>
  <div
    className={`relative p-2 pr-8 rounded-lg max-w-xs break-words shadow-sm
      ${isOwnMessage 
        ? "bg-[#DCF8C6] text-black ml-auto" 
        : "bg-white text-black mr-auto"}`}
  >
    {!isOwnMessage && (
      <div className="text-xs font-semibold text-gray-600 mb-1">
        {resolveName(msg.senderId,users)}
      </div>
    )}

    {isOwnMessage && !msg.isDeleted && isEditableAndDeletable && (
      <div className="absolute top-1 right-1">
        <ChatActionDropdown>
          <button 
            className="block w-full text-left px-3 py-1 text-sm text-black hover:bg-gray-100"
            onClick={handleDelete}
          >
            <FontAwesomeIcon icon={faTrashAlt} className="mr-2 " />
            
          </button>
          <button 
            className="block w-full text-left px-3 py-1 text-sm text-black hover:bg-gray-100"
            onClick={handleEdit}
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2 " />
            
          </button>
        </ChatActionDropdown>
      </div>
    )}

    <div className="text-left">
      {msg.isDeleted ? (
        <span className="italic text-gray-400">
          <FontAwesomeIcon icon={faBan} className="mr-1" /> Message has been deleted
        </span>
      ) : (
        msg.message
      )}
    </div>

    <div className="text-xs text-gray-400 mt-1 text-right">
      {msgDate.format("hh:mm A")}
      {msg.updatedAt && !msg.isDeleted && " (edited)"}
    </div>
  </div>
</div>

  );
};

export default React.memo(GroupChatMessage);
