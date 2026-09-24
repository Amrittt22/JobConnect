import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { session } = useSelector((state) => state.auth);

  const [job, setJob] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/jobs`
        );

        const jobs = response.data.jobs || [];

        const foundJob = jobs.find(
          (jobItem) => String(jobItem.id) === String(id)
        );

        if (!foundJob) {
          setError("Job not found");
          return;
        }

        setJob(foundJob);
      } catch (err) {
        console.error("Failed to fetch job:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load job details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Check whether this job is already saved
  useEffect(() => {
    const checkSavedJob = async () => {
      if (!session) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/saved-jobs`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const savedJobs = response.data.savedJobs || [];

        const alreadySaved = savedJobs.some(
          (savedJob) =>
            String(savedJob.jobId) === String(id)
        );

        setIsSaved(alreadySaved);
      } catch (err) {
        console.error(
          "Failed to check saved job:",
          err
        );
      }
    };

    checkSavedJob();
  }, [id, session]);

  // Apply for job
  const handleApply = async () => {
    if (!session) {
      navigate("/login");
      return;
    }

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
          "Failed to apply for this job"
      );
    } finally {
      setApplying(false);
    }
  };

  // Save / Unsave job
  const handleSaveToggle = async () => {
    if (!session) {
      navigate("/login");
      return;
    }

    try {
      setSaving(true);
      setSaveMessage("");

      if (isSaved) {
        // Unsave
        const response = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/saved-jobs/${id}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        setIsSaved(false);

        setSaveMessage(
          response.data.message ||
            "Job removed from saved jobs"
        );
      } else {
        // Save
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/saved-jobs/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        setIsSaved(true);

        setSaveMessage(
          response.data.message ||
            "Job saved successfully"
        );
      }
    } catch (err) {
      console.error(
        "Failed to save/unsave job:",
        err
      );

      setSaveMessage(
        err.response?.data?.message ||
          "Failed to update saved job"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Loading job details...
        </p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold text-slate-900">
            {error || "Job not found"}
          </h1>

          <button
            onClick={() =>
              navigate("/jobseeker/dashboard")
            }
            className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <button
          onClick={() =>
            navigate("/jobseeker/dashboard")
          }
          className="mb-6 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to Jobs
        </button>

        {/* Job Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {job.title}
            </h1>

            <p className="mt-2 text-lg font-medium text-slate-700">
              {job.companies?.name || "Company"}
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                📍 {job.location || "Location not specified"}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1">
                💼 {job.jobType || "Not specified"}
              </span>

              {job.salaryMin || job.salaryMax ? (
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  💰 ₹{job.salaryMin || 0} - ₹
                  {job.salaryMax || "N/A"}
                </span>
              ) : null}
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-900">
              Job Description
            </h2>

            <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
              {job.description}
            </p>
          </div>

          {/* Skills */}
          {job.skillsRequired && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Required Skills
              </h2>

              <p className="mt-3 text-slate-600">
                {Array.isArray(job.skillsRequired)
                  ? job.skillsRequired.join(", ")
                  : job.skillsRequired}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">

            {/* Apply */}
            <button
              onClick={handleApply}
              disabled={applying}
              className="flex-1 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {applying
                ? "Applying..."
                : "Apply for Job"}
            </button>

            {/* Save */}
            <button
              onClick={handleSaveToggle}
              disabled={saving}
              className={`flex-1 rounded-xl border px-6 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isSaved
                  ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {saving
                ? "Updating..."
                : isSaved
                ? "🔖 Saved"
                : "🔖 Save Job"}
            </button>
          </div>

          {/* Application message */}
          {applicationMessage && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              {applicationMessage}
            </div>
          )}

          {/* Save message */}
          {saveMessage && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              {saveMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDetails;