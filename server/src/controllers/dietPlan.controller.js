const DietPlan = require('../models/DietPlan');
const logger = require('../utils/logger');

// @desc    Get all diet plans
// @route   GET /api/v1/diet-plans
// @access  Private
exports.getDietPlans = async (req, res, next) => {
  try {
    const plans = await DietPlan.find({ isActive: true });
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single diet plan
// @route   GET /api/v1/diet-plans/:id
// @access  Private
exports.getDietPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Create diet plan
// @route   POST /api/v1/diet-plans
// @access  Private (Owner/Trainer)
exports.createDietPlan = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    const plan = await DietPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Update diet plan
// @route   PUT /api/v1/diet-plans/:id
// @access  Private (Owner/Trainer)
exports.updateDietPlan = async (req, res, next) => {
  try {
    let plan = await DietPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    plan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete diet plan
// @route   DELETE /api/v1/diet-plans/:id
// @access  Private (Owner/Trainer)
exports.deleteDietPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    await plan.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
