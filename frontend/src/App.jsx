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

function App() {


  return (
      <>

          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signuprole" element={<SignupRole />} />
              <Route path="/signup/patient" element={<SignupPatient />} />
              <Route path="/signup/doctor" element={<SignupDoctor />} />
              <Route path="/signup/admin" element={<SignupAdmin />} />
              <Route path="/patient/home" element={<PatientHome />} />
              <Route path="/patient/profile" element={<PatientProfile />} />
              <Route path="/patient/finddoctor" element={<PatientFindDoctor />} />
              <Route path="/patient/appointment" element={<PatientAppointments />} />
              <Route path="/patient/bookappointment/:doctorId" element={<BookAppointment />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
              <Route path="/doctor/schedule" element={<DoctorAvailability />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/managedoctor" element={<AdminManageDoctor />} />
              <Route path="/admin/doctor/:id" element={<AdminDoctorDetails />} />
              <Route path="/admin/manageuser" element={<AdminManageUser />} />
              <Route path="/admin/manageappiontment" element={<AdminManageAppiontment />} />
              <Route path="*" element={<NotFound />} />
          </Routes>
      </>
  )
}

export default App
