import { Personal, User } from "../../models";
import Joi, { ref } from "joi";
import bcrypt from "bcrypt";
import CustomErrorHandler from "../../services/CustomErrorHandler";

const userController = {
  async me(req, res, next) {
    try {
      const user = await User.findOne({ _id: req.user._id }).select(
        "-password -updatedAt -__v"
      );
      if (!user) {
        return next(CustomErrorHandler.notFound());
      }

      res.json(user);
    } catch (err) {
      return next(err);
    }
  },

  // Edit name
  async editName(req, res, next) {
    const { name } = req.body;
    let document;

    try {
      document = await Personal.findByIdAndUpdate(
        { _id: req.params.id },
        {
          name,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }

    res.status(201).json(document);
  },

  // Edit email
  async editEmail(req, res, next) {
    const { email } = req.body;
    let document;

    try {
      document = await User.findByIdAndUpdate(
        { _id: req.params.id },
        {
          email: email,
        },
        { new: true }
      );

      res.status(201).json(document);
    } catch (err) {
      return next(err);
    }
  },

  // Edit Phone
  async editPhone(req, res, next) {
    const { phone } = req.body;
    let document;

    try {
      document = await User.findByIdAndUpdate(
        { _id: req.params.id },
        {
          phone,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }

    res.status(201).json(document);
  },

  // Edit Password
  async editPassword(req, res, next) {
    // check if user exist in database already
    let user, document;
    const { oldPassword, password } = req.body;
    if (!oldPassword || !password) {
      return next(
        CustomErrorHandler.wrongCredentials("password or old password missing!")
      );
    }

    try {
      user = await User.findById({ _id: req.params.id });

      if (!user) {
        return next(CustomErrorHandler.wrongCredentials("User doesn't exist!"));
      }

      // compare password
      const match = await bcrypt.compare(oldPassword, user.password);

      if (!match) {
        return next(CustomErrorHandler.wrongCredentials("wrong password"));
      }

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is salt rounds
      document = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          password: hashedPassword,
        },
        { new: true }
      ).select("-__v -updatedAt -password");
    } catch (err) {
      return next(err);
    }

    return res.status(200).json({
      message: "Password updated successfully...",
      statusCode: 200,
      success: true,
      data: document,
    });
  },
};

export default userController;
