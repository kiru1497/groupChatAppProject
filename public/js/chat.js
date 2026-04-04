const chatContainer = document.getElementById("chatContainer");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const receiverInput = document.getElementById("receiverInput");
const userResults = document.getElementById("userResults");
const groupChatBtn = document.getElementById("groupChatBtn");
const chatList = document.getElementById("chatList"); // ✅ ADDED
const chatTitle = document.getElementById("chatTitle");
const logoutBtn = document.getElementById("logoutBtn");

const token = localStorage.getItem("token");

// connect socket
const socket = io("http://localhost:3000", {
  auth: { token },
});

// decode token
function getCurrentUserIdFromToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).userId;
  } catch {
    localStorage.removeItem("token");
    window.location.href = "./login.html";
  }
}

const currentUserId = getCurrentUserIdFromToken(token);

// state
let currentMode = "group";
let roomId = null;
let selectedUserId = null;

const groupMessages = [];
const personalMessages = {};
const recentChats = {}; // ✅ IMPORTANT

// room generator
function getRoomId(user1, user2) {
  return [user1, user2].sort().join("_");
}

// ================== LOGOUT ==================
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "./login.html";
});

// ================== LOAD GROUP ==================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await axios.get("http://localhost:3000/message/all", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const groupMsgs = res.data.filter((msg) => msg.type === "group");

    groupMsgs.forEach((msg) => {
      groupMessages.push(msg);

      const isMe = msg.UserId === currentUserId;

      if (currentMode === "group") {
        createMessage(msg.text, msg.User.name, isMe);
      }
    });
  } catch (err) {
    console.error(err);
  }
});

// ================== GROUP CHAT ==================
groupChatBtn.addEventListener("click", () => {
  currentMode = "group";
  roomId = null;
  selectedUserId = null;

  chatTitle.innerText = "🌐 Public Room";

  chatContainer.innerHTML = "";

  groupMessages.forEach((msg) => {
    const isMe = msg.UserId === currentUserId;
    createMessage(
      msg.text,
      msg.name || msg.User?.name || `User ${msg.UserId}`,
      isMe,
    );
  });
});

// ================== SEARCH USERS ==================
receiverInput.addEventListener("input", async () => {
  const query = receiverInput.value.trim();

  if (!query) {
    userResults.innerHTML = "";
    return;
  }

  try {
    const res = await axios.get(
      `http://localhost:3000/user/search?name=${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    userResults.innerHTML = "";
    userResults.className =
      "absolute bg-[#202c33] border border-gray-700 w-full mt-1 rounded shadow z-10";

    res.data.forEach((user) => {
      const div = document.createElement("div");
      div.className =
        "p-3 hover:bg-[#2a3942] cursor-pointer text-sm text-white";
      div.innerText = user.name;

      div.onclick = () => startPersonalChat(user);

      userResults.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
});

// ================== START PERSONAL CHAT ==================
async function startPersonalChat(user) {
  selectedUserId = user.id;
  roomId = getRoomId(currentUserId, selectedUserId);

  currentMode = "personal";
  chatTitle.innerText = user.name;

  socket.emit("join_room", { roomId });

  try {
    // ✅ LOAD FROM DB
    const res = await axios.get(
      `http://localhost:3000/message/personal/${roomId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    personalMessages[roomId] = res.data;

    chatContainer.innerHTML = "";

    res.data.forEach((msg) => {
      createMessage(
        msg.text,
        msg.User?.name || msg.name,
        msg.UserId === currentUserId,
      );
    });

    // ✅ UPDATE SIDEBAR
    recentChats[roomId] = user;
    renderChatList();
  } catch (err) {
    console.error(err);
  }
}

// ================== CHAT LIST ==================
function renderChatList() {
  if (!chatList) return;

  chatList.innerHTML = "";

  Object.keys(recentChats).forEach((room) => {
    const user = recentChats[room];

    const div = document.createElement("div");
    div.className =
      "p-4 border-b border-gray-800 cursor-pointer hover:bg-[#202c33]";
    div.innerText = user.name;

    div.onclick = () => startPersonalChat(user);

    chatList.appendChild(div);
  });
}

// ================== MESSAGE UI ==================
function createMessage(text, name, isMe) {
  const wrapper = document.createElement("div");
  wrapper.className = `flex ${isMe ? "justify-end" : "justify-start"}`;

  const bubble = document.createElement("div");

  bubble.className = `
    max-w-xs px-4 py-2 rounded-lg text-sm relative
    ${isMe ? "bg-[#005c4b]" : "bg-[#202c33]"}
  `;

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  bubble.innerHTML = `
    ${!isMe ? `<p class="text-xs font-semibold mb-1 opacity-70">${name}</p>` : ""}
    <p>${text}</p>
    <span class="text-[10px] opacity-60 float-right mt-1">${time}</span>
  `;

  wrapper.appendChild(bubble);
  chatContainer.appendChild(wrapper);

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ================== RECEIVE GROUP ==================
socket.on("group_message", (msg) => {
  groupMessages.push(msg);

  if (currentMode !== "group") return;

  const isMe = msg.UserId === currentUserId;
  createMessage(msg.text, msg.name, isMe);
});

// ================== RECEIVE PERSONAL ==================
socket.on("new_message", (msg) => {
  const msgRoom = msg.roomId;

  if (!personalMessages[msgRoom]) {
    personalMessages[msgRoom] = [];
  }

  personalMessages[msgRoom].push(msg);

  // ✅ UPDATE SIDEBAR
  recentChats[msgRoom] = { id: msg.UserId, name: msg.name };
  renderChatList();

  if (currentMode !== "personal" || msgRoom !== roomId) return;

  const isMe = msg.UserId === currentUserId;
  createMessage(msg.text, msg.name, isMe);
});

// ================== SEND ==================
sendBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;

  if (currentMode === "group") {
    socket.emit("group_message", text);
  } else {
    if (!roomId) {
      alert("Start a chat first");
      return;
    }

    socket.emit("send_message", {
      roomId,
      text,
    });
  }

  input.value = "";
});

// ENTER key
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendBtn.click();
  }
});

// ================== ERROR ==================
socket.on("connect_error", (err) => {
  if (err.message === "Authentication error") {
    alert("Session expired");
    localStorage.removeItem("token");
    window.location.href = "./login.html";
  }
});
