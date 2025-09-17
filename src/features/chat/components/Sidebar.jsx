// import { faChevronDown, faChevronRight, faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
// import { faComments } from "@fortawesome/free-regular-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import _ from "lodash";
// import { v4 as uuidv4 } from "uuid";

// import CustomInfiniteScroll from "../../../common/components/CustomInfiniteScroll";

// import ProfileDropdown from "../../user/components/ProfileDropdown";
// import CreateGroupModal from "../group_chat/CreateGroupModal";
// import { addGroup } from "../chatSlice";
// import { getChatId } from "../../../common/utils/getChatId";
// import groupDefaultAvatar from '../../../assets/images/chat/groupDefaultAvatar.png';

// import ChatCard from "./ChatCard";
// import { toast } from "react-toastify";
// import SidebarContentTitle from "../../../common/components/SidebarContentTitle";
// import { faDropbox } from "@fortawesome/free-brands-svg-icons";

// const Sidebar = ({
//   users,
//   userListLoading,
//   logoutFunction,
//   selectChat,
//   onlineUsers,
//   loggedInUserId,
//   lastMessages,
//   socketRef
// }) => {
//   const pageSize = 11;
//   const dispatch = useDispatch();
//   const [searchText, setSearchText] = useState("");
//   const [createGroupModal, setCreateGroupModal] = useState(false);
//   const [expandChats, setExpandChats] = useState(true);
//   const [expandGroups, setExpandGroups] = useState(true);
//   const createGroupRef = useRef();

//   const isTyping = useSelector((state) => state.common.isTyping || {});
//   const groups = useSelector((state) => state.chat.groups || {});
//   const groupMessages = useSelector((state) => state.chat.groupMessages || {});
//   const [groupTypingUsers, setGroupTypingUsers] = useState({});

//   // Debounced search
//   const handleSearch = useRef(
//     _.debounce((value) => setSearchText(value.trim()), 500)
//   ).current;

//   useEffect(() => () => handleSearch.cancel(), []);

//   // Sorted users by last message timestamp
//   const sortedUsers = useMemo(() => {
//      !expandChats && setExpandChats(true);
//     return _.orderBy(
//       users.filter(u => u.name.toLowerCase().includes(searchText.toLowerCase())),
//       (u) => {
//         const chatId = getChatId(loggedInUserId, u.id);
//         const ts = lastMessages[chatId]?.timestamp;
//         return ts ? new Date(ts).getTime() : 0;
//       },
//       ["desc"]
//     );
//   }, [users, loggedInUserId, Object.keys(lastMessages).length, searchText]);


//   const loggedInUser = users.find(u => u.id === loggedInUserId);

//   // Get last messages for groups
//   const groupLastMessages = useMemo(() => {
//     const result = {};
//     Object.keys(groupMessages).forEach(groupId => {
//       const msgArr = groupMessages[groupId];
//       if (msgArr?.length) {
//         const validMsgs = msgArr.filter(m => !m.isDeleted);
//         if (validMsgs.length) {
//           result[groupId] = _.maxBy(validMsgs, "timestamp");
//         }
//       }
//     });
//     return result;
//   }, [groupMessages]);

//   const groupList = useMemo(() => {
//     return Object.values(groups).sort((a, b) => {
//       const aLastMsg = groupLastMessages[a.groupId];
//       const bLastMsg = groupLastMessages[b.groupId];

//       const aTime = aLastMsg ? new Date(aLastMsg.timestamp).getTime() : new Date(a.createdAt).getTime();
//       const bTime = bLastMsg ? new Date(bLastMsg.timestamp).getTime() : new Date(b.createdAt).getTime();

//       return bTime - aTime; // sort desending
//     });
//   }, [groups, groupLastMessages]);

//   const filteredGroupList = useMemo(() => {
//     !expandGroups && setExpandGroups(true);
//     return groupList.filter(group =>
//       group.groupName.toLowerCase().includes(searchText.toLowerCase())
//     );
//   }, [groupList, searchText]);
//   // Create new group
//   const createNewGroup = ({ groupName, users, type = "public", }) => {
//     if (users.length === 0) {
//       toast.error("At least select 1 user to create a group ");
//       return;
//     }
//     const groupId = uuidv4();
//     const groupDetails = {
//       groupId,
//       groupName,
//       groupAvatar: groupDefaultAvatar,
//       createdBy: loggedInUserId,
//       type,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       groupUsers: [
//         { userId: loggedInUserId, role: "admin", joinedAt: new Date().toISOString() },
//         ...users.map((user) => ({
//           userId: user.id,
//           role: user.role || "member",
//           joinedAt: new Date().toISOString(),
//         })),
//       ],
//     };
//     // console.log(groupDetails);


//     // Dispatch safely
//     dispatch(addGroup({ groupId, groupDetails }));

//     // send( emit) via socket if exists
//     if (socketRef.current) {
//       socketRef.current.emit("createGroup", groupDetails);
//     }
//     toast.success(`${groupDetails?.groupName} group created successfully`);
//     return groupId;
//   };

//   // Socket listeners
//   useEffect(() => {
//     if (!socketRef.current) return;

//     const socket = socketRef.current;

//     const handleGroupCreated = (groupDetails) => {
//       const groupId = groupDetails.groupId;
//       dispatch(addGroup({ groupId, groupDetails }));

//     };

//     const handleGroupTyping = ({ groupId, senderId, typing }) => {
//       // console.log('sidebar recived group typing...:', { groupId, senderId, typing, loggedInUserId });

//       if (senderId !== loggedInUserId) {
//         setGroupTypingUsers(prev => ({
//           ...prev,
//           [groupId]: {
//             ...prev[groupId],
//             [senderId]: typing
//           }
//         }));

//         // Clear typing after 3s
//         if (typing) {
//           setTimeout(() => {
//             setGroupTypingUsers(prev => ({
//               ...prev,
//               [groupId]: {
//                 ...prev[groupId],
//                 [senderId]: false
//               }
//             }));
//           }, 3000);
//         }
//       }
//     };

//     socket.on("createGroup", handleGroupCreated);
//     socket.on("groupTyping", handleGroupTyping);

//     return () => {
//       socket.off("createGroup", handleGroupCreated);
//       socket.off("groupTyping", handleGroupTyping);
//     };
//   }, [dispatch, loggedInUserId, socketRef.current]);

// // console.log(groupLastMessages);

//   return (
//     <div className="w-full md:w-72 lg:w-80 h-screen hide-scrollbar bg-gray-100 text-white overflow-auto" id="user-scroll">
//       <div className="bg-teal-950 p-5 text-sm md:text-base lg:text-lg flex justify-between">
//         <h2 className="text-white cursor-default select-none ">
//           <FontAwesomeIcon icon={faComments} size="2x" /> Chatly
//         </h2>

//         <ProfileDropdown
//           avatar={loggedInUser?.avatar}
//           username={loggedInUser?.name || "User"}
//           logoutFunction={logoutFunction}
//         />
//       </div>
//       <div className="flex flex-col">
//         <div className="flex">
//           <div className="relative m-2 w-full">
//             <span className="absolute inset-y-0 cursor-text left-2 flex items-center text-gray-500">
//               <FontAwesomeIcon icon={faSearch} />
//             </span>
//             <input
//               type="search"
//               placeholder="Search..."
//               className="pl-8 pr-2 py-1 w-full text-gray-900 
//                     placeholder:text-gray-500 bg-gray-300 border 
//                     border-gray-300 outline-none transition duration-150 rounded-full"
//               onChange={(e) => handleSearch(e.target.value)}
//             />
//           </div>
//           <button
//             className="bg-teal-950 mx-1 my-2 p-1 rounded-full ms-auto hover:cursor-pointer"
//             onClick={() => setCreateGroupModal(true)}
//           >
//             +Group
//           </button>
//         </div>

//         <SidebarContentTitle
//         onclick={()=>setExpandChats(!expandChats)}
//         isExpand={expandChats}
//         contentTitle={"Chat"}
//         length={sortedUsers.length}
//         />
//         {userListLoading ? (
//           <div className="flex justify-center text-gray-600 items-center h-full">
//             <FontAwesomeIcon icon={faSpinner} spin size="2x" />
//           </div>
//         ) : (

//         expandChats &&  <CustomInfiniteScroll
//             data={sortedUsers}
//             pageSize={pageSize}
//             scrollTargetId="user-scroll"
//             endMsg=""
//           >

//             {(items) => (

//               items.length === 0 && filteredGroupList.length === 0 ? (
//                 <div className="text-center text-gray-500">No chats or groups found</div>
//                 // <></>
//               ) : (
//                 <>
//                   {/* {items.length > 0 && (
//                 <strong className="text-gray-700 mb-1 ml-1">
//                   Chat{items.length > 1 ? "s" : ""}
//                 </strong>
//               )} */}
  
//                   {items.filter(u => u.id !== loggedInUserId).map(user => {
                      
//                     const chatId = getChatId(loggedInUserId, user.id);

//                     return (
                     
//                       <ChatCard
//                         key={`user-${user.id}`}
//                         id={user.id}
//                         name={user.name}
//                         avatar={user.avatar}
//                         online={onlineUsers.includes(user.id)}
//                         isTyping={isTyping[user.id]}
//                         lastMsgId={lastMessages[chatId]?.messageId}
//                         lastMsgText={lastMessages[chatId]?.message}
//                         lastMsgSender={lastMessages[chatId]?.senderId}
//                         lastMsgTime={lastMessages[chatId]?.timestamp}
//                         loggedInUserId={loggedInUserId}
//                         selectChat={selectChat}
//                       />

//                     );
//                   })}




//                 </>
//               )
//             )

//             }

//           </CustomInfiniteScroll>
//         )}
//         <SidebarContentTitle
//           onclick={() => setExpandGroups(!expandGroups)}
//           isExpand={expandGroups}

//           contentTitle={"Group"}
//           length={filteredGroupList.length}
//         />
//         {expandGroups && filteredGroupList.length > 0 && (
//           // <div className="p-2 flex flex-col mt-4">
//           <>

//             {/* <strong className="text-gray-700 mb-1 ml-1 ">Groups</strong> */}
//             {filteredGroupList.map(group => {
//               const groupId = group.groupId;
//               const groupName = group.groupName;
//               const groupAvatar = group.groupAvatar;
//               const lastMsg = groupLastMessages[groupId];
//               // const groupTyping = groupTypingUsers[groupId];
//               // console.log(groupTypingUsers);

//               // const isGroupTyping = groupTyping && Object.values(groupTyping).some(typing => typing);
//               // console.log('GroupCard render:', {  groupTyping, isGroupTyping });
//               // console.log('group typing :',isGroupTyping);
//               const groupTyping = groupTypingUsers[groupId];
//               const isGroupTyping = groupTyping && Object.values(groupTyping).some(t => t);

//               return (
//                 <ChatCard
//                   key={`group-${groupId}`}
//                   id={groupId}
//                   name={groupName}
//                   avatar={groupAvatar}
//                   isGroup={true}
//                   isTyping={isGroupTyping}
//                   lastMsgId={lastMsg?.messageId}
//                   lastMsgText={lastMsg?.message}
//                   lastMsgSender={lastMsg?.senderId}
//                   lastMsgTime={lastMsg?.timestamp}
//                   loggedInUserId={loggedInUserId}
//                   selectChat={selectChat}
//                   // selectChat={() => selectChat({ id: groupId, name: groupName, avatar: groupAvatar, isGroup: true })}
//                 />

//               );
//             })

//             }
//           </>
//           // </div>
//         )}
//         {createGroupModal && (
//           <CreateGroupModal
//             users={users}
//             createGroupRef={createGroupRef}
//             loggedInUserId={loggedInUserId}
//             onClose={() => setCreateGroupModal(false)}
//             handleCreateGroup={createNewGroup}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default React.memo(Sidebar, (prev, next) =>
//   _.isEqual(prev.users, next.users) &&
//   _.isEqual(prev.lastMessages, next.lastMessages) &&
//   _.isEqual(prev.onlineUsers, next.onlineUsers) &&
//   prev.userListLoading === next.userListLoading &&
//   prev.loggedInUserId === next.loggedInUserId &&
//   prev.logoutFunction === next.logoutFunction
// );


import { faChevronDown, faChevronRight, faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faComments } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

import CustomInfiniteScroll from "../../../common/components/CustomInfiniteScroll";

import ProfileDropdown from "../../user/components/ProfileDropdown";
import CreateGroupModal from "../group_chat/CreateGroupModal";
import { addGroup } from "../chatSlice";
import { getChatId } from "../../../common/utils/getChatId";
import groupDefaultAvatar from '../../../assets/images/chat/groupDefaultAvatar.png';

import ChatCard from "./ChatCard";
import { toast } from "react-toastify";
import SidebarContentTitle from "../../../common/components/SidebarContentTitle";
import { faDropbox } from "@fortawesome/free-brands-svg-icons";

const Sidebar = ({
  users,
  userListLoading,
  logoutFunction,
  selectChat,
  onlineUsers,
  loggedInUserId,
  lastMessages,
  socketRef
}) => {
  const pageSize = 11;
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [createGroupModal, setCreateGroupModal] = useState(false);
  const [expandChats, setExpandChats] = useState(true);
  const [expandGroups, setExpandGroups] = useState(true);
  const createGroupRef = useRef();

  const isTyping = useSelector((state) => state.common.isTyping || {});
  const groups = useSelector((state) => state.chat.groups || {});
  const groupMessages = useSelector((state) => state.chat.groupMessages || {});
  const [groupTypingUsers, setGroupTypingUsers] = useState({});

  // Debounced search
  const handleSearch = useRef(
    _.debounce((value) => setSearchText(value.trim()), 500)
  ).current;

  useEffect(() => () => handleSearch.cancel(), []);

  // Sorted users by last message timestamp
  const sortedUsers = useMemo(() => {
     !expandChats && setExpandChats(true);
    return _.orderBy(
      users.filter(u => u.name.toLowerCase().includes(searchText.toLowerCase())),
      (u) => {
        const chatId = getChatId(loggedInUserId, u.id);
        const ts = lastMessages[chatId]?.timestamp;
        return ts ? new Date(ts).getTime() : 0;
      },
      ["desc"]
    );
  }, [users, loggedInUserId, Object.keys(lastMessages).length, searchText]);


  const loggedInUser = users.find(u => u.id === loggedInUserId);

  // Get last messages for groups
  const groupLastMessages = useMemo(() => {
    const result = {};
    Object.keys(groupMessages).forEach(groupId => {
      const msgArr = groupMessages[groupId];
      if (msgArr?.length) {
        const validMsgs = msgArr.filter(m => !m.isDeleted);
        if (validMsgs.length) {
          result[groupId] = _.maxBy(validMsgs, "timestamp");
        }
      }
    });
    return result;
  }, [groupMessages]);

  const groupList = useMemo(() => {
    return Object.values(groups).sort((a, b) => {
      const aLastMsg = groupLastMessages[a.groupId];
      const bLastMsg = groupLastMessages[b.groupId];

      const aTime = aLastMsg ? new Date(aLastMsg.timestamp).getTime() : new Date(a.createdAt).getTime();
      const bTime = bLastMsg ? new Date(bLastMsg.timestamp).getTime() : new Date(b.createdAt).getTime();

      return bTime - aTime; // sort desending
    });
  }, [groups, groupLastMessages]);

  const filteredGroupList = useMemo(() => {
    !expandGroups && setExpandGroups(true);
    return groupList.filter(group =>
      group.groupName.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [groupList, searchText]);
  // Create new group
  const createNewGroup = ({ groupName, users, type = "public", }) => {
    if (users.length === 0) {
      toast.error("At least select 1 user to create a group ");
      return;
    }
    const groupId = uuidv4();
    const groupDetails = {
      groupId,
      groupName,
      groupAvatar: groupDefaultAvatar,
      createdBy: loggedInUserId,
      type,//public/private
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      groupUsers: [
        { userId: loggedInUserId, role: "admin", joinedAt: new Date().toISOString() },
        ...users.map((user) => ({
          userId: user.id,
          role: user.role || "member",
          joinedAt: new Date().toISOString(),
        })),
      ],
    };
    // console.log(groupDetails);


    // Dispatch safely
    dispatch(addGroup({ groupId, groupDetails }));

    // send( emit) via socket if exists
    if (socketRef.current) {
      socketRef.current.emit("createGroup", groupDetails);
    }
    toast.success(`${groupDetails?.groupName} group created successfully`);
    return groupId;
  };

  // Socket listeners
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    const handleGroupCreated = (groupDetails) => {
      const groupId = groupDetails.groupId;
      dispatch(addGroup({ groupId, groupDetails }));

    };

    const handleGroupTyping = ({ groupId, senderId, typing }) => {
      // console.log('sidebar recived group typing...:', { groupId, senderId, typing, loggedInUserId });

      if (senderId !== loggedInUserId) {
        setGroupTypingUsers(prev => ({
          ...prev,
          [groupId]: {
            ...prev[groupId],
            [senderId]: typing
          }
        }));

        // Clear typing after 3s
        if (typing) {
          setTimeout(() => {
            setGroupTypingUsers(prev => ({
              ...prev,
              [groupId]: {
                ...prev[groupId],
                [senderId]: false
              }
            }));
          }, 3000);
        }
      }
    };

    socket.on("createGroup", handleGroupCreated);
    socket.on("groupTyping", handleGroupTyping);

    return () => {
      socket.off("createGroup", handleGroupCreated);
      socket.off("groupTyping", handleGroupTyping);
    };
  }, [dispatch, loggedInUserId, socketRef.current]);

// console.log(groupLastMessages);



  return (
    <div className="w-full md:w-72 lg:w-80 h-screen hide-scrollbar bg-gray-100 text-white overflow-auto" id="user-scroll">
      <div className="bg-teal-950 p-5 text-sm md:text-base lg:text-lg flex justify-between">
        <h2 className="text-white cursor-default select-none ">
          <FontAwesomeIcon icon={faComments} size="2x" /> Chatly
        </h2>

        <ProfileDropdown
          avatar={loggedInUser?.avatar}
          username={loggedInUser?.name || "User"}
          logoutFunction={logoutFunction}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex">
          <div className="relative m-2 w-full">
            <span className="absolute inset-y-0 cursor-text left-2 flex items-center text-gray-500">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="search"
              placeholder="Search..."
              className="pl-8 pr-2 py-1 w-full text-gray-900 
                    placeholder:text-gray-500 bg-gray-300 border 
                    border-gray-300 outline-none transition duration-150 rounded-full"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button
            className="bg-teal-950 mx-1 my-2 p-1 rounded-full ms-auto hover:cursor-pointer"
            onClick={() => setCreateGroupModal(true)}
          >
            +Group
          </button>
        </div>
       

        <SidebarContentTitle
        onclick={()=>setExpandChats(!expandChats)}
        isExpand={expandChats}
        contentTitle={"Chat"}
        length={sortedUsers.length}
        />
        {userListLoading ? (
          <div className="flex justify-center text-gray-600 items-center h-full">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : (

        expandChats &&  <CustomInfiniteScroll
            data={sortedUsers}
            pageSize={pageSize}
            scrollTargetId="user-scroll"
            endMsg=""
          >

            {(items) => (

              items.length === 0 && filteredGroupList.length === 0 ? (
                <div className="text-center text-gray-500">No chats or groups found</div>
                // <></>
              ) : (
                <>
                  {/* {items.length > 0 && (
                <strong className="text-gray-700 mb-1 ml-1">
                  Chat{items.length > 1 ? "s" : ""}
                </strong>
              )} */}
  
                  {items.filter(u => u.id !== loggedInUserId).map(user => {
                      
                    const chatId = getChatId(loggedInUserId, user.id);

                    return (
                     
                      <ChatCard
                        key={`user-${user.id}`}
                        id={user.id}
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
                        socket={socketRef.current}

                        
                      />

                    );
                  })}




                </>
              )
            )

            }

          </CustomInfiniteScroll>
        )}
        <SidebarContentTitle
          onclick={() => setExpandGroups(!expandGroups)}
          isExpand={expandGroups}

          contentTitle={"Group"}
          length={filteredGroupList.length}
        />
        {expandGroups && filteredGroupList.length > 0 && (
          // <div className="p-2 flex flex-col mt-4">
          <>

            {/* <strong className="text-gray-700 mb-1 ml-1 ">Groups</strong> */}
            {filteredGroupList.map(group => {
              const groupId = group.groupId;
              const groupName = group.groupName;
              const groupAvatar = group.groupAvatar;
              const lastMsg = groupLastMessages[groupId];
              // const groupTyping = groupTypingUsers[groupId];
              // console.log(groupTypingUsers);

              // const isGroupTyping = groupTyping && Object.values(groupTyping).some(typing => typing);
              // console.log('GroupCard render:', {  groupTyping, isGroupTyping });
              // console.log('group typing :',isGroupTyping);
              const groupTyping = groupTypingUsers[groupId];
              const isGroupTyping = groupTyping && Object.values(groupTyping).some(t => t);

              return (
                <ChatCard
                  key={`group-${groupId}`}
                  id={groupId}
                  name={groupName}
                  avatar={groupAvatar}
                  isGroup={true}
                  isTyping={isGroupTyping}
                  lastMsgId={lastMsg?.messageId}
                  lastMsgText={lastMsg?.message}
                  lastMsgSender={lastMsg?.senderId}
                  lastMsgTime={lastMsg?.timestamp}
                  loggedInUserId={loggedInUserId}
                  selectChat={selectChat}
                  socket={socketRef.current}
                  groupUsers={group.groupUsers || []}
                  // groupUsers={group.groupUsers || []}
                  // selectChat={() => selectChat({ id: groupId, name: groupName, avatar: groupAvatar, isGroup: true })}
                />

              );
            })

            }
          </>
          // </div>
        )}
        {createGroupModal && (
          <CreateGroupModal
            users={users}
            createGroupRef={createGroupRef}
            loggedInUserId={loggedInUserId}
            onClose={() => setCreateGroupModal(false)}
            handleCreateGroup={createNewGroup}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(Sidebar, (prev, next) =>
  _.isEqual(prev.users, next.users) &&
  _.isEqual(prev.lastMessages, next.lastMessages) &&
  _.isEqual(prev.onlineUsers, next.onlineUsers) &&
  prev.userListLoading === next.userListLoading &&
  prev.loggedInUserId === next.loggedInUserId &&
  prev.logoutFunction === next.logoutFunction
);

