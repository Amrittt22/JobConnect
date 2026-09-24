const {
  saveJob,
  unsaveJob,
  getSavedJobs,
} = require("../services/savedJobService");

// Save job
const saveJobController = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.authUser.id;

    const savedJob = await saveJob(jobId, userId);

    res.status(201).json({
      success: true,
      message: "Job saved successfully",
      savedJob,
    });
  } catch (error) {
    next(error);
  }
};

// Unsave job
const unsaveJobController = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.authUser.id;

    await unsaveJob(jobId, userId);

    res.status(200).json({
      success: true,
      message: "Job removed from saved jobs",
    });
  } catch (error) {
    next(error);
  }
};

// Get saved jobs
const getSavedJobsController = async (req, res, next) => {
  try {
    const userId = req.authUser.id;

    const savedJobs = await getSavedJobs(userId);

    console.log("Saved jobs from service:", savedJobs);

    res.status(200).json({
      success: true,
      savedJobs: savedJobs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveJobController,
  unsaveJobController,
  getSavedJobsController,
};