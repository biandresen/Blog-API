import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendResetPasswordEmail(to, resetUrl) {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Reset your password",
      html: `
        <h2>DadJokes - Password Reset</h2>
        <p>Click below to reset your password. This link expires in 5 minutes.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
      `,
    });

    return response;
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw error;
  }
}

async function sendVerificationEmail(to, verificationUrl) {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Verify your DadJokes account",
      html: `
        <h2>Welcome to DadJokes</h2>
        <p>Click below to verify your email address.</p>
        <p>This link expires in 15 minutes.</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      `,
    });

    return response;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

export default {
  sendResetPasswordEmail,
  sendVerificationEmail,
};