import Message from "../Models/messages.js";
import moment from "moment";
const getMessages = async (req, res, next) => {
  const chatId = req.params.chatId;

  // ابحث عن الرسائل المرتبطة بالدردشة
  const messages = await Message.find({
    chat: chatId,
    deletedFor: { $nin: [req.user.id] },
  })
    .select(
      "chat sender content status deleteFor isUpdated oldContent chatType createdAt"
    )
    .populate("sender", "username")
    .populate("chat", "participants");

  // تحقق إذا كانت هناك رسائل موجودة
  if (!messages || messages.length === 0) {
    return res.status(404).json({ message: "No messages found" });
  }
  // تجهيز البيانات للرد
  const formattedMessages = messages.map((message) => ({
    sender: message.sender._id.equals(req.user.id)
      ? "me"
      : message.sender.username,
    content: message.content,
    status: message.status,
    time: moment(message.createdAt).format("h:mm A"),
  }));

  // إرسال الاستجابة
  res.status(200).json(formattedMessages);
};

const getMessage = async (req, res, next) => {
  const message = await Message.findById(req.params.id)
    .select("chat sender content status deleteFor isUpdated oldContent")
    .populate("sender", "username");
  if (!message) return res.status(404).json({ message: "Message not found" });
  res.status(200).json(message);
};

const createMessage = async (req, res, next) => {
  const chat = req.Chat;
  const messageInfo = {
    chat: chat._id,
    chatType: req.chatType,
    sender: req.user.id,
    content: req.body.content,
  };
  const message = await Message.create(messageInfo);
  chat.lastMessage = message._id;
  await chat.save();
  res.status(201).json("send message success");
};

const updateMessage = async (req, res, next) => {
  const message = await Message.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!message) return res.status(404).json({ message: "Message not found" });
  res.status(200).json(message);
};

const softDeleteMessage = async (req, res, next) => {
  const messageId = req.params.id;
  const userId = req.user.id;
  const message = await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { deletedFor: userId } },
    { new: true }
  );
  if (!message) return res.status(404).json({ message: "Message not found" });
  res.status(204).send(); // 204 تعني أنه تم الحذف بنجاح بدون محتوى
};

const deleteMessagePermanently = async (req, res, next) => {
  const messageId = req.params.id;
  const message = await Message.findByIdAndDelete(messageId);
  if (!message) return res.status(404).json({ message: "Message not found" });
  res.status(204).send();
};

const softDeleteMessages = async (req, res, next) => {
  const chatId = req.params.chatId;
  const userId = req.user.id;

  const result = await Message.updateMany(
    { chat: chatId },
    { $addToSet: { deletedFor: userId } }
  );

  if (result.modifiedCount === 0) {
    return res
      .status(404)
      .json({ message: "No messages found or already deleted" });
  }

  res.status(204).send();
};

const deleteMessagesPermanently = async (req, res, next) => {
  const chatId = req.params.chatId;
  const result = await Message.deleteMany({ chat: chatId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "No messages found" });
  }
  res.status(204).send();
};

export {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  softDeleteMessage,
  deleteMessagePermanently,
  softDeleteMessages,
  deleteMessagesPermanently,
};
