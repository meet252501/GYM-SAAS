const { GymClass, ClassSession, ClassBooking } = require('../models/GymClass');
const Member = require('../models/Member');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ─── CLASS DEFINITIONS (CRUD) ─────────────────────────────────

// GET /api/v1/classes
const getClasses = async (req, res, next) => {
  try {
    const { category, isActive } = req.query;
    const filter = {};

    const member = await Member.findOne({ userId: req.user._id });
    const gymId = member ? member.gymId : req.user.gymId;

    if (gymId) filter.gymId = gymId;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const classes = await GymClass.find(filter).sort({ name: 1 });
    return successResponse(res, classes);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/classes
const createClass = async (req, res, next) => {
  try {
    const { name, description, category, duration, capacity, location, color, price } = req.body;
    if (!name) return errorResponse(res, 'Class name is required', 400);

    const gymId = req.user.gymId;
    if (!gymId) return errorResponse(res, 'Gym association not found for user', 400);

    const gymClass = await GymClass.create({
      gymId,
      trainerId: req.user._id,
      name,
      description,
      category: category || 'other',
      duration: duration || 45,
      capacity: capacity || 20,
      location,
      color,
      price: price || 0
    });

    return successResponse(res, gymClass, 201);
  } catch (error) {
    next(error);
  }
};

// ─── CLASS SESSIONS (SCHEDULED SLOTS) ─────────────────────────

// GET /api/v1/classes/sessions
const getSessions = async (req, res, next) => {
  try {
    const { startDate, endDate, trainerId } = req.query;
    const filter = {};

    const member = await Member.findOne({ userId: req.user._id });
    const gymId = member ? member.gymId : req.user.gymId;

    if (gymId) filter.gymId = gymId;
    if (trainerId) filter.trainerId = trainerId;

    if (startDate || endDate) {
      filter.startsAt = {};
      if (startDate) filter.startsAt.$gte = new Date(startDate);
      if (endDate) filter.startsAt.$lte = new Date(endDate);
    } else {
      // Default to showing future sessions (up to 30 days)
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + 30);
      filter.startsAt = { $gte: now, $lte: future };
    }

    const sessions = await ClassSession.find(filter)
      .populate('classId')
      .populate('trainerId', 'name')
      .sort({ startsAt: 1 });

    return successResponse(res, sessions);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/classes/sessions
const createSession = async (req, res, next) => {
  try {
    const { classId, trainerId, startsAt, endsAt, capacity } = req.body;
    if (!classId || !startsAt) {
      return errorResponse(res, 'classId and startsAt are required', 400);
    }

    const gymClass = await GymClass.findById(classId);
    if (!gymClass) return errorResponse(res, 'Parent GymClass not found', 404);

    const gymId = req.user.gymId;
    if (!gymId) return errorResponse(res, 'Gym association not found', 400);

    // Compute endsAt automatically if not provided
    let calculatedEndsAt = endsAt;
    if (!calculatedEndsAt) {
      calculatedEndsAt = new Date(startsAt);
      calculatedEndsAt.setMinutes(calculatedEndsAt.getMinutes() + (gymClass.duration || 45));
    }

    const session = await ClassSession.create({
      classId,
      gymId,
      trainerId: trainerId || req.user._id,
      startsAt,
      endsAt: calculatedEndsAt,
      capacity: capacity || gymClass.capacity || 20,
      bookedCount: 0,
      status: 'scheduled'
    });

    return successResponse(res, session, 201);
  } catch (error) {
    next(error);
  }
};

// ─── CLASS BOOKINGS & WAITLISTS ───────────────────────────────

// POST /api/v1/classes/sessions/:sessionId/book
const bookSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    const session = await ClassSession.findById(sessionId).populate('classId');
    if (!session) return errorResponse(res, 'Class session not found', 404);

    // Check if already booked or waitlisted
    const existingBooking = await ClassBooking.findOne({
      sessionId,
      memberId: member._id,
      status: { $in: ['booked', 'waitlisted'] }
    });

    if (existingBooking) {
      return errorResponse(res, `You are already ${existingBooking.status} for this session`, 400);
    }

    // Determine booking status based on capacity limits
    const capacity = session.capacity || 20;
    let bookingStatus = 'booked';

    if (session.bookedCount >= capacity) {
      bookingStatus = 'waitlisted';
    } else {
      // Safely increment booked count
      session.bookedCount += 1;
      await session.save();
    }

    const booking = await ClassBooking.create({
      sessionId,
      memberId: member._id,
      gymId: member.gymId,
      status: bookingStatus,
      bookedAt: new Date()
    });

    return successResponse(res, {
      booking,
      message: bookingStatus === 'waitlisted'
        ? 'Class is full. You have been added to the waitlist.'
        : 'Successfully booked class session!'
    }, 201);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/classes/bookings/:bookingId/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const member = await Member.findOne({ userId: req.user._id });

    const booking = await ClassBooking.findById(bookingId);
    if (!booking) return errorResponse(res, 'Booking not found', 404);

    // Access control: Only the owner of the booking or staff/owners can cancel
    if (member && booking.memberId.toString() !== member._id.toString()) {
      return errorResponse(res, 'Access denied. You do not own this booking.', 403);
    }

    if (booking.status === 'cancelled') {
      return errorResponse(res, 'Booking is already cancelled', 400);
    }

    const originalStatus = booking.status;
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    const session = await ClassSession.findById(booking.sessionId);
    if (session) {
      if (originalStatus === 'booked') {
        // Decrease count since a booking was canceled
        session.bookedCount = Math.max(0, session.bookedCount - 1);

        // Find the first waitlisted member to automatically promote them to 'booked'!
        const nextWaitlistBooking = await ClassBooking.findOne({
          sessionId: session._id,
          status: 'waitlisted'
        }).sort({ bookedAt: 1 });

        if (nextWaitlistBooking) {
          nextWaitlistBooking.status = 'booked';
          await nextWaitlistBooking.save();

          // Keep bookedCount same because one cancelled and one got promoted
          session.bookedCount += 1;
        }

        await session.save();
      }
    }

    return successResponse(res, {
      booking,
      message: 'Successfully cancelled booking.'
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/classes/bookings
const getMemberBookings = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    const bookings = await ClassBooking.find({ memberId: member._id })
      .populate({
        path: 'sessionId',
        populate: { path: 'classId' }
      })
      .sort({ createdAt: -1 });

    return successResponse(res, bookings);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/classes/:id
const updateClass = async (req, res, next) => {
  try {
    const gymClass = await GymClass.findById(req.params.id);
    if (!gymClass) return errorResponse(res, 'Class not found', 404);

    if (gymClass.gymId.toString() !== req.user.gymId?.toString()) {
      return errorResponse(res, 'Not authorized to update this class', 403);
    }

    const updated = await GymClass.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return successResponse(res, updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/classes/:id
const deleteClass = async (req, res, next) => {
  try {
    const gymClass = await GymClass.findById(req.params.id);
    if (!gymClass) return errorResponse(res, 'Class not found', 404);

    if (gymClass.gymId.toString() !== req.user.gymId?.toString()) {
      return errorResponse(res, 'Not authorized to delete this class', 403);
    }

    await GymClass.findByIdAndDelete(req.params.id);
    // Also delete associated sessions? For now, just the class.
    return successResponse(res, { message: 'Class deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getSessions,
  createSession,
  bookSession,
  cancelBooking,
  getMemberBookings
};
