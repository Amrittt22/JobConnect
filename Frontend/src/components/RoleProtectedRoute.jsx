import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function RoleProtectedRoute({ allowedRoles }) {
  const { user, session, loading } = useSelector(
    (state) => state.auth
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;