import { faBan, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import dayjs from "dayjs";
import React, { useState } from "react";
import ChatActionDropdown from "../components/ChatActionDropdown";
import { useLongPress } from "use-long-press";
import ChatMessageContent from "../components/ChatMessageContent";
import { useSelector } from "react-redux";
// import { useSelector } from "react-redux";
// import resolveName from '../../../common/utils/resolveName'
const ChatMessage = ({ msg, isEditableAndDeletable, isSelected, toggleSelect,
  loggedInUserId, handleEditMsg, handleDeleteMessage }) => {
  // const msgDate = dayjs(msg.timestamp);
  const isOwnMessage = msg.senderId === loggedInUserId;
  const theme = useSelector(state => state.common.theme);
  // const {users}=useSelector(state=>state.user);
  const longPressForSelect = useLongPress(toggleSelect, {
    threshold: isSelected ? 0 : 500,
    captureEvent: true,
    cancelOnMovement: true,
  });
  // console.log(msg);

  //  const displayName = isOwnMessage ? "You" : msg.senderName || resolveName(msg.senderId,users);


  //  console.log( "isSelected:", isSelected);

  return (
    <div
      className={`flex mb-2 ${isOwnMessage ? "justify-end" : "justify-start"} p-1 rounded ${isSelected ? "bg-[#DCF8C6]/50" : ""
        } select-none  md:select-auto `
      }
      {...longPressForSelect()}
    >
      <div
        className={`relative p-2 pr-6 rounded max-w-xs
           break-words
            ${isOwnMessage ? theme == 'dark' ? "bg-green-800 text-white" : "bg-[#DCF8C6] text-black p-2 rounded-lg max-w-xs break-words ml-auto" :
            theme == 'dark' ? 'bg-gray-900  text-white mr-auto' : "bg-white text-black mr-auto"}
`}>
        {!msg.isDeleted && isOwnMessage && isEditableAndDeletable && (
          <div className="absolute top-1  right-1">
            <ChatActionDropdown theme={theme}>
              <button className={`block w-full text-left px-3 py-1 text-sm ${theme == 'dark' ? 'text-white bg-black' : 'text-black hover:bg-gray-100'}`}

                onClick={() => handleDeleteMessage(msg)}
                title="Delete from all"
              >
                <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
              </button>
              <button className={`block w-full text-left px-3 py-1 text-sm ${theme == 'dark' ? 'text-white bg-black' : 'text-black hover:bg-gray-100'}`}

                onClick={() => handleEditMsg(msg)}
                title="Edit"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
              </button>
            </ChatActionDropdown>
          </div>
        )}



        {/* <div className={`text-left `}
      >

          {msg.isDeleted ? (
              <span className="italic text-gray-400">
                     <FontAwesomeIcon icon={faBan} className="mr-1" /> Message has been deleted
                   </span>
          ) : (msg.message)
          }
        </div>

        <div className="no-search-highlight text-xs text-right text-gray-400 mt-1">
          {msgDate.format("hh:mm A")}
          {msg?.updatedAt && !msg.isDeleted && " (Edited) "}
        </div> */}
        <ChatMessageContent msg={msg} />
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
