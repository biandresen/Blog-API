import { Resend } from "resend";
import { normalizeLanguage } from "../utils/normalizeLanguage.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || "PunDad <noreply@pundad.app>";
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || "support@pundad.app";

function getResetPasswordContent(resetUrl, language = "EN") {
  const lang = normalizeLanguage(language)
  if (lang === "NO") {
    return {
      subject: "Tilbakestill passordet ditt",
      text: `Klikk på lenken for å tilbakestille passordet ditt. Lenken utløper om 5 minutter.\n\n${resetUrl}`,
      html: `
        <h2>PunDad - Tilbakestilling av passord</h2>
        <p>Klikk på lenken under for å tilbakestille passordet ditt.</p>
        <p>Denne lenken utløper om 5 minutter.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
      `,
    };
  }

  return {
    subject: "Reset your password",
    text: `Click the link below to reset your password. This link expires in 5 minutes.\n\n${resetUrl}`,
    html: `
      <h2>PunDad - Password Reset</h2>
      <p>Click the link below to reset your password.</p>
      <p>This link expires in 5 minutes.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
    `,
  };
}

function getVerificationContent(verificationUrl, language = "EN") {
  const lang = normalizeLanguage(language)
  if (lang === "NO") {
    return {
      subject: "Bekreft PunDad-kontoen din",
      text: `Klikk på lenken for å bekrefte e-postadressen din. Lenken utløper om 15 minutter.\n\n${verificationUrl}`,
      html: `
        <h2>Velkommen til PunDad</h2>
        <p>Klikk på lenken under for å bekrefte e-postadressen din.</p>
        <p>Denne lenken utløper om 15 minutter.</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      `,
    };
  }

  return {
    subject: "Verify your PunDad account",
    text: `Click the link below to verify your email address. This link expires in 15 minutes.\n\n${verificationUrl}`,
    html: `
      <h2>Welcome to PunDad</h2>
      <p>Click the link below to verify your email address.</p>
      <p>This link expires in 15 minutes.</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    `,
  };
}

async function sendEmail({ to, subject, html, text }) {
  return resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
    text,
    replyTo: EMAIL_REPLY_TO,
  });
}

async function sendResetPasswordEmail(to, resetUrl, language = "EN") {
  const content = getResetPasswordContent(resetUrl, language);
  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
}

async function sendVerificationEmail(to, verificationUrl, language = "EN") {
  const content = getVerificationContent(verificationUrl, language);
  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
}

export default {
  sendResetPasswordEmail,
  sendVerificationEmail,
};