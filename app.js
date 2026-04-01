require("dotenv").config();

const express = require("express");
const app = express();

const path = require("path");
const cors = require("cors");

// ✅ NEW (Socket.IO setup requires http)
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken"); // ✅ FIXED TYPO

const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { connectDb, sequelize } = require("./utils/db");

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/user", userRoutes);
app.use("/message", messageRoutes);

// load models
const User = require("./models/usersSignup");
const Message = require("./models/message");

// relationships
User.hasMany(Message);
Message.belongsTo(User);

const PORT = process.env.PORT || 3000;

// ✅ userId → socketId mapping
const userSocketMap = {};

const startServer = async () => {
  try {
    await connectDb();
    console.log("DB connection verified");

    await sequelize.sync();
    console.log("All models synced");

    // ✅ CREATE HTTP SERVER
    const server = http.createServer(app);

    // ✅ ATTACH SOCKET.IO
    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    // ✅ MAKE IO AVAILABLE IN CONTROLLERS
    app.set("io", io);

    // ✅ SOCKET CONNECTION (merged logic)
    io.on("connection", (socket) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          console.log("❌ No token, disconnecting");
          socket.disconnect();
          return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ attach user info
        socket.userId = decoded.userId;

        // ✅ store mapping
        userSocketMap[socket.userId] = socket.id;

        console.log(
          `🟢 User connected: userId=${socket.userId}, socketId=${socket.id}`,
        );

        console.log("👥 User map:", userSocketMap);
      } catch (err) {
        console.log("❌ Invalid token:", err.message);
        socket.disconnect();
      }

      socket.on("disconnect", () => {
        console.log(`🔴 User disconnected: socketId=${socket.id}`);

        if (socket.userId) {
          delete userSocketMap[socket.userId];
          console.log("👥 Updated user map:", userSocketMap);
        }
      });
    });

    // ✅ START SERVER
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
  }
};

startServer();
