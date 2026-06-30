import API from "./axios.js"

const errorHandle = (error, fallbackMessage) => {
	const backendErrors = error?.response?.data?.errors
	const message = Array.isArray(backendErrors) && backendErrors.length > 0
		? backendErrors.join(", ")
		: error?.response?.data?.message || fallbackMessage

	throw new Error(message)
}

export const getAppointments = async () => {
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

export const updateAppointmentStatus = async (appointmentId, status) => {
	try {
		const response = await API.patch(`/appointments/${appointmentId}/status`, {
			status,
		})
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to update appointment status")
	}
}

export const cancelAppointment = async (appointmentId) => {
	try {
		const response = await API.delete(`/appointments/${appointmentId}`)
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to cancel appointment")
	}
}

export const validateAppointment = async (appointmentData) => {
	try {
		const response = await API.post("/appointments/validate", appointmentData)
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to validate appointment")
	}
}

export default {
	getAppointments,
	bookAppointment,
	updateAppointmentStatus,
	cancelAppointment,
	validateAppointment,
}
