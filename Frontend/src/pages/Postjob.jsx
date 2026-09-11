import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function PostJob() {
  const navigate = useNavigate();

  const { session } = useSelector((state) => state.auth);


  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    companyId: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    skillsRequired: "",
    jobType: "FULL_TIME",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/companies/my`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        console.log("COMPANIES:", response.data.companies);

        setCompanies(response.data.companies);
      } catch (err) {
        console.error("Failed to load companies:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load companies"
        );
      } finally {
        setCompaniesLoading(false);
      }
    };

    if (session) {
      fetchCompanies();
    }
  }, [session]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    console.log("FORM DATA:", formData);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/jobs`,
        {
          ...formData,
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
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      console.log("Job created:", response.data);

      setSuccess("Job posted successfully!");

      setTimeout(() => {
        navigate("/recruiter/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Job creation error:", err);
      console.log("Backend response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          "Failed to create job"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-indigo-600">
            JobConnect
          </h1>

          <button
            onClick={() => navigate("/recruiter/dashboard")}
            className="text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Post a Job
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create a new job opportunity for candidates.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Job Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Job Title
              </label>

              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role and responsibilities..."
                rows="6"
                required
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Company */}
            <div>
              <label
                htmlFor="companyId"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Company
              </label>

              {companiesLoading ? (
                <p className="text-sm text-slate-500">
                  Loading companies...
                </p>
              ) : companies.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm text-amber-700">
                    You don't have a company yet.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/recruiter/create-company")
                    }
                    className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Create a company
                  </button>
                </div>
              ) : (
                <select
                  id="companyId"
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">
                    Select a company
                  </option>

                  {companies.map((company) => (
                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Location
              </label>

              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Remote / Bangalore"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Salary */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="salaryMin"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Minimum Salary
                </label>

                <input
                  id="salaryMin"
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  placeholder="15000"
                  min="0"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="salaryMax"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Maximum Salary
                </label>

                <input
                  id="salaryMax"
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  placeholder="25000"
                  min="0"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label
                htmlFor="skillsRequired"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Required Skills
              </label>

              <input
                id="skillsRequired"
                type="text"
                name="skillsRequired"
                value={formData.skillsRequired}
                onChange={handleChange}
                placeholder="React, JavaScript, CSS"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-1 text-xs text-slate-400">
                Separate skills using commas.
              </p>
            </div>

            {/* Job Type */}
            <div>
              <label
                htmlFor="jobType"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Job Type
              </label>

              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Posting Job..." : "Post Job"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default PostJob;