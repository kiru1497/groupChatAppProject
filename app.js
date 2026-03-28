require("dotenv").config();

const express = require("express");
const app = express();

const path = require("path");
const cors = require("cors");

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

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
  }
};

startServer();
