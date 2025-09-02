import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { decryptData, encryptData } from "../common/utils/encryption";

// fetch logged-in user
export const fetchLoggedInUser = createAsyncThunk(
  "common/fetchLoggedInUser",
  async (_, { rejectWithValue }) => {
    try {
      const encryptedToken = Cookies.get("access_token");
      if (!encryptedToken) return rejectWithValue("No access token found");

      const accessToken = decryptData(encryptedToken);

      const response = await axios.get(
        "https://api.escuelajs.co/api/v1/auth/profile",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      return response.data;
    } catch (err) {
      if (err.response?.status === 401) {
        const refreshToken = Cookies.get("refresh_token");
        if (!refreshToken) return rejectWithValue("Please log in again.");

        try {
          const refreshResponse = await axios.post(
            "https://api.escuelajs.co/api/v1/auth/refresh-token",
            { refreshToken }
          );
          const newAccessToken = refreshResponse.data.access_token;
          Cookies.set("access_token", encryptData(newAccessToken), { expires: 7 });

          const retryResponse = await axios.get(
            "https://api.escuelajs.co/api/v1/auth/profile",
            { headers: { Authorization: `Bearer ${newAccessToken}` } }
          );

          return retryResponse.data;
        } catch {
          return rejectWithValue("Failed to refresh token.");
        }
      }
      return rejectWithValue("Failed to fetch user profile");
    }
  }
);

export const commonSlice = createSlice({
  name: "common",
  initialState: {
    theme: "light",
    isUserLoggedIn: false,
    loggedInUserData: null,  
    selectedChatUser:null,
    // onlineUsers: [],
    isTyping: {},
    loading: false,
    error: null,
  },
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
    },
    setIsUserLoggedIn(state, action) {
      state.isUserLoggedIn = action.payload;
    },
    // setOnlineUsers(state, action) {
    //   state.onlineUsers = action.payload;
    // },
    setSelectedChatUser(state,action){
      state.selectedChatUser=action.payload;
    },
    setTyping(state, action) {
      // console.log(userId);
      
      const { userId, typing } = action.payload;
      // ensure isTyping object exists
        if (!state.isTyping) {
          state.isTyping = {};
        }

        if (!typing) {
          delete state.isTyping[userId];
        } else {
          state.isTyping[userId] = true;
        }
    },
    setLoggedInUserDataToNull(state){
        state.loggedInUserData=null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoggedInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoggedInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.loggedInUserData = action.payload;
        state.isUserLoggedIn = true;
      })
      .addCase(fetchLoggedInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.loggedInUserData = null;
        state.isUserLoggedIn = false;
      });
  },
});

export const { setTheme,  setIsUserLoggedIn,setSelectedChatUser,setTyping,setLoggedInUserDataToNull} = commonSlice.actions;
export default commonSlice.reducer;
