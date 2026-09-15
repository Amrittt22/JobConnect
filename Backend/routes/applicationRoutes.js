const express = require("express");

const {
  applyToJob,getMyApplications,getJobApplicants,updateApplicationStatus
} = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/my",
  authMiddleware,
  authorizeRoles("JOBSEEKER"),
  getMyApplications
);
router.post(
  "/:jobId/apply",
  authMiddleware,
  authorizeRoles("JOBSEEKER"),
  applyToJob,
  
);
router.get(
  "/job/:jobId",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  getJobApplicants
);
router.put(
  "/:id/status",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  updateApplicationStatus
);

module.exports = router;