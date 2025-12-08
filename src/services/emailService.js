import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendResetPasswordEmail(to, resetUrl) {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to, // use the function argument
      subject: "Reset your password",
      html: `
        <h2>Bloggy - Password Reset</h2>
        <p>Click below to reset your password. This link expires in 5 minutes.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
      `,
    });

    console.log("Email sent!", response);
    return response;
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw error; // propagate the error to the request handler if needed
  }
}

export default {
  sendResetPasswordEmail,
};
