import bcrypt from "bcrypt";

import User from "../Models/users.js";

import { isValidUser } from "../utils/checkUser.js";

export const registerReqBody = async (req, res, next) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "username",
    "email",
    "password",
    "bio",
    "friends",
  ];
  req.body.password = await bcrypt.hash(req.body.password, 10);

  req.body = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  req.body.role = req.role;
  next();
};

export const updatedCurrentUserReq = async (req, res, next) => {
  try {
    const allowedFields = ["firstName", "lastName", "username", "email", "bio"];

    req.body = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    if (!Object.keys(req.body).length) {
      return res.status(204).send();
    }

    const user = await isValidUser(req.user.id); 

    Object.keys(req.body).forEach((field) => {
      if (
        user[field] &&
        req.body[field].trim().toLowerCase() ===
          user[field].trim().toLowerCase()
      ) {
        delete req.body[field];
      }
    });

    if (!Object.keys(req.body).length) {
      return res.status(204).send();
    }

    req.User = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).send({error: error.message});
  }
};

export const updateUserCurrentPasswordReq = async (req, res, next) => {
  const newPassword = req.body.newPassword;
  req.body = {};
  req.body.password = await bcrypt.hash(newPassword, 10);

  next();
};
