const {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
} = require("../services/applicationservice");

// Apply for a job
const applyForJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.authUser.id;

    console.log("Apply jobId:", jobId);
    console.log("Apply userId:", userId);

    const application = await applyToJob(jobId, userId);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's applications
const getMyApplicationsController = async (req, res, next) => {
  try {
    const userId = req.authUser.id;

    const applications = await getMyApplications(userId);

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// Get applicants for a recruiter's job
const getJobApplicantsController = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const recruiterId = req.authUser.id;

    const applicants = await getJobApplicants(
      jobId,
      recruiterId
    );

    res.status(200).json({
      success: true,
      applicants,
    });
  } catch (error) {
    next(error);
  }
};

// Update application status
const updateApplicationStatusController = async (
  req,
  res,
  next
) => {
  try {
    const applicationId = req.params.applicationId;
    const recruiterId = req.authUser.id;
    const { status } = req.body;

    const application = await updateApplicationStatus(
      applicationId,
      recruiterId,
      status
    );

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplicationsController,
  getJobApplicantsController,
  updateApplicationStatusController,
};