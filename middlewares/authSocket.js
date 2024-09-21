import jwt from "jsonwebtoken";
import Users from "../Models/users.js";

export default async (socket, next) => {
  const token = socket.handshake.headers.authorization?.split(" ")[1];

  if (!token) {
    next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY_TOKEN);
    socket.userId = decoded.id;
    const user = await Users.findById(socket.userId);
    user.isOnline = true;
    await user.save();
    socket.emit("userStatus", { userId: socket.userId, status: "online" });
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
};
