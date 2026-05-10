const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getDietPlans,
  getDietPlan,
  createDietPlan,
  updateDietPlan,
  deleteDietPlan,
  assignDietPlan
} = require('../controllers/dietPlan.controller');

router.use(protect);

router.route('/')
  .get(getDietPlans)
  .post(authorize('owner', 'trainer'), createDietPlan);

router.route('/:id')
  .get(getDietPlan)
  .put(authorize('owner', 'trainer'), updateDietPlan)
  .delete(authorize('owner', 'trainer'), deleteDietPlan);

router.post('/:id/assign', authorize('owner', 'trainer'), assignDietPlan);

module.exports = router;
