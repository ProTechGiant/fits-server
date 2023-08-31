import { Payment, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { STRIPE_SECRET_KEY } from "../../config";
import { errorResponse, successResponse } from "../../utils/response";
import { HTTP_STATUS } from "../../utils/constants";
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const cardController = {
  //create customers card
  async store(req, res, next) {
    const { card_number, exp_month, exp_year, cvc } = req.body;
    let documents;
    let updateCustomer;
    let tok_card;
    try {
      console.log("calllllll", card_number, exp_month, exp_year, cvc, req.params);
      if (!card_number || !exp_month || !exp_year || !cvc) {
        const { error } = cardSchema.validate(req.body);
        res.status(500).json(error);
      }
      await stripe.tokens
        .create({
          card: {
            number: parseInt(card_number),
            exp_month: parseInt(exp_month),
            exp_year: parseInt(exp_year),
            cvc: parseInt(cvc),
          },
        })
        .then(async (response) => {
          tok_card = response.id;
          documents = await stripe.customers.createSource(req.params.id, {
            source: response.id,
          });

          updateCustomer = await Payment.updateOne(
            { cus_id: req.params.id },
            {
              card_id: documents.id,
              tok_card,
            },
            { new: true }
          );
          const updateUser = await User.findByIdAndUpdate({ _id: req.user._id }, { cardCreated: true });
          if (updateCustomer && updateUser) {
            return successResponse(res, next, documents, HTTP_STATUS.OK, "card created successfully...");
          } else {
            return errorResponse(res, HTTP_STATUS.FORBIDDEN, null, "database does't updated");
          }
        });
    } catch (err) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, err.message);
    }
  },
  async show(req, res, next) {
    let documents;

    try {
      if (req.params.id && req.body.card_id) {
        console.log("first");
        documents = await stripe.customers.retrieveSource(req.params.id, req.body.card_id);
      } else {
        return next(CustomErrorHandler.emptyState());
      }
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return successResponse(res, next, documents, HTTP_STATUS.CREATED, "customer card get successfully");
  },
  //update card data
  async update(req, res, next) {
    //card not update because we are not live mode
    let documents;
    const { card_id, address_city } = req.body;
    try {
      documents = await stripe.customers.updateSource(req.params.id, card_id, {
        address_city: address_city,
      });
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(201).json(documents);
  },
  //delete card
  async destroy(req, res, next) {
    let documents;
    try {
      documents = await stripe.customers.del(req.params.id);
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(201).json(documents);
  },
};

export default cardController;
