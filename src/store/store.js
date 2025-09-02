import { combineReducers, configureStore } from '@reduxjs/toolkit'

import commonReducer from '../common/commonSlice'
import userReducer from '../features/user/userSlice'
import authReducer from '../features/auth/authSlice'
import chatReducer from '../features/chat/chatSlice'

import { persistReducer, persistStore } from "redux-persist";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

//combining all reducers to single combined reducer
const rootReducer = combineReducers({
  common: commonReducer,
  user:userReducer,
  auth:authReducer,
  chat: chatReducer,
});

const persistConfig = {
  key: 'root', // The key for the persisted state in storage
  storage,     // The storage mechanism (e.g., localStorage, AsyncStorage)
  whitelist: ['common','chat'], // Optional: only persist specific slices
  // blacklist: ['anotherSlice'], // Optional: don't persist specific slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  // middlware to fix serializable check errors for redux-persist
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
export const persistor = persistStore(store);
export default store;