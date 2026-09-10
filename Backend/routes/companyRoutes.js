const express = require("express");

const {
  createCompany,
  getMyCompanies,
} = require("../controllers/companyController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  createCompany
);

router.get(
  "/my",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  getMyCompanies
);

module.exports = router;