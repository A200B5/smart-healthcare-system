import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {ThemeProvider} from "./context/ThemeContext.jsx";
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext.jsx";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <AuthProvider>
            <ThemeProvider>
                <App />
                <ToastContainer 
                    autoClose={3000} 
                    pauseOnHover={true} 
                    closeOnClick={true}
                    position="top-right"
                    hideProgressBar={true}
                />
            </ThemeProvider>
        </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
