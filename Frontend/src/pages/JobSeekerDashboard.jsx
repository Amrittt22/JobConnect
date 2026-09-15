import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function JobSeekerDashboard() {
  const navigate = useNavigate();

  const { user, session } = useSelector((state) => state.auth);

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  const [error, setError] = useState("");
  const [applicationsError, setApplicationsError] = useState("");

  // Search and filters
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [minSalary, setMinSalary] = useState("");

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/jobs`,
          {
            params: {
              search,
              location,
              jobType,
              minSalary,
            },
          }
        );

        setJobs(response.data.jobs || []);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);

        setError(
          err.response?.data?.message || "Failed to load jobs"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [search, location, jobType, minSalary]);

  // Fetch my applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!session) return;

      try {
        setApplicationsLoading(true);
        setApplicationsError("");

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/applications/my`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        setApplications(response.data.applications || []);
      } catch (err) {
        console.error("Failed to fetch applications:", err);

        setApplicationsError(
          err.response?.data?.message ||
            "Failed to load applications"
        );
      } finally {
        setApplicationsLoading(false);
      }
    };

    fetchApplications();
  }, [session]);

  // Application status badge
  const getStatusClass = (status) => {
    switch (status) {
      case "SHORTLISTED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "HIRED":
        return "bg-indigo-100 text-indigo-700";

      case "APPLIED":
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Job Seeker Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Welcome back, {user?.name} 👋
          </p>
        </div>

        {/* Search Section */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Find Jobs
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-4">

            {/* Search */}
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />

            {/* Location */}
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />

            {/* Job Type */}
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            >
              <option value="">All Job Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="CONTRACT">Contract</option>
            </select>

            {/* Minimum Salary */}
            <input
              type="number"
              placeholder="Minimum salary"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {/* Jobs Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Available Jobs
          </h2>

          {loading && (
            <p className="mt-5 text-slate-500">
              Loading jobs...
            </p>
          )}

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="mt-5 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-500">
                No jobs found.
              </p>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
                >
                  {/* Job title */}
                  <h3 className="text-xl font-semibold text-slate-900">
                    {job.title}
                  </h3>

                  {/* Company */}
                  <p className="mt-2 font-medium text-slate-700">
                    {job.companies?.name || "Company"}
                  </p>

                  {/* Location */}
                  <p className="mt-2 text-sm text-slate-500">
                    📍 {job.location || "Location not specified"}
                  </p>

                  {/* Job Type */}
                  <p className="mt-1 text-sm text-slate-500">
                    💼 {job.jobType || "Not specified"}
                  </p>

                  {/* Salary */}
                  {(job.salaryMin || job.salaryMax) && (
                    <p className="mt-1 text-sm text-slate-500">
                      💰 ₹{job.salaryMin || 0} - ₹
                      {job.salaryMax || "N/A"}
                    </p>
                  )}

                  {/* Description */}
                  <p className="mt-4 line-clamp-3 text-sm text-slate-600">
                    {job.description}
                  </p>

                  {/* View Job */}
                  <button
                    onClick={() =>
                      navigate(`/jobseeker/jobs/${job.id}`)
                    }
                    className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
                  >
                    View Job
                  </button>
                </div>
              ))}

            </div>
          )}
        </div>

        {/* My Applications */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            My Applications
          </h2>

          {applicationsLoading && (
            <p className="mt-5 text-slate-500">
              Loading applications...
            </p>
          )}

          {applicationsError && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
              {applicationsError}
            </div>
          )}

          {!applicationsLoading &&
            !applicationsError &&
            applications.length === 0 && (
              <div className="mt-5 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
                <p className="text-slate-500">
                  You haven't applied to any jobs yet.
                </p>
              </div>
            )}

          {!applicationsLoading &&
            !applicationsError &&
            applications.length > 0 && (
              <div className="mt-5 space-y-4">

                {applications.map((application) => {
                  const job = application.jobs;

                  return (
                    <div
                      key={application.id}
                      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                    >
                      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                        {/* Application Info */}
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {job?.title || "Job"}
                          </h3>

                          <p className="mt-1 font-medium text-slate-700">
                            {job?.companies?.name || "Company"}
                          </p>

                          <div className="mt-3 space-y-1 text-sm text-slate-500">
                            <p>
                              📍{" "}
                              {job?.location ||
                                "Location not specified"}
                            </p>

                            <p>
                              💼{" "}
                              {job?.jobType ||
                                "Not specified"}
                            </p>

                            <p>
                              Applied on:{" "}
                              {application.appliedAt
                                ? new Date(
                                    application.appliedAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Status + Button */}
                        <div className="flex flex-col items-start gap-3 md:items-end">

                          {/* Status Badge */}
                          <span
                            className={`rounded-full px-4 py-2 text-xs font-semibold ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {application.status}
                          </span>

                          {/* View Job */}
                          {job?.id && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/jobseeker/jobs/${job.id}`
                                )
                              }
                              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              View Job
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default JobSeekerDashboard;