const applicationService = require("../services/applicationservice");

const applyToJob = async (req, res, next) => {
  try {
    const application = await applicationService.applyToJob({
      jobId: req.params.jobId,
      applicantId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getMyApplications(
      req.user.id,
    );

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

const getJobApplicants = async (req, res, next) => {
  try {
    const applicants = await applicationService.getJobApplicants(
      req.params.jobId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      applicants,
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await applicationService.updateApplicationStatus(
      req.params.id,
      req.user.id,
      req.body.status
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
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
};
