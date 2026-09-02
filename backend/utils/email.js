const { Resend } = require("resend");

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const WELCOME_SUBJECT = "Your Odyssey Treasure Hunt credentials";

function renderWelcomeTemplate({ team_name, password, email }) {
  return `
    <h1>Welcome, ${team_name}!</h1>
    <p>Your team has been registered for the treasure hunt.</p>
    <p>Team name: <strong>${team_name}</strong></p>
    <p>Password: <strong>${password}</strong></p>
    <p>Registered email: ${email}</p>
    <p>Keep your password safe — you will need it to log in.</p>
  `;
}

async function sendWelcomeEmail({ to, team_name, password, email }) {
  if (!resend) {
    console.warn("Resend not configured (RESEND_API_KEY missing) — skipping welcome email.");
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Odyssey Hunt <noreply@example.com>",
      to,
      subject: WELCOME_SUBJECT,
      html: renderWelcomeTemplate({ team_name, password, email }),
    });
    console.log(`Welcome email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}

module.exports = { sendWelcomeEmail };
