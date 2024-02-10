const express = require("express");
const {
  RegisterUser,
  LoginUser,
  generateOTP,
  findUserByEmail,
  verifyOtp,
  createResetSession,
  resetPassword,
  LogoutUser,
  googleAuthSignIn,
} = require("../controllers/authControllers");
const Router = express.Router();
const localVariables = require("../middlewares/auth");
Router.post("/signup", RegisterUser);
Router.post("/signin", LoginUser);
Router.post("/logout", LogoutUser);
Router.post("/google", googleAuthSignIn);
Router.get("/findByEmail", findUserByEmail);
Router.get("/generateotp", localVariables, generateOTP);
Router.get("/verifyotp", verifyOtp);
Router.get("/createResetSession", createResetSession);
Router.put("/forgetPassword", resetPassword);

module.exports = Router;
