const express = require("express");

const {
  saveJobController,
  unsaveJobController,
  getSavedJobsController,
} = require("../controllers/savedJobController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Get my saved jobs
router.get(
  "/",
  authMiddleware,
  authorizeRoles("JOBSEEKER"),
  getSavedJobsController
);

// Save a job
router.post(
  "/:jobId",
  authMiddleware,
  authorizeRoles("JOBSEEKER"),
  saveJobController
);

// Unsave a job
router.delete(
  "/:jobId",
  authMiddleware,
  authorizeRoles("JOBSEEKER"),
  unsaveJobController
);

module.exports = router;