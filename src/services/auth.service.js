import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import crypto from "node:crypto";
import { sendVerificationEmail } from "../config/mailer.js";

const VERIFICATION_CODE_EXPIRY_MINUTES = 10;
const MAX_VERIFICATION_ATTEMPTS = 5;

const hashCode = (code) =>
  crypto.createHash("sha256").update(code).digest("hex");  

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const registerUser = async ({ fullName, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const code = crypto.randomInt(100000, 1000000).toString();

  const user = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "student",
    isVerified: false,
    emailVerificationCodeHash: hashCode(code),
    emailVerificationExpiresAt: new Date(
      Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000
    ),
    emailVerificationAttempts: 0,
  });

  try {
    await sendVerificationEmail(normalizedEmail, code);
  } catch (error) {
    // Keep the account and its verification code so a resend
    // workflow can be used if email delivery temporarily fails.
    console.error("Verification email delivery failed:", error.message);
    throw new Error(
      "Account created, but the verification email could not be sent. Please contact support to resend it."
    );
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
};

export const verifyEmailService = async (email, code) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    where: { email: normalizedEmail },
  });

  if (!user || user.isVerified || !user.emailVerificationCodeHash) {
    throw new Error("Invalid or expired verification code");
  }

  if (
    !user.emailVerificationExpiresAt ||
    user.emailVerificationExpiresAt.getTime() <= Date.now()
  ) {
    throw new Error("Invalid or expired verification code");
  }

  if (user.emailVerificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    throw new Error("Too many attempts. Please request a new code.");
  }

  user.emailVerificationAttempts += 1;

  if (hashCode(code) !== user.emailVerificationCodeHash) {
    await user.save();
    throw new Error("Invalid or expired verification code");
  }

  user.isVerified = true;
  user.emailVerificationCodeHash = null;
  user.emailVerificationExpiresAt = null;
  user.emailVerificationAttempts = 0;

  await user.save();

  return { message: "Email verified successfully. You can now log in." };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Find user
  const user = await User.findOne({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }
if (!user.isVerified) {
  throw new Error("Please verify your email before logging in");
}
  // Generate JWT
  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    token,
  };
};

const RESET_CODE_EXPIRY_MINUTES = 10;
const MAX_RESET_ATTEMPTS = 5;

const hashResetCode = (code) =>
  crypto.createHash("sha256").update(code).digest("hex");

export const forgotPasswordService = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    where: { email: normalizedEmail },
  });

  // Use the same response whether the account exists or not.
  if (!user) {
    return {
      message: "If the account exists, a reset code will be sent.",
    };
  }

  const code = crypto.randomInt(100000, 1000000).toString();

  user.passwordResetCodeHash = hashResetCode(code);
  user.passwordResetExpiresAt = new Date(
    Date.now() + RESET_CODE_EXPIRY_MINUTES * 60 * 1000
  );
  user.passwordResetAttempts = 0;

  await user.save();

  // TODO: Send `code` to the user's email through your email service.
  // Never return the code in the API response.

  return {
    message: "If the account exists, a reset code will be sent.",
  };
};

export const verifyResetCodeService = async (email, code) => {
  const user = await User.findOne({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user || !user.passwordResetCodeHash) {
    throw new Error("Invalid or expired reset code");
  }

  if (
    !user.passwordResetExpiresAt ||
    user.passwordResetExpiresAt.getTime() <= Date.now()
  ) {
    throw new Error("Invalid or expired reset code");
  }

  if (user.passwordResetAttempts >= MAX_RESET_ATTEMPTS) {
    throw new Error("Too many attempts. Request a new reset code.");
  }

  user.passwordResetAttempts += 1;
  await user.save();

  if (hashResetCode(code) !== user.passwordResetCodeHash) {
    throw new Error("Invalid or expired reset code");
  }

  return { message: "Reset code verified successfully" };
};

export const resetPasswordService = async ({
  email,
  code,
  newPassword,
}) => {
  const user = await User.findOne({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user || !user.passwordResetCodeHash) {
    throw new Error("Invalid or expired reset code");
  }

  if (
    !user.passwordResetExpiresAt ||
    user.passwordResetExpiresAt.getTime() <= Date.now()
  ) {
    throw new Error("Invalid or expired reset code");
  }

  if (user.passwordResetAttempts >= MAX_RESET_ATTEMPTS) {
    throw new Error("Too many attempts. Request a new reset code.");
  }

  user.passwordResetAttempts += 1;

  if (hashResetCode(code) !== user.passwordResetCodeHash) {
    await user.save();
    throw new Error("Invalid or expired reset code");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetCodeHash = null;
  user.passwordResetExpiresAt = null;
  user.passwordResetAttempts = 0;

  await user.save();

  return { message: "Password reset successful" };
};