const Gym = require('../models/Gym');
const logger = require('../utils/logger');

// @desc    Get gym settings
// @route   GET /api/v1/gym/settings
// @access  Private (Owner/Trainer)
exports.getSettings = async (req, res, next) => {
  try {
    // For now, we assume there's only one gym per owner
    let gym = await Gym.findOne({ ownerId: req.user._id });
    
    if (!gym) {
      // If no gym exists for this owner, create a default one
      gym = await Gym.create({
        name: 'GymFlow Pro',
        ownerId: req.user._id,
        address: { city: 'Unknown', country: 'IN' },
        email: req.user.email
      });
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
    let gym = await Gym.findOne({ ownerId: req.user._id });

    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    gym = await Gym.findByIdAndUpdate(gym._id, req.body, {
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
