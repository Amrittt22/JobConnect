import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import PostJob from "./pages/Postjob";
import CreateCompany from "./pages/CreateCompany";
import ManageJobs from "./pages/ManageJobs";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import EditJob from "./pages/EditJob";
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* JobSeeker Routes */}
      <Route element={<RoleProtectedRoute allowedRoles={["JOBSEEKER"]} />}>
        <Route path="/jobseeker/dashboard" element={<JobSeekerDashboard />} />
      </Route>

      {/* Recruiter Routes */}
      <Route element={<RoleProtectedRoute allowedRoles={["RECRUITER"]} />}>
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />

        <Route path="/recruiter/create-company" element={<CreateCompany />} />

        <Route path="/recruiter/post-job" element={<PostJob />} />

        <Route path="/recruiter/jobs" element={<ManageJobs />} />

        <Route path="/recruiter/edit-job/:id" element={<EditJob />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<RoleProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
