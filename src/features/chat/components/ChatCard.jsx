// import React from "react";
// import dayjs from "dayjs";
// import CommonAvatar from "../../user/components/CommonAvatar";
// import resolveName from "../../../common/utils/resolveName";
// import { useDispatch, useSelector } from "react-redux";
// import { getChatId } from "../../../common/utils/getChatId";
// import { setMessageCounts } from "../../../common/commonSlice";
// import {getLastMsgTime} from "../../../common/utils/getLastSeen";

// const ChatCard = ({
//   id,
//   name,
//   avatar,
//   online,
//   isGroup = false,
//   isTyping,
//   lastMsgId,
//   lastMsgText,
//   lastMsgSender,
//   lastMsgTime,
//   loggedInUserId,
//   selectChat,
// }) => {
//   const { users } = useSelector((state) => state.user);
//   const { messageCounts,selectedChatUser } = useSelector((state) => state.common);
//   const dispatch=useDispatch();
//   // console.log(id);
//   const chatKey = isGroup 
//   ? id                   
//   : getChatId(loggedInUserId, id);  // 1 to 1 chats use combined key like 1_2, 23_40

// // console.log(" chatKey:", chatKey, "count:", messageCounts?.[chatKey]);

//   // Determine display text for last message
//   const lastMessageText = isTyping
//     ? <span className="text-green-600 italic">Typing...</span>
//     : lastMsgText
//     ? `${lastMsgSender === loggedInUserId
//         ? "You"
//         : isGroup
//         ? resolveName(lastMsgSender, users)
//         : name
//       }: ${lastMsgText}`
//     : "No messages yet";

//   return (
//     <div
//       className={`flex items-center select-none px-3  py-3 border-b cursor-pointer hover:bg-gray-200 ${selectedChatUser?.id === id ? 'bg-gray-300' : '' }`}
//       // onClick={() => selectChat({ id, name, avatar, isGroup })}
//        onClick={() => {
//             selectChat({ id, name, avatar, isGroup });
            
//             dispatch(setMessageCounts({ chatId: chatKey, count: 0 }));
//           }}
//     >
//    <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
//   <CommonAvatar avatar={avatar} avatarClassName={`h-13 w-13  ${!isGroup && online ? ' p-0.5 bg-green-800' : 'p-0.5 bg-gray-400' }`} />

//   {!isGroup && (
//     <span
//       className={`absolute bottom-1.5 right-1.5  w-3.5 h-3.5  rounded-full border-2 border-white shadow-sm
//         ${online ? "bg-green-500" : "bg-gray-400"}`}
//     />
//   )}
// </div>


//       <div className="w-full ml-2 overflow-hidden">
//         <div className="flex justify-between">
//           <span className="font-semibold truncate max-w-[140px] text-gray-600">{name}</span>
//           <span className="text-sm text-gray-500">
//             {lastMsgTime ? getLastMsgTime( lastMsgTime) : ""}
//           </span>
//         </div>
//         <div className="flex justify-between">
//         <span className="block text-sm text-gray-600 truncate max-w-[220px]">
//           {lastMessageText}
//         </span>

//         {messageCounts?.[chatKey] > 0 && (
//          <span
//           className="ml-2 flex items-center justify-center text-xs font-medium text-white bg-teal-950 rounded-full h-5 w-5 min-w-[20px]">
//           {messageCounts[chatKey]}
//         </span>

//         )}
//       </div>


//       </div>
//     </div>
//   );
// };

// // Re-render only if relevant props change
// export default React.memo(ChatCard, (prev, next) => {
//   return (
//     prev.id === next.id &&
//     prev.online === next.online &&
//     prev.isTyping === next.isTyping &&
//     prev.lastMsgId === next.lastMsgId &&
//     prev.lastMsgTime === next.lastMsgTime
//   );
// });
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import CommonAvatar from "../../user/components/CommonAvatar";
import resolveName from "../../../common/utils/resolveName";
import { useDispatch, useSelector } from "react-redux";
import { getChatId } from "../../../common/utils/getChatId";
import { setMessageCounts } from "../../../common/commonSlice";
import { getLastMsgTime } from "../../../common/utils/getLastSeen";
import { deleteAllGroupMessages, deleteAllMessages, setDisappearingMessagesForChat } from "../chatSlice";
import disappearingMsgs from '../../../assets/images/chat/disappearingMsgs.png';

import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ChatMessageDisappearingModal from "./ChatMessageDisappearingModal";

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
  socket,
  groupUsers = [],
}) => {
  const { users } = useSelector((state) => state.user);
  const { messageCounts, selectedChatUser,theme } = useSelector((state) => state.common);
  const { disappearingMessagesChats } = useSelector((state) => state.chat);

  const [showTimerModal, setShowTimerModal] = useState(false);
  const dispatch = useDispatch();
  const chatKey = isGroup
    ? id
    : getChatId(loggedInUserId, id);  // 1 to 1 chats use combined key like 1_2, 23_40
  // Automatically clear expired disappearing messages
  useEffect(() => {
    if (!disappearingMessagesChats) return;
    const expiryTime = disappearingMessagesChats[chatKey];
    if (expiryTime && dayjs().isAfter(dayjs(expiryTime))) {
      // Clear disappearing messages for this chat
      if (isGroup) {
        // For groups, just remove the timer

        dispatch(deleteAllGroupMessages({ groupId: chatKey }))
      } else {
        // For 1-to-1 chats, remove all messages
        dispatch(deleteAllMessages({ chatId: chatKey }))
      }

      dispatch(setDisappearingMessagesForChat({ chatId: chatKey, expiryTime: null }));
      dispatch(setMessageCounts({ chatId: chatKey, count: 0 }));
    }
  }, [disappearingMessagesChats, chatKey, dispatch]);

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

  //     const expiry = dayjs(message.createdAt).add(24, 'hour');
  // if (dayjs().isAfter(expiry)) {
  //   deleteMessage(message.id);
  // }

  // const handleTimerSelect = (value) => {
  //   let expiryTime = null;

  //   if (value !== "off") {
  //     const hoursMap = { "24hours": 24, "7days": 168, "90days": 2160 }; // hours
  //     expiryTime = dayjs().add(hoursMap[value], "hour").toISOString();
  //   }
  //   // console.log("hii",socket);
    

  //   // if (isGroup) {
  //   //   // console.log(groupUsers);
      
  //   //   socket.emit("disappearingMessageChat", {
  //   //     chatId: chatKey,
  //   //     expiryTime,
  //   //     isGroup: true,
  //   //     groupUsers
  //   //   });
  //   // } else {
  //   //   socket.emit("disappearingMessageChat", {
  //   //     chatId: chatKey,
  //   //     expiryTime,
  //   //     isGroup: false,
  //   //     groupUsers: []
  //   //   });
  //   // }
  //   // console.log("users",groupUsers);
  //   // console.log("users",chatKey,expiryTime,isGroup);
  //     if (socket) {
  //       // console.log("users",groupUsers);
        
  //   if (isGroup) {
  //     socket.current.emit("disappearingMessageChat", {
  //       chatId: chatKey,
  //       expiryTime,
  //       isGroup: true,
  //       groupUsers
  //     });
  //   } else {
  //     socket.current.emit("disappearingMessageChat", {
  //       chatId: chatKey,
  //       expiryTime,
  //       isGroup: false,
  //       groupUsers: []
  //     });
  //   }
  // } else {
  //   console.warn("Socket is not connected yet");
  // }


  //   dispatch(setDisappearingMessagesForChat({ chatId: chatKey, expiryTime }));
  //   setShowTimerModal(false);
  // };

  return (
    <>
      <div
        className={` ${theme == "light" ? "bg-gray-100 border-b-gray-200 hover:bg-gray-200  " : "bg-gray-900"} ${selectedChatUser?.id === id && theme=='light' ? 'bg-gray-300' : ''}   flex items-center select-none px-3  py-3 border-b cursor-pointer `}
        // onClick={() => selectChat({ id, name, avatar, isGroup })}
        onClick={() => {
          selectChat({ id, name, avatar, isGroup });

          dispatch(setMessageCounts({ chatId: chatKey, count: 0 }));
        }}
      >
        <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
          <CommonAvatar avatar={avatar} avatarClassName={`h-16 w-16  ${!isGroup && online ? ' p-0.5 bg-green-800' : 'p-0.5 bg-gray-400'}`} />

          {/* {!isGroup && (
    <span
      className={`absolute bottom-1.5 right-1.5  w-3.5 h-3.5  rounded-full border-2 border-white shadow-sm
        ${online ? "bg-green-500" : disappearingMessagesChats && disappearingMessagesChats?.[chatKey] ? <img src={disappearingMsgs} /> : "bg-gray-400"}`}
    />
  )} */}
          <span
            onClick={(e) => {
              e.stopPropagation(); // prevent selecting chat
              setShowTimerModal(true);

            }}
            title={`${disappearingMessagesChats?.[chatKey] ? `Disappearing messages active` : 'Set disappearing messages'}`}
            className={`absolute bottom-0 -right-1 flex items-center justify-center
             
    ${!isGroup ? "w-6 h-6" : "w-6 h-6"} 
    rounded-full border-2 border-white shadow-sm overflow-hidden cursor-pointer`}
          >
            {!isGroup ? (

              online ? (
                disappearingMessagesChats?.[chatKey] ? (
                  <img
                    src={disappearingMsgs}
                    alt="Disappearing"
                    className="w-full h-full bg-white select-none pointer-events-none"
                  />
                ) : (
                  <span className="block w-full h-full rounded-full bg-green-500" />
                )
                // <span className="block w-full h-full rounded-full bg-green-500" />
              ) : disappearingMessagesChats?.[chatKey] ? (
                <img
                  src={disappearingMsgs}
                  alt="Disappearing"
                  className="w-full h-full  bg-white select-none pointer-events-none"
                />
              ) : (
                <span className="block w-full h-full rounded-full bg-gray-400" />
              )
            ) : (

              disappearingMessagesChats?.[chatKey] ? (
                <img
                  src={disappearingMsgs}
                  alt="Disappearing"
                  className="w-full h-full bg-white select-none pointer-events-none"
                />
              ) : (
                <FontAwesomeIcon icon={faGear} className="text-gray-700 bg-white text-lg" />
              )
            )}
          </span>



        </div>


        <div className={`w-full ml-2 overflow-hidden `}>
          <div className="flex justify-between">
            <span className={`font-semibold truncate max-w-[140px] text-gray-600 ${theme === "light" ? "text-gray-600" : "text-white"}`}>{name}</span>
            <span className={`text-sm text-gray-500 ${theme === "light" ?  "text-gray-600" : "text-white"}`}>
              {lastMsgTime ? getLastMsgTime(lastMsgTime) : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={`block text-sm text-gray-600 truncate max-w-[220px] ${theme === "light" ?  "text-gray-600" : "text-white"}`}>
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

      {showTimerModal && (
        <ChatMessageDisappearingModal
          onClose={() => setShowTimerModal(false)}
          // onSelectTimer={handleTimerSelect}
          socketRef={socket}
          chatKey={chatKey}
          isGroup={isGroup}
          groupUsers={groupUsers}
          oldTimer={getOldTimerKey(disappearingMessagesChats?.[chatKey])}
        />
      )}
    </>
  );
};
const getOldTimerKey = (expiryTime) => {
  if (!expiryTime) return 'off';
  const hoursDiff = dayjs(expiryTime).diff(dayjs(), 'hour'); // hours remaining
  if (hoursDiff <= 24) return '24hours';
  if (hoursDiff <= 168) return '7days';
  if (hoursDiff <= 2160) return '90days';
  return 'off';
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
