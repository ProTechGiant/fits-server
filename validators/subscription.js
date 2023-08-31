import Joi from "joi";

const subscriptionSchema = Joi.object({
  video_links: Joi.string().required(),
});

export default subscriptionSchema;
