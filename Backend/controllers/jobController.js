const jobService = require("../services/jobServices");

const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      companyId,
      location,
      salaryMin,
      salaryMax,
      skillsRequired,
      jobType,
    } = req.body;

    if (!title || !description || !companyId || !jobType) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, company and job type are required",
      });
    }

    const job = await jobService.createJob({
      title,
      description,
      companyId,
      postedById: req.authUser.id,
      location,
      salaryMin,
      salaryMax,
      skillsRequired,
      jobType,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await jobService.getRecruiterJobs(
      req.authUser.id
    );

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};
const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      location,
      salaryMin,
      salaryMax,
      skillsRequired,
      jobType,
    } = req.body;

    if (!title || !description || !jobType) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description and job type are required",
      });
    }

    const job = await jobService.updateJob(
      id,
      req.authUser.id,
      {
        title,
        description,
        location,
        salaryMin,
        salaryMax,
        skillsRequired,
        jobType,
      }
    );

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};
const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    await jobService.deleteJob(
      id,
      req.authUser.id
    );

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getRecruiterJobs,
  updateJob,
  deleteJob,
};
