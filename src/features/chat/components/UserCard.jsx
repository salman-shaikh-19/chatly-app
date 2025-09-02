import React from "react";
import dayjs from "dayjs";
import userFallback from '../../../assets/images/fallback/userFallback.png'

const UserCard = React.memo(({ user, loggedInUserId, lastMsg, isTyping, online, onClick }) => {
    // console.log("re-render for:",user);
    
  return (
    <div
      className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-200 focus:outline-none"
      onClick={() => onClick(user)}
    >
      <div className="relative w-12 h-12">
        <img
          src={user.avatar || userFallback}
          className="object-cover w-12 h-12 rounded-full"
          onError={(e) => {
                e.currentTarget.onerror = null; // prevents infinite loop
                e.currentTarget.src = userFallback;
            }}
        />
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${online ? "bg-green-500" : "bg-gray-400"}`}
        ></span>
      </div>
      <div className="w-full pb-2">
        <div className="flex justify-between">
          <span className="block ml-2 font-semibold text-gray-600">
            <b>{user.name}</b>
          </span>
          <span className="text-sm text-gray-500">
            {lastMsg ? dayjs(lastMsg.timestamp).format("hh:mm A") : ""}
          </span>
        </div>
        <span className="block ml-2 text-sm text-gray-600 truncate w-50 ">
          {isTyping ? "Typing..." : lastMsg ? `${lastMsg.senderId === loggedInUserId ? "You" : user.name}: ${lastMsg.message}` : "No messages yet"}
        </span>
      </div>
    </div>
  );
});

export default UserCard;
