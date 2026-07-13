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

export const getSpecialties = async () => {
	try {
		const response = await API.get("/doctors/specialties")
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to fetch specialties")
	}
}

export const getDoctorProfile = async () => {
	try {
		const response = await API.get("/doctors/me")
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to fetch doctor profile")
	}
}

export const getDoctorReviews = async (doctorId) => {
	try {
		const response = await API.get(`/reviews/doctors/${doctorId}/reviews`)
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to fetch doctor reviews")
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

export const getMySchedule = async () => {
	try {
		const response = await API.get("/availability/my-schedule")
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to fetch schedule")
	}
}

export const updateSchedule = async (doctorId, scheduleData) => {
	try {
		const response = await API.put(`/availability/doctors/${doctorId}/schedule`, scheduleData)
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to update schedule")
	}
}

export default {
	getDoctors,
	getSpecialties,
	getDoctorProfile,
	getDoctorReviews,
	getDoctorById,
	createDoctor,
	updateDoctor,
	deleteDoctor,
	getMySchedule,
	updateSchedule,
}
