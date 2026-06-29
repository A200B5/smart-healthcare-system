import { useState, useEffect } from "react";
import TableSkeleton from "../../components/loaders/TableSkeleton.jsx";
import DoctorNavbar from "../../components/DoctorNavbar.jsx";
import { getMySchedule, updateSchedule } from "../../services/doctorService.js";
import { toast } from "react-toastify";
import SaveButton from "../../components/SaveButton.jsx";
import { hasDataChanged } from "../../services/formUtils.js";
import "./doctor.css";

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
  const [savingAll, setSavingAll] = useState(false);

  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigationFn, setPendingNavigationFn] = useState(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  useEffect(() => {
    // Determine if dirty
    const dirty = hasDataChanged(schedule, originalSchedule);
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
      toast.error("Failed to load your schedule.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async (proceedFn = null) => {
    if (!doctorId) return;
    try {
      setSavingAll(true);
      
      let hasError = false;

      const modifiedDays = schedule.filter((day, index) => 
        hasDataChanged(day, originalSchedule[index])
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
          toast.error(`Failed to update ${dayData.name}: ${err.message}`);
        }
      }
      
      if (!hasError) {
        toast.success("Weekly schedule updated successfully.");
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
      toast.error(`Failed to save changes: ${err.message}`);
      setShowUnsavedModal(false);
    } finally {
      setSavingAll(false);
    }
  };

  const handleChange = (dayId, field, value) => {
    setSchedule(prev => prev.map(day => 
      day.id === dayId ? { ...day, [field]: value } : day
    ));
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

          <div className="auth-card doctor-availability-card">

            <div className="doctor-availability-grid">
              {schedule.map((day) => (
                <div key={day.id} className="doctor-availability-day" style={{ opacity: day.isAvailable ? 1 : 0.7 }}>
                  <div className="doctor-availability-checkbox-wrap">
                    <input 
                      type="checkbox"
                      checked={day.isAvailable}
                      onChange={(e) => handleChange(day.id, "isAvailable", e.target.checked)}
                      className="doctor-availability-checkbox"
                      id={`day-${day.id}`}
                    />
                    <label htmlFor={`day-${day.id}`} className="doctor-availability-label" style={{ color: day.isAvailable ? "var(--text-primary)" : "var(--text-secondary)" }}>
                      {day.name}
                    </label>
                  </div>
                  
                  <div className="doctor-availability-controls">
                    <div className="doctor-availability-time-wrap">
                      <input 
                        type="time" 
                        className="form-input doctor-availability-time-input" 
                        value={day.startTime}
                        onChange={(e) => handleChange(day.id, "startTime", e.target.value)}
                        disabled={!day.isAvailable}
                      />
                      <span className="doctor-availability-time-separator">to</span>
                      <input 
                        type="time" 
                        className="form-input doctor-availability-time-input" 
                        value={day.endTime}
                        onChange={(e) => handleChange(day.id, "endTime", e.target.value)}
                        disabled={!day.isAvailable}
                      />
                    </div>
                    
                    <div className="doctor-availability-slot-wrap">
                      <span className="doctor-availability-slot-label">Slot:</span>
                      <select 
                        className="form-input doctor-availability-slot-input" 
                        value={day.slotDuration}
                        onChange={(e) => handleChange(day.id, "slotDuration", Number(e.target.value))}
                        disabled={!day.isAvailable}
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

            <div className="doctor-availability-save-wrap">
                <SaveButton
                    onClick={() => handleSaveChanges(null)}
                    isDirty={isDirty}
                    isSaving={savingAll}
                    className="btn btn-primary doctor-availability-save-btn"
                />
            </div>

            <div className="doctor-availability-note">
              <strong>ℹ️ Note:</strong> Changes are not saved automatically. Click <strong>Save Changes</strong> after editing your weekly schedule. Unchecking a day means you will not accept any appointments for that day.
            </div>
            
          </div>
        </div>
      </div>

      {showUnsavedModal && (
        <div
            className="modal-overlay doctor-availability-modal-overlay"
        >
            <div
                className="modal-content doctor-availability-modal-content"
            >
                <div className="doctor-availability-modal-header">
                    <h2 className="doctor-availability-modal-title">
                        Unsaved Changes
                    </h2>
                </div>
                <div className="doctor-availability-modal-body">
                    You have unsaved changes to your weekly schedule. Would you like to save them before leaving?
                </div>
                <div className="modal-actions doctor-availability-modal-actions">
                    <button 
                        className="btn btn-outline doctor-availability-btn-cancel" 
                        onClick={() => setShowUnsavedModal(false)}
                        disabled={savingAll}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn doctor-availability-btn-leave"
                        onClick={handleLeaveWithoutSaving}
                        disabled={savingAll}
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

