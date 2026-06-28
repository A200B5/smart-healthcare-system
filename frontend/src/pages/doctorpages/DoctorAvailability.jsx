import { useState, useEffect } from "react";
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
  const [originalSchedule, setOriginalSchedule] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingAll, setSavingAll] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigationFn, setPendingNavigationFn] = useState(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  useEffect(() => {
    // Determine if dirty
    const dirty = JSON.stringify(schedule) !== JSON.stringify(originalSchedule);
    setIsDirty(dirty);

    if (dirty) {
      window.onNavigateBlocker = (path, proceedFn) => {
        setPendingNavigationFn(() => proceedFn);
        setShowUnsavedModal(true);
      };
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.onNavigateBlocker = null;
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    } else {
      window.onNavigateBlocker = null;
    }
  }, [schedule, originalSchedule]);

  // Clean up global blocker when component unmounts
  useEffect(() => {
    return () => {
      window.onNavigateBlocker = null;
    };
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
        setOriginalSchedule(JSON.parse(JSON.stringify(mappedSchedule)));
      }
    } catch (err) {
      setError("Failed to load your schedule.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async (proceedFn = null) => {
    if (!doctorId) return;
    try {
      setSavingAll(true);
      setSuccessMsg("");
      setError("");
      
      let hasError = false;

      // Find modified days
      const modifiedDays = schedule.filter((day, index) => 
        JSON.stringify(day) !== JSON.stringify(originalSchedule[index])
      );

      for (const dayData of modifiedDays) {
        try {
          await updateSchedule(doctorId, {
            dayOfWeek: dayData.id,
            startTime: dayData.startTime,
            endTime: dayData.endTime,
            isAvailable: dayData.isAvailable,
            slotDuration: dayData.slotDuration,
          });
        } catch (err) {
          console.error(err);
          hasError = true;
          setError(`Failed to update ${dayData.name}: ${err.message}`);
        }
      }
      
      if (!hasError) {
        setSuccessMsg("Successfully updated weekly schedule.");
        const newOriginal = JSON.parse(JSON.stringify(schedule));
        setOriginalSchedule(newOriginal);
        // We explicitly calculate isDirty to false here immediately
        // so it doesn't wait for next render if we proceed
        setIsDirty(false);
        window.onNavigateBlocker = null;

        if (proceedFn && typeof proceedFn === 'function') {
            proceedFn();
        } else {
            setShowUnsavedModal(false);
        }
      } else {
          setShowUnsavedModal(false);
      }
    } catch (err) {
      setError(`Failed to save changes: ${err.message}`);
      setShowUnsavedModal(false);
    } finally {
      setSavingAll(false);
    }
  };

  const handleChange = (dayId, field, value) => {
    setSchedule(prev => prev.map(day => 
      day.id === dayId ? { ...day, [field]: value } : day
    ));
    setSuccessMsg("");
  };

  const handleLeaveWithoutSaving = () => {
    setShowUnsavedModal(false);
    setSchedule(JSON.parse(JSON.stringify(originalSchedule)));
    setIsDirty(false);
    window.onNavigateBlocker = null;
    if (pendingNavigationFn) {
        pendingNavigationFn();
    }
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

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px", alignItems: "center" }}>
              {schedule.map((day) => (
                <div key={day.id} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "24px",
                  padding: "16px 24px",
                  background: "var(--bg-secondary, #f8fafc)",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  borderRadius: "8px",
                  opacity: day.isAvailable ? 1 : 0.7,
                  width: "100%",
                  maxWidth: "750px"
                }}>
                  <div style={{ width: "140px", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
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
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input 
                        type="time" 
                        className="form-input" 
                        value={day.startTime}
                        onChange={(e) => handleChange(day.id, "startTime", e.target.value)}
                        disabled={!day.isAvailable}
                        style={{ padding: "8px 12px", width: "150px" }}
                      />
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500, minWidth: "16px", textAlign: "center" }}>to</span>
                      <input 
                        type="time" 
                        className="form-input" 
                        value={day.endTime}
                        onChange={(e) => handleChange(day.id, "endTime", e.target.value)}
                        disabled={!day.isAvailable}
                        style={{ padding: "8px 12px", width: "150px" }}
                      />
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "130px" }}>
                      <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>Slot:</span>
                      <select 
                        className="form-input" 
                        value={day.slotDuration}
                        onChange={(e) => handleChange(day.id, "slotDuration", Number(e.target.value))}
                        disabled={!day.isAvailable}
                        style={{ padding: "8px", flex: 1 }}
                      >
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <button
                    className="btn btn-primary"
                    onClick={() => handleSaveChanges(null)}
                    disabled={!isDirty || savingAll}
                    style={{ padding: "12px 32px", fontSize: "16px" }}
                >
                    {savingAll ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div style={{ padding: "16px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "8px", color: "#1e3a8a", fontSize: "14px" }}>
              <strong>ℹ️ Note:</strong> Changes are not saved automatically. Click <strong>Save Changes</strong> after editing your weekly schedule. Unchecking a day means you will not accept any appointments for that day.
            </div>
            
          </div>
        </div>
      </div>

      {showUnsavedModal && (
        <div
            className="modal-overlay"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "20px",
            }}
        >
            <div
                className="modal-content"
                style={{
                    background: "var(--bg-primary, #ffffff)",
                    borderRadius: "16px",
                    padding: "24px",
                    maxWidth: "600px",
                    width: "100%",
                    boxShadow: "var(--shadow-lg, 0 20px 60px rgba(0, 0, 0, 0.3))",
                }}
            >
                <div style={{ marginBottom: "16px" }}>
                    <h2 style={{ margin: 0, fontSize: "20px", color: "var(--text-primary)" }}>
                        Unsaved Changes
                    </h2>
                </div>
                <div style={{ marginBottom: "32px", color: "var(--text-secondary)", fontSize: "15px", lineHeight: "1.5" }}>
                    You have unsaved changes to your weekly schedule. Would you like to save them before leaving?
                </div>
                <div className="modal-actions" style={{ marginBottom: 0 }}>
                    <button 
                        className="btn btn-outline" 
                        onClick={() => setShowUnsavedModal(false)}
                        disabled={savingAll}
                        style={{ minWidth: "100px" }}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn"
                        onClick={handleLeaveWithoutSaving}
                        disabled={savingAll}
                        style={{
                            background: "transparent",
                            color: "var(--rejected, #ef4444)",
                            border: "1px solid var(--rejected, #ef4444)"
                        }}
                    >
                        Leave Without Saving
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleSaveChanges(pendingNavigationFn)}
                        disabled={savingAll}
                    >
                        {savingAll ? "Saving..." : "Save & Leave"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}

export default DoctorAvailability;

