import { STRIPE_SECRET_KEY } from "../../config";
import { errorResponse, successResponse } from "../../utils/response";
import { HTTP_STATUS } from "../../utils/constants";
import { Payment, User } from "../../models";
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const connectController = {
  async createExpressAccount(req, res, next) {
    try {
      const getPayment = await Payment.findById({
        _id: req.params.id,
      });
      if (!getPayment.account_id) {
        await stripe.accounts
          .create({
            type: "express",
            country: "US",
            email: req.body.email,
            requested_capabilities: ["card_payments", "transfers"],
          })
          .then(async (resp) => {
            await Payment.findByIdAndUpdate(
              { _id: req.params.id },
              {
                account_id: resp.id,
              },
              {
                new: true,
              }
            ).then((response) => {
              return successResponse(res, next, response, HTTP_STATUS.OK, "Create Express Account id Successfully!");
            });
          });
      } else {
        return errorResponse(res, HTTP_STATUS.CONFLICT, "Account Already Created!");
      }
    } catch (error) {
      return next(error);
    }
  },
  async createExpressAccountLink(req, res, next) {
    try {
      let account;
      const { email, country, type } = req.body;
      const getPaymentAccount = await Payment.findOne({
        user: req.user._id,
      });
      if (getPaymentAccount === null) {
        return errorResponse(res, HTTP_STATUS.BAD_GATEWAY, "Before Create stripe customer account");
      }
      account = await stripe.accounts.retrieve(getPaymentAccount.account_id);

      if (account.capabilities.transfers !== "inactive") {
        return errorResponse(res, HTTP_STATUS.CONFLICT, `Account is Already Active`, account);
      }
      if (!getPaymentAccount.account_id) {
        await stripe.accounts
          .create({
            type,
            country,
            email,
            requested_capabilities: ["card_payments", "transfers"],
          })
          .then(async (resp) => {
            await Payment.findOneAndUpdate(
              { user: req.user._id },
              {
                account_id: resp.id,
              },
              {
                new: true,
              }
            ).then(async (response) => {
              account = await stripe.accounts.retrieve(response.account_id);

              if (!account) {
                return errorResponse(res, HTTP_STATUS.NOT_FOUND, "No Account Found!");
              }

              const getPayment = await Payment.findOne({
                user: req.user._id,
              });

              const accountLink = await stripe.accountLinks.create({
                account: getPayment.account_id,
                refresh_url: "https://fits-api-server.herokuapp.com",
                return_url: "https://fits-api-server.herokuapp.com",
                type: "account_onboarding",
              });
              if (!accountLink) {
                return errorResponse(res, HTTP_STATUS.NOT_FOUND, "No Account Link Create!");
              }

              return successResponse(res, next, accountLink, HTTP_STATUS.OK, "Create Express Account Link Successfully!");
            });
          });
      } else {
        account = await stripe.accounts.retrieve(getPaymentAccount.account_id);

        if (account.capabilities.transfers !== "inactive") {
          return errorResponse(res, HTTP_STATUS.CONFLICT, "Account is Already Active");
        }

        const accountLink = await stripe.accountLinks.create({
          account: getPaymentAccount.account_id,
          refresh_url: "https://fits-api-server.herokuapp.com",
          return_url: "https://fits-api-server.herokuapp.com",
          type: "account_onboarding",
        });

        if (!accountLink) {
          return errorResponse(res, HTTP_STATUS.NOT_FOUND, "No Account Link Create!");
        }

        return successResponse(res, next, accountLink, HTTP_STATUS.OK, "Create Express Account Link Successfully!");
      }
    } catch (error) {
      return next(error);
    }
  },

  async fetchExpressAccount(req, res, next) {
    let account;

    try {
      account = await stripe.accounts.retrieve(req.params.id);

      if (!account) {
        return errorResponse(res, HTTP_STATUS.NOT_FOUND, "No Account Found!");
      }

      return successResponse(res, next, account, HTTP_STATUS.OK, "Get Express Account Successfully!");
    } catch (error) {
      return next(error);
    }
  },
};

export default connectController;
