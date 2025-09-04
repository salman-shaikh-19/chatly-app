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
    }
  },
});

export const { addMessage, clearMessages,deleteSelectedMessages, deleteMessage, deleteAllMessages, updateMessage,softDeleteFromAll } = chatSlice.actions;
export default chatSlice.reducer;
// export { getChatId };
