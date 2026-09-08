const supabase = require("../config/supabaseClient");

const registerUser = async ({ name, email, password, role }) => {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw error;

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

  if (error) throw error;

  if (!data?.user) {
    throw new Error("Login succeeded but no user was returned");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  if (!profile) {
    throw new Error(
      "User profile not found in users table. Please register again."
    );
  }

  return {
    session: data.session,
    user: profile,
  };
};

module.exports = {
  registerUser,
  loginUser,
};