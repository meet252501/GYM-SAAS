const BadgeService = require('../../src/services/badge.service');
const { Badge, MemberBadge } = require('../../src/models/Badge');
const Member = require('../../src/models/Member');
const NotificationService = require('../../src/services/notification.service');

// Mock dependencies
jest.mock('../../src/models/Badge');
jest.mock('../../src/models/Member');
jest.mock('../../src/services/notification.service');

describe('BadgeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAndAward', () => {
    const memberId = 'member123';
    const criteriaType = 'workout';
    const currentValue = 10;
    const userId = 'user123';
    const gymId = 'gym123';

    it('should return empty array if member is not found', async () => {
      Member.findById.mockResolvedValue(null);

      const result = await BadgeService.checkAndAward(memberId, criteriaType, currentValue);

      expect(Member.findById).toHaveBeenCalledWith(memberId);
      expect(result).toEqual([]);
      expect(Badge.find).not.toHaveBeenCalled();
    });

    it('should return empty array if no potential badges are found', async () => {
      Member.findById.mockResolvedValue({ _id: memberId, userId, gymId });
      
      const distinctMock = jest.fn().mockResolvedValue(['badge1']);
      MemberBadge.find.mockReturnValue({ distinct: distinctMock });
      // Actually mock distinct on the model so distinct() works on await MemberBadge.find({ memberId }).distinct('badgeId')
      MemberBadge.find = jest.fn().mockReturnValue({
        distinct: distinctMock
      });

      Badge.find.mockResolvedValue([]);

      const result = await BadgeService.checkAndAward(memberId, criteriaType, currentValue);

      expect(MemberBadge.find).toHaveBeenCalledWith({ memberId });
      expect(distinctMock).toHaveBeenCalledWith('badgeId');
      expect(Badge.find).toHaveBeenCalledWith({
        category: criteriaType,
        criteriaThreshold: { $lte: currentValue },
        _id: { $nin: ['badge1'] }
      });
      expect(result).toEqual([]);
    });

    it('should correctly award badges and send notifications', async () => {
      Member.findById.mockResolvedValue({ _id: memberId, userId, gymId });
      
      const distinctMock = jest.fn().mockResolvedValue([]);
      MemberBadge.find = jest.fn().mockReturnValue({
        distinct: distinctMock
      });

      const mockBadges = [
        { _id: 'badge1', name: 'First Workout', icon: 'icon1', points: 10 },
        { _id: 'badge2', name: '10 Workouts', icon: 'icon2', points: 50 }
      ];

      Badge.find.mockResolvedValue(mockBadges);
      
      // First iteration finds no existing badge, second iteration finds no existing badge
      MemberBadge.findOne.mockResolvedValue(null);
      
      // Mock create
      MemberBadge.create.mockResolvedValue({});

      // Mock notification
      NotificationService.send.mockResolvedValue({});

      const result = await BadgeService.checkAndAward(memberId, criteriaType, currentValue);

      expect(MemberBadge.findOne).toHaveBeenCalledTimes(2);
      expect(MemberBadge.create).toHaveBeenCalledTimes(2);
      expect(MemberBadge.create).toHaveBeenCalledWith({ memberId, badgeId: 'badge1' });
      expect(MemberBadge.create).toHaveBeenCalledWith({ memberId, badgeId: 'badge2' });

      expect(NotificationService.send).toHaveBeenCalledTimes(2);
      expect(NotificationService.send).toHaveBeenCalledWith({
        recipientId: userId,
        gymId: gymId,
        title: 'New Badge Unlocked! 🏆',
        message: `Congratulations! You've earned the "First Workout" badge.`,
        type: 'badge_earned',
        data: { badgeId: 'badge1', icon: 'icon1', points: 10 }
      });
      expect(NotificationService.send).toHaveBeenCalledWith({
        recipientId: userId,
        gymId: gymId,
        title: 'New Badge Unlocked! 🏆',
        message: `Congratulations! You've earned the "10 Workouts" badge.`,
        type: 'badge_earned',
        data: { badgeId: 'badge2', icon: 'icon2', points: 50 }
      });

      expect(result).toEqual(mockBadges);
    });

    it('should not award if member already has the badge (race condition check)', async () => {
      Member.findById.mockResolvedValue({ _id: memberId, userId, gymId });
      
      const distinctMock = jest.fn().mockResolvedValue([]);
      MemberBadge.find = jest.fn().mockReturnValue({
        distinct: distinctMock
      });

      const mockBadges = [
        { _id: 'badge1', name: 'First Workout', icon: 'icon1', points: 10 }
      ];

      Badge.find.mockResolvedValue(mockBadges);
      
      // Simulate existing badge found during race condition check
      MemberBadge.findOne.mockResolvedValue({ _id: 'existingMemberBadge' });

      const result = await BadgeService.checkAndAward(memberId, criteriaType, currentValue);

      expect(MemberBadge.findOne).toHaveBeenCalledWith({ memberId, badgeId: 'badge1' });
      expect(MemberBadge.create).not.toHaveBeenCalled();
      expect(NotificationService.send).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle errors gracefully and return empty array', async () => {
      Member.findById.mockRejectedValue(new Error('DB Error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await BadgeService.checkAndAward(memberId, criteriaType, currentValue);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
