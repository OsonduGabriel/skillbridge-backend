
const getEmailContent = (code) => ({
  subject: "Verify your SkillBridge email",
  text: `Your SkillBridge verification code is ${code}. It expires in 10 minutes.`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <h2>Welcome to SkillBridge!</h2>
      <p>Use the code below to verify your email address:</p>
      <h1 style="letter-spacing: 6px">${code}</h1>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not create this account, you can ignore this email.</p>
    </div>
  `,
});

// Send email through Brevo's HTTPS API.
const sendWithBrevo = async (email, code) => {
  const { BREVO_API_KEY, MAIL_FROM } = process.env;

  if (!BREVO_API_KEY || !MAIL_FROM) {
    throw new Error("Missing BREVO_API_KEY or MAIL_FROM");
  }

  const content = getEmailContent(code);

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "SkillBridge",
        email: MAIL_FROM,
      },
      to: [{ email }],
      subject: content.subject,
      textContent: content.text,
      htmlContent: content.html,
    }),
  });

  if (!response.ok) {
    const errorDetails = await response.text();

    throw new Error(
      `Brevo email request failed (${response.status}): ${errorDetails}`
    );
  }

  return response.json();
};

// Check that the required Brevo configuration exists.
export const verifyMailerConnection = async () => {
  if (!process.env.BREVO_API_KEY || !process.env.MAIL_FROM) {
    throw new Error("Missing BREVO_API_KEY or MAIL_FROM");
  }

  console.log("Brevo email configuration loaded successfully");
};

// Send verification email.
export const sendVerificationEmail = async (email, code) => {
  return sendWithBrevo(email, code);
};
