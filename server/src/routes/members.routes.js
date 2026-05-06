const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getMembers, createMember, getMember, updateMember, deleteMember,
  getMemberQR, getExpiringSoon, getMemberStats
} = require('../controllers/members.controller');

router.use(protect);

router.route('/')
  .get(authorize('owner', 'trainer'), getMembers)
  .post(authorize('owner', 'trainer'), createMember);

router.get('/stats', authorize('owner', 'trainer'), getMemberStats);
router.get('/expiring-soon', authorize('owner', 'trainer'), getExpiringSoon);

router.route('/:id')
  .get(getMember)
  .patch(authorize('owner', 'trainer'), updateMember)
  .delete(authorize('owner'), deleteMember);

router.get('/:id/qr', getMemberQR);

module.exports = router;
