const chatContainer = document.getElementById("chatContainer");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// simulate logged-in user
const currentUser = "me";

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

// send message
sendBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;

  createMessage(text, "me");

  input.value = "";
});

// press enter
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

// demo messages
createMessage("Hey! Welcome to the group chat 👋", "other");
createMessage("Thanks! Looks great!", "me");
