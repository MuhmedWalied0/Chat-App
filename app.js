import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import "dotenv/config";
import "./config/database.js";
import jwt from "jsonwebtoken";
import chatMessage from "./soket.io/Message.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import PrivateChat from "./routes/privateChats.js";
import Message from "./routes/messages.js";
import Messages from "./Models/messages.js";
import Users from "./Models/users.js";
import User from "./routes/users.js";
import authSocket from "./middlewares/authSocket.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // يسمح بجميع المصادر
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true,
  },
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(cors());

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/user-profile", (req, res) => {
  res.render("user-profile");
});

app.get("/edit-profile", (req, res) => {
  res.render("edit-profile");
});

app.get("/confirm-delete", (req, res) => {
  res.render("confirm-delete");
});
app.get("/change-password", (req, res) => {
  res.render("change-password");
});
app.use("/api/users", User);
app.use("/api/messages", Message);
app.use("/api/private-chats", PrivateChat);

io.use(authSocket);

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
  const address = server.address();
  const serverUrl = `http://${address.address}:${address.port}`; // أو https إذا كنت تستخدم HTTPS
  console.log(serverUrl);
});
