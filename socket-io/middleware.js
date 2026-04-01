const jwt = require("jsonwebtoken");

module.exports = (socket, next, userSocketMap) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.userId = decoded.userId;

    // map user → socket
    userSocketMap[socket.userId] = socket.id;

    next();
  } catch (err) {
    console.log("Socket auth error:", err.message);
    next(new Error("Authentication error"));
  }
};
