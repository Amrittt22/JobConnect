const supabase = require("../config/supabaseClient");

const createJob = async ({
  title,
  description,
  companyId,
  postedById,
  location,
  salaryMin,
  salaryMax,
  skillsRequired,
  jobType,
}) => {
  // Verify that the company belongs to the logged-in recruiter
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .eq("recruiterId", postedById)
    .single();

  if (companyError || !company) {
    const error = new Error(
      "You are not authorized to post jobs for this company"
    );

    error.statusCode = 403;
    throw error;
  }

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title,
      description,
      companyId,
      postedById,
      location,
      salaryMin,
      salaryMax,
      skillsRequired,
      jobType,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
const getRecruiterJobs = async (postedById) => {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      *,
      companies (
        id,
        name,
        logoUrl
      )
    `)
    .eq("postedById", postedById)
    .order("createdAt", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};
const updateJob = async (
  jobId,
  recruiterId,
  {
    title,
    description,
    location,
    salaryMin,
    salaryMax,
    skillsRequired,
    jobType,
  }
) => {
  // Check that the job belongs to this recruiter
  const { data: existingJob, error: findError } =
    await supabase
      .from("jobs")
      .select("id")
      .eq("id", jobId)
      .eq("postedById", recruiterId)
      .single();

  if (findError || !existingJob) {
    const error = new Error(
      "You are not authorized to update this job"
    );

    error.statusCode = 403;
    throw error;
  }

  const { data, error } = await supabase
    .from("jobs")
    .update({
      title,
      description,
      location,
      salaryMin,
      salaryMax,
      skillsRequired,
      jobType,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("postedById", recruiterId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

module.exports = {
  createJob,
  getRecruiterJobs,
  updateJob,
};