const supabase = require("../config/supabaseClient");

const applyToJob = async ({ jobId, applicantId }) => {
  // Check that the job exists and is open
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, status")
    .eq("id", jobId)
    .eq("status", "OPEN")
    .single();

  if (jobError || !job) {
    const error = new Error(
      "Job not found or no longer accepting applications",
    );
    error.statusCode = 404;
    throw error;
  }

  // Check for an existing application
  const { data: existingApplication, error: existingError } = await supabase
    .from("applications")
    .select("id")
    .eq("jobId", jobId)
    .eq("applicantId", applicantId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingApplication) {
    const error = new Error("You have already applied for this job");
    error.statusCode = 409;
    throw error;
  }

  // Create application
  const { data, error } = await supabase
    .from("applications")
    .insert({
      jobId,
      applicantId,
      status: "APPLIED",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
const getMyApplications = async (applicantId) => {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      jobs (
        id,
        title,
        location,
        jobType,
        salaryMin,
        salaryMax,
        companies (
          id,
          name,
          logoUrl
        )
      )
    `,
    )
    .eq("applicantId", applicantId)
    .order("appliedAt", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

module.exports = {
  applyToJob,
  getMyApplications,
};
