import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { getChatId } from "../../common/utils/getChatId";
// const getChatId = (user1, user2) => {
//   return [user1, user2].sort().join("_"); // e.g. "1_3"
// };
export const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: {}, // structure will be { userId: [{ senderId, message, timestamp }] }
    groups: {},
    groupMessages: {},
    // unreadMessages: {}
  },
  reducers: {
    addMessage(state, action) {
      const { loggedInUserId, userId, message } = action.payload;

      const chatId = getChatId(loggedInUserId, userId);
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      // console.log('rec:', message.messageId);

      const newMessage = {
        messageId: message.messageId,
        isDeleted: false,
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
      };

      state.messages[chatId].push(newMessage);
    },
    deleteMessage(state, action) {
      const { chatId, messageId } = action.payload;

      if (state.messages[chatId]) {
        // remove msg from the array
        state.messages[chatId] = state.messages[chatId].filter(
          (msg) => msg.messageId !== messageId
        );
      }
    },
    deleteAllMessages(state, action) {
      const { chatId } = action.payload;

      if (state.messages[chatId]) {
        // remove all msgs for this chat
        state.messages[chatId] = [];
      }
    },
    deleteSelectedMessages(state, action) {
      const { chatId, messageIds } = action.payload;
      // console.log(messageIds);

      if (state.messages[chatId]) {
        state.messages[chatId] = state.messages[chatId].filter(
          (msg) => !messageIds.includes(msg.messageId)
        );
      }
    },

    updateMessage: (state, action) => {
      const { chatId, messageId, message, updatedAt, senderId, receiverId } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      const chat = state.messages[chatId];
      const index = chat.findIndex(m => m.messageId === messageId);

      if (index === -1) {
        // if message not found  re-add it (like some sticutuin deleted previously means reciver deleted sender's msg before sender edit , so we added again on reciver side)
        chat.push({
          messageId, message, updatedAt, senderId, receiverId,
          isDeleted: false, timestamp: updatedAt
        });
      } else {
        // if message exist then  simply update it....
        chat[index] = { ...chat[index], message, updatedAt };
      }
    },
    softDeleteFromAll: (state, action) => {
      const { chatId, messageId, ...updates } = action.payload;
      if (!state.messages[chatId]) return;

      state.messages[chatId] = state.messages[chatId].map(msg =>
        msg.messageId === messageId ? { ...msg, ...updates } : msg
      );
    },
    clearMessages(state) {
      state.messages = {}; // reset all msgs of all user
    },

    //group methods
    addGroup(state, action) {
      const { groupId, groupDetails } = action.payload;

      if (!groupId || !groupDetails) return;
      if (!state.groups) state.groups = {};
      if (!state.groupMessages) state.groupMessages = {};

      // Store group details properly
      state.groups[groupId] = {
        groupId,
        groupName: groupDetails.groupName,
        groupAvatar: groupDetails.groupAvatar,
        createdBy: groupDetails.createdBy,
        createdAt: groupDetails.createdAt,
        type:groupDetails.type,
        updatedAt: groupDetails.updatedAt,
        groupUsers: groupDetails.groupUsers
      };

      if (!state.groupMessages[groupId]) state.groupMessages[groupId] = [];
    },

    addGroupMessage(state, action) {
      const { groupId, message } = action.payload;
      if (!groupId || !message) return;
      if (!state.groupMessages) state.groupMessages = {};
      if (!state.groupMessages[groupId]) state.groupMessages[groupId] = [];

      state.groupMessages[groupId].push({
        messageId: message.messageId || uuidv4(),
        isDeleted: false,
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
      });
    },

    updateGroupMessage(state, action) {
      const { groupId, messageId, message, updatedAt, senderId } = action.payload;
      if (!groupId || !messageId) return;
      if (!state.groupMessages) state.groupMessages = {};
      if (!state.groupMessages[groupId]) state.groupMessages[groupId] = [];

      const chat = state.groupMessages[groupId];
      const index = chat.findIndex(m => m.messageId === messageId);

      if (index === -1) {
        chat.push({ messageId, message, updatedAt, senderId, isDeleted: false, timestamp: updatedAt });
      } else {
        chat[index] = { ...chat[index], message, updatedAt };
      }
    },

    deleteGroup(state, action) {
      const { groupId } = action.payload;
      if (!groupId) return;
      if (state.groups) delete state.groups[groupId];
      if (state.groupMessages) delete state.groupMessages[groupId];
    },

    deleteGroupMessage(state, action) {
      const { groupId, messageId } = action.payload;
      if (!groupId || !messageId) return;
      if (!state.groupMessages) state.groupMessages = {};
      if (!state.groupMessages[groupId]) return;

      state.groupMessages[groupId] = state.groupMessages[groupId].filter(
        (msg) => msg.messageId !== messageId
      );
    },

    softDeleteGroupMessage(state, action) {
      const { groupId, messageId, ...updates } = action.payload;
      if (!groupId || !messageId) return;
      if (!state.groupMessages) state.groupMessages = {};
      if (!state.groupMessages[groupId]) return;

      state.groupMessages[groupId] = state.groupMessages[groupId].map(msg =>
        msg.messageId === messageId ? { ...msg, ...updates } : msg
      );
    },

    deleteAllGroupMessages(state, action) {
      const { groupId } = action.payload;
      if (!groupId) return;
      if (!state.groupMessages) state.groupMessages = {};
      if (state.groupMessages[groupId]) {
        state.groupMessages[groupId] = [];
      }
    },
    // remove user from group
    removeUserFromGroup(state, action) {
      const { groupId, userId } = action.payload;
      if (!state.groups[groupId]) return;

      // remove user from groupUsers
      state.groups[groupId].groupUsers = 
        state.groups[groupId].groupUsers.filter(u => u.userId !== userId);

      // update the group updatedAt timestamp
      if (state.groups[groupId]) {
        state.groups[groupId].updatedAt = new Date().toISOString();
      }
    },

    //leave group
    leaveGroup(state, action) {
      const { groupId, userId, isAdmin = false } = action.payload;
      if (!state.groups[groupId]) return;

      // remove user from groupUsers
      state.groups[groupId].groupUsers = 
        state.groups[groupId].groupUsers.filter(u => u.userId !== userId);

      // if the user is an admin and there are other users, assign a new admin
      if (isAdmin && state.groups[groupId].groupUsers.length > 0) {
        // Find the first non-admin user to make admin
        const newAdmin = state.groups[groupId].groupUsers[0];
        if (newAdmin) {
          const userIndex = state.groups[groupId].groupUsers.findIndex(u => u.userId === newAdmin.userId);
          if (userIndex !== -1) {
            state.groups[groupId].groupUsers[userIndex].isAdmin = true;
          }
        }
      }

      // Update the group's updatedAt timestamp
      state.groups[groupId].updatedAt = new Date().toISOString();
    },
  },

});


export const { 
  addMessage, 
  clearMessages, 
  deleteSelectedMessages, 
  deleteMessage, 
  addGroup, 
  addGroupMessage, 
  updateGroupMessage, 
  softDeleteGroupMessage, 
  deleteGroupMessage, 
  deleteAllGroupMessages, 
  deleteGroup, 
  deleteAllMessages, 
  updateMessage, 
  softDeleteFromAll,
  leaveGroup,
  removeUserFromGroup 
} = chatSlice.actions;
export default chatSlice.reducer;
// export { getChatId };
