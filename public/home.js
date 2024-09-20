document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login";
    return;
  }
  const socket = await io("http://localhost:3000", {
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

  const welcomeMessage = document.getElementById("welcome-message");
  const username = localStorage.getItem("username");

  if (username && welcomeMessage) {
    welcomeMessage.textContent = `مرحبا ${username} `;
  }

  document
    .getElementById("logout-button")
    .addEventListener("click", function (event) {
      event.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      window.location.href = "login";
    });

  try {
    const response = await fetch("http://localhost:3000/api/private-chats/", {
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
      alert("خطأ في الاتصال بالخادم");
    }
  } catch (error) {
    console.error("Error fetching chats:", error);
    alert("حدث خطأ أثناء جلب المحادثات.");
  }
  async function showChats(chats) {
    chatList.innerHTML = "";
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

      const unreadCount = document.createElement("span");
      unreadCount.className = "unread-count";
      unreadCount.textContent =
        chat.unreadMessagesCount > 0
          ? `${chat.unreadMessagesCount} unread messages`
          : "";

      chatDetails.appendChild(chatName);
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

  async function displayMessages(chatId) {
    const messageList = document.getElementById("message-list");
    messageList.innerHTML = "";

    try {
      const response = await fetch(
        `http://localhost:3000/api/private-chats/${chatId}/messages/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const messages = await response.json();
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
      } else {
        alert("خطأ في الاتصال بالخادم");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      alert("حدث خطأ أثناء جلب الرسائل.");
    }
  }

  chatList.addEventListener("click", async function (event) {
    if (event.target.closest(".chat-link")) {
      event.preventDefault();
      const chatId = event.target.closest(".chat-link").dataset.chatId;
      const name = event.target.closest(".chat-link").dataset.chatName;
      const status = event.target.closest(".chat-link").dataset.chatStatus;

      // إزالة أي شات محدد مسبقًا
      const allChatLinks = document.querySelectorAll(".chat-link");
      allChatLinks.forEach((link) => link.classList.remove("active"));

      // تعيين الشات الجديد كمحدد
      event.target.closest(".chat-link").classList.add("active");

      // إرسال الحدث للسيرفر لإعلامه بأن المستخدم فتح الشات
      socket.emit("openChat", { chatId });
      await displayMessages(chatId);
      // تحديث معلومات الشات في الواجهة
      chatStatus.textContent = status;
      chatName.textContent = name;
      socket.emit("updateUnreadCount",{ chatId, unreadMessagesCount:0 })
      // العثور على عنصر الشات المراد
      const chatElement = document.querySelector(
        `.chat-link[data-chat-id="${chatId}"]`
      );

      if (chatElement) {
        let unreadCountElement = chatElement.querySelector(".unread-count");

        // إذا كان هناك عنصر عدد الرسائل الغير مقروءة
        if (!unreadCountElement) {
          unreadCountElement = document.createElement("span");
          unreadCountElement.className = "unread-count";
          chatElement
            .querySelector(".chat-details")
            .appendChild(unreadCountElement);
        }

        // تصفير عدد الرسائل غير المقروءة عند فتح الشات
        unreadCountElement.textContent = "";
      }
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
  function sendMessage() {
    const messageInput = document.getElementById("message-input");
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
  socket.on("updateUnreadCount", (data) => {
    const { chatId, unreadMessagesCount } = data;

    const chatElement = document.querySelector(
      `.chat-link[data-chat-id="${chatId}"]`
    );
    if (chatElement) {
      let unreadCountElement = chatElement.querySelector(".unread-count");

      if (!unreadCountElement) {
        unreadCountElement = document.createElement("span");
        unreadCountElement.className = "unread-count";
        chatElement
          .querySelector(".chat-details")
          .appendChild(unreadCountElement);
      }

      unreadCountElement.textContent =
        unreadMessagesCount > 0 ? `${unreadMessagesCount} unread messages` : "";
    }
  });
});
