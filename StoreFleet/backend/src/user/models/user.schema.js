import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "user name is required"],
    maxLength: [30, "user name can't exceed 30 characters"],
    minLength: [2, "name should have at least 2 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "user email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    select: false,
    minLength: [6, "Password must contain at least 6 characters"],
  },
  profileImg: {
    public_id: { type: String, required: true, default: "1234567890" },
    url: {
      type: String,
      required: true,
      default: "https://ui-avatars.com/api/?name=StoreFleet+User",
    },
  },
  role: { type: String, default: "user", enum: ["user", "admin"] },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Hash only when a password is new or has changed.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_Secret, {
    expiresIn: process.env.JWT_Expire || "1d",
  });
};

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
