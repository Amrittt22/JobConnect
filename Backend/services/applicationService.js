const supabase = require("../config/supabaseClient");

const {
  createNotification,
} = require("./notificationService");

// Apply for a job
const applyToJob = async (jobId, applicantId) => {
  // Check whether job exists and is open
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, title, status")
    .eq("id", jobId)
    .eq("status", "OPEN")
    .single();

  if (jobError || !job) {
    const error = new Error(
      "Job not found or no longer available"
    );
    error.statusCode = 404;
    throw error;
  }

  // Check whether applicant already applied
  const {
    data: existingApplication,
    error: existingError,
  } = await supabase
    .from("applications")
    .select("id")
    .eq("jobId", jobId)
    .eq("applicantId", applicantId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingApplication) {
    const error = new Error(
      "You have already applied for this job"
    );
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

// Get current user's applications
const getMyApplications = async (applicantId) => {
  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      jobs (
        id,
        title,
        description,
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
    `)
    .eq("applicantId", applicantId)
    .order("appliedAt", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Get applicants for a recruiter's job
const getJobApplicants = async (jobId, recruiterId) => {
  // Verify recruiter owns the job
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

  // Get applicants
  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      users (
        id,
        name,
        email
      )
    `)
    .eq("jobId", jobId)
    .order("appliedAt", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Update application status
const updateApplicationStatus = async (
  applicationId,
  recruiterId,
  status
) => {
  const allowedStatuses = [
    "APPLIED",
    "SHORTLISTED",
    "REJECTED",
    "HIRED",
  ];

  if (!allowedStatuses.includes(status)) {
    const error = new Error(
      "Invalid application status"
    );
    error.statusCode = 400;
    throw error;
  }

  // Get application and verify recruiter owns the job
  const {
    data: application,
    error: applicationError,
  } = await supabase
    .from("applications")
    .select(`
      id,
      applicantId,
      jobId,
      status,
      jobs (
        id,
        title,
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
  if (
    !application.jobs ||
    application.jobs.postedById !== recruiterId
  ) {
    const error = new Error(
      "You are not authorized to update this application"
    );
    error.statusCode = 403;
    throw error;
  }

  // Update application status
  const { data, error } = await supabase
    .from("applications")
    .update({
      status,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Create notification for applicant
  if (application.status !== status) {
    try {
      await createNotification({
        userId: application.applicantId,
        type: "APPLICATION_STATUS",
        message: `Your application for "${application.jobs.title}" has been updated to ${status}.`,
      });
    } catch (notificationError) {
      console.error(
        "Failed to create notification:",
        notificationError
      );
    }
  }

  return data;
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
};