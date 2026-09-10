const supabase = require("../config/supabaseClient");

const createCompany = async ({
  name,
  logoUrl,
  description,
  website,
  industry,
  recruiterId,
}) => {
  const { data, error } = await supabase
    .from("companies")
    .insert({
      name,
      logoUrl,
      description,
      website,
      industry,
      recruiterId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

const getRecruiterCompanies = async (recruiterId) => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("recruiterId", recruiterId)
    .order("createdAt", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

module.exports = {
  createCompany,
  getRecruiterCompanies,
};