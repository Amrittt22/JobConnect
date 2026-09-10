const supabase = require("../config/supabaseClient");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    // Verify the Supabase access token
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      console.error("Supabase auth error:", authError);

      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Get the user's profile from our users table
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (profileError) {
      console.error("Profile query error:", profileError);

      return res.status(500).json({
        success: false,
        message: "Failed to load user profile",
      });
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    req.authUser = authUser;
    req.user = profile;
    req.userRole = profile.role;

    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = authMiddleware;