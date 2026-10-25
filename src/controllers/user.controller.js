import {getUserById,updateUser,deleteUser,} from "../services/user.service.js";

export const getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const user = await updateUser(req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMe = async (req, res, next) => {
  try {
    await deleteUser(req.user.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

 export const getCurrentUser = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Authenticated user retrieved successfully",
    data: {
      user: req.user,
    },
  });
};

export const getAdminDashboard = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the admin dashboard.",
    data: {
      user: req.user,
    },
  });
};