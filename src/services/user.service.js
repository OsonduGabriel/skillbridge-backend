import User from "../models/user.model.js";

export const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateUser = async (userId, data) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const { fullName, email } = data;

  if (fullName !== undefined) {
    user.fullName = fullName;
  }

  if (email !== undefined) {
    user.email = email;
  }

  await user.save();

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
};

export const deleteUser = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error("User not found");
  }

  await user.destroy();

  return true;
};