const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getMembers, createMember, getMember, updateMember, deleteMember,
  getMemberQR, getExpiringSoon, getMemberStats, getLeaderboard
} = require('../controllers/members.controller');

const { upload } = require('../services/storage.service');

router.use(protect);

router.get('/leaderboard', getLeaderboard);

router.route('/')
  .get(authorize('owner', 'trainer'), getMembers)
  .post(authorize('owner', 'trainer'), upload.single('photo'), createMember);

router.get('/stats', authorize('owner', 'trainer'), getMemberStats);
router.get('/expiring-soon', authorize('owner', 'trainer'), getExpiringSoon);

router.route('/:id')
  .get(authorize('owner', 'trainer'), getMember)
  .patch(authorize('owner', 'trainer'), upload.single('photo'), updateMember)
  .delete(authorize('owner'), deleteMember);

router.get('/:id/qr', authorize('owner', 'trainer'), getMemberQR);

module.exports = router;
