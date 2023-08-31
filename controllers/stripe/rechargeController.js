import CustomErrorHandler from "../../services/CustomErrorHandler";
import { STRIPE_SECRET_KEY } from "../../config";
import { Payment, User } from "../../models";
import { errorResponse, successResponse } from "../../utils/response";
import { HTTP_STATUS } from "../../utils/constants";
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const rechargeController = {
  //create customers
  async store(req, res, next) {
    let charge;
    const { amount, currency, description, source } = req.body;
    try {
      if (!amount || !currency || !description) {
        res.status(422).json("Please add all requirements");
      }

      if (source) {
        charge = await stripe.charges.create({
          amount: amount * 100,
          currency: currency,
          customer: req.params.cus_id,
          source: source,
          description: description,
        });
        if (charge) {
          await Payment.findOneAndUpdate(
            { cus_id: req.params.cus_id },
            {
              $push: {
                trnsactions: {
                  type: "recharge",
                  recharge: charge,
                },
              },
            },
            { new: true }
          );
        }
        const getUser = await User.findById({ _id: req.user._id });
        const sum = getUser.amount + amount;
        const updateUserAmount = await User.findByIdAndUpdate({ _id: req.user._id }, { amount: sum });

        if (updateUserAmount) {
          stripe.customers
            .update(req.params.cus_id, {
              balance: sum,
            })
            .then((resp) => {
              return successResponse(res, next, charge, HTTP_STATUS.OK, "create successfully");
            });
        } else {
          return errorResponse(res, HTTP_STATUS.NOT_MODIFIED, "Payment not update in db", null);
        }
      }
      // });
    } catch (err) {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, err.message, null);
    }
  },

  //get particular customer
  async show(req, res, next) {
    let documents;
    try {
      if (req.params.id) {
        documents = await stripe.customers.retrieve(req.params.id, {
          expend: ["default_source"],
        });
      } else {
        return next(CustomErrorHandler.emptyState());
      }
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(201).json(documents);
  },
  async update(req, res, next) {
    let documents;
    try {
      documents = await stripe.customers.update(req.params.id, {
        balance: req.body.balance,
      });
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(201).json(documents);
  },
};

export default rechargeController;
