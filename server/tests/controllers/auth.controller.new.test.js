const authController = require('../../src/controllers/auth.controller');
const User = require('../../src/models/User');
const { successResponse, errorResponse } = require('../../src/utils/apiResponse');

// Mock models and apiResponse
jest.mock('../../src/models/User');
jest.mock('../../src/utils/apiResponse', () => ({
  successResponse: jest.fn(),
  errorResponse: jest.fn()
}));

describe('Auth Controller - updatePassword', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { _id: 'user123' },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should return 404 if user is not found', async () => {
    User.findById.mockResolvedValue(null);

    await authController.updatePassword(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(res, 'User not found', 404);
  });

  it('should return 400 if current password does not match', async () => {
    const mockUser = {
      _id: 'user123',
      comparePassword: jest.fn().mockResolvedValue(false),
      save: jest.fn()
    };
    User.findById.mockResolvedValue(mockUser);
    req.body = { currentPassword: 'wrong_password', newPassword: 'new_password' };

    await authController.updatePassword(req, res, next);

    expect(mockUser.comparePassword).toHaveBeenCalledWith('wrong_password');
    expect(errorResponse).toHaveBeenCalledWith(res, 'Incorrect current password', 400);
  });

  it('should update password and save if current password is correct', async () => {
    const mockUser = {
      _id: 'user123',
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true)
    };
    User.findById.mockResolvedValue(mockUser);
    req.body = { currentPassword: 'correct_password', newPassword: 'new_password' };

    await authController.updatePassword(req, res, next);

    expect(mockUser.comparePassword).toHaveBeenCalledWith('correct_password');
    expect(mockUser.passwordHash).toBe('new_password');
    expect(mockUser.save).toHaveBeenCalled();
    expect(successResponse).toHaveBeenCalledWith(res, { message: 'Security settings updated successfully' });
  });

  it('should update twoFactorEnabled preference', async () => {
    const mockUser = {
      _id: 'user123',
      twoFactorEnabled: false,
      save: jest.fn().mockResolvedValue(true)
    };
    User.findById.mockResolvedValue(mockUser);
    req.body = { twoFactorEnabled: true };

    await authController.updatePassword(req, res, next);

    expect(mockUser.twoFactorEnabled).toBe(true);
    expect(mockUser.save).toHaveBeenCalled();
    expect(successResponse).toHaveBeenCalledWith(res, { message: 'Security settings updated successfully' });
  });
});
