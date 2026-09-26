const express = require("express");

const {
  applyForJob,
  getMyApplicationsController,
  getJobApplicantsController,
  updateApplicationStatusController,
} = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Job seeker applies for a job
router.post(
  "/:jobId/apply",
  authMiddleware,
  authorizeRoles("JOBSEEKER"),
  applyForJob
);

// Job seeker gets their applications
router.get(
  "/my",
  authMiddleware,
  authorizeRoles("JOBSEEKER"),
  getMyApplicationsController
);

// Recruiter gets applicants for a job
router.get(
  "/job/:jobId",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  getJobApplicantsController
);

// Recruiter updates application status
router.put(
  "/:applicationId/status",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  updateApplicationStatusController
);

module.exports = router;