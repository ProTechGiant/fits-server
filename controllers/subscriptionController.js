import Subscription from "../models/subscription";
import Video from "../models/video";
import { Personal } from "../models";
import { HTTP_STATUS } from "../utils/constants";
import { errorResponse, successResponse } from "../utils/response";
import subscriptionSchema from "../validators/subscription";
import user from "../models/user";

const subscriptionController = {
  // create profile
  async store(req, res, next) {
    // validation
    const { error } = subscriptionSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { video_links } = req.body;
    let subscribeVideo, alreadySubscribe;

    try {
      alreadySubscribe = await Subscription.findOne({ user: req.user._id });

      if (!alreadySubscribe) {
        subscribeVideo = await Subscription.create({
          video_links: [{ video_links }],
          user: req.user._id,
        });
      } else {
        const checkVideoAlredayExist = alreadySubscribe.video_links.find((item, i) => {
          return item.video_links === video_links;
        });

        if (checkVideoAlredayExist) {
          return errorResponse(res, HTTP_STATUS.CONFLICT, "already subscribe this video ", null);
        }
        await Subscription.findOneAndUpdate(
          { user: req.user._id },
          {
            $push: {
              video_links: {
                video_links,
              },
            },
          }
        );
      }

      return successResponse(res, next, subscribeVideo, HTTP_STATUS.OK, "subscribe videos successfully");
    } catch (err) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, err, null);
    }
  },

  //get all subscriptions videos

  async index(req, res, next) {
    let subscribeVideo;

    try {
      subscribeVideo = await Subscription.find({});

      return successResponse(res, next, subscribeVideo, HTTP_STATUS.OK, "subscribe videos successfully");
    } catch (err) {
      return next(err);
    }
  },

  async show(req, res, next) {
    try {
      const subscribeVideos = await Subscription.findOne({ user: req.user._id });

      const allVideos = await Video.find()

      const traineeVideos = allVideos.filter((video) => {
        const foundLink = subscribeVideos.video_links.find((link) => {
          return video.video_links === link.video_links;
        });

        return foundLink !== undefined;
      });

      const videosWithTrainer = []

      for (const video of traineeVideos) {
        const trainer = await Personal.findOne({ user: video.user });
        videosWithTrainer.push({ ...video.toObject(), user: trainer.toObject() });
      }

      res.status(200).json(videosWithTrainer);
    } catch (err) {
      return next(err);
    }
  }
};

export default subscriptionController;
