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
  currentGroup
}) => {

  const toggleSelect = useCallback((id) => {
    setSelectedMsgs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, [setSelectedMsgs]);
  const { users } = useSelector(state => state.user);
  // console.log(currentGroup);
const usersMap = useMemo(() => {
  const map = new Map();
  users.forEach(u => map.set(u.id, u));
  return map;
}, [users]);
// console.log(currentGroup);
  const creatorId = currentGroup ? Number(currentGroup.createdBy) : null;
  
  return (
    <div className="flex-1 overflow-y-auto p-2 flex flex-col space-y-2 hide-scrollbar">
      {
        currentGroup && (
          <div className="text-xs flex flex-col items-center justify-center">
            <ChatCommonLabel>
              {currentGroup?.groupName} was created on {dayjs(currentGroup?.createdAt).format("MMM D, YYYY")} By {creatorId==Number(loggedInUserId) ? "You" : (usersMap.get(creatorId)?.name || "Unknown")}

            </ChatCommonLabel>


            {
              currentGroup.groupUsers.map((user, i) => {

                const userObj = usersMap.get(Number(user.userId));
                // console.log(userObj);
                    if (!userObj) return null;
                 if (Number(user.userId) === creatorId) return null;

                return (
                  // <span key={i} className="text-gray-500 my-1 px-3 py-1 rounded-md bg-white">
                  //   {userObj?.name} was added on {dayjs(user.joinedAt).format("MMM D, YYYY")}
                  // </span>
                
                  <ChatCommonLabel key={i}>
                    {userObj?.name} was added on {dayjs(user.joinedAt).format("MMM D, YYYY")}
                  </ChatCommonLabel>
                  
                  

                )
              })
            }
          </div>
        )
      }
      {messages.length > 0 ? (
        messages.map((msg, index) => {
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const showDateBadge = !prevMsg || !dayjs(prevMsg.timestamp).isSame(msg.timestamp, "day");
          const isMsgEditAndDeletable = isEditOrDeletable(msg.timestamp);
          return (
            <React.Fragment key={`group-msg-${msg.messageId}-${index}`}>
              {showDateBadge && (
                <div className="text-xs flex items-center justify-center">
                  <ChatCommonLabel>
                   
                   <ChatCommonDateLabel timestamp={msg.timestamp}/>
              
                  </ChatCommonLabel>

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
          <NoMsgYet />

      )}

      {typing && typingUserNames?.length > 0 && (
        <div className="text-gray-500 italic text-sm mt-auto ">
          {typingUserNames.length === 1 ? `${typingUserNames[0]} is typing...`
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
