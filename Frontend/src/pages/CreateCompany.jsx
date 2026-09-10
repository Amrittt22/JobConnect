import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CreateCompany() {
  const navigate = useNavigate();
  const { session } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    industry: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/companies`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      navigate("/recruiter/post-job");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to create company"
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
            Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900">
            Create Company
          </h2>

          <p className="mt-2 mb-8 text-sm text-slate-500">
            Add your company before posting jobs.
          </p>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Company Name
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. TechNova"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                rows="5"
                placeholder="Tell candidates about your company..."
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Website
              </label>

              <input
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Industry
              </label>

              <input
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="e.g. Software / FinTech"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Company"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateCompany;