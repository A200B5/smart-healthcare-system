import API from "./axios.js"

const errorHandle = (error, fallbackMessage) => {
    const backendErrors = error?.response?.data?.errors   // optional chaining operator ?. its check if the property exists before accessing it
    const message = Array.isArray(backendErrors) && backendErrors.length > 0
        ? backendErrors.join(", ")
        : error?.response?.data?.message || fallbackMessage

    const err = new Error(message);
    if (error?.response?.data?.reason) {
        err.reason = error.response.data.reason;
    }
    err.status = error?.response?.status;
    err.originalMessage = error?.response?.data?.message;
    throw err;
}

// Login Function :

export const loginUser = async (userData) => {
    try {
        const response = await API.post(
            "/auth/login",
            userData,
        )
        return response.data;
    } catch (error) {
        errorHandle(error, "Failed Login")
    }
}

// Register Function :

export const registerUser = async (userData) => {
    try {
        const response = await API.post(
            "/auth/register",
            userData,
        )
        return response.data;
    } catch (error) {
        errorHandle(error, "Failed Register")
    }
}

// Get Current User :

export const getCurrentUser = async () => {
    try {
        const response = await API.get("/auth/me");
        return response.data;
    } catch (error) {
        errorHandle(error, "Failed Getting Current User")
    }
}

export const updateProfile = async (userData) => {
    try {
        const response = await API.put("/auth/me", userData);
        return response.data;
    } catch (error) {
        errorHandle(error, "Failed updating profile");
    }
}

// Logout Function :

export const logoutUser = (reason = 'manual') => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason } }))
}