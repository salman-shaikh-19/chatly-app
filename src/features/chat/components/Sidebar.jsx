import { faSearch, faSignOutAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomInfiniteScroll from "../../../common/components/CustomInfiniteScroll";
import { faComments } from "@fortawesome/free-regular-svg-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getChatId } from "../../../common/utils/getChatId";
import _ from "lodash";
import UserCard from "../../user/components/UserCard";
import ProfileDropdown from "../../user/components/ProfileDropdown";

const Sidebar = ({ users, userListLoading,logoutFunction,selectChat,onlineUsers,loggedInUserId,
  lastMessages, }) => {
  const pageSize = 10;
  const isTyping = useSelector((state) => state.common.isTyping || {});
  const [searchText,setSearchText]=useState("");
  

   // useRef to keep the debounced function persistent
  const handleSearch = useRef(
    _.debounce((value) => {
      setSearchText(value.trim());
      // users= users.filter(user=>user.name.toLowerCase()==value.toLowerCase());
    }, 500)
  ).current;

  useEffect(() => {
    return () => handleSearch.cancel(); // cancel pending debounced calls on unmount
  }, []);
  // console.log(searchText);
  
    
  // Sort users by latest message timestamp
const sortedUsers = useMemo(() => {
  return _.orderBy(
    // users
     users.filter(u => u.name.toLowerCase().includes(searchText.toLowerCase()))
    , (u) => {
    const chatId = getChatId(loggedInUserId, u.id);
    const ts = lastMessages[chatId]?.timestamp;
    return ts ? new Date(ts).getTime() : 0;
  }, ["desc"]);
}, [users, loggedInUserId, Object.keys(lastMessages).length,searchText]);
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

      {userListLoading  ? (
        <div className="flex justify-center text-gray-600 items-center h-full">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : (
        <CustomInfiniteScroll
          data={sortedUsers}
          pageSize={pageSize}
          scrollTargetId="user-scroll"
          endMsg=""
        >
          {(items) => (
            <div className="flex flex-col">
              
                <div className="relative m-2">
                    <span className="absolute inset-y-0 left-2 flex items-center text-gray-500">
                      <FontAwesomeIcon icon={faSearch} />
                    </span>
                      <input
                        type="search"
                        // value={searchText}
                        placeholder="Search..."
                        className="pl-8 pr-2 py-1 w-full text-gray-900 placeholder:text-gray-500 bg-gray-300  border border-gray-300 outline-none transition duration-150 
                          rounded-full"

                          onChange={(e)=>handleSearch(e.target.value)}
                      />
                </div>

 {/* <strong className="text-gray-800 ms-2">Chats</strong> */}
 {
  items.length==0 ? (
    <div className="text-center text-gray-500">No user found</div>
  )
     :   items
                .filter((item) => item.id !== loggedInUserId)
                .map((user) => {
                  const chatId = getChatId(loggedInUserId, user.id);
                  return (
                 
                    <UserCard
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
