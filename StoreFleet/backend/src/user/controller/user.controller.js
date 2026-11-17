// Please don't change the pre-written code
import { sendPasswordResetEmail } from "../../../utils/emails/passwordReset.js";
import { sendWelcomeEmail } from "../../../utils/emails/welcomeMail.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { sendToken } from "../../../utils/sendToken.js";
import {
  createNewUserRepo,
  deleteUserRepo,
  findUserForPasswordResetRepo,
  findUserRepo,
  getAllUsersRepo,
  updateUserProfileRepo,
  updateUserRoleAndProfileRepo,
} from "../models/user.repository.js";
import crypto from "crypto";

export const createNewUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new ErrorHandler(400, "Please provide name, email and password"));
    }

    const newUser = await createNewUserRepo({ name, email, password });
    // Send the welcome email before ending the HTTP response.
    try {
      await sendWelcomeEmail(newUser);
    } catch (mailError) {
      // A mail provider outage should not prevent a user from creating an account.
      console.error("Welcome email could not be sent:", mailError.message);
    }
    return await sendToken(newUser, res, 200);
  } catch (error) {
    if (error.code === 11000) {
      return next(new ErrorHandler(409, "An account with this email address already exists. Please login instead."));
    }
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new ErrorHandler(400, "Please enter email and password"));

    const user = await findUserRepo({ email: email.toLowerCase().trim() }, true);
    if (!user) return next(new ErrorHandler(401, "Invalid email or password"));
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) return next(new ErrorHandler(401, "Invalid email or password"));
    return await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const logoutUser = async (req, res) =>
  res.status(200).cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  }).json({ success: true, msg: "Logout successful" });

export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new ErrorHandler(400, "Please provide your email address"));

    const user = await findUserRepo({ email: email.toLowerCase().trim() });
    // Use a generic response so the endpoint does not disclose registered emails.
    if (!user) {
      return res.status(200).json({ success: true, message: "If an account exists for this email, a reset link will be sent." });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const baseUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
    const resetPasswordURL = `${baseUrl}/password/reset/${resetToken}`;

    try {
      await sendPasswordResetEmail(user, resetPasswordURL);
    } catch (mailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorHandler(500, "Unable to send password reset email. Please try again later."));
    }

    return res.status(200).json({ success: true, message: "Password reset email sent successfully" });
  } catch (error) {
    return next(new ErrorHandler(500, error.message || error));
  }
};

export const resetUserPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;
    if (!password || password !== confirmPassword) {
      return next(new ErrorHandler(400, "Password and confirm password must match"));
    }

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await findUserForPasswordResetRepo(hashedToken);
    if (!user) return next(new ErrorHandler(400, "Password reset token is invalid or has expired"));

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.user._id });
    return res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error.message || error));
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword) return next(new ErrorHandler(400, "Please enter your current password"));
    const user = await findUserRepo({ _id: req.user._id }, true);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return next(new ErrorHandler(401, "Incorrect current password"));
    }
    if (!newPassword || newPassword !== confirmPassword) {
      return next(new ErrorHandler(400, "New password and confirm password must match"));
    }
    user.password = newPassword;
    await user.save();
    return await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updatedUserDetails = await updateUserProfileRepo(req.user._id, { name, email });
    if (!updatedUserDetails) return next(new ErrorHandler(404, "User not found"));
    return res.status(200).json({ success: true, updatedUserDetails });
  } catch (error) {
    if (error.code === 11000) return next(new ErrorHandler(409, "That email address is already in use"));
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsersRepo();
    return res.status(200).json({ success: true, allUsers });
  } catch (error) {
    return next(new ErrorHandler(500, error.message || error));
  }
};

export const getUserDetailsForAdmin = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.params.id });
    if (!userDetails) return res.status(404).json({ success: false, msg: "No user found with provided id" });
    return res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error.message || error));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserRepo(req.params.id);
    if (!deletedUser) return res.status(404).json({ success: false, msg: "No user found with provided id" });
    return res.status(200).json({ success: true, msg: "User deleted successfully", deletedUser });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const updateUserProfileAndRole = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    if (role !== undefined && !["user", "admin"].includes(role)) {
      return next(new ErrorHandler(400, "Role must be either 'user' or 'admin'"));
    }
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (!Object.keys(updateData).length) return next(new ErrorHandler(400, "Please provide at least one field to update"));

    const updatedUser = await updateUserRoleAndProfileRepo(req.params.id, updateData);
    if (!updatedUser) return next(new ErrorHandler(404, "User not found"));
    return res.status(200).json({ success: true, updatedUser, updatedUserDetails: updatedUser });
  } catch (error) {
    if (error.code === 11000) return next(new ErrorHandler(409, "That email address is already in use"));
    return next(new ErrorHandler(400, error.message || error));
  }
};
