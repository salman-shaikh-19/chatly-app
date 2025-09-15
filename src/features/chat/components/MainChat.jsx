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
import { setMessageCounts, setSelectedChatUser, setTyping } from "../../../common/commonSlice";
import { setOnlineUsers } from "../../user/userSlice";
import {
  addGroup,
  addGroupMessage,
  addMessage,
  softDeleteFromAll,
  updateGroupMessage,
  updateMessage,
  softDeleteGroupMessage,
  deleteAllGroupMessages,
  leaveGroup,
  removeUserFromGroup
} from "../chatSlice";
import _ from "lodash";
import ChatWindow from "../private_chat/ChatWindow"
import GroupChatWindow from "../group_chat/GroupChatWindow";
import chatBgImg from '../../../assets/images/chat/chatBgImg.png';
import { showBrowserNotification } from '../../../common/utils/showBrowserNotification';
import { useTabVisibility } from '../../../common/hooks/useTabVisibility';
import { getChatId } from "../../../common/utils/getChatId";

const MainChat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, userListLoading, onlineUsers } = useSelector((state) => state.user);
  const { loggedInUserData, selectedChatUser, messageCounts } = useSelector((state) => state.common);
  const { messages, groups } = useSelector(state => state.chat);

  const loggedInUserId = loggedInUserData?.id;
  const selectedUserId = selectedChatUser?.id || null;

  const [isChatOpen, setIsChatOpen] = useState(false);

  const socketRef = useRef(null);
  const selectedChatUserRef = useRef(selectedChatUser);
  const notificationSoundRef = useRef(null);

  // custom hook for tab visibility
  const isTabVisible = useTabVisibility();
  // console.log("message counts",messageCounts);

  // keep ref updated for latest selected chat
  useEffect(() => {
    selectedChatUserRef.current = selectedChatUser;
  }, [selectedChatUser]);


  //play notification tone
  function playNotificationSound() {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.currentTime = 0;
      notificationSoundRef.current.play().catch(err => {
        console.warn("sound play blocked:", err);
      });
    }
  }




  const goBackToSidebar = () => {
    dispatch(setSelectedChatUser(null));
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
    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket", "polling"], // try websocket first, then fallback
      autoConnect: true,                    // connect immediately (default is true)
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("userOnline", loggedInUserId);
    });

    socket.emit("userOnline", loggedInUserId);


    socket.on("onlineUsers", (list) => {
      dispatch(setOnlineUsers(list));
    });


    // socket.on("privateMessage", ({ senderId, receiverId, message, messageId, timestamp }) => {
    //   const msgObj = { senderId, receiverId, message, messageId, timestamp };
    //   const userId = senderId === loggedInUserId ? receiverId : senderId;

    //   dispatch(addMessage({ loggedInUserId, userId, message: msgObj }));
    //   if (loggedInUserId !== receiverId) { console.log("i m not reciver by i m returning");
    //     return;}else{

    //     }
    //       if (senderId !== loggedInUserId && receiverId === loggedInUserId) {
    //     console.log("senderid",senderId);
    //       console.log("reciver id:",receiverId);
    //      console.log("logged in user",loggedInUserId);

    //     const isActiveChat = selectedChatUserRef.current?.id === senderId;

    //     if (!isTabVisible || !isActiveChat) {
    //       const sender = users.find(u => u.id === senderId);
    //       console.log("sender:",sender);

    //       showBrowserNotification(sender?.name || "New Message", message);
    //     }
    //   }
    // });
    // Private messages
    socket.on("privateMessage", ({ senderId, receiverId, message, messageId, timestamp }) => {
      const msgObj = { senderId, receiverId, message, messageId, timestamp };
      const chatUserId = senderId === loggedInUserId ? receiverId : senderId;

      // Add message to state
      dispatch(addMessage({ loggedInUserId, userId: chatUserId, message: msgObj }));

      // Show notification and msg count only for receiver
      if (loggedInUserId === receiverId) {
        // const chatId = [senderId, receiverId].sort().join("_");
        const chatId = getChatId(senderId, receiverId);
        const sender = users.find(u => u.id === senderId);
        const senderName = sender?.name || "New Message";
        const isActiveChat = selectedChatUserRef.current?.id === senderId;
        if (!isActiveChat) {
          dispatch(setMessageCounts({ chatId, count: 1 }));
        }
        if (!isTabVisible || !isActiveChat) {
          // dispatch(setMessageCounts({chatId , count: 1 }));
          playNotificationSound();
          showBrowserNotification(senderName, message);
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

      if (Number(groupDetails?.createdBy) !== Number(loggedInUserId)) {
        // console.log("reciver: gheree",groupDetails);
        toast.info(`🎉 You’ve been added to a new group: "${groupDetails.groupName}"! Welcome aboard and enjoy connecting with everyone!`);
      }


    });

    socket.on("groupMessage", ({ groupId, senderId, message, messageId, timestamp }) => {
      const msgObj = {
        senderId,
        message,
        messageId,
        timestamp: timestamp || new Date().toISOString()
      };
      dispatch(addGroupMessage({ groupId, message: msgObj }));

      // console.log("group id",groupId);//here id got
      if (senderId !== loggedInUserId) {
        const isActiveChat = selectedChatUserRef.current?.id == groupId;
        if (!isActiveChat) {
          dispatch(setMessageCounts({ chatId: groupId, count: 1 }));
        }

        if (!isTabVisible || !isActiveChat) {
          // console.log("group id in side",groupId);//here id got
          //  const chatId=getChatId(senderId,receiverId);
          const sender = users.find(u => u.id == senderId);
          const group = Object.values(groups).find(g => g.groupId == groupId);

          // console.log(group);

          const title = group ? `${group.groupName} - ${sender?.name}` : sender?.name || "New Group Message";
          playNotificationSound();
          showBrowserNotification(title, message);
        }
        // else{
        //    dispatch(setMessageCounts({chatId: groupId , count: 0 }));
        // }
      }
    });

    socket.on("updateGroupMessage", ({ groupId, messageId, message, updatedAt, senderId }) => {
      dispatch(updateGroupMessage({ groupId, messageId, message, updatedAt, senderId }));
    });
   socket.on("groupUpdate", ({ groupId, userId, isAdmin = false }) => {
      const isCurrentUser = Number(userId) === Number(loggedInUserId);
      
      if (isCurrentUser) {
        // Current user left or was removed
        dispatch(leaveGroup({ groupId, userId, isAdmin }));
        
        // // If the current active chat is the group being left, clear the selected chat
        // if (selectedChatUser?.id === groupId) {
        //   dispatch(setSelectedChatUser(null));
        // }
      } else {
        // Other group members
        dispatch(removeUserFromGroup({ groupId, userId }));
      }
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

  // console.log(selectChat);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.classList.add("blurred");
      } else {
        document.body.classList.remove("blurred");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

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
        className={`flex-1 flex flex-col ${isChatOpen ? "flex w-full" : "hidden sm:flex"} m-1  object-contain`}
        style={{
          backgroundImage: `url(${chatBgImg})`,
          // backgroundSize: "cover",
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
            <span className="select-none">No Chat Selected</span>
          </div>
        )}
      </div>
      <audio ref={notificationSoundRef} src="/sounds/notification.mp3" preload="auto" />

    </div>
  );
};

export default MainChat;


