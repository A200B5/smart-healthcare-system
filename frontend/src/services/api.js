// frontend/src/services/api.js
// Centralized API service layer.
// All HTTP calls go through here so the rest of the app stays clean.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Attach Authorization header when a token is stored
const getHeaders = () => {
  const token = localStorage.getItem('depi_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Throws on non-2xx responses with the server's error message
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  register: (name, email, password, role) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password, role }),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse),
};

// ── Doctors ───────────────────────────────────────────────────
export const doctorsAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/doctors`, { headers: getHeaders() }).then(handleResponse),

  getById: (id) =>
    fetch(`${BASE_URL}/doctors/${id}`, { headers: getHeaders() }).then(handleResponse),

  create: (data) =>
    fetch(`${BASE_URL}/doctors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`${BASE_URL}/doctors/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${BASE_URL}/doctors/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),
};

// ── Appointments ──────────────────────────────────────────────
export const appointmentsAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/appointments`, { headers: getHeaders() }).then(handleResponse),

  book: (doctorId, date, time, notes) =>
    fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ doctorId, date, time, notes }),
    }).then(handleResponse),

  updateStatus: (id, status) =>
    fetch(`${BASE_URL}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  cancel: (id) =>
    fetch(`${BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),
};

// ── Users (Admin) ─────────────────────────────────────────────
export const usersAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/users`, { headers: getHeaders() }).then(handleResponse),

  getStats: () =>
    fetch(`${BASE_URL}/users/stats`, { headers: getHeaders() }).then(handleResponse),

  delete: (id) =>
    fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),
};

// ── Availability ──────────────────────────────────────────────
export const availabilityAPI = {
  // Get available time slots for a doctor on a specific date (public)
  getAvailableSlots: (doctorId, date) =>
    fetch(`${BASE_URL}/availability/doctors/${doctorId}/slots?date=${date}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Get doctor's full weekly schedule (public)
  getDoctorSchedule: (doctorId) =>
    fetch(`${BASE_URL}/availability/doctors/${doctorId}/schedule`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Get authenticated doctor's own schedule (doctor only)
  getMySchedule: () =>
    fetch(`${BASE_URL}/availability/my-schedule`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Update doctor's availability for a specific day (doctor only)
  updateSchedule: (doctorId, dayOfWeek, startTime, endTime, isAvailable, slotDuration) =>
    fetch(`${BASE_URL}/availability/doctors/${doctorId}/schedule`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        dayOfWeek,
        startTime,
        endTime,
        isAvailable,
        slotDuration: slotDuration || 30,
      }),
    }).then(handleResponse),
};

// ── Reviews ────────────────────────────────────────────────────
export const reviewsAPI = {
  // Add a review for a doctor (patient only)
  addReview: (doctorId, rating, comment) =>
    fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ doctorId, rating, comment }),
    }).then(handleResponse),

  // Get all reviews for a doctor (public)
  getDoctorReviews: (doctorId) =>
    fetch(`${BASE_URL}/reviews/doctors/${doctorId}/reviews`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Check if current patient has already reviewed a doctor (patient only)
  checkIfReviewed: (doctorId) =>
    fetch(`${BASE_URL}/reviews/check/${doctorId}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Delete a review (admin or the patient who wrote it)
  deleteReview: (reviewId) =>
    fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),
};
