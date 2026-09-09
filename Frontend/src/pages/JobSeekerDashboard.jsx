import { useSelector } from "react-redux";

function JobSeekerDashboard() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Job Seeker Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome back, {user?.name} 👋
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-semibold">Find Jobs</h2>
            <p className="mt-2 text-sm text-slate-500">
              Discover opportunities that match your skills.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-semibold">Applications</h2>
            <p className="mt-2 text-sm text-slate-500">
              Track your job applications.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-semibold">Saved Jobs</h2>
            <p className="mt-2 text-sm text-slate-500">
              View jobs you've saved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobSeekerDashboard;