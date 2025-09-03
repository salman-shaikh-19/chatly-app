import React from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import isEditOrDeletable from "../../../common/utils/isEditOrDeletable";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import ChatMessage from "./ChatMessage";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const ChatMessages = ({ messages, handleEditMsg, loggedInUserId, typing, messagesEndRef, handleDeleteMessage }) => {
  return (
    <div className="flex-1 overflow-y-auto p-2 flex flex-col space-y-2 hide-scrollbar" id="chatWindow">
      {messages.length > 0 ? (
        messages.map((msg, index) => {
          const msgDate = dayjs(msg.timestamp);
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const showDateBadge = !prevMsg || !dayjs(prevMsg.timestamp).isSame(msgDate, "day");
          const isMsgEditAndDeletable = isEditOrDeletable(msg.timestamp);

          return (
            <React.Fragment key={msg.messageId}> {/* same like <></>*/ }
              {showDateBadge && (
                <div className="text-xs text-gray-500 text-center my-2 bg-gray-200 px-3 py-1 rounded-full">
                  {msgDate.isToday() ? "Today" :
                   msgDate.isYesterday() ? "Yesterday" :
                   msgDate.format("MMM D, YYYY")}
                </div>
              )}

              <ChatMessage
                msg={msg}
                isEditableAndDeletable={isMsgEditAndDeletable}
                loggedInUserId={loggedInUserId}
                handleEditMsg={handleEditMsg}
                handleDeleteMessage={handleDeleteMessage}
              />
            </React.Fragment>
          );
        })
      ) : (
        <div className="text-gray-400 text-center">No messages yet</div>
      )}

      {typing && (
        <div className="flex space-x-1 mt-auto text-gray-500 italic text-sm">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 bg-gray-500 ms-1 rounded-full"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default React.memo(ChatMessages);
