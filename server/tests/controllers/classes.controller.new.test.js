const classesController = require('../../src/controllers/classes.controller');
const { GymClass, ClassSession, ClassBooking } = require('../../src/models/GymClass');
const { successResponse, errorResponse } = require('../../src/utils/apiResponse');

// Mock GymClass models and apiResponse
jest.mock('../../src/models/GymClass', () => {
  return {
    GymClass: {
      findById: jest.fn()
    },
    ClassSession: {
      findOne: jest.fn()
    },
    ClassBooking: {
      find: jest.fn()
    }
  };
});
jest.mock('../../src/utils/apiResponse', () => ({
  successResponse: jest.fn(),
  errorResponse: jest.fn()
}));

describe('Classes Controller - getClassAttendees', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: { id: 'class123' },
      user: { gymId: 'gym123' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should return 404 if gym class is not found', async () => {
    GymClass.findById.mockResolvedValue(null);

    await classesController.getClassAttendees(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(res, 'Class not found', 404);
  });

  it('should return 403 if the user is from a different gym', async () => {
    const mockClass = { _id: 'class123', gymId: 'different_gym' };
    GymClass.findById.mockResolvedValue(mockClass);

    await classesController.getClassAttendees(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(res, 'Not authorized', 403);
  });

  it('should return empty list if no session exists for the class', async () => {
    const mockClass = { _id: 'class123', gymId: 'gym123' };
    GymClass.findById.mockResolvedValue(mockClass);
    ClassSession.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(null)
    });

    await classesController.getClassAttendees(req, res, next);

    expect(successResponse).toHaveBeenCalledWith(res, { session: null, attendees: [] });
  });

  it('should return attendees list correctly if session and bookings exist', async () => {
    const mockClass = { _id: 'class123', gymId: 'gym123' };
    const mockSession = { _id: 'session456', classId: 'class123', startsAt: new Date() };
    const mockBookings = [
      { memberId: { _id: 'member1', firstName: 'John', lastName: 'Doe' } },
      { memberId: { _id: 'member2', firstName: 'Jane', lastName: 'Smith' } }
    ];

    GymClass.findById.mockResolvedValue(mockClass);
    
    // Chain mock for ClassSession.findOne().sort()
    ClassSession.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockSession)
    });

    // Chain mock for ClassBooking.find().populate()
    ClassBooking.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockBookings)
    });

    await classesController.getClassAttendees(req, res, next);

    expect(successResponse).toHaveBeenCalledWith(res, {
      session: mockSession,
      attendees: [
        { _id: 'member1', firstName: 'John', lastName: 'Doe' },
        { _id: 'member2', firstName: 'Jane', lastName: 'Smith' }
      ]
    });
  });
});
