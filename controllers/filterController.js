import { Session } from "../models";
import { HTTP_STATUS } from "../utils/constants";
import { errorResponse, successResponse } from "../utils/response";

const filterController = {
  // filter multiple records
  async filter(req, res, next) {
    const { sports, min_price, max_price, type, sort_by } = req.body;
    let document;
    try {
      document = await Session.aggregate([
        {
          $match: {
            $or: [
              { sports: sports },
              {
                "session_type.type": type,
              },
              { price: { $gte: min_price, $lt: max_price } },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            as: "user",
            let: { user_id: "$user" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$_id", "$$user_id"] }],
                  },
                },
              },
              {
                $lookup: {
                  from: "personals",
                  as: "personal",
                  localField: "personal",
                  foreignField: "_id",
                },
              },
              {
                $lookup: {
                  from: "professions",
                  as: "profession",
                  localField: "profession",
                  foreignField: "_id",
                },
              },
            ],
          },
        },
        { $unwind: "$user" },
      ]).sort(
        sort_by === "highest_rating"
          ? { averageRating: -1, numReviews: -1 }
          : {
            createdAt: -1,
          }
      );

      if (document.length == 0) {
        return errorResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "No Search Results Found!",
          null
        );
      }

      return successResponse(
        res,
        next,
        { result: document },
        HTTP_STATUS.OK,
        "Search Results Found!"
      );
    } catch (err) {
      return next(err);
    }
  },

  // search class_title and date
  async search(req, res, next) {
    const { class_date, class_title } = req.body;
    let document;

    var classTitle = new RegExp(class_title, "i");

    try {
      document = await Session.find({
        $or: [{ class_title: classTitle }, { select_date: class_date }],
      }).sort({ createdAt: -1 });

      if (document.length == 0) {
        return errorResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "No Search Results Found!",
          null
        );
      }

      return successResponse(
        res,
        next,
        { result: document },
        HTTP_STATUS.OK,
        "Search Results Found!"
      );
    } catch (err) {
      return next(err);
    }
  },

  async update(req, res, next) { },

  async destroy(req, res, next) { },

  async index(req, res, next) { },

  async show(req, res, next) { },
};

export default filterController;
