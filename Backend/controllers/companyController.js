const companyService = require("../services/companyServices");

const createCompany = async (req, res, next) => {
  try {
    const {
      name,
      logoUrl,
      description,
      website,
      industry,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    const company = await companyService.createCompany({
      name,
      logoUrl,
      description,
      website,
      industry,
      recruiterId: req.authUser.id,
    });

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      company,
    });
  } catch (error) {
    next(error);
  }
};

const getMyCompanies = async (req, res, next) => {
  try {
    const companies = await companyService.getRecruiterCompanies(
      req.authUser.id
    );

    res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  getMyCompanies,
};