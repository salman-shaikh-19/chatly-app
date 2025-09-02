import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/index.css';
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { store, persistor } from "./store/store.js";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
          <ToastContainer  />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
