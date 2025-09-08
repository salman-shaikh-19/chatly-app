import { useSelector, useDispatch } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { v4 as uuidv4 } from "uuid";
import ChatInputBar from "../components/ChatInputBar";
import GroupChatHeader from "./GroupChatHeader";
import GroupChatMessages from "./GroupChatMessages";
import { addGroupMessage, updateGroupMessage, softDeleteGroupMessage, deleteAllGroupMessages, deleteGroupMessage } from "../chatSlice";
import isEditOrDeletable from "../../../common/utils/isEditOrDeletable";

const MySwal = withReactContent(Swal);

const GroupChatWindow = ({ loggedInUserId, selectedGroupId, socket, goBack }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [editMsg, setEditMsg] = useState(null);
  const [selectedMsgs, setSelectedMsgs] = useState([]);
  const [groupTyping, setGroupTyping] = useState({});

  const { selectedChatUser } = useSelector(state => state.common);
  const { onlineUsers, users } = useSelector(state => state.user);
  const groups = useSelector(state => state.chat.groups || {});
  const groupMessages = useSelector(state => state.chat.groupMessages[selectedGroupId] || []);
  
  const currentGroup = groups[selectedGroupId];
  const groupUsers = currentGroup?.groupUsers || [];

  // Create user lookup for names
  const userLookup = users.reduce((acc, user) => {
    acc[user.id] = user.name;
    return acc;
  }, {});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages, selectedChatUser,groupTyping]);

  const handleSend = (messageText) => {
    if (!selectedGroupId || !currentGroup) return;

    if (editMsg) {
      if (!isEditOrDeletable(editMsg.timestamp)) {
        toast.error("You can only edit messages within 2 minutes of sending");
        setEditMsg(null);
        return;
      }

      socket.emit("updateGroupMessage", {
        groupId: selectedGroupId,
        messageId: editMsg.messageId,
        senderId: loggedInUserId,
        message: messageText,
        groupUsers
      });
      setEditMsg(null);
    } else {
      const msgObj = {
        groupId: selectedGroupId,
        senderId: loggedInUserId,
        message: messageText,
        messageId: uuidv4(),
        timestamp: new Date().toISOString(),
      };

      // Only emit to server, don't add locally (server will broadcast back)
      socket.emit("groupMessage", {
        ...msgObj,
        groupUsers
      });
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedGroupId) return;
    
    socket.emit("groupTyping", { 
      groupId: selectedGroupId, 
      senderId: loggedInUserId, 
      typing: true,
      groupUsers 
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("groupTyping", { 
        groupId: selectedGroupId, 
        senderId: loggedInUserId, 
        typing: false,
        groupUsers 
      });
    }, 400);
  };

  const handleDeleteMessage = useCallback((msg) => {
    if (!msg) return;
    
    if (msg.isDeleted) {
      // Delete already deleted message from user's side only
      MySwal.fire({
        title: 'Delete from your side?',
        text: "This will remove the message from your view only.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete for me!'
      }).then((result) => {
        if (result.isConfirmed) {
          dispatch(softDeleteGroupMessage({ 
            groupId: selectedGroupId, 
            messageId: msg.messageId, 
            isDeleted: true, 
            deletedAt: new Date().toISOString() 
          }));
          toast.success("Message removed from your view");
        }
      });
      return;
    }

    if (!isEditOrDeletable(msg.timestamp)) {
      toast.error("You can only delete messages within 2 minutes of sending");
      return;
    }

    MySwal.fire({
      title: 'Are you sure?',
      text: "Deleting this message will remove it from all group members. This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setEditMsg(null);
        socket.emit("deleteGroupMessage", {
          groupId: selectedGroupId,
          messageId: msg.messageId,
          senderId: loggedInUserId,
          groupUsers
        });
      }
    });
  }, [socket, selectedGroupId, loggedInUserId, groupUsers, dispatch]);

  const handleEditMessage = useCallback((msg) => {
    setEditMsg(msg);
  }, []);

  const handleSelectedDelete = () => {
  if (selectedMsgs.length === 0) return;

  MySwal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${selectedMsgs.length} selected message${selectedMsgs.length > 1 ? 's' : ''} from this group. This action cannot be undone!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: `Yes, delete!`
  }).then((result) => {
    if (result.isConfirmed) {
      // Hard delete selected messages from Redux store
      selectedMsgs.forEach(messageId => {
        dispatch(deleteGroupMessage({ 
          groupId: selectedGroupId, 
          messageId 
        }));
      })

      //   // Emit to server if you want other group members to see deletion
      //   socket.emit("deleteGroupMessage", {
      //     groupId: selectedGroupId,
      //     messageId,
      //     senderId: loggedInUserId,
      //     groupUsers
      //   });
      // });

      setSelectedMsgs([]); // reset selection
      toast.success(`${selectedMsgs.length} message${selectedMsgs.length > 1 ? 's' : ''} deleted`);
    }
  });
};


  const handleDeleteAll = () => {
    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert messages! This will only delete messages from your side.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete for me!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Only delete locally for the user, don't emit to server for group chats
        dispatch(deleteAllGroupMessages({ groupId: selectedGroupId }));
        setSelectedMsgs([]);
        toast.success(`All messages deleted from your side`);
      }
    });
  };

  // Socket listeners for group-specific events
  useEffect(() => {
    if (!socket) return;

    const handleGroupTyping = ({ groupId, senderId, typing }) => {
      if (groupId === selectedGroupId && senderId !== loggedInUserId) {
        setGroupTyping(prev => ({
          ...prev,
          [senderId]: typing
        }));
      }
    };

    socket.on("groupTyping", handleGroupTyping);

    return () => {
      socket.off("groupTyping", handleGroupTyping);
    };
  }, [socket, selectedGroupId, loggedInUserId]);

  const typingUsers = Object.keys(groupTyping).filter(userId => groupTyping[userId]);
  const typingUserNames = typingUsers.map(userId => userLookup[userId] || `User ${userId}`);
  const isAnyoneTyping = typingUsers.length > 0;

  return (
    <div className="flex flex-col h-full border rounded w-full">
      <GroupChatHeader
        goBack={goBack}
        handleDeleteAll={handleDeleteAll}
        messages={groupMessages}
        onlineUsers={onlineUsers}
        selectedChatUser={selectedChatUser}
        typing={isAnyoneTyping}
        typingUserNames={typingUserNames}
        handleSelectedDelete={handleSelectedDelete}
        selectedMsgs={selectedMsgs}
        groupUsers={groupUsers}
          allUsers={users}
      />
      
      <GroupChatMessages
        messages={groupMessages}
        loggedInUserId={loggedInUserId}
        selectedMsgs={selectedMsgs}
        setSelectedMsgs={setSelectedMsgs}
        messagesEndRef={messagesEndRef}
        typing={isAnyoneTyping}
        typingUserNames={typingUserNames}
        handleDeleteMessage={handleDeleteMessage}
        handleEditMsg={handleEditMessage}
    
      />
      
      <ChatInputBar
        onSend={handleSend}
        handleTyping={handleTyping}
        editMsg={editMsg}
        onClearEdit={() => setEditMsg(null)}
      />
    </div>
  );
};

export default GroupChatWindow;
