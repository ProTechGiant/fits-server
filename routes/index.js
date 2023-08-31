import express from "express";
const router = express.Router();
import {
  registerController,
  loginController,
  userController,
  profileController,
  personalController,
  professionController,
  fitnessController,
  classesController,
  sessionController,
  videoController,
  reviewController,
  customerController,
  cardController,
  serviceController,
  goalController,
  userMeController,
  usersController,
  rechargeController,
  transferController,
  bankController,
  bookingController,
  messageController,
  filterController,
  dashboardController,
  connectController,
  subscriptionController,
} from "../controllers";
import auth from "../middlewares/auth";
import admin from "../middlewares/admin";
import trainee from "../middlewares/trainee";
import trainer from "../middlewares/trainer";
import role from "../middlewares/role";

//Change password
router.post("/email-send", userController.emailSend);
router.post("/resend-email", userController.resendEmail);
router.post("/code-verify", userController.codeVerify);
router.post("/change-password", userController.changePassword);

// Auth Routes
router.post("/register", role, registerController.register);
router.post("/login", loginController.login);
router.get("/me", auth, userController.me);
router.post("/logout", auth, loginController.logout);
router.get("/users", auth, userController.index);
//all user data profession info && personal info && user info

router.get("/user/me", [auth], userMeController.getUserInfo);
router.get("/user/:userId", [auth], userMeController.showAdmin);

// profile update routes
router.put("/profile/edit/name/:id", auth, profileController.editName);
router.put("/profile/edit/email/:id", auth, profileController.editEmail);
router.put("/profile/edit/phone/:id", auth, profileController.editPhone);
router.put("/profile/edit/password/:id", auth, profileController.editPassword);

// personal Info Route
router.post("/personal", [auth], personalController.store);
router.put("/personal/:id", [auth], personalController.update);
router.get("/personal/:userId", [auth], personalController.show);
router.get("/personal", [auth], personalController.index);
// router.get("/challenges", [auth, admin], personalController.index);
// router.delete("/challenges/:id", [auth, admin], personalController.destroy);

//profession Info Route
router.post("/profession", [auth], professionController.store);
router.put("/profession/:id", [auth], professionController.update);
router.get("/profession", [auth], professionController.index);
router.get("/profession/:userId", [auth], professionController.show);
router.put("/profession/verification/:id", [auth], professionController.updateVerificationProcess);
// Orders Routes
// router.post("/orders", [auth, admin], orderController.store);
// router.get("customer/orders", [auth], orderController.index);
// router.get("customer/orders/:id", [auth], orderController.show);
// router.get("/orders", [auth, admin], adminOrderController.index);
router.get("/records/total", [auth, admin], dashboardController.index);
//fitness Route
router.post("/fitness", [auth], fitnessController.store);
router.put("/fitness/:id", [auth], fitnessController.update);
//choice fitness
// router.post("/user/fitness/choose", [auth], fitnessController.chooseFitness);
router.put("/user/fitness/choose", [auth], fitnessController.chooseFitness);
//update roll
router.put("/user/role/update/:id", [auth], userController.updateRole);
//classes
router.post("/classes", [auth], classesController.store);

//session
router.post("/session", [auth], sessionController.store);
router.get("/session/recommended", [auth], sessionController.recommended);
router.put("/session/:id", [auth], sessionController.update);
router.delete("/session/:id", [auth], sessionController.destroy);
router.get("/session/:id", [auth], sessionController.show);
router.get("/session", [auth], sessionController.index);
router.get("/session/trainer/:id", [auth], sessionController.getByTrainerId);

// book a session apis endpoint
router.post("/book-a-session", [auth], bookingController.store);
router.get("/book-a-session/trainer/:id", [auth, trainer], bookingController.getByTrainerId);
router.get("/book-a-session", [auth, admin], bookingController.show);
router.put("/book-a-session/recommended/:id", [auth, admin], bookingController.recommended);
router.get("/get-booked-sessions", [auth, trainee], bookingController.getByTraineeId);
router.delete("/book-a-session/trainee/:id", [auth], bookingController.destroyTrainee);
router.delete("/book-a-session/trainer/:id", [auth], bookingController.destroyTrainer);

// service
router.post("/services", [auth], serviceController.store);
router.put("/services/:id", [auth], serviceController.update);
router.delete("/services/:id", [auth], serviceController.destroy);
router.get("/services/:id", [auth], serviceController.show);
router.get("/services", [auth], serviceController.index);

// goals
router.post("/goals", [auth], goalController.store);
router.put("/goals/:id", [auth], goalController.update);
router.delete("/goals/:id", [auth], goalController.destroy);
router.get("/goals/:id", [auth], goalController.show);
router.get("/goals", [auth], goalController.index);

//video create
router.post("/video", [auth], videoController.store);
router.put("/video/:videoId", [auth], videoController.update);
router.delete("/video/:videoId", [auth], videoController.destroy);
router.get("/video", [auth], videoController.index);
router.get("/video/:trainerId", [auth], videoController.getTrainerVideos);

//subscription videos
router.post("/subscription/videos", [auth], subscriptionController.store);
router.get("/subscription/videos", [auth], subscriptionController.index);
router.get("/subscription/videos/:userId", [auth], subscriptionController.show);

//review
router.post("/review", [auth], reviewController.store);
router.get("/review/:id", [auth], reviewController.show);

// filter record api
router.put("/filter", [auth], filterController.filter);
router.put("/search", [auth], filterController.search);

//all Users
router.get("/admin/users", [auth, admin], usersController.index);
router.put("/admin/update/user/password/:id", [auth, admin], usersController.updateUserPassword);
router.put("/admin/user/:id", [auth, admin], usersController.updateAccountStatus);
router.put("/admin/trainer/status/:id", [auth, admin], usersController.updateTrainerStatus);
router.put("/user/status/:id", [auth, admin], usersController.updateEmailVerify);
router.put("/user/suspended/:id", [auth], usersController.suspended);
router.delete("/user/:userId", [auth], usersController.delUser);

// ---------------------Begin: all chat routes goes here-------------------

router.post("/chat/room/create", [auth], messageController.createRoom);
router.get("/chat/rooms", [auth], messageController.getAllMyRooms);
router.post("/chat/message/create", [auth], messageController.sendMessage);
router.get("/chat/messages/:roomId", [auth], messageController.index);

// ----------------------End: all chat routes goes here--------------------

// All Stripe Routes goes here

// stripe customer endpoints
router.post("/stripe/customer", [auth], customerController.store);
router.delete("/stripe/customer/:id", [auth], customerController.destroy);
router.get("/stripe/customer/:id", [auth], customerController.show);
router.get("/stripe/customer", [auth], customerController.index);
router.put("/stripe/customer/:id", [auth], customerController.update);
router.post("/stripe/customer/checkBalanceTransactions/:id", [auth], customerController.checkBalanceTransactions);
router.post("/stripe/customer/BalanceTransactionDetail/:cus_id", [auth], customerController.BalanceTransactionDetail);
router.get("/stripe/balance_transaction/:cus_id/:balance_tr_id", [auth], customerController.balance);

//customer stripe balance check
router.get("/stripe/balance/:cus_id", [auth], customerController.checkBalance);

// stripe customer card endpoints
router.post("/stripe/card/:id", [auth], cardController.store);
router.delete("/stripe/card/:id", [auth], cardController.destroy);
router.post("/stripe/customer/card/:id", [auth], cardController.show);
router.put("/stripe/card/:id", [auth], cardController.update);

// stripe customer recharge endpoints
router.post("/stripe/recharge/:cus_id", [auth], rechargeController.store);
router.get("/stripe/recharge/:id", [auth], rechargeController.show);
router.put("/stripe/recharge/:id", [auth], rechargeController.update);
// stripe customer transfer amount endpoints
router.post("/stripe/transfer", [auth], transferController.store);
router.get("/stripe/transfer", [auth], transferController.show);
router.post("/stripe/transfer_pay/:id", transferController.transfer);
router.post("/stripe/payout/:bank_account_id", transferController.payoutBankAccount);
//stripe bank_account create
router.post("/stripe/bank_account/:cus_id", bankController.store);
router.get("/stripe/bank_account/:cus_id", [auth], bankController.show);

// stripe connect account

router.post("/stripe/connect/accountLink", auth, connectController.createExpressAccountLink);

//account verify admin
// router.post("/admin/accountVerify", accountVerifiedController.store);
// classes
router.post("/admin/classes", [auth], classesController.store);
router.get("/admin/classes/:id", [auth], classesController.show);
router.get("/admin/classes", [auth], classesController.index);
router.delete("/admin/classes/:id", [auth], classesController.destroy);
router.put("/admin/classes/:id", [auth], classesController.update);

export default router;
