import React from "react";
import dayjs from "dayjs";
import CommonAvatar from "../../user/components/CommonAvatar";
import resolveName from "../../../common/utils/resolveName";
import { useSelector } from "react-redux";

const ChatCard = ({
  id,
  name,
  avatar,
  online,
  isGroup = false,
  isTyping,
  lastMsgId,
  lastMsgText,
  lastMsgSender,
  lastMsgTime,
  loggedInUserId,
  selectChat,
}) => {
  const { users } = useSelector((state) => state.user);

  // Determine display text for last message
  const lastMessageText = isTyping
    ? <span className="text-green-600 italic">Typing...</span>
    : lastMsgText
    ? `${lastMsgSender === loggedInUserId
        ? "You"
        : isGroup
        ? resolveName(lastMsgSender, users)
        : name
      }: ${lastMsgText}`
    : "No messages yet";

  return (
    <div
      className="flex items-center px-3 py-2 border-b cursor-pointer hover:bg-gray-200"
      onClick={() => selectChat({ id, name, avatar, isGroup })}
    >
      <div className="relative w-12 h-12">
        <CommonAvatar avatar={avatar} avatarClassName="h-12 w-12" />
        {!isGroup && (
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              online ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        )}
      </div>

      <div className="w-full ml-2">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">{name}</span>
          <span className="text-sm text-gray-500">
            {lastMsgTime ? dayjs(lastMsgTime).format("hh:mm A") : ""}
          </span>
        </div>
        <span className="block text-sm text-gray-600 truncate w-50">
          {lastMessageText}
        </span>
      </div>
    </div>
  );
};

// Re-render only if relevant props change
export default React.memo(ChatCard, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.online === next.online &&
    prev.isTyping === next.isTyping &&
    prev.lastMsgId === next.lastMsgId &&
    prev.lastMsgTime === next.lastMsgTime
  );
});
