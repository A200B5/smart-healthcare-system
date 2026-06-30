import API from "./axios.js"

const errorHandle = (error, fallbackMessage) => {
	const backendErrors = error?.response?.data?.errors
	const message = Array.isArray(backendErrors) && backendErrors.length > 0
		? backendErrors.join(", ")
		: error?.response?.data?.message || fallbackMessage

	throw new Error(message)
}

export const getCurrentPatient = async () => {
	try {
		const response = await API.get("/auth/me")
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to fetch current user")
	}
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

export const getDoctorReviews = async (doctorId) => {
	try {
		const response = await API.get(`/reviews/doctors/${doctorId}/reviews`)
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to fetch doctor reviews")
	}
}

export const checkReviewStatus = async (doctorId) => {
	try {
		const response = await API.get(`/reviews/check/${doctorId}`)
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to check review status")
	}
}

export const submitReview = async (reviewData) => {
	try {
		const response = await API.post("/reviews", reviewData)
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to submit review")
	}
}

export const getAvailableSlots = async (doctorId, date) => {
	try {
		const response = await API.get(`/availability/doctors/${doctorId}/slots`, {
			params: { date },
		})
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to fetch available slots")
	}
}

export const getDoctorSchedule = async (doctorId) => {
	try {
		const response = await API.get(`/availability/doctors/${doctorId}/schedule`)
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to fetch doctor schedule")
	}
}

export const getMyAppointments = async () => {
	try {
		const response = await API.get("/appointments")
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to fetch appointments")
	}
}

export const bookAppointment = async (appointmentData) => {
	try {
		const response = await API.post("/appointments", appointmentData)
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to book appointment")
	}
}

export const cancelAppointment = async (appointmentId) => {
	try {
		const response = await API.post(`/appointments/cancel`, { appointmentId })
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to cancel appointment")
	}
}

export default {
	getCurrentPatient,
	getDoctors,
	getDoctorById,
	getDoctorReviews,
	checkReviewStatus,
	submitReview,
	getAvailableSlots,
	getDoctorSchedule,
	getMyAppointments,
	bookAppointment,
	cancelAppointment,
}
