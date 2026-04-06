// ================= DOM =================
const chatContainer = document.getElementById("chatContainer");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const suggestionsDiv = document.getElementById("suggestions");

const receiverInput = document.getElementById("receiverInput");
const userResults = document.getElementById("userResults");
const groupChatBtn = document.getElementById("groupChatBtn");
const chatList = document.getElementById("chatList");
const chatTitle = document.getElementById("chatTitle");
const logoutBtn = document.getElementById("logoutBtn");

// ================= AUTH =================
const token = localStorage.getItem("token");
const currentUsername = localStorage.getItem("username");

// ================= SOCKET =================
const socket = io("http://localhost:3000", {
  auth: { token },
});

// ================= USER =================
function getCurrentUserId(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).userId;
  } catch {
    localStorage.clear();
    window.location.href = "./login.html";
  }
}

const currentUserId = getCurrentUserId(token);

// ================= STATE =================
let currentMode = "group";
let roomId = null;
let selectedUserId = null;

const groupMessages = [];
const personalMessages = {};
const recentChats = {};

// ================= ROOM =================
function getRoomId(user1, user2) {
  return [user1.toLowerCase(), user2.toLowerCase()].sort().join("_");
}

// ================= LOGOUT =================
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "./login.html";
});

// ================= LOAD GROUP =================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await axios.get("http://localhost:3000/message/all", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const groupMsgs = res.data.filter((msg) => msg.type === "group");

    groupMsgs.forEach((msg) => {
      groupMessages.push(msg);

      createMessage(
        msg.text,
        msg.User?.name || msg.name,
        msg.UserId === currentUserId,
      );
    });

    renderChatList();
  } catch (err) {
    console.error(err);
  }
});

// ================= GROUP CHAT =================
groupChatBtn.addEventListener("click", () => {
  currentMode = "group";
  roomId = null;
  selectedUserId = null;

  chatTitle.innerText = "🌐 Public Room";
  chatContainer.innerHTML = "";

  groupMessages.forEach((msg) => {
    createMessage(
      msg.text,
      msg.User?.name || msg.name,
      msg.UserId === currentUserId,
    );
  });
});

// ================= SEARCH USERS =================
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

// ================= START PERSONAL CHAT =================
async function startPersonalChat(user) {
  console.log("Opening chat with:", user.name);

  selectedUserId = user.id;
  roomId = getRoomId(currentUsername, user.name);

  currentMode = "personal";

  chatTitle.innerText = `💬 ${user.name}`;
  chatContainer.innerHTML = "";

  userResults.innerHTML = "";
  receiverInput.value = "";

  socket.emit("join_room", { roomId });

  try {
    const res = await axios.get(
      `http://localhost:3000/message/personal/${roomId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    personalMessages[roomId] = res.data;

    if (!res.data.length) {
      const empty = document.createElement("div");
      empty.className = "text-center text-gray-400 mt-4";
      empty.innerText = "Start your conversation 👋";
      chatContainer.appendChild(empty);
    }

    res.data.forEach((msg) => {
      createMessage(
        msg.text,
        msg.User?.name || msg.name,
        msg.UserId === currentUserId,
      );
    });

    recentChats[roomId] = user;
    renderChatList();
  } catch (err) {
    console.error(err);
  }
}

// ================= SIDEBAR =================
function renderChatList() {
  if (!chatList) return;

  chatList.innerHTML = "";

  const pub = document.createElement("div");
  pub.className =
    "p-4 border-b border-gray-800 cursor-pointer hover:bg-[#202c33]";
  pub.innerText = "🌐 Public Room";
  pub.onclick = () => groupChatBtn.click();
  chatList.appendChild(pub);

  Object.keys(recentChats).forEach((room) => {
    const user = recentChats[room];

    const div = document.createElement("div");
    div.className =
      "p-4 border-b border-gray-800 cursor-pointer hover:bg-[#202c33]";
    div.innerText = `💬 ${user.name}`;

    div.onclick = () => startPersonalChat(user);

    chatList.appendChild(div);
  });
}

// ================= MESSAGE UI =================
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

// ================= AI INPUT SUGGESTIONS =================
input.addEventListener("input", async () => {
  const text = input.value.trim();

  if (text.length < 3) {
    suggestionsDiv.innerHTML = "";
    return;
  }

  try {
    const res = await axios.post("http://localhost:3000/ai/predict", {
      text,
    });

    renderSuggestions(res.data);
  } catch (err) {
    console.error(err);
  }
});

// ================= RECEIVE =================
socket.on("group_message", (msg) => {
  groupMessages.push(msg);

  if (currentMode === "group") {
    createMessage(msg.text, msg.name, msg.UserId === currentUserId);
  }
});

socket.on("new_message", async (msg) => {
  console.log("RECEIVED:", msg);

  const msgRoom = msg.roomId;

  if (!personalMessages[msgRoom]) {
    personalMessages[msgRoom] = [];
  }

  personalMessages[msgRoom].push(msg);

  recentChats[msgRoom] = { id: msg.UserId, name: msg.name };
  renderChatList();

  if (msg.UserId === currentUserId) return;

  if (currentMode === "personal" && msgRoom === roomId) {
    createMessage(msg.text, msg.name, false);
  }

  // 🔥 AI reply suggestions
  try {
    const res = await axios.post("http://localhost:3000/ai/replies", {
      message: msg.text,
    });

    renderSuggestions(res.data);
  } catch (err) {
    console.error(err);
  }
});

// ================= SEND =================
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

    socket.emit("send_message", { roomId, text });

    createMessage(text, currentUsername, true);
  }

  input.value = "";
  suggestionsDiv.innerHTML = "";
});

// ENTER SEND
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendBtn.click();
  }
});

// ================= AI RENDER =================
function renderSuggestions(list) {
  suggestionsDiv.innerHTML = "";

  list.forEach((text) => {
    const btn = document.createElement("button");

    btn.innerText = text;
    btn.className = "bg-[#202c33] px-3 py-1 rounded text-sm hover:bg-[#2a3942]";

    btn.onclick = () => {
      input.value = text;
    };

    suggestionsDiv.appendChild(btn);
  });
}

// ================= ERROR =================
socket.on("connect_error", (err) => {
  if (err.message === "Authentication error") {
    alert("Session expired");
    localStorage.clear();
    window.location.href = "./login.html";
  }
});
