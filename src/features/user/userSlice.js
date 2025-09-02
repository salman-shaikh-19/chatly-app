import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("https://api.escuelajs.co/api/v1/users");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    userListLoading: false,
    onlineUsers: [],
    error: null,
  },
  reducers: {

     setOnlineUsers(state, action) {
      // console.log('i m called in  user');
      
      state.onlineUsers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.userListLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.userListLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.userListLoading = false;
        state.error = action.payload;
      });
  },
});
export const { setOnlineUsers} = userSlice.actions;
export default userSlice.reducer;
