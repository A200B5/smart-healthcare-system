import React, { useState, useEffect } from "react";
import TableSkeleton from "../../components/loaders/TableSkeleton.jsx";
import DoctorNavbar from "../../components/DoctorNavbar.jsx";
import { getMySchedule, updateSchedule } from "../../services/doctorService.js";

const DAYS_OF_WEEK = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 7, name: "Sunday" },
];

function DoctorAvailability() {
  const [doctorId, setDoctorId] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingDay, setSavingDay] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMySchedule();
      if (data && data.success) {
        setDoctorId(data.doctorId);
        
        // Map existing schedule or create default structure
        const mappedSchedule = DAYS_OF_WEEK.map((day) => {
          const existing = data.schedule?.find((s) => s.dayOfWeek === day.id);
          return existing ? {
            ...day,
            startTime: existing.startTime.slice(0, 5), // Format HH:mm
            endTime: existing.endTime.slice(0, 5),
            isAvailable: existing.isAvailable,
            slotDuration: existing.slotDuration,
          } : {
            ...day,
            startTime: "09:00",
            endTime: "17:00",
            isAvailable: false,
            slotDuration: 30,
          };
        });
        
        setSchedule(mappedSchedule);
      }
    } catch (err) {
      setError("Failed to load your schedule.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDay = async (dayId) => {
    if (!doctorId) return;
    const dayData = schedule.find(d => d.id === dayId);
    
    try {
      setSavingDay(dayId);
      setSuccessMsg("");
      setError("");
      
      await updateSchedule(doctorId, {
        dayOfWeek: dayData.id,
        startTime: dayData.startTime,
        endTime: dayData.endTime,
        isAvailable: dayData.isAvailable,
        slotDuration: dayData.slotDuration,
      });
      
      setSuccessMsg(`Successfully updated schedule for ${dayData.name}`);
    } catch (err) {
      setError(`Failed to update ${dayData.name}: ${err.message}`);
    } finally {
      setSavingDay(null);
    }
  };

  const handleChange = (dayId, field, value) => {
    setSchedule(prev => prev.map(day => 
      day.id === dayId ? { ...day, [field]: value } : day
    ));
    setSuccessMsg("");
  };

  if (loading) {
    return (
      <>
        <DoctorNavbar />
        <div className="page">
          <div className="page-content">
            <TableSkeleton rows={7} columns={4} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DoctorNavbar />
      <div className="page" id="page-doctor-schedule">
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">My Weekly Schedule</h1>
              <p className="page-subtitle">Define your working hours and slot durations per day</p>
            </div>
          </div>

          <div className="auth-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
            
            {error && (
              <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
                ⚠️ {error}
              </div>
            )}
            
            {successMsg && (
              <div style={{ background: "#DCFCE7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
                ✅ {successMsg}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {schedule.map((day) => (
                <div key={day.id} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                  padding: "16px",
                  background: "var(--bg-secondary, #f8fafc)",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  borderRadius: "8px",
                  opacity: day.isAvailable ? 1 : 0.7
                }}>
                  <div style={{ minWidth: "120px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <input 
                      type="checkbox"
                      checked={day.isAvailable}
                      onChange={(e) => handleChange(day.id, "isAvailable", e.target.checked)}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      id={`day-${day.id}`}
                    />
                    <label htmlFor={`day-${day.id}`} style={{ fontWeight: 600, fontSize: "16px", cursor: "pointer", color: day.isAvailable ? "var(--text-primary)" : "var(--text-secondary)" }}>
                      {day.name}
                    </label>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "300px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input 
                        type="time" 
                        className="form-input" 
                        value={day.startTime}
                        onChange={(e) => handleChange(day.id, "startTime", e.target.value)}
                        disabled={!day.isAvailable}
                        style={{ padding: "8px", width: "120px" }}
                      />
                      <span style={{ color: "var(--text-secondary)" }}>to</span>
                      <input 
                        type="time" 
                        className="form-input" 
                        value={day.endTime}
                        onChange={(e) => handleChange(day.id, "endTime", e.target.value)}
                        disabled={!day.isAvailable}
                        style={{ padding: "8px", width: "120px" }}
                      />
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Slot:</span>
                      <select 
                        className="form-input" 
                        value={day.slotDuration}
                        onChange={(e) => handleChange(day.id, "slotDuration", Number(e.target.value))}
                        disabled={!day.isAvailable}
                        style={{ padding: "8px" }}
                      >
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                      </select>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleUpdateDay(day.id)}
                    disabled={savingDay === day.id}
                    style={{ padding: "8px 16px" }}
                  >
                    {savingDay === day.id ? "Saving..." : "Save"}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "24px", padding: "16px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "8px", color: "#1e3a8a", fontSize: "14px" }}>
              <strong>ℹ️ Note:</strong> If you uncheck a day, you will not accept any appointments for that day, regardless of the hours specified. Make sure to click "Save" after modifying each day.
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}

export default DoctorAvailability;
