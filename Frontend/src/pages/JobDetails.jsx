import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { session } = useSelector((state) => state.auth);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/jobs`
        );

        const foundJob = response.data.jobs.find(
          (job) => job.id === id
        );

        if (!foundJob) {
          setError("Job not found");
          return;
        }

        setJob(foundJob);
      } catch (err) {
        console.error("Failed to fetch job:", err);

        setError(
          err.response?.data?.message || "Failed to load job"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      setApplicationMessage("");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/applications/${id}/apply`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      setApplicationMessage(
        response.data.message ||
          "Application submitted successfully"
      );
    } catch (err) {
      console.error("Failed to apply:", err);

      setApplicationMessage(
        err.response?.data?.message ||
          "Failed to submit application"
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Loading job...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              navigate("/jobseeker/dashboard")
            }
            className="mt-4 rounded-xl bg-slate-900 px-5 py-2 text-white"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">

        {/* Back Button */}
        <button
          onClick={() =>
            navigate("/jobseeker/dashboard")
          }
          className="mb-6 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to Jobs
        </button>

        {/* Job Details Card */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">

          {/* Job Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {job.title}
            </h1>

            <p className="mt-2 text-lg text-slate-600">
              {job.companies?.name || "Company"}
            </p>
          </div>

          {/* Job Information */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            {/* Location */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Location
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {job.location || "Not specified"}
              </p>
            </div>

            {/* Job Type */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Job Type
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {job.jobType}
              </p>
            </div>

            {/* Salary */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Salary
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {job.salaryMin !== null
                  ? `₹${job.salaryMin}`
                  : "Not specified"}

                {" - "}

                {job.salaryMax !== null
                  ? `₹${job.salaryMax}`
                  : "Not specified"}
              </p>
            </div>

            {/* Status */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Status
              </p>

              <p className="mt-1 font-medium text-green-600">
                {job.status}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-900">
              Job Description
            </h2>

            <p className="mt-3 whitespace-pre-line text-slate-600">
              {job.description ||
                "No description provided."}
            </p>
          </div>

          {/* Skills */}
          {job.skillsRequired?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Required Skills
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {job.skillsRequired.map(
                  (skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Apply Section */}
          <div className="mt-8 border-t border-slate-200 pt-6">

            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {applying
                ? "Applying..."
                : "Apply for this Job"}
            </button>

            {applicationMessage && (
              <p className="mt-3 text-center text-sm text-slate-600">
                {applicationMessage}
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;