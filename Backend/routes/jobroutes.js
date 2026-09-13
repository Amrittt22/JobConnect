const express = require("express");

const { createJob , getRecruiterJobs , updateJob , deleteJob} = require("../controllers/jobController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");


const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  createJob
);
  
router.get(
  "/my",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  getRecruiterJobs
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  updateJob
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  deleteJob
);

module.exports = router;