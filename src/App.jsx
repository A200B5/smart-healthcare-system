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
import DoctorProfile from "./pages/doctorpages/DoctorProfile.jsx";
import AdminDashboard from "./pages/adminpages/AdminDashboard.jsx";
import AdminManageDoctor from "./pages/adminpages/AdminManageDoctor.jsx";
import AdminManageUser from "./pages/adminpages/AdminManageUser.jsx";
import AdminManageAppiontment from "./pages/adminpages/AdminManageAppiontment.jsx";
import NotFound from "./pages/notmatchpage/NotFound.jsx";

function App() {


  return (
      <>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signuprole" element={<SignupRole />} />
              <Route path="/signuppatient" element={<SignupPatient />} />
              <Route path="/signupdoctor" element={<SignupDoctor />} />
              <Route path="/signupadmin" element={<SignupAdmin />} />
              <Route path="/patienthome" element={<PatientHome />} />
              <Route path="/patientfinddoctor" element={<PatientFindDoctor />} />
              <Route path="/patientappointment" element={<PatientAppointments />} />
              <Route path="/doctordashboard" element={<DoctorDashboard />} />
              <Route path="/doctorprofile" element={<DoctorProfile />} />
              <Route path="/admindashboard" element={<AdminDashboard />} />
              <Route path="/adminmanagedoctor" element={<AdminManageDoctor />} />
              <Route path="/adminmanageuser" element={<AdminManageUser />} />
              <Route path="/adminmanageappiontment" element={<AdminManageAppiontment />} />
              <Route path="*" element={<NotFound />} />
          </Routes>
      </>
  )
}

export default App
