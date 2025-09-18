import { useSelector, useDispatch } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { v4 as uuidv4 } from "uuid";
import ChatInputBar from "../components/ChatInputBar";
import GroupChatHeader from "./GroupChatHeader";
import GroupChatMessages from "./GroupChatMessages";
import { addGroupMessage, updateGroupMessage, softDeleteGroupMessage, deleteAllGroupMessages, deleteGroupMessage, deleteGroup } from "../chatSlice";
import isEditOrDeletable from "../../../common/utils/isEditOrDeletable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";

const MySwal = withReactContent(Swal);

const GroupChatWindow = ({ loggedInUserId, selectedGroupId, socket, goBack }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatRef = useRef();

  const [editMsg, setEditMsg] = useState(null);
  const [selectedMsgs, setSelectedMsgs] = useState([]);
  const [groupTyping, setGroupTyping] = useState({});

  const { selectedChatUser } = useSelector(state => state.common);
  const { onlineUsers, users } = useSelector(state => state.user);
  const groups = useSelector(state => state.chat.groups || {});
  const groupMessages = useSelector(state => state.chat.groupMessages[selectedGroupId] || []);
  
  // Get the latest group data from Redux store
  const currentGroup = groups[selectedGroupId];
  const groupUsers = currentGroup?.groupUsers || [];

  // Create user lookup for names
  const userLookup = users.reduce((acc, user) => {
    acc[user.id] = user.name;
    return acc;
  }, {});

 
  // useEffect(() => {
  //   console.log('Current group users:', groupUsers);
  //   console.log('Logged in user ID:', loggedInUserId);
  //   console.log('Is user in group?', groupUsers.some(u => u.userId === loggedInUserId));
  // }, [groupUsers, loggedInUserId]);

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

const handleGroupDelete = () => {
    MySwal.fire({
      title: 'Delete group from your list?',
      text: "This will remove the group and all its messages from your view only.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete for me!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Only delete locally for the user, don't emit to server 
        dispatch(deleteGroup({ groupId: selectedGroupId }));
        // dispatch(deleteAllGroupMessages({ groupId: selectedGroupId }));
        setSelectedMsgs([]);
        toast.success(`Group deleted from your side`);
        goBack();
      }
    });
  }
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
// Ensure we're comparing the same data types (convert both to string or number)
const isUserInGroup = groupUsers.some(u => Number(u.userId) === Number(loggedInUserId));
const currentUserRole = groupUsers.find(u => Number(u.userId) === Number(loggedInUserId))?.role;
let chatDisabledMessage = "";

if (!isUserInGroup) {
  chatDisabledMessage = "You are not a member of this group";
} else if (currentGroup?.type === "private" && currentUserRole !== "admin") {
  chatDisabledMessage = "Only admins can send messages in this group";
}

const canChat = isUserInGroup && (currentGroup?.type === "public" || (currentGroup?.type === "private" && currentUserRole === "admin"));

// console.log(currentGroup);

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
          socket={socket}
          isUserInGroup={isUserInGroup}
          handleGroupDelete={handleGroupDelete}
          chatRef={chatRef}
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
        currentGroup={currentGroup}
        chatRef={chatRef}
    
      />
      
        {canChat ? (
      <ChatInputBar
        onSend={handleSend}
        handleTyping={handleTyping}
        editMsg={editMsg}
        onClearEdit={() => setEditMsg(null)}
      />
    ):(
     <div className="w-full flex justify-center my-2 ">
        <div className="mx-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-center text-sm shadow-sm border border-yellow-300 max-w-md">
          <FontAwesomeIcon icon={faWarning} />{chatDisabledMessage}
        </div>
      </div>

    )}
    </div>
  );
};

export default GroupChatWindow;
