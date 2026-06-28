import axios from "axios"

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error);
    }
)

API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if ( error.response?.status === 401 ) {
            window.dispatchEvent(new Event('session:expired'))
        }
        return Promise.reject(error);
    }
)

export default API;