import {
  Payment,
  Classes,
  Personal,
  Profession,
  Review,
  Service,
  Session,
  User,
} from "../../models";
import bcrypt from "bcrypt";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { HTTP_STATUS } from "../../utils/constants";
import { successResponse } from "../../utils/response";
import Joi from "joi";

const usersController = {
  async index(req, res, next) {
    let documents;

    try {
      documents = await User.find({ role: { $ne: "admin" } }).select(
        "-__v -createdAt"
      );
      documents.reverse();
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(HTTP_STATUS.OK).json(documents);
  },

  async updateAccountStatus(req, res, next) {
    let documents;

    try {
      documents = await User.findByIdAndUpdate(
        { _id: req.params.id },
        { accountVerified: req.body.accountVerified },
        { new: true }
      ).select(" -password -__v -createdAt");
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(HTTP_STATUS.CREATED).json(documents);
  },

  async updateTrainerStatus(req, res, next) {
    let documents;

    try {
      documents = await User.findByIdAndUpdate(
        { _id: req.params.id },
        { trainerVerified: req.body.trainerVerified },
        { new: true }
      ).select(" -password -__v -createdAt");
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(HTTP_STATUS.CREATED).json(documents);
  },

  async updateEmailVerify(req, res, next) {
    let documents;
    try {
      documents = await User.findByIdAndUpdate(
        { _id: req.params.id },
        { emailVerified: req.body.emailVerified },
        { new: true }
      ).select(" -password -__v -createdAt");
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(HTTP_STATUS.CREATED).json(documents);
  },

  async delUser(req, res, next) {
    let documents,
      userPersonal,
      userProfession,
      userClasses,
      user,
      userReview,
      userServices,
      deleted,
      message = "",
      statusCode,
      userSession,
      payment;
    try {
      user = await User.findOneAndDelete({ _id: req.params.userId }).select(
        "-password -__v -updatedAt"
      );
      if (user) {
        deleted = true;
        statusCode = HTTP_STATUS.OK;
        message = "found";
        userPersonal = await Personal.findOneAndDelete({
          user: req.params.userId,
        }).select("-__v -updatedAt");

        userProfession = await Profession.findOneAndDelete({
          user: req.params.userId,
        }).select("-__v -updatedAt");

        userClasses = await Classes.deleteMany({
          user: req.params.userId,
        }).select("-__v -updatedAt");

        userReview = await Review.deleteMany({
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

        userServices = await Service.deleteMany({
          user: req.params.userId,
        }).select("-__v -updatedAt");

        userSession = await Session.deleteMany({
          user: req.params.userId,
        }).select("-__v -updatedAt");
        payment = await Payment.findOneAndDelete({ user: req.params.userId });
      } else {
        message = "Not Found";
        deleted = false;
        statusCode = 404;
      }

      documents = {
        statusCode,
        deleted,
        message,
      };
    } catch (err) {
      return next(err);
    }
    res.status(statusCode).json(documents);
  },

  async suspended(req, res, next) {
    let documents;
    try {
      documents = await User.findByIdAndUpdate(
        { _id: req.params.id },
        { suspended: req.body.suspended },
        { new: true }
      ).select(" -password -__v -createdAt");
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    let data = {
      documents,
      statusCode: HTTP_STATUS.OK,
    };
    res.status(HTTP_STATUS.CREATED).json(data);
  },

  // Edit Password
  async updateUserPassword(req, res, next) {
    let user, document;
    const schema = Joi.object({
      password: Joi.string().required().min(8),
    });
    const { error } = schema.validate(req.body);

    if (error) {
      return next(error);
    }
    const { password } = req.body;
    if (!password) {
      return next(
        CustomErrorHandler.wrongCredentials("password or old password missing!")
      );
    }
    try {
      user = await User.findById({ _id: req.params.id });

      if (!user) {
        return next(CustomErrorHandler.wrongCredentials("User doesn't exist!"));
      }
      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is salt rounds
      document = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          password: hashedPassword,
        },
        { new: true }
      ).select("-__v -updatedAt -password");
    } catch (err) {
      return next(err);
    }

    return successResponse(
      res,
      next,
      document,
      HTTP_STATUS.OK,
      "update password successfully"
    );
  },
};
export default usersController;
