import nodemailer from "nodemailer";

export const sendPasswordResetEmail = async (user, resetPasswordURL) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SMPT_SERVICE || "gmail",
    auth: {
      user: process.env.STORFLEET_SMPT_MAIL,
      pass: process.env.STORFLEET_SMPT_MAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.STORFLEET_MAIL || process.env.STORFLEET_SMPT_MAIL,
    to: user.email,
    subject: "StoreFleet password reset",
    html: `
      <!doctype html>
      <html lang="en">
        <body style="margin:0;padding:24px;background:#f4f7f8;font-family:Arial,sans-serif;color:#24323d">
          <main style="max-width:600px;margin:auto;padding:32px;background:#fff;border-radius:12px">
            <div style="text-align:center">
              <img src="https://files.codingninjas.in/logo1-32230.png" alt="StoreFleet logo" style="width:150px;max-width:100%" />
              <h1>Password reset</h1>
            </div>
            <p>Hello ${escapeHtml(user.name)},</p>
            <p>We received a request to reset your StoreFleet password. This link expires in 10 minutes.</p>
            <p><a href="${escapeHtml(resetPasswordURL)}" style="display:inline-block;padding:12px 20px;background:#20a879;color:#fff;text-decoration:none;border-radius:6px">Reset password</a></p>
            <p>If you did not request this, you can ignore this email.</p>
          </main>
        </body>
      </html>
    `,
  });
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}
