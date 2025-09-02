import { faCog, faCogs, faComment, faSignOut, faSignOutAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomInfiniteScroll from '../../../common/components/CustomInfiniteScroll'
import { faComments } from "@fortawesome/free-regular-svg-icons";
import React from "react";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { getChatId } from "../../../common/utils/getChatId";

const Sidebar = ({ users, userListLoading, logoutFunction, selectChat, onlineUsers, loggedInUserId,lastMessages }) => {
    const pageSize = 10;
    // console.log('clieckd on user');
const isTyping = useSelector((state) => state.common.isTyping || {});

    // console.log(onlineUsers);
   

    return (
        <div
            className="w-100 max-w-full h-screen hide-scrollbar  bg-gray-100 text-white overflow-auto"
            id="user-scroll"
        >
            <div className="bg-teal-950 p-5 text-sm md:text-base lg:text-lg flex justify-between">
                <h2 className="text-white "><FontAwesomeIcon icon={faComments} size="2x" /> Chatly</h2>
                {/* {loggedInUserId} */}
                <button className="" onClick={logoutFunction}><FontAwesomeIcon icon={faSignOutAlt} size="2x" /></button>
            </div>
            {userListLoading ? (
                <div className="flex justify-center items-center h-full">
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                </div>
            ) : (
                <CustomInfiniteScroll
                    data={users}
                    pageSize={pageSize}
                    scrollTargetId="user-scroll"
                    endMsg="No more users"
                >
                    {(items) => (
                        <div className="flex flex-col">
                            {/* items.filter(item=>item.id!==loggedInUserId) */}
                            {items.filter(item => item.id !== loggedInUserId).map((user, index) => {
                                const chatId = getChatId(loggedInUserId, user.id);
                                 const lastMsg = lastMessages[chatId];
                               
                                 
                                return (
                                    <div
                                        key={user.id ?? index} // use id if available
                                        className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-200 focus:outline-none"
                                        onClick={() => selectChat(user)}
                                    >
                                        <div className="relative w-12 h-12">
                                            <img
                                                src={user.avatar ?? "https://ncetir.com/Images/login@4x.png"}
                                                className="object-cover w-12 h-12 rounded-full"
                                            />
                                            <span
                                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${onlineUsers.includes(user.id) ? "bg-green-500" : "bg-gray-400"
                                                    }`}
                                            ></span>
                                        </div>
                                        <div className="w-full pb-2">
                                            <div className="flex justify-between">
                                                <span className="block ml-2 font-semibold text-gray-600">
                                                    <b>{user.name}</b>
                                                </span>
                                                  <span className="text-sm text-gray-500">
                                                    {lastMsg
                                                    ? dayjs(lastMsg.timestamp).format("hh:mm A")
                                                    : ""}
                                                </span>
                                            </div>
                                           <span className="block ml-2 text-sm text-gray-600 truncate w-50 ">
                                                { isTyping[user.id] ? 'Typing...' : lastMsg
                                                    ? `${lastMsg.senderId == loggedInUserId ? "You" : user.name}: ${lastMsg.message}`
                                                    : "No messages yet"}
                                                </span>

                                       
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CustomInfiniteScroll>
            )}
        </div>
    );
};

export default React.memo(Sidebar);
