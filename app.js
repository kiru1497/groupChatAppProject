require("dotenv").config();

const express = require("express");
const app = express();

const path = require("path");
const cors = require("cors");
const http = require("http"); // ✅ ADD THIS

// routes
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");

// DB
const { connectDb, sequelize } = require("./utils/db");

// models
const User = require("./models/usersSignup");
const Message = require("./models/message");
const ArchivedMessage = require("./models/archivedMessages");

//cron
require("./cron/archivedMessages");

// socket init
const initSocket = require("./socket-io/index");

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/user", userRoutes);
app.use("/message", messageRoutes);

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

    // create HTTP server
    const server = http.createServer(app);

    // initialize socket.io
    const io = initSocket(server);

    // make io available in controllers
    app.set("io", io);

    // start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
  }
};

startServer();
