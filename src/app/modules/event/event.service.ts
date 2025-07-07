import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { Notification } from "../notification/notification.model";
import { User } from "../user/user.model";
import type { TEvent } from "./event.interface";
import { Event, EventAttendee } from "./event.model";

const EventSearchableFields = ["title", "description", "location", "tags"];

const createEventIntoDB = async (userId: string, eventData: TEvent) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Validate date is in the future
  const eventDate = new Date(eventData.date);
  if (eventDate < new Date()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Event date must be in the future"
    );
  }

  const event = await Event.create({
    ...eventData,
    organizer: userId,
    attendees: [userId], // Organizer is automatically an attendee
  });

  // Create attendee record for organizer
  await EventAttendee.create({
    event: event._id,
    user: userId,
    status: "confirmed",
  });

  const populatedEvent = await Event.findById(event._id)
    .populate("organizer", "name avatar")
    .populate("attendees", "name avatar");

  return populatedEvent;
};

const getAllEventsFromDB = async (query: Record<string, unknown>) => {
  // Filter for active events by default
  const baseFilter = { isActive: true };

  const eventQuery = new QueryBuilder(
    Event.find(baseFilter)
      .populate("organizer", "name avatar")
      .populate("attendees", "name avatar"),
    query
  )
    .search(EventSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await eventQuery.modelQuery;
  const meta = await eventQuery.countTotal();

  // Add computed fields for each event
  const eventsWithComputedFields = result.map((event: any) => {
    const eventObj = event.toObject();
    return {
      ...eventObj,
      attendees: eventObj.attendees.length,
      organizer: eventObj.organizer
        ? { ...eventObj.organizer, rating: 4.5 } // This would come from a ratings system
        : { rating: 4.5 },
    };
  });

  return {
    meta,
    result: eventsWithComputedFields,
  };
};

const getSingleEventFromDB = async (userId: string, eventId: string) => {
  const event = await Event.findById(eventId)
    .populate("organizer", "name avatar")
    .populate("attendees", "name avatar");

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  // Check if user is attending
  const isAttending = event.attendees.some(
    (attendee: any) => attendee._id.toString() === userId
  );

  // Check if user has favorited (this would come from saved items)
  const isFavorited = false; // This would be implemented with saved items

  const eventObj = event.toObject();
  return {
    ...eventObj,
    attendees: eventObj.attendees.length,
    isAttending,
    isFavorited,
    organizer: {
      ...eventObj,
      rating: 4.5, // This would come from a ratings system
    },
  };
};

const updateEventIntoDB = async (
  userId: string,
  eventId: string,
  payload: Partial<TEvent>
) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  // Check if user is the organizer
  if (event.organizer.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update events you organized"
    );
  }

  // Validate date if being updated
  if (payload.date) {
    const eventDate = new Date(payload.date);
    if (eventDate < new Date()) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Event date must be in the future"
      );
    }
  }

  const updatedEvent = await Event.findByIdAndUpdate(eventId, payload, {
    new: true,
    runValidators: true,
  })
    .populate("organizer", "name avatar")
    .populate("attendees", "name avatar");

  return updatedEvent;
};

const deleteEventFromDB = async (userId: string, eventId: string) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  // Check if user is the organizer
  if (event.organizer.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete events you organized"
    );
  }

  // Soft delete by setting isActive to false
  await Event.findByIdAndUpdate(eventId, { isActive: false });

  // Delete all attendee records
  await EventAttendee.deleteMany({ event: eventId });

  return event;
};

const joinEventIntoDB = async (userId: string, eventId: string) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  if (!event.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "Event is not active");
  }

  // Check if event date has passed
  if (new Date(event.date) < new Date()) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot join past events");
  }

  // Check if already attending
  if (event.attendees.includes(userId)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are already attending this event"
    );
  }

  // Check if event is full
  if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
    throw new AppError(httpStatus.BAD_REQUEST, "Event is full");
  }

  // Add user to attendees
  await Event.findByIdAndUpdate(eventId, {
    $push: { attendees: userId },
  });

  // Create attendee record
  await EventAttendee.create({
    event: eventId,
    user: userId,
    status: "confirmed",
  });

  // Create notification for organizer
  if (event.organizer.toString() !== userId) {
    const user = await User.findById(userId);
    await Notification.create({
      recipient: event.organizer,
      sender: userId,
      type: "group_join", // Reusing existing notification type
      title: "New Event Attendee",
      message: `${user?.name} joined your event: ${event.title}`,
      data: { eventId },
    });
  }

  return { message: "Successfully joined the event" };
};

const leaveEventIntoDB = async (userId: string, eventId: string) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  // Check if user is attending
  if (!event.attendees.includes(userId)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not attending this event"
    );
  }

  // Organizer cannot leave their own event
  if (event.organizer.toString() === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Event organizer cannot leave their own event"
    );
  }

  // Remove user from attendees
  await Event.findByIdAndUpdate(eventId, {
    $pull: { attendees: userId },
  });

  // Delete attendee record
  await EventAttendee.deleteOne({ event: eventId, user: userId });

  return { message: "Successfully left the event" };
};

const getEventAttendeesFromDB = async (
  userId: string,
  eventId: string,
  query: Record<string, unknown>
) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  const attendeeQuery = new QueryBuilder(
    EventAttendee.find({ event: eventId })
      .populate("user", "name avatar bio location isActive lastSeen")
      .sort({ joinedAt: -1 }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await attendeeQuery.modelQuery;
  const meta = await attendeeQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getMyEventsFromDB = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const { type = "all" } = query;

  let eventQuery;

  if (type === "organized") {
    // Events organized by user
    eventQuery = new QueryBuilder(
      Event.find({ organizer: userId, isActive: true })
        .populate("organizer", "name avatar")
        .populate("attendees", "name avatar"),
      query
    );
  } else if (type === "attending") {
    // Events user is attending
    eventQuery = new QueryBuilder(
      Event.find({ attendees: userId, isActive: true })
        .populate("organizer", "name avatar")
        .populate("attendees", "name avatar"),
      query
    );
  } else {
    // All events (organized + attending)
    eventQuery = new QueryBuilder(
      Event.find({
        $or: [{ organizer: userId }, { attendees: userId }],
        isActive: true,
      })
        .populate("organizer", "name avatar")
        .populate("attendees", "name avatar"),
      query
    );
  }

  eventQuery.search(EventSearchableFields).filter().sort().paginate().fields();

  const result = await eventQuery.modelQuery;
  const meta = await eventQuery.countTotal();

  // Add computed fields
  const eventsWithComputedFields = result.map((event: any) => {
    const eventObj = event.toObject();
    return {
      ...eventObj,
      attendees: eventObj.attendees.length,
      isAttending: eventObj.attendees.some(
        (attendee: any) => attendee._id.toString() === userId
      ),
      organizer: {
        ...(eventObj.organizer || {}),
        rating: 4.5,
      },
    };
  });

  return {
    meta,
    result: eventsWithComputedFields,
  };
};

const getEventsByLocationFromDB = async (
  location: string,
  query: Record<string, unknown>
) => {
  const eventQuery = new QueryBuilder(
    Event.find({
      location: { $regex: location, $options: "i" },
      isActive: true,
      date: { $gte: new Date() },
    })
      .populate("organizer", "name avatar")
      .populate("attendees", "name avatar"),
    query
  )
    .search(EventSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await eventQuery.modelQuery;
  const meta = await eventQuery.countTotal();

  return {
    meta,
    result,
  };
};

export const EventServices = {
  createEventIntoDB,
  getAllEventsFromDB,
  getSingleEventFromDB,
  updateEventIntoDB,
  deleteEventFromDB,
  joinEventIntoDB,
  leaveEventIntoDB,
  getEventAttendeesFromDB,
  getMyEventsFromDB,
  getEventsByLocationFromDB,
};
