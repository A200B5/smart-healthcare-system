import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { decodeJwt } from "../services/jwtUtils.js";
import AlertModal from "./AlertModal.jsx";

const SessionManager = ({ token, onLogout }) => {
    const navigate = useNavigate();
    const [isOneMinuteModalOpen, setIsOneMinuteModalOpen] = useState(false);
    const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
    
    const timeoutRefs = useRef([]);
    const hasExpiredRef = useRef(false);

    const clearAllTimeouts = () => {
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];
    };

    useEffect(() => {
        clearAllTimeouts();
        setIsOneMinuteModalOpen(false);
        setIsExpiredModalOpen(false);
        hasExpiredRef.current = false;

        if (!token) return;

        const decoded = decodeJwt(token);
        if (!decoded || !decoded.exp) return;

        const expirationTime = decoded.exp * 1000;
        const now = Date.now();
        const timeUntilExpiration = Math.max(0, expirationTime - now);

        if (timeUntilExpiration <= 0) {
            handleExpiration();
            return;
        }

        const fiveMinutes = 5 * 60 * 1000;
        const oneMinute = 60 * 1000;

        // Schedule 5-minute warning
        if (timeUntilExpiration > fiveMinutes) {
            const timeUntil5Min = timeUntilExpiration - fiveMinutes;
            const t5 = setTimeout(() => {
                toast.warn(
                    <div>
                        <strong>Session Expiring</strong><br/>
                        Your session will expire in 5 minutes.<br/>
                        Please save your work.
                    </div>, 
                    { 
                        toastId: "session-5m", 
                        autoClose: 10000,
                        position: "top-right" 
                    }
                );
            }, timeUntil5Min);
            timeoutRefs.current.push(t5);
        }

        // Schedule 1-minute warning
        if (timeUntilExpiration > oneMinute) {
            const timeUntil1Min = timeUntilExpiration - oneMinute;
            const t1 = setTimeout(() => {
                if (!hasExpiredRef.current) {
                    setIsOneMinuteModalOpen(true);
                }
            }, timeUntil1Min);
            timeoutRefs.current.push(t1);
        }

        // Schedule expiration
        const tExp = setTimeout(() => {
            handleExpiration();
        }, timeUntilExpiration);
        timeoutRefs.current.push(tExp);

        const handleSessionExpiredEvent = () => {
            handleExpiration();
        };

        window.addEventListener('session:expired', handleSessionExpiredEvent);

        return () => {
            clearAllTimeouts();
            window.removeEventListener('session:expired', handleSessionExpiredEvent);
        };
    }, [token]);

    const handleExpiration = () => {
        if (hasExpiredRef.current) return; // Prevent duplicate execution
        hasExpiredRef.current = true;
        
        clearAllTimeouts(); // Stop any pending 1-min warnings

        // Replace any existing modal with the expired modal
        setIsOneMinuteModalOpen(false);
        setIsExpiredModalOpen(true);
        
        // Wait exactly 3 seconds before forcing logout
        const expTimeout = setTimeout(() => {
            setIsExpiredModalOpen((prev) => {
                if (prev) {
                    executeLogout();
                    return false;
                }
                return prev;
            });
        }, 3000);
        timeoutRefs.current.push(expTimeout);
    };

    const executeLogout = () => {
        onLogout(); // Clears AuthContext state and localStorage
        navigate("/login");
    };

    const handleLoginAgain = () => {
        setIsExpiredModalOpen(false);
        executeLogout();
    };

    return (
        <>
            <AlertModal
                isOpen={isOneMinuteModalOpen}
                title="Session Expiring"
                message={"Your session will expire in less than one minute.\n\nPlease save your work before your session ends."}
                buttonText="OK"
                onClose={() => setIsOneMinuteModalOpen(false)}
            />
            <AlertModal
                isOpen={isExpiredModalOpen}
                title="Session Expired"
                message={"Your session has expired for security reasons.\n\nYou will be redirected to the login page in 3 seconds."}
                buttonText="Login Again"
                onClose={handleLoginAgain}
            />
        </>
    );
};

export default SessionManager;
