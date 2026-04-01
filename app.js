require("dotenv").config();

const express = require("express");
const app = express();

const path = require("path");
const cors = require("cors");

// ✅ NEW (Socket.IO setup requires http)
const http = require("http");
const { Server } = require("socket.io");

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

    // ✅ SOCKET CONNECTION
    io.on("connection", (socket) => {
      console.log("🟢 User connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
      });
    });

    // ❌ REMOVE app.listen
    // ✅ USE server.listen instead
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
  }
};

startServer();
