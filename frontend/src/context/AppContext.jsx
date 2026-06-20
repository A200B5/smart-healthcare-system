// frontend/src/context/AppContext.jsx
// Global data store for doctors and appointments.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doctorsAPI, appointmentsAPI } from '../services/api';

const AppContext = createContext(null);

// Converts raw API doctor object to the Doctor format.
// schedule comes as a comma-separated string from the DB: 'Mon,Wed,Fri'
const normalizeDoctor = (d) => ({
  ...d,
  id: String(d.id),
  available: Boolean(d.available),
  schedule: typeof d.schedule === 'string'
    ? d.schedule.split(',').map((s) => s.trim()).filter(Boolean)
    : d.schedule || [],
});

// Converts raw API appointment object to the Appointment format.
const normalizeAppointment = (a) => ({
  id: String(a.id),
  doctorId: String(a.doctorId),
  doctorName: a.doctorName,
  specialty: a.specialty,
  avatar: a.avatar,
  patientId: String(a.patientId),
  patientName: a.patientName,
  date: a.date,
  time: a.time,
  status: a.status,
  notes: a.notes,
  createdAt: a.createdAt,
});

export const AppProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    try {
      const data = await doctorsAPI.getAll();
      setDoctors((data.doctors || []).map(normalizeDoctor));
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    if (!localStorage.getItem('depi_token')) return;
    setLoadingAppointments(true);
    try {
      const data = await appointmentsAPI.getAll();
      setAppointments((data.appointments || []).map(normalizeAppointment));
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  // Doctors are public – fetch on mount
  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const addAppointment = async (doctorId, date, time, notes) => {
    try {
      await appointmentsAPI.book(doctorId, date, time, notes);
      await fetchAppointments();
      return true;
    } catch (err) {
      console.error('Book appointment error:', err);
      return false;
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await appointmentsAPI.updateStatus(id, status);
      // Optimistically update local state without refetching
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status } : a))
      );
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  return (
    <AppContext.Provider value={{
      doctors, appointments,
      loadingDoctors, loadingAppointments,
      fetchDoctors, fetchAppointments,
      addAppointment, updateAppointmentStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};
