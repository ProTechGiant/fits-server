import Joi from "joi";
import bcrypt from "bcrypt";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { Personal, Profession, User } from "../../models";
import JwtServices from "../../services/JwtService";
import { isObjectEmpty } from "../../utils/utility";
import { HTTP_STATUS, ROLE_TYPES } from "../../utils/constants";
import { errorResponse } from "../../utils/response";

const loginController = {
  async login(req, res, next) {
    // Validation
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required().min(8),
    });
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return next(error);
    }
    // check if user exist in database already
    let user, result, professionResult, personal, profile_status;
    let step_1 = false;
    // for trainer profiles steps
    let step_2 = false;
    let step_3 = false;
    // for trainee profiles steps
    let profile_completed = false;

    try {
      user = await User.findOne({ email: req.body.email }).select("-updatedAt -__v");
      if (!user) {
        return next(CustomErrorHandler.wrongCredentials());
      }
      personal = await Personal.findOne({ user: user._id });
      if (user.role === ROLE_TYPES.TRAINER) {
        if (personal) {
          step_1 = true;
        }
        professionResult = await Profession.findOne({ user: user._id });
        if (professionResult) {
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
        if (personal) {
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
    } catch (err) {
      return next(err);
    }

    // compare password
    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      return next(CustomErrorHandler.wrongCredentials());
    }
    //emailVerified
    if (!user.emailVerified) {
      let email_message;
      const access_token = JwtServices.sign({ _id: user._id, role: user.role });
      return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, "please verify your email first", { access_token, email_message, user });
    } else if (user.suspended) {
      return next(CustomErrorHandler.wrongCredentials("your account has been suspended"));
    } else {
      // tokens
      const access_token = JwtServices.sign({ _id: user._id, role: user.role });

      // database whitlist
      result = {
        message: "success",
        login: true,
        access_token,
        profile_completed,
        profile_status,
        data: user,
      };
    }
    res.status(200).json(result);
  },

  async logout(req, res, next) {
    // validations
    const refreshSchema = Joi.object({
      refresh_token: Joi.string().required(),
    });
    const { error } = refreshSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    try {
      await RefreshToken.deleteOne({ token: req.body.refresh_token });
    } catch (err) {
      return next(new Error("Something went wrong in the database"));
    }
    res.json({ status: 1 });
  },
};

export default loginController;
