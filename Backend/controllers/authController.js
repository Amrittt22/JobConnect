const authService = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const user = await authService.registerUser({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const data = await authService.loginUser({
      email,
      password,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};