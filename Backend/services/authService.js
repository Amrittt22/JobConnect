const supabase = require("../config/supabase");

const registerUser = async ({ name, email, password, role }) => {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw error;
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .insert({
      id: data.user.id,
      name,
      email,
      role: role || "JOBSEEKER",
    })
    .select()
    .single();

  if (userError) {
    // If profile creation fails, remove the auth account
    await supabase.auth.admin.deleteUser(data.user.id);
    throw userError;
  }

  return user;
};

const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

module.exports = {
  registerUser,
  loginUser,
};