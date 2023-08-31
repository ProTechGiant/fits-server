import { User } from "../models";
import CustomErrorHandler from "../services/CustomErrorHandler";

const trainee = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id });

    if (user.role === "trainee") {
      next();
    } else {
      res.status(401).json({ message: "only trainee can do it" });
    }
  } catch (error) {
    return next(CustomErrorHandler.serverError());
  }
};

export default trainee;
