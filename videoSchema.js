import Joi from "joi";

const videoSchema = Joi.object({
  topic: Joi.string().min(3).max(80).required(),
  video_links: Joi.string().required(),
  video_category: Joi.string().required(),
  video_details: Joi.string().required(),
  video_thumbnail: Joi.string().required(),
  price: Joi.number().required(),
});

export default videoSchema;
