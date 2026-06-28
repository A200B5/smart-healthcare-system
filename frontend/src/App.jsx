import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// Eagerly Loaded Critical Path Pages & Components
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import SignupRole from "./pages/signuppages/SignupRole.jsx";
import SignupPatient from "./pages/signuppages/SignupPatient.jsx";
import SignupDoctor from "./pages/signuppages/SignupDoctor.jsx";
import NotFound from "./pages/notmatchpage/NotFound.jsx";

import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AlreadyAuthenticated from "./components/AlreadyAuthenticated.jsx";

// Fallbacks
import GlobalLoader from "./components/loaders/GlobalLoader.jsx";
import DashboardSkeleton from "./components/loaders/DashboardSkeleton.jsx";
import ProfileSkeleton from "./components/loaders/ProfileSkeleton.jsx";
import TableSkeleton from "./components/loaders/TableSkeleton.jsx";
import CardSkeleton from "./components/loaders/CardSkeleton.jsx";

import PageTransition from "./components/PageTransition.jsx";

// Lazy Loaded Pages
const DoctorDashboard = lazy(() => import("./pages/doctorpages/DoctorDashboard.jsx"));
const PatientHome = lazy(() => import("./pages/pateintpages/PatientHome.jsx"));
const PatientFindDoctor = lazy(() => import("./pages/pateintpages/PatientFindDoctor.jsx"));
const PatientAppointments = lazy(() => import("./pages/pateintpages/PatientAppointments.jsx"));
const BookAppointment = lazy(() => import("./pages/pateintpages/BookAppointment.jsx"));
const PatientProfile = lazy(() => import("./pages/pateintpages/PatientProfile.jsx"));
const DoctorProfile = lazy(() => import("./pages/doctorpages/DoctorProfile.jsx"));
const DoctorAvailability = lazy(() => import("./pages/doctorpages/DoctorAvailability.jsx"));
const AdminDashboard = lazy(() => import("./pages/adminpages/AdminDashboard.jsx"));
const AdminManageDoctor = lazy(() => import("./pages/adminpages/AdminManageDoctor.jsx"));
const AdminManageUser = lazy(() => import("./pages/adminpages/AdminManageUser.jsx"));
const AdminManageAppiontment = lazy(() => import("./pages/adminpages/AdminManageAppiontment.jsx"));
const AdminDoctorDetails = lazy(() => import("./pages/adminpages/AdminDoctorDetails.jsx"));

function App() {

    return (
        <>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/login" element={<AlreadyAuthenticated><PageTransition><Login /></PageTransition></AlreadyAuthenticated>} />
                <Route path="/signuprole" element={<AlreadyAuthenticated><PageTransition><SignupRole /></PageTransition></AlreadyAuthenticated>} />
                <Route path="/signup/patient" element={<AlreadyAuthenticated><PageTransition><SignupPatient /></PageTransition></AlreadyAuthenticated>} />
                <Route path="/signup/doctor" element={<AlreadyAuthenticated><PageTransition><SignupDoctor /></PageTransition></AlreadyAuthenticated>} />


                {/* Patient Routes */}
                <Route path="/patient/home" element={<RoleProtectedRoute allowedRoles={["patient"]}><Suspense fallback={<DashboardSkeleton />}><PageTransition><PatientHome /></PageTransition></Suspense></RoleProtectedRoute>} />
                <Route path="/patient/profile" element={<RoleProtectedRoute allowedRoles={["patient"]}><Suspense fallback={<ProfileSkeleton />}><PageTransition><PatientProfile /></PageTransition></Suspense></RoleProtectedRoute>} />
                <Route path="/patient/finddoctor" element={<RoleProtectedRoute allowedRoles={["patient"]}><Suspense fallback={<CardSkeleton />}><PageTransition><PatientFindDoctor /></PageTransition></Suspense></RoleProtectedRoute>} />
                <Route path="/patient/appointment" element={<RoleProtectedRoute allowedRoles={["patient"]}><Suspense fallback={<CardSkeleton />}><PageTransition><PatientAppointments /></PageTransition></Suspense></RoleProtectedRoute>} />
                <Route path="/patient/bookappointment/:doctorId" element={<RoleProtectedRoute allowedRoles={["patient"]}><Suspense fallback={<ProfileSkeleton />}><PageTransition><BookAppointment /></PageTransition></Suspense></RoleProtectedRoute>} />

                {/* Doctor Routes */}
                <Route path="/doctor" element={<RoleProtectedRoute allowedRoles={["doctor"]}><Suspense fallback={<DashboardSkeleton />}><PageTransition><DoctorDashboard /></PageTransition></Suspense></RoleProtectedRoute>} />
                <Route path="/doctor/dashboard" element={<RoleProtectedRoute allowedRoles={["doctor"]}><Suspense fallback={<DashboardSkeleton />}><PageTransition><DoctorDashboard /></PageTransition></Suspense></RoleProtectedRoute>} />
                <Route path="/doctor/profile" element={<RoleProtectedRoute allowedRoles={["doctor"]}><Suspense fallback={<ProfileSkeleton />}><PageTransition><DoctorProfile /></PageTransition></Suspense></RoleProtectedRoute>} />
                <Route path="/doctor/schedule" element={<RoleProtectedRoute allowedRoles={["doctor"]}><Suspense fallback={<TableSkeleton rows={7} columns={4} />}><PageTransition><DoctorAvailability /></PageTransition></Suspense></RoleProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<RoleProtectedRoute allowedRoles={["admin"]}><Suspense fallback={<DashboardSkeleton />}><PageTransition><AdminDashboard /></PageTransition></Suspense></RoleProtectedRoute>} />
                <Route path="/admin/managedoctor" element={<RoleProtectedRoute allowedRoles={["admin"]}><Suspense fallback={<TableSkeleton rows={5} columns={6} />}><PageTransition><AdminManageDoctor /></PageTransition></Suspense></RoleProtectedRoute>} />
                <Route path="/admin/doctor/:id" element={<RoleProtectedRoute allowedRoles={["admin"]}><Suspense fallback={<ProfileSkeleton />}><PageTransition><AdminDoctorDetails /></PageTransition></Suspense></RoleProtectedRoute>} />
                <Route path="/admin/manageuser" element={<RoleProtectedRoute allowedRoles={["admin"]}><Suspense fallback={<TableSkeleton rows={5} columns={6} />}><PageTransition><AdminManageUser /></PageTransition></Suspense></RoleProtectedRoute>} />
                <Route path="/admin/manageappiontment" element={<RoleProtectedRoute allowedRoles={["admin"]}><Suspense fallback={<TableSkeleton rows={5} columns={6} />}><PageTransition><AdminManageAppiontment /></PageTransition></Suspense></RoleProtectedRoute>} />

                {/* Catch-all 404 */}
                <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
        </>
    )
}

export default App
