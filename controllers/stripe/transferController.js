import CustomErrorHandler from "../../services/CustomErrorHandler";
import { STRIPE_SECRET_KEY } from "../../config";
import { errorResponse } from "../../utils/response";
import { HTTP_STATUS } from "../../utils/constants";
import { Payment } from "../../models";
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const transferController = {
  //create customers
  async store(req, res, next) {
    let documents;

    const { sender, reciver, currency, amount, subamount } = req.body;
    try {
      if (!sender || !reciver || !currency || !amount || !subamount) {
        res.status(500).json("Please add all requirements");
      }

      const balanceTransaction = await stripe.customers.createBalanceTransaction(sender, {
        amount: amount,
        currency: currency,
      });
      let balanceReciver = await stripe.customers.createBalanceTransaction(reciver, { amount: subamount, currency: currency });
      const updateTransfer = await Payment.findOneAndUpdate(
        { cus_id: sender },
        {
          $push: {
            trnsactions: {
              reciver: balanceReciver,
              sender: balanceTransaction,
            },
          },
        },
        { new: true }
      );
      const updateReciver = await Payment.findOneAndUpdate(
        { cus_id: reciver },
        {
          $push: {
            trnsactions: {
              reciver: balanceReciver,
              sender: balanceTransaction,
            },
          },
        },
        { new: true }
      );
      if (updateTransfer && updateReciver) {
        res.status(200).json({
          reciver: balanceReciver,
          sender: balanceTransaction,
        });
      } else {
        return errorResponse(res, HTTP_STATUS.BAD_GATEWAY, "error in update");
      }
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    // res.status(201).json(documents);
  },

  //get particular customer
  async show(req, res, next) {
    let documents;
    try {
      if (req.params.id) {
        documents = await stripe.customers.retrieve(req.params.id);
      } else {
        return next(CustomErrorHandler.emptyState());
      }
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(201).json(documents);
  },

  async transfer(req, res, next) {
    try {
      const { amount, currency } = req.body;

      // Use proper error handling based on your use case
      if (!amount || !currency) {
        return res.status(400).json({ error: "Amount and currency are required." });
      }

      const transferPayment = await stripe.transfers.create({
        amount: amount,
        currency: currency,
        destination: req.params.id,
      });

      res.status(201).json(transferPayment);
    } catch (error) {
      console.error("Error creating transfer:", error);

      // Handle specific Stripe errors and provide appropriate responses
      if (error.type === "StripeInvalidRequestError") {
        return res.status(400).json({ error: error.message });
      } else if (error.type === "StripeCardError") {
        return res.status(402).json({ error: error.message });
      } else {
        return res.status(500).json({ error: "An error occurred while processing the transfer." });
      }
    }
  },

  async payoutBankAccount(req, res, next) {
    const { amount, currency } = req.body;
    console.log("req.params.bank_account_id", req.params.bank_account_id);
    stripe.payouts.create(
      {
        amount,
        currency,
        method: "instant",
        destination: req.params.bank_account_id,
      },
      (err, payout) => {
        if (err) {
          console.error("Error:", err.message);
          return errorResponse(res, HTTP_STATUS.BAD_REQUEST, err.message);
        } else {
          console.log("Payout:", payout);
          res.status(201).json(payout);
        }
      }
    );
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

export default transferController;
