import UserModel from "./user.schema.js";

export const createNewUserRepo = async (user) => new UserModel(user).save();

export const findUserRepo = async (factor, withPassword = false) => {
  const query = UserModel.findOne(factor);
  if (withPassword) query.select("+password");
  return query;
};

export const findUserForPasswordResetRepo = async (hashtoken) =>
  UserModel.findOne({
    resetPasswordToken: hashtoken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

export const updateUserProfileRepo = async (_id, data) =>
  UserModel.findByIdAndUpdate(_id, data, {
    new: true,
    runValidators: true,
  });

export const getAllUsersRepo = async () => UserModel.find({});
export const deleteUserRepo = async (_id) => UserModel.findByIdAndDelete(_id);

export const updateUserRoleAndProfileRepo = async (_id, data) =>
  UserModel.findByIdAndUpdate(_id, data, {
    new: true,
    runValidators: true,
  });
