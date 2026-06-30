import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import GlobalLoader from "../components/loaders/GlobalLoader.jsx";
import SessionManager from "../components/SessionManager.jsx";
import { isTokenExpired } from "../services/jwtUtils.js";

import {loginUser , registerUser , getCurrentUser , logoutUser} from "../services/authService.js";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    const [user , setUser] = useState( () => {
        const savedUser = localStorage.getItem('user')
        return savedUser ? JSON.parse(savedUser) : null;
    } )

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState(null)

    const saveAuthData = (data) => {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
    }

    const clearAuthData = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
    }

    // CHECK AUTH ON APP START
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token')
            if (!token || isTokenExpired(token)) {
                if (token) clearAuthData(); // Token is expired, clear it
                setLoading(false)
                return;
            }
            try {
                const data = await getCurrentUser()
                if (data && data.user) {
                    if (data.adminDeletedRefunds) {
                        data.user.adminDeletedRefunds = data.adminDeletedRefunds;
                    }
                    setUser(data.user)
                }
            } catch (error) {
                console.error("Authentication Restoration Error:", error)
                // Only clear session if token is explicitly invalid (e.g., 401 Unauthorized)
                if (error.status === 401) {
                    clearAuthData()
                }
            } finally {
                setLoading(false)
            }
        }
        initAuth()

        // Listen for global auth:logout events (e.g. from axios interceptor)
        const handleLogoutEvent = () => {
            clearAuthData();
        };
        window.addEventListener('auth:logout', handleLogoutEvent);

        return () => {
            window.removeEventListener('auth:logout', handleLogoutEvent);
        };
    } , [])

    const login = async (userData) => {
        setError(null)
        try {
            const data = await loginUser(userData)
            
            if (data.user?.role === 'doctor' && (data.user?.verification_status === 'pending' || data.user?.verificationStatus === 'pending')) {
                throw new Error("Your account is currently awaiting administrator approval.");
            }

            if (data.adminDeletedRefunds) {
                data.user.adminDeletedRefunds = data.adminDeletedRefunds;
            }

            saveAuthData(data)
            return data.user
        }catch (error) {
            setError(error.message || "Login Failed");
            throw error;
        }
    }

    // Register
    const register = async (userData) => {
        setError(null)
        try {
            const data = await registerUser(userData)
            if (data.user?.role !== 'doctor') {
                saveAuthData(data)
            }
            return data.user
        }catch (error) {
            setError(
                error.response?.data?.message || "Register Failed"
            )
            throw error;
        }
    }

    // Logout
    const logout = (reason = 'manual') => {
        logoutUser(reason)
        clearAuthData()
        setError(null)
        
        if (reason === 'manual') {
            toast.success("Thanks for using MediCare Pro.\nSee you again soon! 👋");
        }
    }

    // Clean Error
    const clearError = () => {
        setError(null)
    }

    // Use Values
    const value = useMemo( () => (
        {
            user,
            loading,
            error,
            login,
            register,
            logout,
            clearError,
            isAuthenticated: !!user,
            isPatient: user?.role === "patient",
            isDoctor: user?.role === "doctor",
            isAdmin: user?.role === "admin"
        }
    ) , [user , loading , error ] )

    // Loading Screen
    if(loading) {
        return <GlobalLoader />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
            <SessionManager 
                token={localStorage.getItem("token")} 
                onLogout={logout} 
            />
        </AuthContext.Provider>
    )

}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if(!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }
    return context;
}