const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getPlans,
  createPlan,
  deletePlan,
  assignMembership
} = require('../controllers/membership.controller');

router.use(protect);

router.route('/plans')
  .get(getPlans)
  .post(authorize('owner', 'trainer'), createPlan);

router.delete('/plans/:id', authorize('owner', 'trainer'), deletePlan);

router.post('/assign', authorize('owner', 'trainer'), assignMembership);

module.exports = router;
