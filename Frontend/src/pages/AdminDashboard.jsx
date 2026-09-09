import { useSelector } from "react-redux";

function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome back, {user?.name} 👋
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-semibold">Users</h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage JobConnect users.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-semibold">Companies</h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage companies and recruiters.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-semibold">Moderation</h2>
            <p className="mt-2 text-sm text-slate-500">
              Review and manage platform activity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;