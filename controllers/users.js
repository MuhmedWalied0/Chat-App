import User from "../Models/users.js";
import jwt from "jsonwebtoken";
import {formatObject,formatArrayOfObjects} from "../utils/formatObjects.js";

export const register = async (req, res, next) => {
  const user = await User.create(req.body);
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.SECRET_KEY_TOKEN
  );
  const data = formatObject(user, ["id", "username", "email", "role"]);
  res.status(201).json({
    message: "User created successfully",
    user: {
      ...data,
      token,
    },
  });
};

export const login = async (req, res, next) => {
  const user = req.User;
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.SECRET_KEY_TOKEN
  );
  const data = formatObject(user, ["id", "username", "email", "role"]);
  res.json({
    message: "User login successfully",
    user: {
      ...data,
      token,
    },
  });
};

export const getCurrentUser = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const data = formatObject(user, [
    "id",
    "firstName",
    "lastName",
    "username",
    "email",
    "role",
  ]);
  res.json({
    user: data,
  });
};

export const updateCurrentUser = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  Object.keys(req.body).forEach((key) => {
    user[key] = req.body[key];
  });

  await user.save();
  const data = formatObject(user, [
    "id",
    "firstName",
    "lastName",
    "username",
    "email",
    "role",
  ]);
  res.json({
    message: "Update User successfully",
    user: data,
  });
};

export const updateCurrentUserPassword = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({
    message: "Password updated successfully",
  });
};

export const deleteCurrentUser = async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({
    message: "User deleted successfully",
  });
};

export const getUsersBloked = async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select("blockedUsers -_id")
    .populate("blockedUsers");
  if(!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const data=formatArrayOfObjects(user.blockedUsers,["id", "firstName", "lastName" ,"username" ,"email"]);
  res.status(200).json({
    message: "Users blocked by current user",
    blockedUsers: data,
  });
};

export const blockUser = async (req, res, next) => {
  const currentUser = req.currentUser;
  const targetUser = req.params.userId;
  currentUser.blockedUsers.push(targetUser);
  currentUser.save();
  res
    .status(200)
    .json({ message: `Successfully block user id:'${targetUser}' ` });
};

export const unblockUser = async (req, res, next) => {
  const currentUser = req.currentUser;
  const targetUser = req.params.userId;
  currentUser.blockedUsers = currentUser.blockedUsers.filter(
    (blockedUser) => blockedUser.toString() !== targetUser.toString()
  );
  await currentUser.save();
  res
    .status(200)
    .json({ message: `Successfully unblock user id:'${targetUser}' ` });
};
