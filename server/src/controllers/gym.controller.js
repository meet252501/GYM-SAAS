const Gym = require('../models/Gym');
const logger = require('../utils/logger');

// @desc    Get gym settings
// @route   GET /api/v1/gym/settings
// @access  Private (Owner/Trainer)
exports.getSettings = async (req, res, next) => {
  try {
    const gym = await Gym.findById(req.user.gymId);
    
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    res.status(200).json({
      success: true,
      data: gym
    });
  } catch (error) {
    logger.error(`Error in getSettings: ${error.message}`);
    next(error);
  }
};

// @desc    Update gym settings
// @route   PUT /api/v1/gym/settings
// @access  Private (Owner)
exports.updateSettings = async (req, res, next) => {
  try {
    let gym = await Gym.findById(req.user.gymId);

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const updateData = { ...req.body };
    if (updateData.settings && typeof updateData.settings === 'string') {
      try {
        updateData.settings = JSON.parse(updateData.settings);
      } catch (e) {
        logger.error('Failed to parse gym settings JSON');
      }
    }
    
    if (req.file) {
      updateData.logo = req.file.path; // Cloudinary URL
    }

    gym = await Gym.findByIdAndUpdate(gym._id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: gym
    });
  } catch (error) {
    logger.error(`Error in updateSettings: ${error.message}`);
    next(error);
  }
};
