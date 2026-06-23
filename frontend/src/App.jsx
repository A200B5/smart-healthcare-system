import {Routes , Route} from "react-router-dom";
import DoctorDashboard from "./pages/doctorpages/DoctorDashboard.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import SignupRole from "./pages/signuppages/SignupRole.jsx";
import SignupPatient from "./pages/signuppages/SignupPatient.jsx";
import SignupDoctor from "./pages/signuppages/SignupDoctor.jsx";
import SignupAdmin from "./pages/signuppages/SignupAdmin.jsx";
import PatientHome from "./pages/pateintpages/PatientHome.jsx";
import PatientFindDoctor from "./pages/pateintpages/PatientFindDoctor.jsx";
import PatientAppointments from "./pages/pateintpages/PatientAppointments.jsx";
import BookAppointment from "./pages/pateintpages/BookAppointment.jsx";
import PatientProfile from "./pages/pateintpages/PatientProfile.jsx";
import DoctorProfile from "./pages/doctorpages/DoctorProfile.jsx";
import DoctorAvailability from "./pages/doctorpages/DoctorAvailability.jsx";
import AdminDashboard from "./pages/adminpages/AdminDashboard.jsx";
import AdminManageDoctor from "./pages/adminpages/AdminManageDoctor.jsx";
import AdminManageUser from "./pages/adminpages/AdminManageUser.jsx";
import AdminManageAppiontment from "./pages/adminpages/AdminManageAppiontment.jsx";
import AdminDoctorDetails from "./pages/adminpages/AdminDoctorDetails.jsx";
import NotFound from "./pages/notmatchpage/NotFound.jsx";

import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import AlreadyAuthenticated from "./components/AlreadyAuthenticated.jsx";

function App() {

  return (
      <>
          <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AlreadyAuthenticated><Login /></AlreadyAuthenticated>} />
              <Route path="/signuprole" element={<AlreadyAuthenticated><SignupRole /></AlreadyAuthenticated>} />
              <Route path="/signup/patient" element={<AlreadyAuthenticated><SignupPatient /></AlreadyAuthenticated>} />
              <Route path="/signup/doctor" element={<AlreadyAuthenticated><SignupDoctor /></AlreadyAuthenticated>} />
              <Route path="/signup/admin" element={<AlreadyAuthenticated><SignupAdmin /></AlreadyAuthenticated>} />

              {/* Patient Routes */}
              <Route path="/patient/home" element={<RoleProtectedRoute allowedRoles={["patient"]}><PatientHome /></RoleProtectedRoute>} />
              <Route path="/patient/profile" element={<RoleProtectedRoute allowedRoles={["patient"]}><PatientProfile /></RoleProtectedRoute>} />
              <Route path="/patient/finddoctor" element={<RoleProtectedRoute allowedRoles={["patient"]}><PatientFindDoctor /></RoleProtectedRoute>} />
              <Route path="/patient/appointment" element={<RoleProtectedRoute allowedRoles={["patient"]}><PatientAppointments /></RoleProtectedRoute>} />
              <Route path="/patient/bookappointment/:doctorId" element={<RoleProtectedRoute allowedRoles={["patient"]}><BookAppointment /></RoleProtectedRoute>} />

              {/* Doctor Routes */}
              <Route path="/doctor" element={<RoleProtectedRoute allowedRoles={["doctor"]}><DoctorDashboard /></RoleProtectedRoute>} />
              <Route path="/doctor/dashboard" element={<RoleProtectedRoute allowedRoles={["doctor"]}><DoctorDashboard /></RoleProtectedRoute>} />
              <Route path="/doctor/profile" element={<RoleProtectedRoute allowedRoles={["doctor"]}><DoctorProfile /></RoleProtectedRoute>} />
              <Route path="/doctor/schedule" element={<RoleProtectedRoute allowedRoles={["doctor"]}><DoctorAvailability /></RoleProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<RoleProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></RoleProtectedRoute>} />
              <Route path="/admin/managedoctor" element={<RoleProtectedRoute allowedRoles={["admin"]}><AdminManageDoctor /></RoleProtectedRoute>} />
              <Route path="/admin/doctor/:id" element={<RoleProtectedRoute allowedRoles={["admin"]}><AdminDoctorDetails /></RoleProtectedRoute>} />
              <Route path="/admin/manageuser" element={<RoleProtectedRoute allowedRoles={["admin"]}><AdminManageUser /></RoleProtectedRoute>} />
              <Route path="/admin/manageappiontment" element={<RoleProtectedRoute allowedRoles={["admin"]}><AdminManageAppiontment /></RoleProtectedRoute>} />

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
          </Routes>
      </>
  )
}

export default App
