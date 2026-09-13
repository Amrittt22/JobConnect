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
module.exports = {
  applyToJob,
  getMyApplications,
};
