
import nodemailer from "nodemailer";

const { SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const verifyMailerConnection = async () => {
  if (!SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    throw new Error("Missing SMTP_USER, SMTP_PASS or MAIL_FROM");
  }

  await transporter.verify();
  console.log("Email service connected successfully");
};

export const sendVerificationEmail = async (email, code) => {
  return transporter.sendMail({
    from: `"SkillBridge" <${MAIL_FROM}>`,
    to: email,
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
};
