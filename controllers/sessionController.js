import { Personal, Profession, Session, User } from "../models";
import { HTTP_STATUS } from "../utils/constants";
import { errorResponse } from "../utils/response";
import onlineSchema from "../validators/sessionValidators/online";
import physicalSchema from "../validators/sessionValidators/physicalSchema";
import recordedSchema from "../validators/sessionValidators/recordedSchema";
import sessionSchema from "../validators/sessionValidators/sessionSchema";

const sessionController = {
  // get  All classes/or sessions
  async index(req, res, next) {
    let document,
      success,
      message = "",
      statusCode,
      classes,
      session_user,
      profession_info,
      personal_info;
    let user_ids;
    try {
      classes = await Session.find().select("-updatedAt -__v").sort({ createdAt: -1 }).populate({ path: "user" });

      if (classes) {
        session_user = await Session.find();

        if (session_user) {
          user_ids = session_user.map((item) => item.user);
          personal_info = await Personal.find({ user: { $in: user_ids } });
          profession_info = await Profession.find({ user: { $in: user_ids } });
        }
        success = true;
        statusCode = 200;
        message = "all classes get successfully";
      } else {
        message = "not found";
        success = false;
        statusCode = 404;
      }
      document = {
        statusCode,
        success,
        message,
        data: {
          classes,
          personal_info,
          profession_info,
        },
      };

      res.status(statusCode).json(document);
    } catch (error) {
      return next(error);
    }
  },
  async recommended(req, res, next) {
    try {
      const classes = await Session.find({ recommended: true }).select("-updatedAt -__v").sort({ createdAt: -1 }).populate({ path: "user" });

      let user_ids = classes.map((item) => item.user);
      const [personal_info, profession_info] = await Promise.all([Personal.find({ user: { $in: user_ids } }), Profession.find({ user: { $in: user_ids } })]);

      const success = true;
      const statusCode = 200;
      const message = "All recommended classes retrieved successfully";

      const document = {
        statusCode,
        success,
        message,
        data: {
          classes,
          personal_info,
          profession_info,
        },
      };

      res.status(statusCode).json(document);
    } catch (error) {
      return next(error);
    }
  },

  // create session
  async store(req, res, next) {
    const { session_title, class_title, select_date, class_time, duration, equipment, session_type, sports, details, price, no_of_slots, image } = req.body;
    // validation
    const { error } = sessionSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    let document,
      success,
      message = "",
      statusCode,
      session;

    try {
      session = await Session.create({
        session_title,
        class_title,
        select_date,
        class_time,
        duration,
        equipment,
        session_type,
        sports,
        details,
        price,
        no_of_slots,
        user: req.user._id,
        image,
      });
      if (session) {
        (message = "created successfully"), (statusCode = 201), (success = true);
      } else {
        message = "not create";
        success = false;
        statusCode = 404;
      }
      document = {
        statusCode,
        success,
        message,
        data: session,
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },

  async update(req, res, next) {
    const {
      session_title,
      class_title,
      select_date,
      class_time,
      duration,
      equipment,
      session_type,
      sports,

      details,
      price,
      no_of_slots,
      image,
    } = req.body;
    let document,
      success,
      message = "",
      statusCode,
      session;

    try {
      session = await Session.findByIdAndUpdate(
        { _id: req.params.id },
        {
          session_title: session_title,
          class_title: class_title,
          select_date: select_date,
          class_time: class_time,
          duration: duration,
          equipment: equipment,
          session_type: session_type,
          sports: sports,

          details: details,
          price: price,
          no_of_slots: no_of_slots,
          image: image,
        },
        { new: true }
      );
      if (session) {
        (message = "update session successfully"), (statusCode = 200), (success = true);
      } else {
        message = "not create";
        success = false;
        statusCode = 404;
      }
      document = {
        statusCode,
        success,
        message,
        data: session,
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },
  async destroy(req, res, next) {
    let document, statusCode;

    try {
      document = await Session.findByIdAndDelete({ _id: req.params.id });

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
        message: "Session Deleted Successfully!",
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },
  async show(req, res, next) {
    let document,
      personal_info,
      profession_info,
      success,
      message = "",
      statusCode,
      session;

    try {
      session = await Session.findById({ _id: req.params.id }).populate("user").select("-updatedAt -__v");
      if (session) {
        personal_info = await Personal.findOne({ user: session.user }).select("-updatedAt -__v");
        profession_info = await Profession.findOne({
          user: session.user,
        }).select("-updatedAt -__v");

        message = "get session successfully";
        statusCode = 200;
        success = true;
      } else {
        message = "not found";
        success = false;
        statusCode = 404;
      }
      document = {
        statusCode,
        success,
        message,
        data: {
          session,
          personal_info,
          profession_info,
        },
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },
  // async recommended(req, res, next) {
  //   try {
  //     const sessions = await Session.find({ recommended: true }).populate("user").select("-updatedAt -__v");
  //     if (!sessions || sessions.length === 0) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "No recommended sessions found.",
  //       });
  //     }

  //     const sessionIds = sessions.map((session) => session.user);
  //     const [personal_info, profession_info] = await Promise.all([Personal.findOne({ user: { $in: sessionIds } }).select("-updatedAt -__v"), Profession.findOne({ user: { $in: sessionIds } }).select("-updatedAt -__v")]);

  //     const data = {
  //       session: sessions,
  //       personal_info,
  //       profession_info,
  //     };

  //     res.status(200).json({
  //       success: true,
  //       message: "Recommended sessions retrieved successfully.",
  //       data,
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // },

  // get trainer booked session
  async getByTrainerId(req, res, next) {
    let document,
      personal_info,
      profession_info,
      success,
      message = "",
      statusCode,
      session;

    try {
      session = await Session.find({ user: req.params.id }).populate("user").select("-updatedAt -__v");
      if (session) {
        personal_info = await Personal.findOne({ user: req.params.id }).select("-updatedAt -__v");
        profession_info = await Profession.findOne({
          user: req.params.id,
        }).select("-updatedAt -__v");

        message = "get session successfully";
        statusCode = 200;
        success = true;
      } else {
        message = "not found";
        success = false;
        statusCode = 404;
      }
      document = {
        statusCode,
        success,
        message,
        data: {
          session,
          personal_info,
          profession_info,
        },
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },
};

export default sessionController;
