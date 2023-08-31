import { Personal, User } from "../models";
import profileSchema from "../validators/profileSchema";

const personalController = {
  // create profile
  async store(req, res, next) {
    // validation
    const { error } = profileSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const {
      name,
      date_of_birth,
      country,
      state,
      city,
      gender,
      profileImage,
      phoneNumber,
    } = req.body;
    let document,
      success,
      message = "",
      statusCode,
      personal;

    try {
      const checkPersonal = await Personal.findOne({ user: req.user._id });
      if (checkPersonal) {
        success = false;
        statusCode = 409;
        message = "personal info  already exist";
        document = {
          statusCode,
          success,
          message,
          data: checkPersonal,
        };
        res.status(statusCode).json(document);
      }
      personal = await Personal.create({
        name,
        date_of_birth,
        country,
        state,
        city,
        gender,
        user: req.user._id,
        profileImage,
        phoneNumber,
      });
      if (personal) {
        await User.findByIdAndUpdate(
          { _id: req.user._id },
          {
            personal: personal._id,
          },
          { new: true }
        );
        success = true;
        statusCode = 201;
        message = "personal info create successfully";
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
      data: personal,
    };
    res.status(statusCode).json(document);
  },
  async index(req, res, next) {
    let document,
      success,
      message = "",
      statusCode,
      personal;
    try {
      personal = await Personal.find();
      if (personal) {
        success = true;
        statusCode = 200;
        message = "get all personal info  successfully";
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
      data: personal,
    };

    res.status(statusCode).json(document);
  },
  async show(req, res, next) {
    let document,
      success,
      message = "",
      statusCode,
      personal;
    try {
      personal = await Personal.find({ user: req.params.userId });
      if (personal) {
        success = true;
        statusCode = 200;
        message = "get personal info  successfully";
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
      data: personal,
    };

    res.status(statusCode).json(document);
  },

  //update profile info
  async update(req, res, next) {
    const {
      name,
      date_of_birth,
      country,
      state,
      city,
      gender,
      profileImage,
      user,
      phoneNumber,
    } = req.body;
    let document,
      success,
      message = "",
      statusCode,
      personal;

    try {
      let userType;
      if (req.user.role === "admin") {
        userType = user;
      } else {
        userType = req.user._id;
      }
      personal = await Personal.findByIdAndUpdate(
        { _id: req.params.id },
        {
          name,
          date_of_birth,
          country,
          state,
          city,
          gender,
          user: userType,
          profileImage,
          phoneNumber,
        },
        { new: true }
      );
      if (personal) {
        success = true;
        statusCode = 200;
        message = "update personal info  successfully";
      } else {
        message = "not found";
        success = false;
        statusCode = 404;
      }
      document = {
        statusCode,
        success,
        message,
        data: personal,
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },
};

export default personalController;
