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

module.exports = {
  createJob,
};