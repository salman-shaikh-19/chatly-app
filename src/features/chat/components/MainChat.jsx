import { useDispatch, useSelector } from "react-redux";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { fetchUsers } from "../../user/userSlice";
import { logout } from "../../auth/authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "./Sidebar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { setSelectedChatUser, setTyping } from "../../../common/commonSlice";
import { setOnlineUsers } from "../../user/userSlice";
import { addMessage, clearMessages, updateMessage } from "../chatSlice";
import _ from 'lodash';
import ChatWindow from "./ChatWindow";
import { getChatId } from "../../../common/utils/getChatId";
const MainChat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, userListLoading, onlineUsers } = useSelector((state) => state.user);
  const { loggedInUserData, selectedChatUser } = useSelector((state) => state.common);
  const { messages } = useSelector((state) => state.chat);
  // const [selectedChatUser, setSelectedChatUser] = useState(null);
  const loggedInUserId = loggedInUserData?.id;
  const selectedUserId = selectedChatUser?.id || null;

  // Initialize socket inside component
  // const [socket, setSocket] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const goBackToSidebar = () => {
    console.log('clicked', isChatOpen)
    setIsChatOpen(false); // back to user list
  };

  const socketRef = useRef(null);

  // useEffect(() => {
  //   // Initialize socket connection
  //   const newSocket = io("https://chatly-backend-h9q3.onrender.com", { autoConnect: true });
  //   setSocket(newSocket);

  //   return () => {
  //     // Cleanup: Disconnect socket only when component unmounts
  //     newSocket.disconnect();
  //   };
  // }, []);

  useEffect(() => {

    if (!loggedInUserId) return;
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
//     const socket = io("https://chatly-backend.onrender.com", {
//   transports: ["websocket"],
// });
  const socket = io("https://chatly-backend-h9q3.onrender.com", { autoConnect: true, transports: ["websocket"] });

    socketRef.current = socket;

    // connet socket manually

    socket.on("connect", () => {
      // console.log("Connected:", socket.id);
      socket.emit("userOnline", loggedInUserId);
    });

    // emit or send userOnline event
    socket.emit("userOnline", loggedInUserId);

    // listen for onlineUsers event
    socket.on("onlineUsers", (list) => {
      // console.log("Received online users:", list);
      dispatch(setOnlineUsers(list));
    });

    //  recive message
    socket.on("privateMessage", ({ senderId, receiverId, message, messageId, timestamp }) => {
      const msgObj = { senderId, receiverId, message, messageId, timestamp };

      const userId = senderId == loggedInUserId ? receiverId : senderId;

      dispatch(addMessage({ loggedInUserId, userId, message: msgObj }));
    });

    //updated messages recived
    socket.on("updateMessage", (updatedMsg) => {
      // console.log("Received update:", updatedMsg);
      const { chatId, messageId, message, updatedAt } = updatedMsg;

      dispatch(updateMessage({ chatId, messageId, message, updatedAt }));
    });

    // listen for typing event

    socket.on("typing", ({ userId, typing }) => {
      // console.log("inside typing listern"+typing);
      dispatch(setTyping({ userId, typing }));
    });


    // cleanup remove event listeners
    return () => {
      socket.off("onlineUsers");
      socket.off("privateMessage");
       socket.off("updateMessage");
      socket.off("typing");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [loggedInUserId]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const userLogout = async () => {
    // console.log('logout');
    if (socketRef.current && loggedInUserId) {
      socketRef.current.emit("userLogout", loggedInUserId, () => {
        console.log('user logout ack by server');
        socketRef.current.disconnect();
        socketRef.current = null;
        dispatch(setOnlineUsers([]));
      });
    }


    const res = await dispatch(logout());
    if (res) {
      // dispatch(clearMessages());
      toast.success("User logged out successfully");

    }
    navigate("/login");
  };

  const selectChatToOpen = (user) => {
    dispatch(setSelectedChatUser(user));
    setIsChatOpen(true);
  };
  //latest message user first 
  const sortedUsers = useMemo(() => {
    return _.orderBy(users, (u) => {
      const chatId = getChatId(loggedInUserId, u.id);
      return messages[chatId]?.slice(-1)[0]?.timestamp || 0;
    }, ["desc"]);
  }, [users, messages, loggedInUserId]);

  //get last message for each chatId meand for each chat.
  const lastMessages = useMemo(() => {
    const result = {};
    Object.keys(messages).forEach(chatId => {
      const msgArr = messages[chatId];
      if (msgArr?.length) result[chatId] = msgArr[msgArr.length - 1];
    });
    return result;
  }, [messages]);

  // console.log(lastMessages);



  return (
    <div className="h-screen flex">
      <div className={`${isChatOpen ? "hidden sm:flex" : "flex"
        } flex-col  bg-white border-r`}>
        <Sidebar
          users={sortedUsers}
          userListLoading={userListLoading}
          loggedInUserId={loggedInUserId}
          logoutFunction={userLogout}
          selectChat={selectChatToOpen}
          lastMessages={lastMessages}
          // messages={messages}
          onlineUsers={onlineUsers}
        />
      </div>
      <div className={`${isChatOpen ? "block lg:block md:block" : "hidden lg:block md:block"} flex-1 flex flex-col bg-gray-200 m-1`}>
        {selectedChatUser ? (
          <ChatWindow
            loggedInUserId={loggedInUserId}
            selectedUserId={selectedUserId}
            messages={messages}
            socket={socketRef.current}
            goBack={goBackToSidebar}
          />
        ) : (
          <div className="hidden md:flex lg:flex w-full h-screen justify-center items-center text-2xl font-bold space-x-2">
            <FontAwesomeIcon icon={faComment} />
            <span>No Chat Selected</span>
          </div>
        )}
      </div>
      {/* {(isChatOpen ) && (
    <div className="flex-1 flex items-center justify-center bg-gray-200 m-1">
      <ChatWindow
        loggedInUserId={loggedInUserId}
        selectedUserId={selectedUserId}
        messages={messages}
        socket={socketRef.current}
        goBack={goBackToSidebar} // pass back button
      />
    </div>
  )} */}
    </div>
  );
};

export default MainChat;
