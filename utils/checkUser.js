import User from "../Models/users.js";

export const isValidUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.accountStatus === "banned") {
    throw new Error("Sorry, this account is banned.");
  }
  return user;
};

export const isUserFoundById = async (userId, messageError) => {
  const user = await User.findById(userId);
  if (!user) {
    if (messageError) {
      throw new Error(messageError);
    }
    return false;
  }
  return user;
};

export const isUserFoundByQuery = async (query, messageError) => {
  const user = await User.findOne(query);
  if (!user) {
    if (messageError) {
      throw new Error(messageError);
    }
    return false;
  }
  return user;
};

export const isUserNotFoundById = async (userId, messageError) => {
  const user = await User.findById(userId);
  if (!user) {
    if (messageError) {
      throw new Error(messageError);
    }
    return false;
  }
  return true;
};

export const isUserNotFoundByQuery = async (query, messageError) => {
  const user = await User.findOne(query);
  if (user) {
    if (messageError) {
      throw new Error(messageError);
    }
    return false;
  }
  return true;
};

export const isTargetUserBlocked = async (user, targetUserId, messageError) => {
  if (user && user.blockedUsers.includes(targetUserId)) {
    return true;
  }
  if (messageError) {
    throw new Error(messageError);
  }
  return false;
};

export const isTargetUserNotBlocked = async (user, targetUserId, messageError) => {
    if (user && !(user.blockedUsers.includes(targetUserId))) {
      return true;
    }
    if (messageError) {
      throw new Error(messageError);
    }
    return false;
  };