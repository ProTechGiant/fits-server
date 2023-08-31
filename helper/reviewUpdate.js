import { Review, Session, User, Video } from "../models";

const updateReview = async (next, obj) => {
  let document,
    reviewing,
    findById = {},
    setResult = {};

  try {
    if (obj.reviewFor === "trainer" && obj.trainerId) {
      reviewing = await Review.find({
        $and: [{ trainer: obj.trainerId }, { reviewFor: "trainer" }],
      });
      findById._id = obj.trainerId;
    } else if (obj.reviewFor === "session" && obj.sessionId) {
      reviewing = await Review.find({
        $and: [{ session: obj.sessionId }, { reviewFor: "session" }],
      });
      findById._id = obj.sessionId;
    } else if (obj.reviewFor === "video" && obj.videoId) {
      reviewing = await Review.find({
        $and: [{ video: obj.videoId }, { reviewFor: "video" }],
      });
      findById._id = obj.videoId;
    }
    var sum = 0;

    const reviewsRecive = reviewing.length;
    reviewing.map((item, index) => {
      sum = sum + item.rating;
    });
    const average = sum / reviewsRecive;
    setResult.numReviews = reviewsRecive;
    setResult.averageRating = average;
    if (obj.reviewFor === "trainer" && obj.trainerId) {
      document = await User.findByIdAndUpdate(findById, setResult);
    } else if (obj.reviewFor === "session" && obj.sessionId) {
      document = await Session.findByIdAndUpdate(findById, setResult);
    } else if (obj.reviewFor === "video" && obj.videoId) {
      document = await Video.findByIdAndUpdate(findById, setResult);
    }
    document = await User.findByIdAndUpdate(findById, setResult);
    return document;
  } catch (err) {
    return next(err);
  }
};

export default updateReview;
