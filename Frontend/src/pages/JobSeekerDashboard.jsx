import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function JobSeekerDashboard() {
  const { user, session } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Jobs
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [minSalary, setMinSalary] = useState("");

  // Applications
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] =
    useState(true);
  const [applicationsError, setApplicationsError] =
    useState("");

  // Fetch Jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/jobs`,
          {
            params: {
              search: search || undefined,
              location: location || undefined,
              jobType: jobType || undefined,
              minSalary: minSalary || undefined,
            },
          }
        );

        setJobs(response.data.jobs || []);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load jobs"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [search, location, jobType, minSalary]);

  // Fetch My Applications
  useEffect(() => {
    const fetchApplications = async () => {
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

        setApplications(
          response.data.applications || []
        );
      } catch (err) {
        console.error(
          "Failed to fetch applications:",
          err
        );

        setApplicationsError(
          err.response?.data?.message ||
            "Failed to load applications"
        );
      } finally {
        setApplicationsLoading(false);
      }
    };

    if (session) {
      fetchApplications();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              JobConnect
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Welcome back, {user?.name || "Job Seeker"}
            </p>
          </div>

          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            Job Seeker
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Page Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Find Your Next Job
          </h2>

          <p className="mt-2 text-slate-500">
            Search and apply for opportunities that match
            your skills.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search
              </label>

              <input
                type="text"
                placeholder="Job title..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Location
              </label>

              <input
                type="text"
                placeholder="e.g. Bangalore"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            {/* Job Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Job Type
              </label>

              <select
                value={jobType}
                onChange={(e) =>
                  setJobType(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
              >
                <option value="">
                  All Types
                </option>

                <option value="FULL_TIME">
                  Full Time
                </option>

                <option value="PART_TIME">
                  Part Time
                </option>

                <option value="INTERNSHIP">
                  Internship
                </option>

                <option value="CONTRACT">
                  Contract
                </option>
              </select>
            </div>

            {/* Minimum Salary */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Minimum Salary
              </label>

              <input
                type="number"
                placeholder="e.g. 30000"
                value={minSalary}
                onChange={(e) =>
                  setMinSalary(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

          </div>
        </div>

        {/* Jobs Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">
              Available Jobs
            </h3>

            <span className="text-sm text-slate-500">
              {jobs.length}{" "}
              {jobs.length === 1 ? "job" : "jobs"}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-500">
                Loading jobs...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* No Jobs */}
          {!loading &&
            !error &&
            jobs.length === 0 && (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
                <p className="text-slate-500">
                  No jobs found matching your filters.
                </p>
              </div>
            )}

          {/* Job Cards */}
          {!loading &&
            !error &&
            jobs.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">

                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                  >

                    {/* Title */}
                    <h4 className="text-xl font-semibold text-slate-900">
                      {job.title}
                    </h4>

                    {/* Company */}
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {job.companies?.name ||
                        "Company"}
                    </p>

                    {/* Job Info */}
                    <div className="mt-4 flex flex-wrap gap-2">

                      {job.location && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          📍 {job.location}
                        </span>
                      )}

                      {job.jobType && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          {job.jobType}
                        </span>
                      )}

                    </div>

                    {/* Salary */}
                    {(job.salaryMin !== null ||
                      job.salaryMax !== null) && (
                      <p className="mt-4 text-sm font-medium text-slate-700">
                        Salary:{" "}
                        {job.salaryMin !== null
                          ? `₹${job.salaryMin}`
                          : "Not specified"}{" "}
                        -{" "}
                        {job.salaryMax !== null
                          ? `₹${job.salaryMax}`
                          : "Not specified"}
                      </p>
                    )}

                    {/* Description */}
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
                      {job.description ||
                        "No description provided."}
                    </p>

                    {/* View Details */}
                    <button
                      onClick={() =>
                        navigate(
                          `/jobseeker/jobs/${job.id}`
                        )
                      }
                      className="mt-5 rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      View Details
                    </button>

                  </div>
                ))}

              </div>
            )}
        </section>

        {/* My Applications */}
        <section className="mt-12">

          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">
              My Applications
            </h3>

            <span className="text-sm text-slate-500">
              {applications.length}{" "}
              {applications.length === 1
                ? "application"
                : "applications"}
            </span>
          </div>

          {/* Loading */}
          {applicationsLoading && (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-500">
                Loading applications...
              </p>
            </div>
          )}

          {/* Error */}
          {!applicationsLoading &&
            applicationsError && (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
                <p className="text-red-600">
                  {applicationsError}
                </p>
              </div>
            )}

          {/* No Applications */}
          {!applicationsLoading &&
            !applicationsError &&
            applications.length === 0 && (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
                <p className="text-slate-500">
                  You haven't applied to any jobs yet.
                </p>

                <button
                  onClick={() =>
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                  className="mt-4 rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Browse Jobs
                </button>
              </div>
            )}

          {/* Application Cards */}
          {!applicationsLoading &&
            !applicationsError &&
            applications.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">

                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                  >

                    {/* Job */}
                    <h4 className="text-xl font-semibold text-slate-900">
                      {application.jobs?.title ||
                        "Job"}
                    </h4>

                    {/* Company */}
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {application.jobs?.companies
                        ?.name || "Company"}
                    </p>

                    {/* Job Information */}
                    <div className="mt-4 flex flex-wrap gap-2">

                      {application.jobs?.location && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          📍{" "}
                          {application.jobs.location}
                        </span>
                      )}

                      {application.jobs?.jobType && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          {application.jobs.jobType}
                        </span>
                      )}

                    </div>

                    {/* Status */}
                    <div className="mt-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Application Status
                      </p>

                      <span className="mt-2 inline-block rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                        {application.status}
                      </span>
                    </div>

                    {/* Applied Date */}
                    {application.appliedAt && (
                      <p className="mt-4 text-xs text-slate-400">
                        Applied on{" "}
                        {new Date(
                          application.appliedAt
                        ).toLocaleDateString()}
                      </p>
                    )}

                    {/* View Job */}
                    {application.jobs?.id && (
                      <button
                        onClick={() =>
                          navigate(
                            `/jobseeker/jobs/${application.jobs.id}`
                          )
                        }
                        className="mt-5 rounded-xl border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View Job
                      </button>
                    )}

                  </div>
                ))}

              </div>
            )}

        </section>

      </main>
    </div>
  );
}

export default JobSeekerDashboard;