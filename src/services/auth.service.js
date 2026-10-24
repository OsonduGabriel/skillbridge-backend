import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import crypto from "node:crypto";

const generateToken = (user) => {
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

export const registerUser = async ({
  fullName,
  email,
  password,
}) => {
  // Check if user already exists
  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: "student",
    isVerified: false,
  });

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
};

export const loginUser = async ({ email, password }) => {
  // Find user
  const user = await User.findOne({
    where: { email },
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