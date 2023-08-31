import { Profession, User } from "../models";
import { HTTP_STATUS } from "../utils/constants";
import { errorResponse, successResponse } from "../utils/response";
import { isObjectEmpty } from "../utils/utility";
import professionSchema from "../validators/professionSchema";

const professionController = {
  // create profile
  async store(req, res, next) {
    // validation
    const { error } = professionSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { experience_year, experience_note, qualification } = req.body;
    let document,
      success,
      message = "",
      statusCode,
      profession;

    try {
      profession = await Profession.create({
        experience_year,
        experience_note,
        qualification,
        user: req.user._id,
      });
      if (profession) {
        await User.findOneAndUpdate(
          { _id: req.user._id },
          {
            profession: profession._id,
          },
          { new: true }
        );
        (message = "create profession info successfully"),
          (statusCode = 201),
          (success = true);
      } else {
        message = "not create";
        success = false;
        statusCode = 404;
      }
    } catch (err) {
      return next(err);
    }
    document = {
      statusCode,
      success,
      message,
      data: profession,
    };
    res.status(statusCode).json(document);
  },
  async index(req, res, next) {
    let document, statusCode, success, message, profession;

    try {
      profession = await Profession.find();
      if (profession) {
        success = true;
        statusCode = 200;
        message = "get all profession info users  successfully";
      } else {
        message = "not found";
        success = false;
        statusCode = 404;
      }
    } catch (err) {
      return next(err);
    }
    document = {
      statusCode,
      success,
      message,
      data: profession,
    };

    res.status(statusCode).json(document);
  },
  async show(req, res, next) {
    let document, statusCode, success, message, profession;

    try {
      profession = await Profession.find({ user: req.params.userId });
      if (profession) {
        success = true;
        statusCode = 200;
        message = "profession info get successfully";
      } else {
        message = "not found";
        success = false;
        statusCode = 404;
      }
    } catch (err) {
      return next(err);
    }
    document = {
      statusCode,
      success,
      message,
      data: profession,
    };
    res.status(statusCode).json(document);
  },

  //update profile info
  async update(req, res, next) {
    // validation
    const { error } = professionSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { experience_year, experience_note, qualification } = req.body;
    let document,
      success,
      message = "",
      statusCode,
      profession;

    try {
      profession = await Profession.findByIdAndUpdate(
        { _id: req.params.id },
        {
          experience_year: experience_year,
          experience_note: experience_note,
          qualification: qualification,
          // user: req.user._id,
        },
        { new: true }
      );
      if (profession) {
        success = true;
        statusCode = 200;
        message = "profession info update successfully";
      } else {
        message = "not found";
        success = false;
        statusCode = 404;
      }
      document = {
        statusCode,
        success,
        message,
        profession: profession,
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },

  //update verification process
  async updateVerificationProcess(req, res, next) {
    let profession;
    const { verification } = req.body;
    // validation
    if (isObjectEmpty(verification) && !verification.document) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_ACCEPTABLE,
        "Verification Document Is Missing!",
        null
      );
    }

    try {
      profession = await Profession.findOneAndUpdate(
        { user: req.params.id },
        {
          verification_process: verification,
          verification_status: "verified",
        },
        { new: true }
      );

      if (!profession) {
        return errorResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Verification Process Not Added!",
          null
        );
      }
      return successResponse(
        res,
        next,
        { profession },
        HTTP_STATUS.CREATED,
        "Verification Process Added Successfully!"
      );
    } catch (err) {
      return next(err);
    }
  },
};

export default professionController;
