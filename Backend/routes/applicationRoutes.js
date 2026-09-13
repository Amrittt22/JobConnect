const express = require("express");

const {
  applyToJob,getMyApplications
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
  applyToJob
);

module.exports = router;