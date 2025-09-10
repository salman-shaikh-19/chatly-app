import React, { useCallback } from "react";
import GroupChatMessage from "./GroupChatMessage";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

import isEditOrDeletable from "../../../common/utils/isEditOrDeletable";
dayjs.extend(isToday);
dayjs.extend(isYesterday);

const GroupChatMessages = ({
  messages,
  loggedInUserId,
  selectedMsgs,
  setSelectedMsgs,
  messagesEndRef,
  typing,
  typingUserNames,
  handleDeleteMessage,
  handleEditMsg,
  currentGroup
}) => {
  
  const toggleSelect = useCallback((id) => {
    setSelectedMsgs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, [setSelectedMsgs]);

  return (
    <div className="flex-1 overflow-y-auto p-2 flex flex-col space-y-2 hide-scrollbar">
      {messages.length > 0 ? (
        messages.map((msg, index) => {
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const showDateBadge = !prevMsg || !dayjs(prevMsg.timestamp).isSame(msg.timestamp, "day");
            const isMsgEditAndDeletable = isEditOrDeletable(msg.timestamp);
          return (
            <React.Fragment key={`group-msg-${msg.messageId}-${index}`}>
              {showDateBadge && (
                <div className="text-xs flex items-center justify-center">
                  <span className="text-gray-500 my-2 px-3 py-1 rounded-md bg-white">
                    {dayjs(msg.timestamp).isToday()
                      ? "Today"
                      : dayjs(msg.timestamp).isYesterday()
                      ? "Yesterday"
                      : dayjs(msg.timestamp).format("MMM D, YYYY")}
                  </span>
                </div>
              )}
              <GroupChatMessage
                msg={msg}
                isEditableAndDeletable={isMsgEditAndDeletable}
                isOwnMessage={msg.senderId === loggedInUserId}
                isSelected={selectedMsgs.includes(msg.messageId)}
                toggleSelect={() => toggleSelect(msg.messageId)}
                handleDeleteMessage={handleDeleteMessage}
                handleEditMsg={handleEditMsg}
                loggedInUserId={loggedInUserId}
                selectionMode={selectedMsgs.length > 0}
                currentGroup={currentGroup}
              />
            </React.Fragment>
          );
        })
      ) : (
        <div className="text-gray-400 text-center">No messages yet</div>
      )}

      {typing && typingUserNames?.length > 0 && (
        <div className="text-gray-500 italic text-sm mt-auto ">
          {typingUserNames.length === 1  ? `${typingUserNames[0]} is typing...`
            : typingUserNames.length === 2 ? `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`
            : `${typingUserNames[0]} and ${typingUserNames.length - 1} others are typing...`
          }
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default React.memo(GroupChatMessages);
