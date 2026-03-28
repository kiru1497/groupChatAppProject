const chatContainer = document.getElementById("chatContainer");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// simulate logged-in user
const currentUser = "me";

// helper: decode token to get userId
function getCurrentUserIdFromToken(token) {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.userId;
}

// create message bubble
function createMessage(text, sender) {
  const wrapper = document.createElement("div");

  const isMe = sender === currentUser;

  wrapper.className = `flex ${isMe ? "justify-end" : "justify-start"}`;

  const bubble = document.createElement("div");
  bubble.className = `
    max-w-xs px-4 py-2 rounded-lg text-sm
    ${isMe ? "bg-green-500 text-white" : "bg-gray-300 text-black"}
  `;

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  bubble.innerHTML = `
    <p>${text}</p>
    <span class="text-xs opacity-70">${time}</span>
  `;

  wrapper.appendChild(bubble);
  chatContainer.appendChild(wrapper);

  // auto scroll
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ✅ LOAD MESSAGES ON PAGE LOAD
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again");
      window.location.href = "./login.html";
      return;
    }

    const res = await axios.get("http://localhost:3000/message/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // clear existing messages (important to avoid duplicates)
    chatContainer.innerHTML = "";

    const currentUserId = getCurrentUserIdFromToken(token);

    res.data.forEach((msg) => {
      const sender = msg.UserId === currentUserId ? "me" : "other";
      createMessage(msg.text, sender);
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load messages");
  }
});

// send message
sendBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:3000/message/send",
      { text },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    createMessage(text, "me");
    input.value = "";
  } catch (err) {
    console.error(err);
    alert("Failed to send message");
  }
});

// press enter (better version)
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendBtn.click();
  }
});

// demo messages (optional — you can remove later)
createMessage("Hey! Welcome to the group chat 👋", "other");
createMessage("Thanks! Looks great!", "me");
