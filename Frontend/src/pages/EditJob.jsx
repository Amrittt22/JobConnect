import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    skillsRequired: "",
    jobType: "FULL_TIME",
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/jobs/my`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const job = response.data.jobs.find((job) => job.id === id);

        if (!job) {
          setError("Job not found");
          return;
        }

        setFormData({
          title: job.title || "",
          description: job.description || "",
          location: job.location || "",
          salaryMin: job.salaryMin ?? "",
          salaryMax: job.salaryMax ?? "",
          skillsRequired: job.skillsRequired?.join(", ") || "",
          jobType: job.jobType || "FULL_TIME",
        });
      } catch (err) {
        console.error("Failed to load job:", err);
        setError(
          err.response?.data?.message || "Failed to load job"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchJob();
    }
  }, [session, id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/jobs/${id}`,
        {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          salaryMin: formData.salaryMin
            ? Number(formData.salaryMin)
            : null,
          salaryMax: formData.salaryMax
            ? Number(formData.salaryMax)
            : null,
          skillsRequired: formData.skillsRequired
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          jobType: formData.jobType,
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      navigate("/recruiter/jobs");
    } catch (err) {
      console.error("Failed to update job:", err);
      setError(
        err.response?.data?.message || "Failed to update job"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading job...</p>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-red-600">{error}</p>

          <button
            onClick={() => navigate("/recruiter/jobs")}
            className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-indigo-600">
            JobConnect
          </h1>

          <button
            onClick={() => navigate("/recruiter/jobs")}
            className="text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Back to Jobs
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Edit Job
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Update the details of your job posting.
          </p>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Job Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Minimum Salary
                </label>

                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Maximum Salary
                </label>

                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Skills
              </label>

              <input
                type="text"
                name="skillsRequired"
                value={formData.skillsRequired}
                onChange={handleChange}
                placeholder="React, JavaScript, TypeScript"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
              />

              <p className="mt-1 text-xs text-slate-400">
                Separate skills using commas.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Job Type
              </label>

              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/recruiter/jobs")}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditJob;