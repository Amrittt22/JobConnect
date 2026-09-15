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
import EditJob from "./pages/EditJob";

import JobDetails from "./pages/JobDetails";
import Applicants from "./pages/Applicants";

import RoleProtectedRoute from "./components/RoleProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      {/* =========================
          JOB SEEKER ROUTES
      ========================= */}
      <Route
        element={
          <RoleProtectedRoute
            allowedRoles={["JOBSEEKER"]}
          />
        }
      >
        <Route
          path="/jobseeker/dashboard"
          element={<JobSeekerDashboard />}
        />

        <Route
          path="/jobseeker/jobs/:id"
          element={<JobDetails />}
        />
      </Route>

      {/* =========================
          RECRUITER ROUTES
      ========================= */}
      <Route
        element={
          <RoleProtectedRoute
            allowedRoles={["RECRUITER"]}
          />
        }
      >
        {/* Recruiter Dashboard */}
        <Route
          path="/recruiter/dashboard"
          element={<RecruiterDashboard />}
        />

        {/* Create Company */}
        <Route
          path="/recruiter/create-company"
          element={<CreateCompany />}
        />

        {/* Post Job */}
        <Route
          path="/recruiter/post-job"
          element={<PostJob />}
        />

        {/* Manage Jobs */}
        <Route
          path="/recruiter/jobs"
          element={<ManageJobs />}
        />

        {/* Edit Job */}
        <Route
          path="/recruiter/edit-job/:id"
          element={<EditJob />}
        />

        {/* Applicants */}
        <Route
          path="/recruiter/jobs/:jobId/applicants"
          element={<Applicants />}
        />
      </Route>

      {/* =========================
          ADMIN ROUTES
      ========================= */}
      <Route
        element={
          <RoleProtectedRoute
            allowedRoles={["ADMIN"]}
          />
        }
      >
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Route>
    </Routes>
  );
}

export default App;