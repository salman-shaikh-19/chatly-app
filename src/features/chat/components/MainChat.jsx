// import { useDispatch, useSelector } from "react-redux";
// import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
// import { fetchUsers } from "../../user/userSlice";
// import { logout } from "../../auth/authSlice";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faComment, faSpinner } from "@fortawesome/free-solid-svg-icons";
// import Sidebar from "./Sidebar";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import io from "socket.io-client";
// import { setSelectedChatUser, setTyping } from "../../../common/commonSlice";
// import { setOnlineUsers } from "../../user/userSlice";
// import { addGroup, addGroupMessage, addMessage, clearMessages, softDeleteFromAll, updateGroupMessage, updateMessage, softDeleteGroupMessage, deleteAllGroupMessages } from "../chatSlice";
// import _ from 'lodash';
// import ChatWindow from "./ChatWindow";
// import GroupChatWindow from "../group_chat/GroupChatWindow";
// import chatBgImg from '../../../assets/images/chat/chatBgImg.png';
// const MainChat = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { users, userListLoading, onlineUsers } = useSelector((state) => state.user);
//   const { loggedInUserData, selectedChatUser } = useSelector((state) => state.common);
//   const { messages } = useSelector((state) => state.chat);
//   // const [selectedChatUser, setSelectedChatUser] = useState(null);
//   const loggedInUserId = loggedInUserData?.id;
//   const selectedUserId = selectedChatUser?.id || null;

//   // Initialize socket inside component
//   // const [socket, setSocket] = useState(null);
//   const [isChatOpen, setIsChatOpen] = useState(false);

//   const goBackToSidebar = () => {
//     console.log('clicked', isChatOpen)
//     setIsChatOpen(false); // back to user list
//   };

//   const socketRef = useRef(null);

//   // useEffect(() => {
//   //   // Initialize socket connection
//   //   const newSocket = io("http://localhost:5000", { autoConnect: true });
//   //   setSocket(newSocket);

//   //   return () => {
//   //     // Cleanup: Disconnect socket only when component unmounts
//   //     newSocket.disconnect();
//   //   };
//   // }, []);

//   useEffect(() => {

//     if (!loggedInUserId) return;
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//     }
//     const socket = io("https://chatly-backend-h9q3.onrender.com", { autoConnect: true });
//     socketRef.current = socket;

//     // connet socket manually

//     socket.on("connect", () => {
//       // console.log("Connected:", socket.id);
//       socket.emit("userOnline", loggedInUserId);
//     });

//     // emit or send userOnline event
//     socket.emit("userOnline", loggedInUserId);

//     // listen for onlineUsers event
//     socket.on("onlineUsers", (list) => {
//       // console.log("Received online users:", list);
//       dispatch(setOnlineUsers(list));
//     });

//     //  recive message
//     socket.on("privateMessage", ({ senderId, receiverId, message, messageId, timestamp }) => {
//       const msgObj = { senderId, receiverId, message, messageId, timestamp };

//       const userId = senderId == loggedInUserId ? receiverId : senderId;

//       dispatch(addMessage({ loggedInUserId, userId, message: msgObj }));
//     });

//     //updated messages recived
//     socket.on("updateMessage", (updatedMsg) => {
//       // console.log("Received update:", updatedMsg);
//       const { chatId, messageId, message, updatedAt } = updatedMsg;

//       dispatch(updateMessage({ chatId, messageId, message, updatedAt }));
//     });

//     // listen for typing event

//     socket.on("typing", ({ userId, typing }) => {
//       // console.log("inside typing listern"+typing);
//       dispatch(setTyping({ userId, typing }));
//     });
//     socket.on("deleteMessage", (deletedMsg) => {
//   const { chatId, messageId, isDeleted, deletedAt } = deletedMsg;
//   dispatch(softDeleteFromAll({ chatId, messageId, isDeleted, deletedAt }));
// });

// //group methods of socket
//  socket.on("createGroup", (groupDetails) => {
//       const groupId = groupDetails.groupId;
//       dispatch(addGroup({ groupId, groupDetails }));
//     });

//     socket.on("groupMessage", ({ groupId, senderId, message, messageId, timestamp }) => {
//       const msgObj = { 
//         senderId, 
//         message, 
//         messageId, 
//         timestamp: timestamp || new Date().toISOString()
//       };
//       dispatch(addGroupMessage({ groupId, message: msgObj }));
//     });

//     socket.on("updateGroupMessage", ({ groupId, messageId, message, updatedAt, senderId }) => {
//       dispatch(updateGroupMessage({ groupId, messageId, message, updatedAt, senderId }));
//     });

//     // Group message deletion
//     socket.on("deleteGroupMessage", ({ groupId, messageId, isDeleted, deletedAt }) => {
//       dispatch(softDeleteGroupMessage({ groupId, messageId, isDeleted, deletedAt }));
//     });

//     // Delete all group messages
//     socket.on("deleteAllGroupMessages", ({ groupId }) => {
//       dispatch(deleteAllGroupMessages({ groupId }));
//     });

//     // cleanup remove event listeners
//     return () => {
//       socket.off("onlineUsers");
//       socket.off("privateMessage");
//       socket.off("updateMessage");
//       socket.off("typing");
//       socket.off("deleteMessage");
//       socket.off("createGroup");
//       socket.off("groupMessage");
//       socket.off("updateGroupMessage");
//       socket.off("deleteGroupMessage");
//       socket.off("deleteAllGroupMessages");
//       socket.off("groupTyping");
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, [loggedInUserId]);

//   useEffect(() => {
//     dispatch(fetchUsers());
//   }, [dispatch]);

//   const userLogout = async () => {
//     // console.log('logout');
//     if (socketRef.current && loggedInUserId) {
//       socketRef.current.emit("userLogout", loggedInUserId, () => {
//         console.log('user logout ack by server');
//         socketRef.current.disconnect();
//         socketRef.current = null;
//         dispatch(setOnlineUsers([]));
//       });
//     }


//     const res = await dispatch(logout());
//     if (res) {
//       // dispatch(clearMessages());
//       toast.success("User logged out successfully");

//     }
//     navigate("/login");
//   };

//   const selectChatToOpen = (user) => {
//     dispatch(setSelectedChatUser(user));
//     setIsChatOpen(true);
//   };
//   //latest message user first 
//   // const sortedUsers = useMemo(() => {
//   //   return _.orderBy(users, (u) => {
//   //     const chatId = getChatId(loggedInUserId, u.id);
//   //     return messages[chatId]?.slice(-1)[0]?.timestamp || 0;
//   //   }, ["desc"]);
//   // }, [users, messages, loggedInUserId]);


//   //get last message for each chatId meand for each chat.
//     const lastMessages = useMemo(() => {
//       const result = {};
//       Object.keys(messages).forEach(chatId => {
//         const msgArr = messages[chatId];
//         if (msgArr?.length) {
//           // Filter out deleted messages
//           const validMsgs = msgArr.filter(m => !m.isDeleted);
//           if (validMsgs.length) {
//             result[chatId] = _.maxBy(validMsgs, "timestamp");
//           }
//         }
//       });
//       return result;
//     }, [messages]);


//   // console.log(lastMessages);



//   return (
//     <div className="h-screen flex">
//       <div className={`${isChatOpen ? "hidden sm:flex " : "flex"
//         } flex flex-col  bg-white border-r w-full sm:w-72 lg:w-80`}>
//         <Sidebar
//           users={users}
//           userListLoading={userListLoading}
//           loggedInUserId={loggedInUserId}
//           logoutFunction={userLogout}
//           selectChat={selectChatToOpen}
//           lastMessages={lastMessages}
//           // messages={messages}
//           onlineUsers={onlineUsers}
//           socketRef={socketRef}
//         />
//       </div>
//       <div className={` flex-1 flex flex-col
//       ${isChatOpen ? "flex w-full" : "hidden sm:flex"} m-1  `}

//       style={{
//       backgroundImage: `url(${chatBgImg})`,
//       backgroundSize: "cover",
//       backgroundPosition: "center"
//     }}
//       >
//         {selectedChatUser ? (
//           selectedChatUser.isGroup ? (
//             <GroupChatWindow
//               loggedInUserId={loggedInUserId}
//               selectedGroupId={selectedUserId}
//               socket={socketRef.current}
//               goBack={goBackToSidebar}
//             />
//           ) : (
//             <ChatWindow
//               loggedInUserId={loggedInUserId}
//               selectedUserId={selectedUserId}
//               messages={messages}
//               socket={socketRef.current}
//               goBack={goBackToSidebar}
//             />
//           )
//         ) : (
//           <div className="hidden md:flex lg:flex w-full h-screen justify-center items-center text-2xl font-bold space-x-2">
//             <FontAwesomeIcon icon={faComment} />
//             <span>No Chat Selected</span>
//           </div>
//         )}
//       </div>
//       {/* {(isChatOpen ) && (
//     <div className="flex-1 flex items-center justify-center bg-gray-200 m-1">
//       <ChatWindow
//         loggedInUserId={loggedInUserId}
//         selectedUserId={selectedUserId}
//         messages={messages}
//         socket={socketRef.current}
//         goBack={goBackToSidebar} // pass back button
//       />
//     </div>
//   )} */}
//     </div>
//   );
// };

// export default MainChat;
// import { useDispatch, useSelector } from "react-redux";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { fetchUsers } from "../../user/userSlice";
// import { logout } from "../../auth/authSlice";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faComment } from "@fortawesome/free-solid-svg-icons";
// import Sidebar from "./Sidebar";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import io from "socket.io-client";
// import { setSelectedChatUser, setTyping } from "../../../common/commonSlice";
// import { setOnlineUsers } from "../../user/userSlice";
// import {
//   addGroup,
//   addGroupMessage,
//   addMessage,
//   softDeleteFromAll,
//   updateGroupMessage,
//   updateMessage,
//   softDeleteGroupMessage,
//   deleteAllGroupMessages
// } from "../chatSlice";
// import _ from "lodash";
// import ChatWindow from "./ChatWindow";
// import GroupChatWindow from "../group_chat/GroupChatWindow";
// import chatBgImg from '../../../assets/images/chat/chatBgImg.png';
// import { showBrowserNotification } from '../../../common/utils/showBrowserNotification';
// import { useTabVisibility } from '../../../common/hooks/useTabVisibility';

// const MainChat = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { users, userListLoading, onlineUsers } = useSelector((state) => state.user);
//   const { loggedInUserData, selectedChatUser } = useSelector((state) => state.common);
//   const { messages } = useSelector((state) => state.chat);
//   // const [selectedChatUser, setSelectedChatUser] = useState(null);
//   const loggedInUserId = loggedInUserData?.id;
//   const selectedUserId = selectedChatUser?.id || null;

//   // Initialize socket inside component
//   // const [socket, setSocket] = useState(null);
//   const [isChatOpen, setIsChatOpen] = useState(false);

//   const socketRef = useRef(null);
//   const selectedChatUserRef = useRef(selectedChatUser);

//   // Hook for tab visibility
//   const isTabVisible = useTabVisibility();

//   // Keep ref updated for latest selected chat
//   useEffect(() => {
//     selectedChatUserRef.current = selectedChatUser;
//   }, [selectedChatUser]);

//   const goBackToSidebar = () => {
//     console.log('clicked', isChatOpen)
//     setIsChatOpen(false); // back to user list
//   };

//   // Request browser notification permission once
//   useEffect(() => {
//     if ("Notification" in window && Notification.permission !== "granted") {
//       Notification.requestPermission();
//     }
//   }, []);

//   // useEffect(() => {
//   //   // Initialize socket connection
//   //   const newSocket = io("http://localhost:5000", { autoConnect: true });
//   //   setSocket(newSocket);

//   //   return () => {
//   //     // Cleanup: Disconnect socket only when component unmounts
//   //     newSocket.disconnect();
//   //   };
//   // }, []);

//   useEffect(() => {

//     if (!loggedInUserId) return;
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//     }
//     const socket = io(import.meta.env.VITE_BACKEND_URL, { autoConnect: true });
//     socketRef.current = socket;

//     // connet socket manually

//     socket.on("connect", () => {
//       // console.log("Connected:", socket.id);
//       socket.emit("userOnline", loggedInUserId);
//     });

//     // emit or send userOnline event
//     socket.emit("userOnline", loggedInUserId);

//     // listen for onlineUsers event
//     socket.on("onlineUsers", (list) => {
//       // console.log("Received online users:", list);
//       dispatch(setOnlineUsers(list));
//     });

//     //  recive message
//     socket.on("privateMessage", ({ senderId, receiverId, message, messageId, timestamp }) => {
//       const msgObj = { senderId, receiverId, message, messageId, timestamp };
//       const userId = senderId === loggedInUserId ? receiverId : senderId;

//       // const userId = senderId == loggedInUserId ? receiverId : senderId;

//       dispatch(addMessage({ loggedInUserId, userId, message: msgObj }));
//     });

//     //updated messages recived
//     socket.on("updateMessage", (updatedMsg) => {
//       // console.log("Received update:", updatedMsg);
//       const { chatId, messageId, message, updatedAt } = updatedMsg;

//       dispatch(updateMessage({ chatId, messageId, message, updatedAt }));
//     });

//     // listen for typing event

//     socket.on("typing", ({ userId, typing }) => {
//       // console.log("inside typing listern"+typing);
//       dispatch(setTyping({ userId, typing }));
//     });
//     socket.on("deleteMessage", (deletedMsg) => {
//   const { chatId, messageId, isDeleted, deletedAt } = deletedMsg;
//   dispatch(softDeleteFromAll({ chatId, messageId, isDeleted, deletedAt }));
// });

// //group methods of socket
//  socket.on("createGroup", (groupDetails) => {
//       const groupId = groupDetails.groupId;
//       dispatch(addGroup({ groupId, groupDetails }));
//     });

//     socket.on("groupMessage", ({ groupId, senderId, message, messageId, timestamp }) => {
//       const msgObj = { 
//         senderId, 
//         message, 
//         messageId, 
//         timestamp: timestamp || new Date().toISOString()
//       };
//       dispatch(addGroupMessage({ groupId, message: msgObj }));

//       const isActiveChat = selectedChatUserRef.current?.id === groupId;

//       if (!isTabVisible || !isActiveChat) {
//         const sender = users.find(u => u.id === senderId);
//         showBrowserNotification(sender?.name || "New Group Message", message);
//       }
//     });

//     socket.on("updateGroupMessage", ({ groupId, messageId, message, updatedAt, senderId }) => {
//       dispatch(updateGroupMessage({ groupId, messageId, message, updatedAt, senderId }));
//     });

//     // Group message deletion
//     socket.on("deleteGroupMessage", ({ groupId, messageId, isDeleted, deletedAt }) => {
//       dispatch(softDeleteGroupMessage({ groupId, messageId, isDeleted, deletedAt }));
//     });

//     // Delete all group messages
//     socket.on("deleteAllGroupMessages", ({ groupId }) => {
//       dispatch(deleteAllGroupMessages({ groupId }));
//     });

//     // cleanup remove event listeners
//     return () => {
//       socket.off("onlineUsers");
//       socket.off("privateMessage");
//       socket.off("updateMessage");
//       socket.off("typing");
//       socket.off("deleteMessage");
//       socket.off("createGroup");
//       socket.off("groupMessage");
//       socket.off("updateGroupMessage");
//       socket.off("deleteGroupMessage");
//       socket.off("deleteAllGroupMessages");
//       socket.off("groupTyping");
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, [loggedInUserId]);

//   useEffect(() => {
//     dispatch(fetchUsers());
//   }, [dispatch]);

//   const userLogout = async () => {
//     // console.log('logout');
//     if (socketRef.current && loggedInUserId) {
//       socketRef.current.emit("userLogout", loggedInUserId, () => {
//         console.log('user logout ack by server');
//         socketRef.current.disconnect();
//         socketRef.current = null;
//         dispatch(setOnlineUsers([]));
//       });
//     }


//     const res = await dispatch(logout());
//     if (res) {
//       // dispatch(clearMessages());
//       toast.success("User logged out successfully");

//     }
//     navigate("/login");
//   };

//   const selectChatToOpen = (user) => {
//     dispatch(setSelectedChatUser(user));
//     setIsChatOpen(true);
//   };
//   //latest message user first 
//   // const sortedUsers = useMemo(() => {
//   //   return _.orderBy(users, (u) => {
//   //     const chatId = getChatId(loggedInUserId, u.id);
//   //     return messages[chatId]?.slice(-1)[0]?.timestamp || 0;
//   //   }, ["desc"]);
//   // }, [users, messages, loggedInUserId]);


//   //get last message for each chatId meand for each chat.
//     const lastMessages = useMemo(() => {
//       const result = {};
//       Object.keys(messages).forEach(chatId => {
//         const msgArr = messages[chatId];
//         if (msgArr?.length) {
//           // Filter out deleted messages
//           const validMsgs = msgArr.filter(m => !m.isDeleted);
//           if (validMsgs.length) {
//             result[chatId] = _.maxBy(validMsgs, "timestamp");
//           }
//         }
//       });
//       return result;
//     }, [messages]);


//   // console.log(lastMessages);



//   return (
//     <div className="h-screen flex">
//       <div className={`${isChatOpen ? "hidden sm:flex " : "flex"
//         } flex flex-col  bg-white border-r w-full sm:w-72 lg:w-80`}>
//         <Sidebar
//           users={users}
//           userListLoading={userListLoading}
//           loggedInUserId={loggedInUserId}
//           logoutFunction={userLogout}
//           selectChat={selectChatToOpen}
//           lastMessages={lastMessages}
//           // messages={messages}
//           onlineUsers={onlineUsers}
//           socketRef={socketRef}
//         />
//       </div>
//       <div className={` flex-1 flex flex-col
//       ${isChatOpen ? "flex w-full" : "hidden sm:flex"} m-1  `}

//       style={{
//       backgroundImage: `url(${chatBgImg})`,
//       backgroundSize: "cover",
//       backgroundPosition: "center"
//     }}
//       >
//         {selectedChatUser ? (
//           selectedChatUser.isGroup ? (
//             <GroupChatWindow
//               loggedInUserId={loggedInUserId}
//               selectedGroupId={selectedUserId}
//               socket={socketRef.current}
//               goBack={goBackToSidebar}
//             />
//           ) : (
//             <ChatWindow
//               loggedInUserId={loggedInUserId}
//               selectedUserId={selectedUserId}
//               messages={messages}
//               socket={socketRef.current}
//               goBack={goBackToSidebar}
//             />
//           )
//         ) : (
//           <div className="hidden md:flex lg:flex w-full h-screen justify-center items-center text-2xl font-bold space-x-2">
//             <FontAwesomeIcon icon={faComment} />
//             <span>No Chat Selected</span>
//           </div>
//         )}
//       </div>
//       {/* {(isChatOpen ) && (
//     <div className="flex-1 flex items-center justify-center bg-gray-200 m-1">
//       <ChatWindow
//         loggedInUserId={loggedInUserId}
//         selectedUserId={selectedUserId}
//         messages={messages}
//         socket={socketRef.current}
//         goBack={goBackToSidebar} // pass back button
//       />
//     </div>
//   )} */}
//     </div>
//   );
// };

// export default MainChat;
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchUsers } from "../../user/userSlice";
import { logout } from "../../auth/authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "./Sidebar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { setSelectedChatUser, setTyping } from "../../../common/commonSlice";
import { setOnlineUsers } from "../../user/userSlice";
import {
  addGroup,
  addGroupMessage,
  addMessage,
  softDeleteFromAll,
  updateGroupMessage,
  updateMessage,
  softDeleteGroupMessage,
  deleteAllGroupMessages
} from "../chatSlice";
import _ from "lodash";
import ChatWindow from "./ChatWindow";
import GroupChatWindow from "../group_chat/GroupChatWindow";
import chatBgImg from '../../../assets/images/chat/chatBgImg.png';
import { showBrowserNotification } from '../../../common/utils/showBrowserNotification';
import { useTabVisibility } from '../../../common/hooks/useTabVisibility';

const MainChat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, userListLoading, onlineUsers } = useSelector((state) => state.user);
  const { loggedInUserData, selectedChatUser } = useSelector((state) => state.common);
  const { messages,groups } = useSelector(state => state.chat);

  const loggedInUserId = loggedInUserData?.id;
  const selectedUserId = selectedChatUser?.id || null;

  const [isChatOpen, setIsChatOpen] = useState(false);

  const socketRef = useRef(null);
  const selectedChatUserRef = useRef(selectedChatUser);

  // custom hook for tab visibility
  const isTabVisible = useTabVisibility();

  // keep ref updated for latest selected chat
  useEffect(() => {
    selectedChatUserRef.current = selectedChatUser;
  }, [selectedChatUser]);

  const goBackToSidebar = () => {
    setIsChatOpen(false); // back to user list on mobile screen
  };

  // request browser notification permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);


  useEffect(() => {
    if (!loggedInUserId) return;
    if (socketRef.current) socketRef.current.disconnect();

    const socket = io(import.meta.env.VITE_BACKEND_URL, { autoConnect: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("userOnline", loggedInUserId);
    });

    socket.emit("userOnline", loggedInUserId);


    socket.on("onlineUsers", (list) => {
      dispatch(setOnlineUsers(list));
    });

 
    socket.on("privateMessage", ({ senderId, receiverId, message, messageId, timestamp }) => {
      const msgObj = { senderId, receiverId, message, messageId, timestamp };
      const userId = senderId === loggedInUserId ? receiverId : senderId;

      dispatch(addMessage({ loggedInUserId, userId, message: msgObj }));

        if (senderId !== loggedInUserId) {
        const isActiveChat = selectedChatUserRef.current?.id === senderId;

    if (!isTabVisible || !isActiveChat) {
      const sender = users.find(u => u.id === senderId);
      showBrowserNotification(sender?.name || "New Message", message);
    }
  }
    });

    socket.on("updateMessage", ({ chatId, messageId, message, updatedAt }) => {
      dispatch(updateMessage({ chatId, messageId, message, updatedAt }));
    });

    socket.on("typing", ({ userId, typing }) => {
      dispatch(setTyping({ userId, typing }));
    });

    socket.on("deleteMessage", ({ chatId, messageId, isDeleted, deletedAt }) => {
      dispatch(softDeleteFromAll({ chatId, messageId, isDeleted, deletedAt }));
    });


    socket.on("createGroup", (groupDetails) => {
      const groupId = groupDetails.groupId;
      dispatch(addGroup({ groupId, groupDetails }));
    });


    socket.on("groupMessage", ({ groupId, senderId, message, messageId, timestamp }) => {
      const msgObj = {
        senderId,
        message,
        messageId,
        timestamp: timestamp || new Date().toISOString()
      };
      dispatch(addGroupMessage({ groupId, message: msgObj }));

     if (senderId !== loggedInUserId) {
    const isActiveChat = selectedChatUserRef.current?.id === groupId;

    if (!isTabVisible || !isActiveChat) {
      const sender = users.find(u => u.id === senderId);
       const group = Object.values(groups).find(g => g.groupId === groupId);

      // console.log(group);
      
      const title = group ? `${group.groupName} - ${sender?.name}` : sender?.name || "New Group Message";

      showBrowserNotification(title, message);
    }
  }
    });

    socket.on("updateGroupMessage", ({ groupId, messageId, message, updatedAt, senderId }) => {
      dispatch(updateGroupMessage({ groupId, messageId, message, updatedAt, senderId }));
    });

    socket.on("deleteGroupMessage", ({ groupId, messageId, isDeleted, deletedAt }) => {
      dispatch(softDeleteGroupMessage({ groupId, messageId, isDeleted, deletedAt }));
    });

    socket.on("deleteAllGroupMessages", ({ groupId }) => {
      dispatch(deleteAllGroupMessages({ groupId }));
    });

    return () => {
      socket.off();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [loggedInUserId, users, isTabVisible]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const userLogout = async () => {
    if (socketRef.current && loggedInUserId) {
      socketRef.current.emit("userLogout", loggedInUserId, () => {
        socketRef.current.disconnect();
        socketRef.current = null;
        dispatch(setOnlineUsers([]));
      });
    }

    const res = await dispatch(logout());
    if (res) toast.success("User logged out successfully");
    navigate("/login");
  };

  const selectChatToOpen = (user) => {
    dispatch(setSelectedChatUser(user));
    setIsChatOpen(true);
  };

  const lastMessages = useMemo(() => {
    const result = {};
    Object.keys(messages).forEach(chatId => {
      const msgArr = messages[chatId];
      if (msgArr?.length) {
        const validMsgs = msgArr.filter(m => !m.isDeleted);
        if (validMsgs.length) result[chatId] = _.maxBy(validMsgs, "timestamp");
      }
    });
    return result;
  }, [messages]);

  return (
    <div className="h-screen flex">
      <div className={`${isChatOpen ? "hidden sm:flex" : "flex"} flex flex-col bg-white border-r w-full sm:w-72 lg:w-80`}>
        <Sidebar
          users={users}
          userListLoading={userListLoading}
          loggedInUserId={loggedInUserId}
          logoutFunction={userLogout}
          selectChat={selectChatToOpen}
          lastMessages={lastMessages}
          onlineUsers={onlineUsers}
          socketRef={socketRef}
        />
      </div>
      <div
        className={`flex-1 flex flex-col ${isChatOpen ? "flex w-full" : "hidden sm:flex"} m-1`}
        style={{
          backgroundImage: `url(${chatBgImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {selectedChatUser ? (
          selectedChatUser.isGroup ? (
            <GroupChatWindow
              loggedInUserId={loggedInUserId}
              selectedGroupId={selectedUserId}
              socket={socketRef.current}
              goBack={goBackToSidebar}
            />
          ) : (
            <ChatWindow
              loggedInUserId={loggedInUserId}
              selectedUserId={selectedUserId}
              messages={messages}
              socket={socketRef.current}
              goBack={goBackToSidebar}
            />
          )
        ) : (
          <div className="hidden md:flex lg:flex w-full h-screen justify-center items-center text-2xl font-bold space-x-2">
            <FontAwesomeIcon icon={faComment} />
            <span>No Chat Selected</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainChat;



