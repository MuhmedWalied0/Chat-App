import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import "dotenv/config";
import "./config/database.js";
import jwt from "jsonwebtoken";
import chatMessage from "./soket.io/Message.js";
import { isValidChat } from "./utils/checkPrivateChat.js";
import PrivateChat from "./routes/privateChats.js";
import Message from "./routes/messages.js";
import Messages from "./Models/messages.js";
import Users from "./Models/users.js";
import User from "./routes/users.js";
import moment from "moment";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // يمكنك تعديل هذا لتقييد الوصول إلى النطاقات المطلوبة فقط
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

app.use("/api/users", User);
app.use("/api/messages", Message);
app.use("/api/private-chats", PrivateChat);

io.use(async (socket, next) => {
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
});

io.on("connection", async (socket) => {
  console.log("A user connected ", socket.userId);

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
  });

  chatMessage(socket, io);

  socket.on("openChat", async (data) => {
    const result = await Messages.updateMany(
      {
        chat: data.chatId,
        status: { $ne: "seen" },
        sender: { $ne: socket.userId },
      },
      { status: "seen" }
    );
    socket.to(data.chatId).emit("updateUnreadCount", {
      chatId: data.chatId,
      unreadMessagesCount: 0,
    });
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
