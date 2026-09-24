const supabase = require("../config/supabaseClient");

// Save a job
const saveJob = async (jobId, userId) => {
  // Check if job exists and is open
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, status")
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

  // Check if already saved
  const { data: existingSavedJob, error: existingError } =
    await supabase
      .from("savedjobs")
      .select("jobId, userId")
      .eq("jobId", jobId)
      .eq("userId", userId)
      .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingSavedJob) {
    const error = new Error("Job is already saved");
    error.statusCode = 409;
    throw error;
  }

  // Save job
  const { data, error } = await supabase
    .from("savedjobs")
    .insert({
      jobId,
      userId,
    })
    .select("jobId, userId, createdAt")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Remove saved job
const unsaveJob = async (jobId, userId) => {
  const { data: savedJob, error: findError } = await supabase
    .from("savedjobs")
    .select("jobId, userId")
    .eq("jobId", jobId)
    .eq("userId", userId)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (!savedJob) {
    const error = new Error("Job is not saved");
    error.statusCode = 404;
    throw error;
  }

  const { error } = await supabase
    .from("savedjobs")
    .delete()
    .eq("jobId", jobId)
    .eq("userId", userId);

  if (error) {
    throw error;
  }

  return true;
};

// Get saved jobs
const getSavedJobs = async (userId) => {
  // Get saved job records
  const { data: savedJobs, error: savedJobsError } = await supabase
    .from("savedjobs")
    .select("jobId, userId, createdAt")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (savedJobsError) throw savedJobsError;

  if (!savedJobs || savedJobs.length === 0) {
    return [];
  }

  // Get the actual jobs
  const jobIds = savedJobs.map((savedJob) => savedJob.jobId);

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select(`
      *,
      companies (
        id,
        name,
        logoUrl
      )
    `)
    .in("id", jobIds);

  if (jobsError) throw jobsError;

  // Attach job details to each saved job
  const jobsMap = new Map(
    jobs.map((job) => [String(job.id), job])
  );

  return savedJobs.map((savedJob) => ({
    ...savedJob,
    jobs: jobsMap.get(String(savedJob.jobId)) || null,
  }));
};
module.exports = {
  saveJob,
  unsaveJob,
  getSavedJobs,
};