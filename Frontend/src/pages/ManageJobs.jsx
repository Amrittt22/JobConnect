import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ManageJobs() {
  const navigate = useNavigate();

  const { session } = useSelector((state) => state.auth);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/jobs/my`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );

        setJobs(response.data.jobs);
      } catch (err) {
        console.error("Failed to load jobs:", err);

        setError(err.response?.data?.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchJobs();
    }
  }, [session]);

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?",
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      setJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error("Failed to delete job:", err);

      setError(err.response?.data?.message || "Failed to delete job");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-indigo-600">JobConnect</h1>

          <button
            onClick={() => navigate("/recruiter/dashboard")}
            className="text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Manage Jobs</h2>

            <p className="mt-2 text-sm text-slate-500">
              View and manage the jobs you have posted.
            </p>
          </div>

          <button
            onClick={() => navigate("/recruiter/post-job")}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Post Job
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-slate-500">Loading your jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          /* No jobs */
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              No jobs posted yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Create your first job opportunity.
            </p>

            <button
              onClick={() => navigate("/recruiter/post-job")}
              className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          /* Jobs */
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-5 md:flex-row">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {job.title}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          job.status === "OPEN"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-medium text-indigo-600">
                      {job.companies?.name}
                    </p>

                    <p className="mt-3 text-sm text-slate-600">
                      {job.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                      {job.location && <span>📍 {job.location}</span>}

                      <span>💼 {job.jobType}</span>

                      {(job.salaryMin || job.salaryMax) && (
                        <span>
                          💰 ₹{job.salaryMin || 0} - ₹{job.salaryMax || 0}
                        </span>
                      )}
                    </div>

                    {job.skillsRequired?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.skillsRequired.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => navigate(`/recruiter/edit-job/${job.id}`)}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(job.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageJobs;
