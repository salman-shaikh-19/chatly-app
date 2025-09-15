import { faArrowCircleLeft, faTrashAlt, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useNavigate } from "react-router-dom";
import CommonAvatar from "../../user/components/CommonAvatar";
import resolveName from '../../../common/utils/resolveName';
import ChatHeaderAction from "../components/ChatHeaderAction";
import GroupDetailDropdown from "./GroupDetailDropdown";
const GroupChatHeader = ({
  selectedChatUser,
  onlineUsers,
  handleDeleteAll,
  messages,
  goBack,
  typing,
  typingUserNames,
  selectedMsgs,
  handleSelectedDelete,
  groupUsers,
  allUsers,
  socket,
  isUserInGroup,
  handleGroupDelete
}) => {

  
  // Handle when user leaves the group
  
  const name = selectedChatUser?.name || "Unknown Group";
  const avatar = selectedChatUser?.avatar;//means group porifle pic

  // console.log(selectedChatUser);
  
  // const resolveName = (userId) => {
  //   const user = allUsers?.find(u => u.id === userId);
  //   return user ? user.name : "Unknown";
  // };

  return (
    <div className="flex items-center px-3 py-2 text-sm border-b border-gray-300 bg-teal-950">
 
      <div className="relative w-12 h-12 mr-3">
        <CommonAvatar avatar={avatar} avatarClassName="h-12 w-12" />
      </div>


      <div className="flex-1 overflow-hidden">

        <div className="flex items-center justify-between">
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-white truncate">{name}</span>


            <span className="text-xs text-gray-300 truncate max-w-xs">
              {groupUsers.length > 0 && (
                <>
                  {groupUsers
                    .map(gUser => {
                      const userName = resolveName(gUser.userId, allUsers);
                      const isOnline = onlineUsers.includes(gUser.userId);
                      return (
                        <span
                          key={gUser.userId}
                          className={isOnline ? "text-green-400" : "text-gray-400"}>
                          {userName}
                        </span>
                      );
                    })
                    .filter(Boolean).slice(0, 3).reduce((prev, curr) => [prev, ", ", curr])}
                  {groupUsers.length > 3 && (
                    <span className="text-gray-400"> +{groupUsers.length - 3} more</span>
                  )}
                </>
              )}
            </span>
          </div>


          <div className="flex items-center space-x-2">
        {
          isUserInGroup ?
          (

            <GroupDetailDropdown
              socket={socket}
              allUsers={allUsers}
              groupUsers={groupUsers}
              onlineUsers={onlineUsers}
              selectedChatUser={selectedChatUser}
              // onGroupLeft={handleGroupLeft}
            />
          )
          :
          (
             <ChatHeaderAction
                onClick={handleGroupDelete}
                icon={faTrashAlt}
                title="Delete group from me"
              >
               Group
              </ChatHeaderAction>
          )
        }

            {messages.length > 0 && selectedMsgs.length === 0 && (

              <ChatHeaderAction
                onClick={handleDeleteAll}
                icon={faTrashAlt}
                title="Delete all messages"
              />
            )}
            {selectedMsgs.length > 0 && isUserInGroup && (

              <ChatHeaderAction
                onClick={handleSelectedDelete}
                icon={faTrashAlt}
                title="Delete selected messages"
              >
                ({selectedMsgs.length})
              </ChatHeaderAction>
            )}
            <ChatHeaderAction
              onClick={goBack}
              className="lg:hidden md:hidden"
              icon={faArrowCircleLeft}
              title="Back to user list"
            />

          </div>
        </div>


        <span className="text-gray-400 text-xs">
          {typing && typingUserNames?.length > 0 ? (
            typingUserNames.length === 1
              ? `${typingUserNames[0]} is typing...`
              : typingUserNames.length === 2
                ? `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`
                : `${typingUserNames[0]} and ${typingUserNames.length - 1} others are typing...`
          ) : ""}
        </span>
      </div>
    </div>
  );
};

export default React.memo(GroupChatHeader);


