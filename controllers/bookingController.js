import { STRIPE_SECRET_KEY } from "../config";
import { Personal, Profession, Booking, User, Payment, Session } from "../models";
import { HTTP_STATUS } from "../utils/constants";
import { errorResponse, successResponse } from "../utils/response";
const stripe = require("stripe")(STRIPE_SECRET_KEY);
import bookingSchema from "../validators/bookingSchema";

const bookingController = {
  // get  All classes/or bookings
  async index(req, res, next) { },

  // book a session
  async store(req, res, next) {
    // validation
    const { error } = bookingSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    let document,
      success,
      message = "",
      statusCode,
      booking,
      sum = 0;
    const { trainerId, sessionId, amount, subamount, currency, receiver, sender } = req.body;
    try {
      if (!sender || !receiver || !currency || !amount || !subamount) {
        res.status(500).json("Please add all requirements");
      }
      const senderGet = await User.findById({ _id: req.user._id });
      const reciverGet = await User.findById({ _id: trainerId });

      if (senderGet.amount > 0) {
        sum = senderGet.amount - subamount;

        const getBooking = await Booking.findOne({ session: sessionId });
        if (getBooking === null) {
          let balanceTransaction = await stripe.customers.createBalanceTransaction(sender, {
            amount: amount,
            currency: currency,
          });
          await User.findByIdAndUpdate({ _id: req.user._id }, { amount: sum });
          let balanceReciver = await stripe.customers.createBalanceTransaction(receiver, {
            amount: subamount,
            currency: currency,
          });
          sum = 0;
          sum = reciverGet.amount + subamount;
          await User.findByIdAndUpdate({ _id: trainerId }, { amount: sum });
          await Payment.findOneAndUpdate(
            { cus_id: sender },
            {
              $push: {
                trnsactions: {
                  type: "booking",
                  receiver: balanceReciver,
                  sender: balanceTransaction,
                },
              },
            },
            { new: true }
          );
          await Payment.findOneAndUpdate(
            { cus_id: receiver },
            {
              $push: {
                trnsactions: {
                  type: "booking",
                  receiver: balanceReciver,
                  sender: balanceTransaction,
                },
              },
            },
            { new: true }
          );

          booking = await Booking.create({
            trainer: trainerId,
            trainee: req.user._id,
            session: sessionId,
            amount: subamount,
            sender: sender,
            receiver: receiver,
            currency: currency,
          });
        } else {
          return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "Already booking this session", getBooking);
        }
        if (booking) {
          (message = "session booked"), (statusCode = 201), (success = true);
        } else {
          message = "not booked";
          success = false;
          statusCode = 404;
        }
      } else {
        return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "Balance is less please recharge", null);
      }
      document = {
        statusCode,
        success,
        message,
        data: booking,
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },

  async show(req, res, next) {
    try {
      let bookings = await Booking.find()
        .populate({
          path: "trainer",
          model: "User",
          select: "email numReviews averageRating role",
        })
        .populate({
          path: "trainee",
          model: "User",
          select: "email numReviews averageRating role",
        })
        .populate({
          path: "session",
          model: "Session",
          populate: {
            path: "user",
            model: "User",
            select: "email numReviews averageRating role",
          },
        })
        .select("-updatedAt -__v");
      if (bookings.length == 0) {
        return errorResponse(res, HTTP_STATUS.NOT_FOUND, "No Bookings Found!", null);
      }

      return successResponse(res, next, bookings, HTTP_STATUS.OK, "get bookings successfully");
    } catch (err) {
      return next(err);
    }
  },

  async recommended(req, res, next) {
    try {
      let bookings = await Booking.findByIdAndUpdate({ _id: req.params.id }, { recommended: req.body.recommended }, { new: true })
        .populate({
          path: "trainer",
          model: "User",
          select: "email numReviews averageRating role",
        })
        .populate({
          path: "trainee",
          model: "User",
          select: "email numReviews averageRating role",
        })
        .populate({
          path: "session",
          model: "Session",
        })
        .select("-updatedAt -__v");
      if (bookings.length == 0) {
        return errorResponse(res, HTTP_STATUS.NOT_FOUND, "No Recommended Bookings are Found!", null);
      }

      return successResponse(res, next, bookings, HTTP_STATUS.OK, "get bookings successfully");
    } catch (err) {
      return next(err);
    }
  },

  // get trainer booked sessions
  async getByTrainerId(req, res, next) {
    try {
      let bookings = await Booking.find({
        trainer: req.params.id,
      })
        .where({ recommended: { $eq: true } })
        .populate({
          path: "trainee",
          model: "User",
          select: "email numReviews averageRating role",
        })
        .populate({
          path: "session",
          model: "Session",
          populate: {
            path: "user",
            model: "User",
            select: "email numReviews averageRating role",
          },
        })
        .select("-updatedAt -__v");
      if (bookings.length == 0) {
        return errorResponse(res, HTTP_STATUS.NOT_FOUND, "No Bookings Found!", null);
      }

      return successResponse(res, next, bookings, HTTP_STATUS.OK, "get bookings successfully");
    } catch (err) {
      return next(err);
    }
  },

  // get trainee booked sessions
  async getByTraineeId(req, res, next) {
    try {
      const bookings = await Booking.find({ trainee: req.user._id });
      const sessionsIds = bookings.map((booking) => booking.session);

      const sessions = await Session.find({ _id: { $in: sessionsIds } })

      const sessionsWithUsers = [];

      for (const session of sessions) {
        const user = await Personal.findOne({ user: session.user })
        sessionsWithUsers.push({ ...session.toObject(), trainer: user.toObject() });
      }

      res.status(200).json(sessionsWithUsers);
    } catch (err) {
      return next(err);
    }
  },

  // delete trainee booked session
  async destroyTrainee(req, res, next) {
    let document, statusCode, refund;

    try {
      refund = await Booking.findById({ _id: req.params.id });
      if (refund === null) {
        return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Booking not exist", null);
      }
      const senderGet = await User.findById({ _id: refund.trainee });
      const reciverGet = await User.findById({ _id: refund.trainer });
      const refundSender = await stripe.customers.createBalanceTransaction(refund.sender, {
        amount: refund.amount,
        currency: refund.currency,
      });

      let sum = 0;
      sum = senderGet.amount + refund.amount;
      await User.findByIdAndUpdate({ _id: refund.trainee }, { amount: sum });
      const refundReciver = await stripe.customers.createBalanceTransaction(refund.receiver, {
        amount: refund.amount,
        currency: refund.currency,
      });
      if (refundReciver && senderGet) {
        sum = 0;
        sum = reciverGet.amount - refund.amount;
        await User.findByIdAndUpdate({ _id: refund.trainer }, { amount: sum });
        await Payment.findOneAndUpdate(
          { cus_id: reciverGet.cus_id },
          {
            $push: {
              trnsactions: {
                type: "refund",
                sender: refundSender,
                reciver: refundReciver,
              },
            },
          },
          { new: true }
        );
        await Payment.findOneAndUpdate(
          { cus_id: senderGet.cus_id },
          {
            $push: {
              trnsactions: {
                type: "refund",
                sender: refundSender,
                reciver: refundReciver,
              },
            },
          },
          { new: true }
        );
      }
      document = await Booking.findByIdAndDelete({ _id: req.params.id });
      if (!document) {
        return res.status(HTTP_STATUS.NOT_ACCEPTABLE).json({
          statusCode: HTTP_STATUS.NOT_ACCEPTABLE,
          message: "There Is No Session Exists!",
          deleted: false,
        });
      }
      statusCode = HTTP_STATUS.OK;
      document = {
        statusCode,
        deleted: true,
        message: "Booking Deleted Successfully!",
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },

  // delete trainer booked session
  async destroyTrainer(req, res, next) {
    let document, statusCode;

    try {
      document = await Booking.findByIdAndDelete({ _id: req.params.id });

      if (!document) {
        return res.status(HTTP_STATUS.NOT_ACCEPTABLE).json({
          statusCode: HTTP_STATUS.NOT_ACCEPTABLE,
          message: "There Is No Session Exists!",
          deleted: false,
        });
      }
      statusCode = HTTP_STATUS.OK;
      document = {
        statusCode,
        deleted: true,
        message: "Booking Deleted Successfully!",
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },
};

export default bookingController;
