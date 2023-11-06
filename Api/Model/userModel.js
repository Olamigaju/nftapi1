const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
  },

  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (el) {
        return el == this.password;
      },
      message: "passwords are not the same!",
    },
  },
});

userSchema.pre("save", async function (next) {
  //Only run this function if password wwas actually modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.pre("/^find", function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candiadatepassword,
  userPassword
) {
  return await bcrypt.compare(candiadatepassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
