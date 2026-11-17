import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/errorHandler.js";
import UserModel from "../src/user/models/user.schema.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return next(new ErrorHandler(401, "Please login to access this route"));

    const decodedData = jwt.verify(token, process.env.JWT_Secret);
    const user = await UserModel.findById(decodedData.id);
    if (!user) return next(new ErrorHandler(401, "User account was not found"));

    req.user = user;
    return next();
  } catch (error) {
    return next(new ErrorHandler(401, "Invalid or expired login token"));
  }
};

export const authByUserRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(
      new ErrorHandler(
        403,
        `Role: ${req.user?.role || "unknown"} is not allowed to access this resource`
      )
    );
  }
  return next();
};
