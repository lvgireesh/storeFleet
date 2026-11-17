// Create a JWT and save it in an HTTP-only cookie.
export const sendToken = async (user, res, statusCode) => {
  const token = user.getJWTToken();
  const cookieOptions = {
    expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRES_IN || 1) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };

  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  delete safeUser.resetPasswordToken;
  delete safeUser.resetPasswordExpire;

  return res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    user: safeUser,
    token,
  });
};
