import React from "react";
import dayjs from "dayjs";
import CommonAvatar from "./CommonAvatar";

function UserCard({ userId, name,avatar,online, isTyping,lastMsgId, lastMsgText,lastMsgSender,lastMsgTime,loggedInUserId,
  selectChat,}) {
  return (
    <div
      className="flex items-center px-3 py-2 border-b cursor-pointer hover:bg-gray-200"
      onClick={() => selectChat({ id: userId, name, avatar })}
    >
      <div className="relative w-12 h-12">
        <CommonAvatar
      avatar={avatar}
      />
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            online ? "bg-green-500" : "bg-gray-400"
          }`}
        ></span>
      </div>

      <div className="w-full ml-2">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">{name}</span>
          <span className="text-sm text-gray-500">
            {lastMsgTime ? dayjs(lastMsgTime).format("hh:mm A") : ""}
          </span>
        </div>

        <span className="block text-sm text-gray-600 truncate w-50">
          {isTyping
            ? "Typing..." : lastMsgText
            ? `${lastMsgSender === loggedInUserId ? "You" : name}: ${lastMsgText}`
            : "No messages yet"}
        </span>
      </div>
    </div>
  );
}

// only re-render if relevant props change
export default React.memo(UserCard, (prev, next) => {
  return (
    prev.userId === next.userId &&
    prev.online === next.online &&
    prev.isTyping === next.isTyping &&
    prev.lastMsgId === next.lastMsgId && // message changed only if id changes
    prev.lastMsgTime === next.lastMsgTime
  );
});
