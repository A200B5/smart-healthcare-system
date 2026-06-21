import API from "./axios.js"

// Error Handling :

const errorHandle = (error , fallbackMessage) => {
      const message = error?.response?.data?.message || fallbackMessage;
      throw new Error(message);
}

// Login Function :

export const loginUser = async (userData) => {
    try{
        const response = await API.post(
            "/auth/login",
                 userData,
        )
        return response.data;
    }catch (error) {
        errorHandle(error , "Failed Login")
    }
}

// Register Function :

export const registerUser = async (userData) => {
    try{
        const response = await API.post(
            "/auth/register",
                 userData,
        )
        return response.data;
    }catch (error) {
        errorHandle(error , "Failed Register")
    }
}

// Get Current User :

export const getCurrentUser = async () => {
    try {
        const response = await API.get("/auth/me");
        return response.data;
    }catch (error) {
        errorHandle(error , "Failed Getting Current User")
    }
}

// Logout Function :

export const logoutUser =  () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
}