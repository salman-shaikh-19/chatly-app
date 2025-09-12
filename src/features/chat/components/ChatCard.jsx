import React from "react";
import dayjs from "dayjs";
import CommonAvatar from "../../user/components/CommonAvatar";
import resolveName from "../../../common/utils/resolveName";
import { useDispatch, useSelector } from "react-redux";
import { getChatId } from "../../../common/utils/getChatId";
import { setMessageCounts } from "../../../common/commonSlice";

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
  const { messageCounts } = useSelector((state) => state.common);
  const dispatch=useDispatch();
  // console.log(id);
  const chatKey = isGroup 
  ? id                   
  : getChatId(loggedInUserId, id);  // 1 to 1 chats use combined key like 1_2, 23_40

// console.log(" chatKey:", chatKey, "count:", messageCounts?.[chatKey]);

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
      className={`flex items-center select-none px-3  py-3 border-b cursor-pointer hover:bg-gray-200`}
      // onClick={() => selectChat({ id, name, avatar, isGroup })}
       onClick={() => {
    selectChat({ id, name, avatar, isGroup });
    
    dispatch(setMessageCounts({ chatId: chatKey, count: 0 }));
  }}
    >
   <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
  <CommonAvatar avatar={avatar} avatarClassName={`h-12 w-12 p-0.5 ${online ? 'bg-green-800' : 'bg-gray-400' }`} />

  {!isGroup && (
    <span
      className={`absolute bottom-2 right-1.5  w-3.5 h-3.5  rounded-full border-2 border-white shadow-sm
        ${online ? "bg-green-500" : "bg-gray-400"}`}
    />
  )}
</div>


      <div className="w-full ml-2 overflow-hidden">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">{name}</span>
          <span className="text-sm text-gray-500">
            {lastMsgTime ? dayjs(lastMsgTime).format("hh:mm A") : ""}
          </span>
        </div>
        <div className="flex justify-between">
        <span className="block text-sm text-gray-600 truncate max-w-[220px]">
          {lastMessageText}
        </span>

        {messageCounts?.[chatKey] > 0 && (
         <span
          className="ml-2 flex items-center justify-center text-xs font-medium text-white bg-teal-950 rounded-full h-5 w-5 min-w-[20px]">
          {messageCounts[chatKey]}
        </span>

        )}
      </div>


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
