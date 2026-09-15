import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function Applicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const { session } = useSelector((state) => state.auth);

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch applicants
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setError("");

        if (!session?.access_token) {
          setError("Authentication session not found.");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/applications/job/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        console.log("Applicants:", response.data);

        setApplicants(response.data.applicants || []);
      } catch (err) {
        console.error("Failed to load applicants:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load applicants"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId, session]);

  // Update application status
  const updateStatus = async (applicationId, status) => {
    try {
      console.log(
        "Button clicked:",
        applicationId,
        status
      );

      setUpdatingId(applicationId);
      setError("");

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/applications/${applicationId}/status`,
        {
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Status update response:",
        response.data
      );

      // Update the UI
      setApplicants((currentApplicants) =>
        currentApplicants.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: status,
              }
            : application
        )
      );
    } catch (err) {
      console.error(
        "Status update failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update application status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Loading applicants...
        </p>
      </div>
    );
  }

  // Page
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            navigate("/recruiter/jobs")
          }
          className="mb-6 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to Jobs
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Applicants
          </h1>

          <p className="mt-2 text-slate-500">
            {applicants.length} applicant
            {applicants.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* No applicants */}
        {applicants.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              No applicants yet
            </h2>

            <p className="mt-2 text-slate-500">
              Applications for this job will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {applicants.map((application) => {
              const applicant = application.users;

              return (
                <div
                  key={application.id}
                  className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                >

                  {/* Applicant info */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {applicant?.name ||
                          "Unknown Applicant"}
                      </h2>

                      <p className="mt-1 text-slate-500">
                        {applicant?.email ||
                          "No email"}
                      </p>

                      {applicant?.location && (
                        <p className="mt-1 text-sm text-slate-500">
                          📍 {applicant.location}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <span
                      className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                        application.status ===
                        "SHORTLISTED"
                          ? "bg-green-100 text-green-700"
                          : application.status ===
                            "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : application.status ===
                            "HIRED"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>

                  {/* Skills */}
                  {applicant?.skills?.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        Skills
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {applicant.skills.map(
                          (skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {applicant?.bio && (
                    <div className="mt-5">
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        Bio
                      </p>

                      <p className="text-sm leading-6 text-slate-600">
                        {applicant.bio}
                      </p>
                    </div>
                  )}

                  {/* Resume */}
                  <div className="mt-5">
                    {applicant?.resumeUrl ? (
                      <a
                        href={applicant.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        View Resume
                      </a>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Resume not available
                      </p>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="mt-6 border-t border-slate-200 pt-5">

                    <p className="mb-3 text-sm font-semibold text-slate-700">
                      Application Actions
                    </p>

                    <div className="flex flex-wrap gap-3">

                      {/* Shortlist */}
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(
                            application.id,
                            "SHORTLISTED"
                          )
                        }
                        disabled={
                          updatingId === application.id
                        }
                        className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === application.id
                          ? "Updating..."
                          : "Shortlist"}
                      </button>

                      {/* Reject */}
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(
                            application.id,
                            "REJECTED"
                          )
                        }
                        disabled={
                          updatingId === application.id
                        }
                        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>

                      {/* Hire */}
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(
                            application.id,
                            "HIRED"
                          )
                        }
                        disabled={
                          updatingId === application.id
                        }
                        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Hire
                      </button>

                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}

export default Applicants;