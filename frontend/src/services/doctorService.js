import API from "./axios.js"

const errorHandle = (error, fallbackMessage) => {
    const backendErrors = error?.response?.data?.errors
    const message = Array.isArray(backendErrors) && backendErrors.length > 0
        ? backendErrors.join(", ")
        : error?.response?.data?.message || fallbackMessage

    throw new Error(message)
}

export const getDoctors = async () => {
    try {
        const response = await API.get("/doctors")
        return response.data
    } catch (error) {
        errorHandle(error, "Failed to fetch doctors")
    }
}

export const getDoctorById = async (doctorId) => {
    try {
        const response = await API.get(`/doctors/${doctorId}`)
        return response.data
    } catch (error) {
        errorHandle(error, "Failed to fetch doctor")
    }
}

export const createDoctor = async (doctorData) => {
    try {
        const response = await API.post("/doctors", doctorData)
        return response.data
    } catch (error) {
        errorHandle(error, "Failed to create doctor")
    }
}

export const updateDoctor = async (doctorId, doctorData) => {
    try {
        const response = await API.put(`/doctors/${doctorId}`, doctorData)
        return response.data
    } catch (error) {
        errorHandle(error, "Failed to update doctor")
    }
}

export const deleteDoctor = async (doctorId) => {
    try {
        const response = await API.delete(`/doctors/${doctorId}`)
        return response.data
    } catch (error) {
        errorHandle(error, "Failed to delete doctor")
    }
}

export default {
    getDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
}