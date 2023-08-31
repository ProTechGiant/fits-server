import { Personal, Review, Session, Video } from "../models";
import { errorResponse, successResponse } from "../utils/response";
import { HTTP_STATUS } from "../utils/constants";

const ratingController = {
  // create profile
  async store(req, res, next) {
    const { body } = req
    if (!body.trainerId) {
      return errorResponse(res, HTTP_STATUS.NOT_ACCEPTABLE, "trainerId Is Missing!", null);
    }
    const traineeDetail = await Personal.findById(body.reviews.userId);
    const trainerDetails = await Personal.findById(body.trainerId);
    const existingReview = await Review.findOne({
      $and: [
        { ["trainee._id"]: body.reviews.userId },
        { $and: [{ trainer: body.trainerId, reviewFor: body.reviewFor }] }
      ]
    });

    if (existingReview) {
      existingReview.rating = body.reviews.rating;
      existingReview.comment = body.reviews.comment;
      const updatedReview = await existingReview.save();


      if (body.reviewFor === "video") {
        if (!body.videoId) {
          return errorResponse(res, HTTP_STATUS.NOT_ACCEPTABLE, "videoId Is Missing!", null);
        }
        const video = await Video.findById(body.videoId);
        const newAverageRating = getAverage(body.reviews.rating, video.averageRating);
        await Video.findByIdAndUpdate(body.videoId, { averageRating: newAverageRating, numReviews: video.numReviews + 1 });
      } else if (body.reviewFor === "session") {
        if (!body.sessionId) {
          return errorResponse(res, HTTP_STATUS.NOT_ACCEPTABLE, "sessionId Is Missing!", null);
        }
        const session = await Session.findById(body.sessionId);
        const newAverageRating = getAverage(body.reviews.rating, session.averageRating);
        await Session.findByIdAndUpdate(body.sessionId, { averageRating: newAverageRating, numReviews: session.numReviews + 1 });
      }

      return successResponse(
        res,
        next,
        { review: updatedReview },
        HTTP_STATUS.OK,
        "Thanks for reviewed"
      );
    } else {
      const saveReview = {
        rating: body.reviews.rating,
        comment: body.reviews.comment,
        trainer: trainerDetails,
        reviewFor: body.reviewFor,
        trainee: traineeDetail,
      };

      if (body.reviewFor === "video") {
        if (!body.videoId) {
          return errorResponse(res, HTTP_STATUS.NOT_ACCEPTABLE, "videoId Is Missing!", null);
        }
        const video = await Video.findById(body.videoId);
        const newAverageRating = getAverage(body.reviews.rating, video.averageRating);
        await Video.findByIdAndUpdate(body.videoId, { averageRating: newAverageRating, numReviews: video.numReviews + 1 });
        saveReview.video = body.videoId;
      } else if (body.reviewFor === "session") {
        if (!body.sessionId) {
          return errorResponse(res, HTTP_STATUS.NOT_ACCEPTABLE, "sessionId Is Missing!", null);
        }
        const session = await Session.findById(body.sessionId);
        const newAverageRating = getAverage(body.reviews.rating, session.averageRating);
        await Session.findByIdAndUpdate(body.sessionId, { averageRating: newAverageRating, numReviews: session.numReviews + 1 });
        saveReview.session = body.sessionId;
      }

      const newReview = new Review(saveReview);
      const savedReview = await newReview.save();

      return successResponse(
        res,
        next,
        { review: savedReview },
        HTTP_STATUS.CREATED,
        "Thanks for reviewed"
      );
    }
  },


  //Review Show trainer
  async show(req, res, next) {
    let document,
      success,
      message = "",
      statusCode,
      reviewing;
    try {
      reviewing = await Review.find({ trainer: req.params.id });
      if (reviewing) {
        (message = "get successfully"), (statusCode = 200), (success = true);
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
      data: reviewing,
    };
    res.status(statusCode).json(document);
  },
};

export default ratingController;


function getAverage(num1, num2) {
  return (num1 + num2) / 2;
}