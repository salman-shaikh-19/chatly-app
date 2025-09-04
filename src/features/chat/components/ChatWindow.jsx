import { useSelector, useDispatch } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";

import { deleteAllMessages, deleteMessage, deleteSelectedMessages } from "../chatSlice";
import { toast } from "react-toastify";
import { getChatId } from "../../../common/utils/getChatId";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ChatInputBar from "./ChatInputBar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import { v4 as uuidv4 } from "uuid";
import isEditOrDeletable from "../../../common/utils/isEditOrDeletable";
const MySwal = withReactContent(Swal);

const ChatWindow = ({ loggedInUserId, selectedUserId, socket, goBack }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [editMsg, setEditMsg] = useState(null);

  const { selectedChatUser } = useSelector(state => state.common);
  const { onlineUsers } = useSelector(state => state.user);
  const chatId = getChatId(loggedInUserId, selectedUserId);
  const messages = useSelector(state => state.chat.messages[chatId] || []);
  const typing = useSelector(state => state.common.isTyping?.[selectedUserId] || false);
      const [selectedMsgs,setSelectedMsgs]=useState([]);
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  const handleSend = (messageText) => {
    if (!selectedUserId) return;

    if (editMsg) {
      // console.log(editMsg);

      if (!isEditOrDeletable(editMsg.timestamp)) {
        toast.error("You can only edit messages within 2 minutes of sending");
        setEditMsg(null); // clear edit
        return;
      }
      socket.emit("updateMessage", {
        chatId,
        senderId: loggedInUserId,
        receiverId: selectedUserId,
        messageId: editMsg.messageId,
        message: messageText
      });
      setEditMsg(null);
    } else {
      const msgObj = {
        senderId: loggedInUserId,
        receiverId: selectedUserId,
        message: messageText,
        messageId: uuidv4(),
        timestamp: new Date().toISOString(),
      };
      socket.emit("privateMessage", msgObj);
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedUserId) return;
    socket.emit("typing", { senderId: loggedInUserId, receiverId: selectedUserId, typing: true });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { senderId: loggedInUserId, receiverId: selectedUserId, typing: false });
    }, 400);
  };

  // const handleDeleteMessage = useCallback((msg) => {
  //   if (!msg) return;
  //   const chatId = getChatId(loggedInUserId, selectedUserId);
  //   toast.success(`Message deleted from your side`);
  //   dispatch(deleteMessage({ chatId, messageId: msg.messageId }));
  // }, [dispatch, loggedInUserId, selectedUserId]);
  const handleDeleteMessage = useCallback((msg) => {
    if (!msg) return;
    if (!isEditOrDeletable(msg.timestamp)) {
      toast.error("You can only delete messages within 2 minutes of sending");
      return;
    }
    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert messages!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        socket.emit("deleteMessage", {
          chatId,
          messageId: msg.messageId,
          senderId: loggedInUserId,
          receiverId: selectedUserId,
        });
      }
    });

    // no local delete, server will broadcast soft delete
  }, [socket, chatId, loggedInUserId, selectedUserId]);

  const handleEditMessage = useCallback((msg) => {
    setEditMsg(msg);
  }, []);

  //delete selected msgs
   const handleSelectedDelete = () => {
    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert messages!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete All!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteSelectedMessages({ chatId,messageIds: selectedMsgs }));
        setSelectedMsgs([]);//reset
        toast.success(`Your selected messages deleted from your side`);
      }
    });
  };

  //clear all msgs
  const handleDeleteAll = () => {
    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert messages!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete All!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteAllMessages({ chatId }));
        setSelectedMsgs([]);//reset
        toast.success(`All messages deleted from your side`);
      }
    });
  };
  // console.log('called');

  return (
    <div className="flex flex-col h-full border rounded w-full">
      <ChatHeader
        goBack={goBack}
        handleDeleteAll={handleDeleteAll}
        messages={messages}
        onlineUsers={onlineUsers}
        selectedChatUser={selectedChatUser}
        typing={typing}
        handleSelectedDelete={handleSelectedDelete}
        selectedMsgs={selectedMsgs}
      />
      <ChatMessages
        messages={messages}
        loggedInUserId={loggedInUserId}
        typing={typing}
        messagesEndRef={messagesEndRef}
        handleDeleteMessage={handleDeleteMessage}
        handleEditMsg={handleEditMessage}
        selectedMsgs={selectedMsgs}
        setSelectedMsgs={setSelectedMsgs}

      />
      <ChatInputBar
        loggedInUserId={loggedInUserId}
        selectedUserId={selectedUserId}
        socket={socket}
        onSend={handleSend}
        handleTyping={handleTyping}
        editMsg={editMsg}
        onClearEdit={() => setEditMsg(null)}
      />
    </div>
  );
};

export default ChatWindow;
