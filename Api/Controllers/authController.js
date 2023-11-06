const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const signToken = (id) => {
  return (
    jwt.sign({ id }, process.env.JWT_SECRET),
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPPIRES_IN * 24 * 60 * 60 * 100
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-fordwarded-proto"] === "https",
  });

  // remove passord from output

  user.password == undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signUp = async (req, res, next) => {
  const newUSer = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUSer, 201, req, res);
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exist

  if (!email || !password) {
    res.status(400).json({
      status: "fail",
      message: "Please provide email and password",
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(401).json({
      status: "failled",
      message: "Incorrect email or password",
    });
  }
  // if everything ok, send token to client
  createSendToken(user, 200, req, res);
};
