const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "JobConnect Backend is running 🚀",
  });
});

// Supabase configuration check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is connected and environment is loaded",
    supabaseConfigured: !!process.env.SUPABASE_URL,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});