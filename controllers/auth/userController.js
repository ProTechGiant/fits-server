import { Personal, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import Otp from "../../models/otp";
import bcrypt from "bcrypt";
import SendGridService from "../../services/SendGridService";
import { errorResponse, successResponse } from "../../utils/response";
import { HTTP_STATUS } from "../../utils/constants";

const userController = {
  async me(req, res, next) {
    let documents,
      userPersonal,
      // userFitness,
      user;

    // for trainer profiles steps

    // for trainee profiles steps

    try {
      user = await User.findById({ _id: req.user._id }).select("-password -__v -updatedAt");

      if (user) {
        userPersonal = await Personal.findOne({
          user: user._id,
        });
        // PROFILE COMPLETE STEPS
      }
      documents = {
        user: user,
        personal_info: userPersonal,
      };
      return successResponse(res, next, documents, HTTP_STATUS.OK, "found");
    } catch (err) {
      return next(err);
    }
  },
  // Check otp exist in this particular email or not
  async codeVerify(req, res, next) {
    try {
      let data = await Otp.findOne({
        email: req.body.email,
        code: req.body.code,
      })
        .limit(1)
        .sort({ $natural: -1 });
      if (data) {
        const date = new Date();
        const currenTime = date.getTime();

        const diff = data.expireIn - currenTime;

        if (diff < 0) {
          return next(CustomErrorHandler.wrongCredentials("token expired"));
        } else {
          let user;
          if (req.body.type == "verification") {
            user = {
              emailVerified: true,
            };
          }
          if (req.body.type == "forgot_password") {
            user = {
              reset_password: true,
            };
          }
          const result = await User.findOneAndUpdate({ email: data.email }, user, { new: true });
          if (result) {
            res.status(201).json({ message: "verified" });
          } else {
            return errorResponse(res, HTTP_STATUS.BAD_GATEWAY, "unverfied ");
          }
        }
      } else {
        return next(CustomErrorHandler.wrongCredentials("verification code incorrect"));
      }
    } catch (error) {
      return next(error);
    }
  },

  async emailSend(req, res, next) {
    // const response = await SendGridService.sendEmail(req.body.email, next);
    if (req.body.email) {
      successResponse(
        res,
        next,
        '111222',
        HTTP_STATUS.CREATED,
        "send code successfully"
      );
    }
  },

  // otp resend in email (one time password ) for verification
  async resendEmail(req, res, next) {
    const response = await SendGridService.sendEmail(req.body.email, next);
    res.status(201).json(response);
  },

  // otp (one time password) check expire and update password
  async changePassword(req, res, next) {
    // try {
    const findData = await User.findOne({ email: req.body.email });

    if (findData) { //findData.reset_password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await User.findOneAndUpdate(
        { email: req.body.email },
        { password: hashedPassword, reset_password: false }
      );
      res.status(201).json({ message: "password updated" });
    } else {
      return next(CustomErrorHandler.notFound("unable to change password"));
    }
  },

  // Get all users
  async index(req, res, next) {
    let documents;
    // pagination mongoose pagination
    try {
      documents = await User.find({ role: { $eq: "customer" } })
        .select("-updatedAt -__v -password")
        .sort({ createdAt: -1 });
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json(documents);
  },

  async updateRole(req, res, next) {
    const { role } = req.body;
    let document;
    try {
      document = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          role: role,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }

    res.status(201).json(document);
  },
};

export default userController;
