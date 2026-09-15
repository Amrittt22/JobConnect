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

const getJobApplicants = async (jobId, recruiterId) => {
  // First verify that this job belongs to the recruiter
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .eq("postedById", recruiterId)
    .single();

  if (jobError || !job) {
    const error = new Error(
      "You are not authorized to view applicants for this job"
    );
    error.statusCode = 403;
    throw error;
  }

  // Get all applications for this job
  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      users (
        id,
        name,
        email,
        profilePic,
        resumeUrl,
        skills,
        bio,
        location
      )
    `)
    .eq("jobId", jobId)
    .order("appliedAt", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};
const updateApplicationStatus = async (
  applicationId,
  recruiterId,
  status
) => {
  // Normalize status
  const normalizedStatus = String(status || "")
    .trim()
    .toUpperCase();

  console.log("Application status received:", normalizedStatus);

  // Find application and verify recruiter owns the job
  const { data: application, error: applicationError } =
    await supabase
      .from("applications")
      .select(`
        id,
        jobId,
        jobs (
          id,
          postedById
        )
      `)
      .eq("id", applicationId)
      .single();

  if (applicationError || !application) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  // Verify recruiter owns the job
  if (application.jobs?.postedById !== recruiterId) {
    const error = new Error(
      "You are not authorized to update this application"
    );

    error.statusCode = 403;
    throw error;
  }

  // Allowed statuses
  const allowedStatuses = [
    "APPLIED",
    "SHORTLISTED",
    "REJECTED",
    "HIRED",
  ];

  if (!allowedStatuses.includes(normalizedStatus)) {
    const error = new Error("Invalid application status");
    error.statusCode = 400;
    throw error;
  }

  // Update status
  const { data, error } = await supabase
    .from("applications")
    .update({
      status: normalizedStatus,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
};
