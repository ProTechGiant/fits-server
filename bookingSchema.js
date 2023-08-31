import Joi from "joi";

const bookingSchema = Joi.object({
  sessionId: Joi.string().required(),
  trainerId: Joi.string().required(),
  amount: Joi.number().required(),
  subamount: Joi.number().required(),
  currency: Joi.string().required(),
  sender: Joi.string().required(),
  receiver: Joi.string().required(),
});

export default bookingSchema;
