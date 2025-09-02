import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { encryptData, decryptData } from "../../common/utils/encryption";

// Login
export const login = createAsyncThunk("auth/login", async (loginData, { rejectWithValue }) => {
  try {
    const response = await axios.post("https://api.escuelajs.co/api/v1/auth/login", loginData, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    const { access_token, refresh_token } = response.data;

    Cookies.set("access_token", encryptData(access_token), { expires: 7 });
    Cookies.set("refresh_token", encryptData(refresh_token), { expires: 7 });

    return { access_token, refresh_token };
  } catch (err) {
    return rejectWithValue(err.response?.data || { statusCode: 500, message: "Login Failed" });
  }
});

// Register
export const registerUser = createAsyncThunk("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post("https://api.escuelajs.co/api/v1/users/", userData);
    return response.data;
  } catch (err) {
    const messages = err.response?.data?.message;
    if (Array.isArray(messages)) {
      return rejectWithValue(messages.join("\n\n"));
    }
    return rejectWithValue(err.response?.data?.message || "Failed to register user");
  }
});

// Email availability
export const isEmailAvailable = createAsyncThunk("auth/isEmailAvailable", async (email, { rejectWithValue }) => {
  try {
    const response = await axios.post("https://api.escuelajs.co/api/v1/users/is-available", { email });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to check email availability");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userLoading: false,
    accessToken: null,
    refreshToken: null,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.userLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.userLoading = false;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.userLoading = false;
        state.error = action.payload || "Login Failed";
      })

      // register
      .addCase(registerUser.pending, (state) => {
        state.userLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.userLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.userLoading = false;
        state.error = action.payload || "Failed to register new user";
      })

      // email availability
      .addCase(isEmailAvailable.pending, (state) => {
        state.userLoading = true;
        state.error = null;
      })
      .addCase(isEmailAvailable.fulfilled, (state) => {
        state.userLoading = false;
      })
      .addCase(isEmailAvailable.rejected, (state, action) => {
        state.userLoading = false;
        state.error = action.payload || "Failed to check email availability";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
