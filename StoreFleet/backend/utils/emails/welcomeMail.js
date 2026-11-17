import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (user) => {
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
    subject: "Welcome to StoreFleet!",
    html: `
      <!doctype html>
      <html lang="en">
        <body style="margin:0;padding:24px;background:#f4f7f8;font-family:Arial,sans-serif;color:#24323d">
          <main style="max-width:600px;margin:auto;padding:32px;background:#fff;border-radius:12px">
            <div style="text-align:center">
              <img src="https://files.codingninjas.in/logo1-32230.png" alt="StoreFleet logo" style="width:150px;max-width:100%" />
            </div>
            <h1 style="color:#20a879">Welcome to StoreFleet, ${escapeHtml(user.name)}!</h1>
            <p>Your account has been created successfully.</p>
            <p>We're glad to have you with us. You can now sign in and start exploring StoreFleet.</p>
            <p style="margin-top:28px">Thanks,<br/>The StoreFleet Team</p>
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
