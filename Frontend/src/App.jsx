import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";

import RoleProtectedRoute from "./components/RoleProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        element={
          <RoleProtectedRoute allowedRoles={["JOBSEEKER"]} />
        }
      >
        <Route
          path="/jobseeker/dashboard"
          element={<JobSeekerDashboard />}
        />
      </Route>

      <Route
        element={
          <RoleProtectedRoute allowedRoles={["RECRUITER"]} />
        }
      >
        <Route
          path="/recruiter/dashboard"
          element={<RecruiterDashboard />}
        />
      </Route>

      <Route
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]} />
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