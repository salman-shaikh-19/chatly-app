// import React, { useCallback, useMemo } from "react";
// import GroupChatMessage from "./GroupChatMessage";
// import dayjs from "dayjs";


// import isEditOrDeletable from "../../../common/utils/isEditOrDeletable";
// import { useSelector } from "react-redux";
// import ChatCommonLabel from "../../../common/components/ChatCommonLabel";
// import ChatCommonDateLabel from "../../../common/components/ChatCommonDateLabel";
// import NoMsgYet from "../../../common/components/NoMsgYet";


// const GroupChatMessages = ({
//   messages,
//   loggedInUserId,
//   selectedMsgs,
//   setSelectedMsgs,
//   messagesEndRef,
//   typing,
//   typingUserNames,
//   handleDeleteMessage,
//   handleEditMsg,
//   currentGroup
// }) => {

//   const toggleSelect = useCallback((id) => {
//     setSelectedMsgs((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   }, [setSelectedMsgs]);
//   const { users } = useSelector(state => state.user);
//   // console.log(currentGroup);
// const usersMap = useMemo(() => {
//   const map = new Map();
//   users.forEach(u => map.set(u.id, u));
//   return map;
// }, [users]);
// // console.log(currentGroup);
//   const creatorId = currentGroup ? Number(currentGroup.createdBy) : null;
  
//   return (
//     <div className="flex-1 overflow-y-auto p-2 flex flex-col space-y-2 hide-scrollbar">
//       {
//         currentGroup && (
//           <div className="text-xs flex flex-col items-center justify-center">
//             <ChatCommonLabel>
//               {currentGroup?.groupName} was created on {dayjs(currentGroup?.createdAt).format("MMM D, YYYY")} By {creatorId==Number(loggedInUserId) ? "You" : (usersMap.get(creatorId)?.name || "Unknown")}

//             </ChatCommonLabel>


//             {
//               currentGroup.groupUsers.map((user, i) => {

//                 const userObj = usersMap.get(Number(user.userId));
//                 // console.log(userObj);
//                     if (!userObj) return null;
//                  if (Number(user.userId) === creatorId) return null;

//                 return (
//                   // <span key={i} className="text-gray-500 my-1 px-3 py-1 rounded-md bg-white">
//                   //   {userObj?.name} was added on {dayjs(user.joinedAt).format("MMM D, YYYY")}
//                   // </span>
                
//                   <ChatCommonLabel key={i}>
//                     {userObj?.name} was added on {dayjs(user.joinedAt).format("MMM D, YYYY")}
//                   </ChatCommonLabel>
                  
                  

//                 )
//               })
//             }
//           </div>
//         )
//       }
//       {messages.length > 0 ? (
//         messages.map((msg, index) => {
//           const prevMsg = index > 0 ? messages[index - 1] : null;
//           const showDateBadge = !prevMsg || !dayjs(prevMsg.timestamp).isSame(msg.timestamp, "day");
//           const isMsgEditAndDeletable = isEditOrDeletable(msg.timestamp);
//           return (
//             <React.Fragment key={`group-msg-${msg.messageId}-${index}`}>
//               {showDateBadge && (
//                 <div className="text-xs flex items-center justify-center">
//                   <ChatCommonLabel>
                   
//                    <ChatCommonDateLabel timestamp={msg.timestamp}/>
              
//                   </ChatCommonLabel>

//                 </div>
//               )}

//               <GroupChatMessage
//                 msg={msg}
//                 isEditableAndDeletable={isMsgEditAndDeletable}
//                 isOwnMessage={msg.senderId === loggedInUserId}
//                 isSelected={selectedMsgs.includes(msg.messageId)}
//                 toggleSelect={() => toggleSelect(msg.messageId)}
//                 handleDeleteMessage={handleDeleteMessage}
//                 handleEditMsg={handleEditMsg}
//                 loggedInUserId={loggedInUserId}
//                 selectionMode={selectedMsgs.length > 0}
//                 currentGroup={currentGroup}
//               />
//             </React.Fragment>
//           );
//         })
//       ) : (
//           <NoMsgYet />

//       )}

//       {typing && typingUserNames?.length > 0 && (
//         <div className="text-gray-500 italic text-sm mt-auto ">
//           {typingUserNames.length === 1 ? `${typingUserNames[0]} is typing...`
//             : typingUserNames.length === 2 ? `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`
//               : `${typingUserNames[0]} and ${typingUserNames.length - 1} others are typing...`
//           }
//         </div>
//       )}

//       <div ref={messagesEndRef} />
//     </div>
//   );
// };

// export default React.memo(GroupChatMessages);
import React, { useCallback, useMemo } from "react";
import GroupChatMessage from "./GroupChatMessage";
import dayjs from "dayjs";

import isEditOrDeletable from "../../../common/utils/isEditOrDeletable";
import { useSelector } from "react-redux";
import ChatCommonLabel from "../../../common/components/ChatCommonLabel";
import ChatCommonDateLabel from "../../../common/components/ChatCommonDateLabel";
import NoMsgYet from "../../../common/components/NoMsgYet";

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
  currentGroup,
}) => {
  const toggleSelect = useCallback(
    (id) => {
      setSelectedMsgs((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    },
    [setSelectedMsgs]
  );

  const { users } = useSelector((state) => state.user);

  const usersMap = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const creatorId = currentGroup ? Number(currentGroup.createdBy) : null;

  // Generate proper system message for "user added"
  const getUserAddedMessage = (userId, addedById) => {
    const userName = usersMap.get(Number(userId))?.name || "Unknown";

    if (userId === addedById) {
      return `${userName} joined the group`;
    } else {
      const addedByName =
        addedById === Number(loggedInUserId)
          ? "You"
          : usersMap.get(addedById)?.name || "Unknown";
      return `${userName} was added by ${addedByName}`;
    }
  };

  // Combine messages and user-added events chronologically
  const combinedEvents = useMemo(() => {
    if (!currentGroup) return [];

    const addedEvents = currentGroup.groupUsers
      .filter((u) => Number(u.userId) !== creatorId)
      .map((u) => ({
        type: "added",
        userId: u.userId,
        timestamp: u.joinedAt,
        addedBy: creatorId,
      }));

    const msgEvents = messages.map((m) => ({ type: "message", message: m }));

    const allEvents = [...msgEvents, ...addedEvents];

    allEvents.sort(
      (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix()
    );

    return allEvents;
  }, [messages, currentGroup, creatorId]);

  return (
    <div className="flex-1 overflow-y-auto p-2 flex flex-col space-y-2 hide-scrollbar">
      {currentGroup && (
        <div className="text-xs flex flex-col items-center justify-center mb-2">
          <ChatCommonLabel>
            {currentGroup?.groupName} was created on{" "}
            {dayjs(currentGroup?.createdAt).format("MMM D, YYYY")} by{" "}
            {creatorId === Number(loggedInUserId)
              ? "You"
              : usersMap.get(creatorId)?.name || "Unknown"}
          </ChatCommonLabel>
        </div>
      )}

      {combinedEvents.length === 0 && <NoMsgYet />}

      {combinedEvents.map((event, index) => {
        const prevEvent = index > 0 ? combinedEvents[index - 1] : null;
        const showDateBadge =
          !prevEvent ||
          !dayjs(prevEvent.timestamp).isSame(event.timestamp, "day");

        return (
          <React.Fragment key={index}>
            {/* Date Badge */}
            {showDateBadge && (
              <div className="text-xs flex items-center justify-center my-1">
                <ChatCommonLabel>
                  <ChatCommonDateLabel timestamp={event.timestamp} />
                </ChatCommonLabel>
              </div>
            )}

            {/* User Added Badge */}
            {event.type === "added" && (
              <div className="text-xs flex flex-col items-center justify-center my-1">
                <ChatCommonLabel>
                  {getUserAddedMessage(event.userId, event.addedBy)}
                </ChatCommonLabel>
              </div>
            )}

            {/* Message */}
            {event.type === "message" && (
              <GroupChatMessage
                msg={event.message}
                isEditableAndDeletable={isEditOrDeletable(
                  event.message.timestamp
                )}
                isOwnMessage={event.message.senderId === loggedInUserId}
                isSelected={selectedMsgs.includes(event.message.messageId)}
                toggleSelect={() => toggleSelect(event.message.messageId)}
                handleDeleteMessage={handleDeleteMessage}
                handleEditMsg={handleEditMsg}
                loggedInUserId={loggedInUserId}
                selectionMode={selectedMsgs.length > 0}
                currentGroup={currentGroup}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Typing Indicator */}
      {typing && typingUserNames?.length > 0 && (
        <div className="text-gray-500 italic text-sm mt-auto">
          {typingUserNames.length === 1
            ? `${typingUserNames[0]} is typing...`
            : typingUserNames.length === 2
            ? `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`
            : `${typingUserNames[0]} and ${
                typingUserNames.length - 1
              } others are typing...`}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default React.memo(GroupChatMessages);


