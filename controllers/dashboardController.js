import { Session, User, Booking } from "../models";

const dashboardController = {
  async index(req, res, next) {
    try {
      const trainer = await User.find({ role: "trainer" }).count();
      const trainee = await User.find({ role: "trainee" }).count();
      const session = await Session.find().count();
      const bookings = await Booking.find().count();

      const result = {
        status: true,
        users: {
          trainer,
          trainee,
        },
        sessions: {
          total: session,
          booked: bookings,
        },
      };
      res.json(result);
    } catch (err) {
      res.json({ err });
    }
  },
};

export default dashboardController;
