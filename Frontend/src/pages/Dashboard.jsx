import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, session } = useSelector((state) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem("jobconnect_session");

    dispatch(logout());

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              JobConnect
            </h1>
            <p className="text-sm text-slate-500">
              Job & Career Platform
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-5 py-2 font-semibold text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Welcome{user?.name ? `, ${user.name}` : ""}! 👋
          </h2>

          <p className="mt-2 text-slate-500">
            Here's what's happening with your JobConnect account.
          </p>
        </div>

        {/* User Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-xl font-bold text-slate-900">
            Account Information
          </h3>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Name</p>
              <p className="mt-1 font-semibold text-slate-900">
                {user?.name || "Not available"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-1 font-semibold text-slate-900">
                {user?.email || "Not available"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Role</p>
              <p className="mt-1 font-semibold capitalize text-slate-900">
                {user?.role?.toLowerCase() || "Job Seeker"}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-3xl">💼</div>
            <h3 className="mt-4 text-lg font-bold">
              Find Jobs
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Search for jobs that match your skills and interests.
            </p>
            <button className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Browse Jobs
            </button>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-3xl">📄</div>
            <h3 className="mt-4 text-lg font-bold">
              Applications
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Track the jobs you've applied for.
            </p>
            <button className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              My Applications
            </button>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-3xl">👤</div>
            <h3 className="mt-4 text-lg font-bold">
              My Profile
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Complete your profile and showcase your skills.
            </p>
            <button className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              View Profile
            </button>
          </div>
        </div>

        {/* Debug info - remove later */}
        <div className="mt-8 rounded-xl bg-slate-900 p-5 text-sm text-white">
          <p>
            <strong>Session:</strong>{" "}
            {session ? "Active ✅" : "Not found ❌"}
          </p>

          <p className="mt-2">
            <strong>User:</strong>{" "}
            {user ? "Loaded ✅" : "Not found ❌"}
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;