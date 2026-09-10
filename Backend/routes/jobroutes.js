const express = require("express");

const { createJob } = require("../controllers/jobController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  createJob
);

module.exports = router;