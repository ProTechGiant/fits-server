import { STRIPE_SECRET_KEY } from "../config/";
import {
  Classes,
  Payment,
  Personal,
  Profession,
  Review,
  Service,
  Session,
  User,
} from "../models";
import { ROLE_TYPES } from "../utils/constants";
import { isObjectEmpty } from "../utils/utility";
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const userMeController = {
  // get
  async getUserInfo(req, res, next) {
    let documents,
      userPersonal,
      userProfession,
      user,
      userReview,
      userServices,
      success,
      message = "",
      stripeMessage = "",
      statusCode,
      customer,
      card,
      userSession,
      sessionReview,
      payment,
      profile_status;
    let step_1 = false;
    // for trainer profiles steps
    let step_2 = false;
    // for trainee profiles steps
    let step_3 = false;
    let profile_completed = false;
    // try {
    user = await User.findById({ _id: req.user._id }).select(
      "-password -__v -updatedAt"
    );
    if (user) {
      success = true;
      statusCode = 201;
      message = "found";
      userPersonal = await Personal.findOne({
        user: req.user._id,
      }).select("-__v -updatedAt");

      userProfession = await Profession.findOne({
        user: req.user._id,
      }).select("-__v -updatedAt");

      userReview = await Review.find({
        trainer: req.user._id,
        reviewFor: "trainer",
      })
        .populate({
          path: "trainer",
          model: "User",
          select: "email numReviews averageRating role personal profession",
        })
        .populate({
          path: "reviews.user",
          model: "User",
          select: "email numReviews averageRating role personal profession",
          populate: {
            path: "personal",
            model: "Personal",
            select: "-__v -user -updatedAt",
          },
        });

      userServices = await Service.find({ user: req.user._id }).select(
        "-__v -updatedAt"
      );
      userSession = await Session.find({ user: req.user._id }).select(
        "-__v -updatedAt"
      );
      sessionReview = await Review.find({
        user: req.user._id,
      }).select("-__v -updatedAt");
      payment = await Payment.findOne({ user: req.user._id });

      if (payment) {
        if (payment.cus_id) {
          await stripe.customers
            .retrieve(payment.cus_id)
            .then((response) => {
              customer = response;
            })
            .catch((error) => {
              stripeMessage = error.raw.message;
            });
        }

        if (payment.card_id && payment.cus_id) {
          await stripe.customers
            .retrieveSource(payment.cus_id, payment.card_id)
            .then((response) => {
              card = response;
            })
            .catch((error) => {
              stripeMessage = error.raw.message;
            });
        }
      }

      // PROFILE COMPLETE STEPS
      if (user.role === ROLE_TYPES.TRAINER) {
        if (userPersonal) {
          step_1 = true;
        }

        if (userProfession) {
          step_2 = true;
        }

        if (!isObjectEmpty(user.services_offered.toObject())) {
          step_3 = true;
        }
        profile_status = {
          step_1,
          step_2,
          step_3,
        };
      } else if (user.role === ROLE_TYPES.TRAINEE) {
        if (userPersonal) {
          step_1 = true;
        }

        if (!isObjectEmpty(user.fitness_level.toObject())) {
          step_2 = true;
        }

        if (!isObjectEmpty(user.fitness_goal.toObject())) {
          step_3 = true;
        }
        profile_status = {
          step_1,
          step_2,
          step_3,
        };
      }
      if (step_1 && step_2 && step_3) {
        profile_completed = true;
      }
      if (step_1 && step_2 && step_3) {
        profile_completed = true;
      }
    } else {
      message = "Not Found";
      success = false;
      statusCode = 404;
    }

    documents = {
      statusCode,
      success,
      message,
      profile_completed,
      profile_status,
      user: user,
      personal_info: userPersonal,
      profession_info: userProfession,
      reviews: userReview,
      services: userServices,
      session: { userSession, sessionReview },

      stripe: { message: stripeMessage, customer, card },
    };
    // } catch (err) {
    //   return next(err);
    // }

    res.status(statusCode).json(documents);
  },


  async showAdmin(req, res, next) {
    let documents,
      userPersonal,
      userProfession,
      userClasses,
      user,
      userReview,
      userServices,
      success,
      message = "",
      stripeMessage = "",
      statusCode,
      customer,
      card,
      userSession,
      payment,
      profile_status;
    let step_1 = false;
    // for trainer profiles steps
    let step_2 = false;
    // for trainee profiles steps
    let step_3 = false;
    let profile_completed = false;
    try {
      user = await User.findById({ _id: req.params.userId }).select(
        "-password -__v -updatedAt"
      );
      if (user) {
        success = true;
        statusCode = 201;
        message = "found";
        userPersonal = await Personal.findOne({
          user: req.params.userId,
        }).select("-__v -updatedAt");

        userProfession = await Profession.findOne({
          user: req.params.userId,
        }).select("-__v -updatedAt");

        userClasses = await Classes.find({
          user: req.params.userId,
        }).select("-__v -updatedAt");

        userReview = await Review.find({
          trainer: req.params.userId,
          reviewFor: "trainer",
        })
          .populate({
            path: "trainer",
            model: "User",
            select: "email numReviews averageRating role personal profession",
          })
          .populate({
            path: "reviews.user",
            model: "User",
            select: "email numReviews averageRating role personal profession",
            populate: {
              path: "personal",
              model: "Personal",
              select: "-__v -user -updatedAt",
            },
          });

        userServices = await Service.find({ user: req.params.userId }).select(
          "-__v -updatedAt"
        );
        userSession = await Session.find({ user: req.params.userId }).select(
          "-__v -updatedAt"
        );
        payment = await Payment.findOne({ user: req.params.userId });

        if (payment) {
          if (payment.cus_id) {
            await stripe.customers
              .retrieve(payment.cus_id)
              .then((response) => {
                customer = response;
              })
              .catch((error) => {
                stripeMessage = error.raw.message;
              });
          }

          if (payment.card_id && payment.cus_id) {
            await stripe.customers
              .retrieveSource(payment.cus_id, payment.card_id)
              .then((response) => {
                card = response;
              })
              .catch((error) => {
                stripeMessage = error.raw.message;
              });
          }
        }

        // PROFILE COMPLETE STEPS
        if (user.role === ROLE_TYPES.TRAINER) {
          if (userPersonal) {
            step_1 = true;
          }

          if (userProfession) {
            step_2 = true;
          }

          if (!isObjectEmpty(user.services_offered.toObject())) {
            step_3 = true;
          }
          profile_status = {
            step_1,
            step_2,
            step_3,
          };
        } else if (user.role === ROLE_TYPES.TRAINEE) {
          if (userPersonal) {
            step_1 = true;
          }

          if (!isObjectEmpty(user.fitness_level.toObject())) {
            step_2 = true;
          }

          if (!isObjectEmpty(user.fitness_goal.toObject())) {
            step_3 = true;
          }
          profile_status = {
            step_1,
            step_2,
            step_3,
          };
        }
        if (step_1 && step_2 && step_3) {
          profile_completed = true;
        }
        if (step_1 && step_2 && step_3) {
          profile_completed = true;
        }
      } else {
        message = "Not Found";
        success = false;
        statusCode = 404;
      }

      documents = {
        statusCode,
        success,
        message,
        profile_completed,
        profile_status,
        user: user,
        personal_info: userPersonal,
        profession_info: userProfession,
        user_classes: userClasses,
        reviews: userReview,
        services: userServices,
        session: userSession,
        stripe: { message: stripeMessage, customer, card },
      };
    } catch (err) {
      return next(err);
    }

    res.status(statusCode).json(documents);
  },
};

export default userMeController;
