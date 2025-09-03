import { faSignOutAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomInfiniteScroll from "../../../common/components/CustomInfiniteScroll";
import { faComments } from "@fortawesome/free-regular-svg-icons";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { getChatId } from "../../../common/utils/getChatId";
import _ from "lodash";
import UserItem from "../../user/components/UserCard";
import ProfileDropdown from "../../user/components/ProfileDropdown";

const Sidebar = ({ users, userListLoading,logoutFunction,selectChat,onlineUsers,loggedInUserId,
  lastMessages, }) => {
  const pageSize = 10;
  const isTyping = useSelector((state) => state.common.isTyping || {});

  // Sort users by latest message timestamp
const sortedUsers = useMemo(() => {
  return _.orderBy(users, (u) => {
    const chatId = getChatId(loggedInUserId, u.id);
    const ts = lastMessages[chatId]?.timestamp;
    return ts ? new Date(ts).getTime() : 0;
  }, ["desc"]);
}, [users, loggedInUserId, Object.keys(lastMessages).length]);
const loggedInUser = users.find(u => u.id === loggedInUserId);

  return (
    <div
      className="w-100 max-w-full h-screen hide-scrollbar bg-gray-100 text-white overflow-auto"
      id="user-scroll"
    >
      <div className="bg-teal-950 p-5 text-sm md:text-base lg:text-lg flex justify-between">
        <h2 className="text-white">
          <FontAwesomeIcon icon={faComments} size="2x" /> Chatly
        </h2>
           <ProfileDropdown
           avatar={loggedInUser?.avatar}
         username={loggedInUser?.name || "User"}
         logoutFunction={logoutFunction}
       />
       
      </div>

      {userListLoading ? (
        <div className="flex justify-center text-gray-600 items-center h-full">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : (
        <CustomInfiniteScroll
          data={sortedUsers}
          pageSize={pageSize}
          scrollTargetId="user-scroll"
          endMsg="No more users"
        >
          {(items) => (
            <div className="flex flex-col">
              {/* <strong className="text-gray-800 ms-2">Chats</strong> */}
              {items
                .filter((item) => item.id !== loggedInUserId)
                .map((user) => {
                  const chatId = getChatId(loggedInUserId, user.id);
                  return (
               
                    <UserItem
                    key={user.id}
                    userId={user.id}
                    name={user.name}
                    avatar={user.avatar}
                    online={onlineUsers.includes(user.id)}
                    isTyping={isTyping[user.id]}
                    lastMsgId={lastMessages[chatId]?.messageId}
                    lastMsgText={lastMessages[chatId]?.message}
                    lastMsgSender={lastMessages[chatId]?.senderId}
                    lastMsgTime={lastMessages[chatId]?.timestamp}
                    loggedInUserId={loggedInUserId}
                    selectChat={selectChat}
                    />

                  );
                })}
            </div>
          )}
        </CustomInfiniteScroll>
      )}
    </div>
  );
};

export default React.memo(Sidebar);
