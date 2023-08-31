import { Video } from "../models";
import { HTTP_STATUS } from "../utils/constants";
import { successResponse, errorResponse } from "../utils/response";
import videoSchema from "../validators/videoSchema";
const videoController = {
  // create profile
  async store(req, res, next) {
    // validation
    const { error } = videoSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const {
      topic,
      video_links,
      video_category,
      video_details,
      price,
      video_thumbnail,
    } = req.body;
    let document,
      success,
      message = "",
      statusCode,
      video;

    try {
      video = await Video.create({
        topic,
        video_links,
        video_category,
        video_details,
        price,
        video_thumbnail,
        user: req.user._id,
      });
      if (video) {
        (message = "created successfully"),
          (statusCode = 201),
          (success = true);
      } else {
        message = "not create";
        success = false;
        statusCode = 404;
      }
      document = {
        statusCode,
        success,
        message,
        data: video,
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },
  async update(req, res, next) {
    try {
      const { error } = videoSchema.validate(req.body);
      if (error) {
        return next(error);
      }
      let updateVideo;
      const {
        topic,
        video_links,
        video_category,
        video_details,
        price,
        video_thumbnail,
      } = req.body;
      updateVideo = await Video.findByIdAndUpdate(
        { _id: req.params.videoId },
        {
          topic,
          video_links,
          video_category,
          video_details,
          price,
          video_thumbnail,
          user: req.user._id,
        },
        { new: true }
      );

      if (updateVideo) {
        return successResponse(
          res,
          next,
          updateVideo,
          HTTP_STATUS.OK,
          "update video successfully"
        );
      } else {
        return errorResponse(
          res,
          HTTP_STATUS.NOT_MODIFIED,
          "update video in db unsuccessfully",
          updateVideo
        );
      }
    } catch (err) {
      return next(err);
    }
  },
  async destroy(req, res, next) {
    let video;
    try {
      video = await Video.findByIdAndRemove({ _id: req.params.videoId });
      if (video) {
        return successResponse(
          res,
          next,
          null,
          HTTP_STATUS.OK,
          "deleted video successfully"
        );
      } else {
        return errorResponse(
          res,
          HTTP_STATUS.GONE,
          "video not found for delete",
          null
        );
      }
    } catch (error) {
      return next(error);
    }
  },

  async getTrainerVideos(req, res, next) {
    try {
      const videos = await Video.find({ user: req.params.trainerId });
      return successResponse(
        res,
        next,
        videos,
        HTTP_STATUS.OK,
      );
    } catch (error) {
      throw new Error(error);
    }
  },

  async index(req, res, next) {
    try {
      const booking = await Video.aggregate([
        {
          $lookup: {
            from: "users",
            as: "trainer",
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
              { $unwind: "$personal" },
            ],
          },
        },
        {
          $lookup: {
            from: "reviews",
            as: "reviews",
            let: { videoId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$video", "$$videoId"] },
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
                    { $unwind: "$personal" },
                  ],
                },
              },
              { $unwind: "$user" },
            ],
          },
        },

        { $unwind: "$trainer" },
      ]).exec();

      return successResponse(
        res,
        next,
        booking,
        HTTP_STATUS.OK,
        "get videos successfully"
      );
    } catch (err) {
      return next(err);
    }
  },
};

export default videoController;
