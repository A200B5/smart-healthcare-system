import {createContext , useContext ,useState , useMemo , useEffect} from "react";

import {loginUser , registerUser , getCurrentUser , logoutUser} from "../services/authServices.js";

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
            if (!token) {
                setLoading(false)
                return;
            }
            try {
                const data = await getCurrentUser()
                setUser(data.user)
            }catch (error) {
                console.error("Authentication Error", error)
                clearAuthData()
            }finally {
                setLoading(false)
            }
        }
        initAuth()
    } , [])

    // Login
    const login = async (userData) => {
        setError(null)
        try {
            const data = await loginUser(userData)
            saveAuthData(data)
            return data.user
        }catch (error) {
            setError(
                error.response?.data?.message || "Login Failed"
            )
            throw error;
        }
    }

    // Register
    const register = async (userData) => {
        setError(null)
        try {
            const data = await registerUser(userData)
            saveAuthData(data)
            return data.user
        }catch (error) {
            setError(
                error.response?.data?.message || "Register Failed"
            )
            throw error;
        }
    }

    // Logout
    const logout = () => {
        logoutUser()
        clearAuthData()
        setError(null)
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
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
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