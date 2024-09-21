document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login";
    return;
  }
  const socket = io("http://localhost:3000", {
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  const chatList = document.getElementById("chat-list");

  const chatName = document.getElementById("chat-name");
  const chatStatus = document.getElementById("chat-status");
  const chatDetailsContainer = document.querySelector(".chat-details-header");
  const chatDetails = document.querySelector(".chat-details");
  const messageInputContainer = document.querySelector(
    ".message-input-container"
  );
  const messageInput = document.getElementById("message-input");

  const welcomeMessage = document.getElementById("welcome-message");
  const username = localStorage.getItem("username");

  if (username && welcomeMessage) {
    welcomeMessage.textContent = `مرحبا ${username} `;
  }

  getChatRequest();

  document
    .getElementById("logout-button")
    .addEventListener("click", function (event) {
      event.preventDefault();
      logout();
    });

  chatList.addEventListener("click", async function (event) {
    if (event.target.closest(".chat-link")) {
      event.preventDefault();
      messageInput.value = "";
      const chatId = event.target.closest(".chat-link").dataset.chatId;
      const name = event.target.closest(".chat-link").dataset.chatName;
      const status = event.target.closest(".chat-link").dataset.chatStatus;


      const chatLink = document.querySelectorAll(".chat-link");
      chatLink.forEach((link) => link.classList.remove("active"));

      event.target.closest(".chat-link").classList.add("active");

      socket.emit("openChat", { chatId });

      await getMessagesRequest(chatId);

      chatStatus.textContent = status;
      chatName.textContent = name;
    }
  });

  document.getElementById("send-button").addEventListener("click", sendMessage);

  document
    .getElementById("message-input")
    .addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });

  async function showChats(chats) {
    chatList.innerHTML = "";
    const userId=localStorage.getItem("userId");
    chats.forEach((chat) => {
      const chatItem = document.createElement("li");
      chatItem.className = "chat-item";

      const chatLink = document.createElement("a");
      chatLink.href = "#";
      chatLink.className = "chat-link";
      socket.emit("joinChat", chat.id);
      chatLink.dataset.chatId = chat.id;
      chatLink.dataset.chatName = chat.name;
      chatLink.dataset.fiendId = chat.fiend;
      chatLink.dataset.chatStatus = chat.status === true ? "Online" : "Offline";
      const chatPreview = document.createElement("div");
      chatPreview.className = "chat-preview";

      const chatAvatar = document.createElement("div");
      chatAvatar.className = "chat-avatar";
      const avatarImg = document.createElement("img");
      avatarImg.src =
        chat.avatar || "/photo/profile-user-icon-2048x2048-m41rxkoe.png";
      avatarImg.alt = "Avatar";
      chatAvatar.appendChild(avatarImg);

      const chatDetails = document.createElement("div");
      chatDetails.className = "chat-details";
      const chatName = document.createElement("h3");
      chatName.textContent = chat.name;
      const chatLastMessage = document.createElement("p");
      chatLastMessage.textContent = chat.lastMessage.content;

      const chatLastMessageSender = document.createElement("p");
      chatLastMessageSender.textContent = chat.lastMessage.sender===userId ? "me": chat.name;

      const unreadCount = document.createElement("span");
      unreadCount.className = "unread-count";
      unreadCount.textContent =
        chat.unreadMessagesCount > 0
          ? `${chat.unreadMessagesCount} unread messages`
          : "";

      chatDetails.appendChild(chatName);
      chatDetails.appendChild(chatLastMessageSender);
      chatDetails.appendChild(chatLastMessage);
      chatDetails.appendChild(unreadCount);
      chatPreview.appendChild(chatAvatar);
      chatPreview.appendChild(chatDetails);

      const chatTime = document.createElement("span");
      chatTime.className = "chat-time";
      chatTime.textContent = chat.lastMessage.time;

      chatLink.appendChild(chatPreview);
      chatLink.appendChild(chatTime);

      chatItem.appendChild(chatLink);
      chatList.appendChild(chatItem);
    });
  }

  function showMessages(messages) {
    const messageList = document.getElementById("message-list");
    messageList.innerHTML = "";
    messages.forEach((message) => {
      const messageElement = document.createElement("div");
      messageElement.classList.add(
        "message",
        message.sender === "me" ? "outgoing" : "incoming"
      );

      messageElement.innerHTML = `
      <div class="message-content">
          ${message.content}
      <span class="message-time">${message.time}</span>
        </div>
      `;

      messageList.appendChild(messageElement);
    });
    setTimeout(() => {
      messageList.scrollTop = messageList.scrollHeight;
    }, 100);
    chatDetailsContainer.classList.remove("hidden");
    chatDetails.classList.remove("hidden");
    messageInputContainer.classList.remove("hidden");
  }

  async function getMessagesRequest(chatId) {
    try {
      const response = await fetch(`/api/private-chats/${chatId}/messages/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const messages = await response.json();
        showMessages(messages);
      } else {
        console.error("خطأ في الاتصال بالخادم");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  function sendMessage() {
    const chatLink = document.querySelector(".chat-link.active");
    const chatId = chatLink ? chatLink.dataset.chatId : null;

    if (messageInput.value.trim()) {
      const messageInfo = {
        content: messageInput.value,
        chatType: "PrivateChat",
        chatId,
      };

      socket.emit("chatMessage", messageInfo);
      messageInput.value = "";
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    socket.disconnect();
    window.location.href = "login";
  }

  async function getChatRequest() {
    try {
      const response = await fetch("/api/private-chats/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        showChats(result.chats);
      } else {
        console.error("خطا في جلب البيانات");
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }

  socket.on("receiveMessage", (message) => {
    const messageList = document.getElementById("message-list");
    const messageElement = document.createElement("div");
    messageElement.classList.add(
      "message",
      message.sender === socket.id ? "outgoing" : "incoming"
    );

    messageElement.innerHTML = `
      <div class="message-content">
          ${message.content}
      <span class="message-time">${message.time}</span>
        </div>
      `;
    messageList.appendChild(messageElement);
    messageList.scrollTop = messageList.scrollHeight;

    const chatElement = document.querySelector(
      `.chat-link[data-chat-id="${message.chatId}"]`
    );
    if (chatElement) {
      const lastMessageElement = chatElement.querySelector(".chat-details p");
      const lastMessageTimeElement = chatElement.querySelector(".chat-time");
      if (lastMessageElement) {
        lastMessageElement.textContent = message.content;
      }

      if (lastMessageTimeElement) {
        lastMessageTimeElement.textContent = message.time;
      }
      const chatList = document.getElementById("chat-list");
      const chatItem = chatElement.closest("li");

      if (chatList && chatItem) {
        if (chatList.firstChild !== chatItem) {
          chatList.prepend(chatItem);
        }
      }
    }
  });

  // socket.on("updateUnreadCount", (data) => {
  //   const { chatId, unreadMessagesCount } = data;

  //   const chatElement = document.querySelector(
  //     `.chat-link[data-chat-id="${chatId}"]`
  //   );
  //   if (chatElement) {
  //     let unreadCountElement = chatElement.querySelector(".unread-count");

  //     if (!unreadCountElement) {
  //       unreadCountElement = document.createElement("span");
  //       unreadCountElement.className = "unread-count";
  //       chatElement
  //         .querySelector(".chat-details")
  //         .appendChild(unreadCountElement);
  //     }

  //     unreadCountElement.textContent =
  //       unreadMessagesCount > 0 ? `${unreadMessagesCount} unread messages` : "";
  //   }
  // });
});
