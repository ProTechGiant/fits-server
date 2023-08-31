import { STRIPE_SECRET_KEY } from "../../config";
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const bankController = {
  //create customers card
  async store(req, res, next) {
    try {
      await stripe.balance.retrieve(function (err, balance) {
      });
      let transferAmount = await stripe.transfers.create({
        amount: 1000,
        currency: "eur",
        destination: "acct_1Ke2SXBQCIvi9wib",
        transfer_group: "{ORDER10}",
      });
      const payout = await stripe.payouts.create({
        amount: 1,
        currency: "eur",
      });

      const transfer = await stripe.transfers.create({
        amount: 1,
        currency: "eur",
        destination: "acct_1Ke2SXBQCIvi9wib",
        // transfer_group: "ORDER_95",
      });
    } catch (error) {
      return next(error);
    }
  },
  async show(req, res, next) {
    const { bankAccount_id } = req.body;

    try {
      if (!bankAccount_id) {
        const { error } = cardSchema.validate(req.body);
        res.status(500).json(error);
      }
      const bankAccount = await stripe.customers.createSource(
        req.params.cus_id,
        bankAccount_id
      );
      return res.status(201).json({
        message: "create bank account",
        statusCode: 201,
        success: true,
        data: bankAccount,
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
        statusCode: 500,
        success: false,
        data: null,
        stack: err.stack,
      });
    }
  },
};

export default bankController;
