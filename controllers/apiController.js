import { config } from "aws-sdk";
const apiController = {
  async api(_req, res, next) {
    try {
      return res.json({
        message: "Welcome To Fits Backend API",
      });
    } catch (error) {
      return next(error);
    }
  },
};
config.update({ region: "us-east-1" });

export default apiController;
