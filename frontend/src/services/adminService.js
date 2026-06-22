import API from "./axios.js"

const errorHandle = (error, fallbackMessage) => {
	const backendErrors = error?.response?.data?.errors
	const message = Array.isArray(backendErrors) && backendErrors.length > 0
		? backendErrors.join(", ")
		: error?.response?.data?.message || fallbackMessage

	throw new Error(message)
}

export const getAdminStats = async () => {
	try {
		const response = await API.get("/users/stats")
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to fetch admin stats")
	}
}

export const getUsers = async () => {
	try {
		const response = await API.get("/users")
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to fetch users")
	}
}

export const deleteUser = async (userId) => {
	try {
		const response = await API.delete(`/users/${userId}`)
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to delete user")
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

export const getAppointments = async () => {
	try {
		const response = await API.get("/appointments")
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to fetch appointments")
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

export const deleteAppointment = async (appointmentId) => {
	try {
		const response = await API.delete(`/appointments/${appointmentId}`)
		return response.data
	} catch (error) {
		errorHandle(error, "Failed to delete appointment")
	}
}

export default {
	getAdminStats,
	getUsers,
	deleteUser,
	getDoctors,
	getDoctorById,
	createDoctor,
	updateDoctor,
	deleteDoctor,
	getAppointments,
	updateAppointmentStatus,
	deleteAppointment,
}
