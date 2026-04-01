module.exports = (io, socket, userSocketMap) => {
  // example: listen for message (optional if you later move sending to socket)
  socket.on("sendMessage", (data) => {
    const { text } = data;

    if (!text) return;

    const messagePayload = {
      text,
      UserId: socket.userId,
    };

    // broadcast to all
    io.emit("newMessage", messagePayload);
  });
};
