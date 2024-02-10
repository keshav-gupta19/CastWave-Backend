const { User } = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createError = require("../utils/error");
const otpgenerator = require("otp-generator");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "castwave19@gmail.com",
    pass: "tryh ituc sxfx mfcs",
  },
  port: 465,
  host: "smtp.gmail.com",
});

const RegisterUser = async (req, res, next) => {
  try {
    const email = req.body.email;
    if (!email) {
      res.status(422).send({ message: "Missing email." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(200).send({ message: "User already exists." });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({ ...req.body, password: hashedPassword });
    newUser
      .save()
      .then((user) => {
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_KEY, {
          expiresIn: "9999 years",
        });
        res.status(200).send({ token, user });
      })
      .catch((error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

const LoginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // console.log(email, password);
    if (!email || !password) {
      next(createError(201, "Email and password are required"));
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      next(createError(201, "User not found"));
    }
    if (user.googleSignIn) {
      return next(
        createError(
          201,
          "Entered email is signed up with google account. Sign in with google"
        )
      );
    }
    const isPasswordValid = await bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return next(createError(201, "Password does not match"));
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "9999 years",
    });
    res.status(200).send({ user, token });
  } catch (error) {
    return next(createError(401, "Authentication failed"));
  }
};

const googleAuthSignIn = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      try {
        const user = new User({ ...req.body, googleSignIn: true });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
          expiresIn: "9999 years",
        });
        res.status(200).json({ token, user: user });
      } catch (error) {
        next(error);
      }
    } else if (user.googleSignIn) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
        expiresIn: "9999 years",
      });
      res.status(200).json({ token, user });
    } else if (user.googleSignIn === false) {
      next(
        createError(
          201,
          "User already exists with this email can't do google auth"
        )
      );
    }
  } catch (error) {
    next(error);
  }
};
const generateOTP = async (req, res, next) => {
  // return res.status(200).send({message: "Keshhhhhh"})
  req.app.locals.OTP = otpgenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    digits: true,
  });
  const { email } = req.query;
  const { name } = req.query;
  const { reason } = req.query;
  // console.log(name, email, reason, req.app.locals.OTP);
  const verifyOtp = {
    to: email,
    subject: "Account Verification OTP",
    html: `
      <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
  <h1 style="font-size: 22px; font-weight: 500; color: #854CE6; text-align: center; margin-bottom: 30px;">Verify Your CASTWAVE Account</h1>
  <div style="background-color: #FFF; border: 1px solid #e5e5e5; border-radius: 5px; box-shadow: 0px 3px 6px rgba(0,0,0,0.05);">
      <div style="background-color: #854CE6; border-top-left-radius: 5px; border-top-right-radius: 5px; padding: 20px 0;">
          <h2 style="font-size: 28px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 10px;">Verification Code</h2>
          <h1 style="font-size: 32px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 20px;">${req.app.locals.OTP}</h1>
      </div>
      <div style="padding: 30px;">
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Dear ${name},</p>
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Thank you for creating a Castwave account. To activate your account, please enter the following verification code:</p>
          <p style="font-size: 20px; font-weight: 500; color: #666; text-align: center; margin-bottom: 30px; color: #854CE6;">${req.app.locals.OTP}</p>
          <p style="font-size: 12px; color: #666; margin-bottom: 20px;">Please enter this code in the Castwave app to activate your account.</p>
          <p style="font-size: 12px; color: #666; margin-bottom: 20px;">If you did not create a Castwave account, please disregard this email.</p>
      </div>
  </div>
  <br>
  <p style="font-size: 16px; color: #666; margin-bottom: 20px; text-align: center;">Best regards,<br>The Castwave Team</p>
</div>
      `,
  };

  const resetPasswordOtp = {
    to: email,
    subject: "CASTWAVE Reset Password Verification",
    html: `
        <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
            <h1 style="font-size: 22px; font-weight: 500; color: #3498DB; text-align: center; margin-bottom: 30px;">Reset Your CASTWAVE Account Password</h1>
            <div style="background-color: #FFF; border: 1px solid #e5e5e5; border-radius: 5px; box-shadow: 0px 3px 6px rgba(0,0,0,0.05);">
                <div style="background-color: #3498DB; border-top-left-radius: 5px; border-top-right-radius: 5px; padding: 20px 0;">
                    <h2 style="font-size: 28px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 10px;">Verification Code</h2>
                    <h1 style="font-size: 32px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 20px;">${req.app.locals.OTP}</h1>
                </div>
                <div style="padding: 30px;">
                    <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Dear ${name},</p>
                    <p style="font-size: 14px; color: #666; margin-bottom: 20px;">To reset your CASTWAVE account password, please enter the following verification code:</p>
                    <p style="font-size: 20px; font-weight: 500; color: #666; text-align: center; margin-bottom: 30px; color: #3498DB;">${req.app.locals.OTP}</p>
                    <p style="font-size: 12px; color: #666; margin-bottom: 20px;">Please enter this code in the CASTWAVE app to reset your password.</p>
                    <p style="font-size: 12px; color: #666; margin-bottom: 20px;">If you did not request a password reset, please disregard this email.</p>
                </div>
            </div>
            <br>
            <p style="font-size: 16px; color: #666; margin-bottom: 20px; text-align: center;">Best regards,<br>The CASTWAVE Team</p>
        </div>
    `,
  };

  if (reason === "FORGOTPASSWORD") {
    transporter.sendMail(resetPasswordOtp, (err) => {
      if (err) {
        next(err);
      } else {
        return res.status(200).send({ message: "OTP sent" });
      }
    });
  } else {
    transporter.sendMail(verifyOtp, (err) => {
      if (err) {
        next(err);
      } else {
        // console.log("jdjsnj");
        return res.status(200).send({ message: "OTP sent" });
      }
    });
  }
};

const verifyOtp = async (req, res, next) => {
  const { code } = req.query;
  // console.log("heyaaa");
  if (parseInt(code) === parseInt(req.app.locals.OTP)) {
    req.app.locals.OTP = null;
    // console.log("helloooooooookessshhhhhavvvv");
    req.app.locals.resetSession = true;
    return res.status(200).send({ message: "OTP verified" });
  }
  return next(createError(201, "Wrong OTP"));
};

const createResetSession = async (req, res, next) => {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false;
    return res.status(200).send({ message: "Access granted" });
  }
  return res.status(400).send({ message: "Session Expired" });
};

const findUserByEmail = async (req, res, next) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      res.status(200).send({ message: "USer found" });
    } else {
      res.status(202).send({ message: "User not found" });
    }
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  if (!req.app.locals.resetSession) {
    return res.status(440).send({ message: "Session Expired" });
  }
  const { email, password } = req.body;
  try {
    await User.findOne({ email: email }).then((user) => {
      if (user) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        User.updateOne({ email: email }, { $set: { password: hashedPassword } })
          .then(() => {
            req.app.locals.resetSession = false;
            return res
              .status(200)
              .send({ message: "Password Reset Successful" });
          })
          .catch((error) => {
            next(error);
          });
      } else {
        return res.status(202).send({ message: "User not found" });
      }
    });
  } catch (error) {
    next(error);
  }
};

const LogoutUser = (req, res) => {
  res.clearCookie("access_token").json({ message: "Logged out successfully" });
};
module.exports = {
  RegisterUser,
  LoginUser,
  generateOTP,
  verifyOtp,
  resetPassword,
  findUserByEmail,
  createResetSession,
  generateOTP,
  LogoutUser,
  googleAuthSignIn,
};
