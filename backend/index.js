import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend address
  },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  let currentRoom = null;
  let currentUser = null;

  socket.on('drawingChange', (data) => {
    socket.to(data.roomId).emit('drawingUpdate', data.drawingData);
  });

  // When a user joins a room
  socket.on("join", ({ roomId, userName }) => {
    if (currentRoom) {
      socket.leave(currentRoom); // Leave the previous room if any
      rooms.get(currentRoom).delete(currentUser); // Remove the user from the previous room
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom))); // Emit the updated user list
    }

    currentRoom = roomId;
    currentUser = userName;

    socket.join(roomId); // Join the new room

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set()); // Create a new room if it doesn't exist
    }

    rooms.get(roomId).add(userName); // Add the user to the room

    io.to(roomId).emit("userJoined", Array.from(rooms.get(roomId))); // Emit the updated user list for the new room
    console.log(
      "Emitting userJoined event with users:",
      Array.from(rooms.get(roomId))
    );
  });

  socket.on("sendMessage", ({ roomId, message }) => {
    // Broadcast to ALL users in the room INCLUDING the sender
    io.to(roomId).emit("chatMessage", message);
  });

  // On the server (add to your socket.io handlers)
  socket.on("whiteboardChange", ({ roomId, content }) => {
    // Broadcast whiteboard updates to everyone in the room
    socket.to(roomId).emit("whiteboardUpdate", content);
  });

  socket.on("cursorMove", ({ roomId, userName, position }) => {
    // Broadcast cursor positions to everyone in the room
    socket.to(roomId).emit("cursorPosition", { user: userName, position });
  });

  // Handle code changes and broadcast them to other users in the room
  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeUpdate", code);
  });

  // Handle when a user leaves the room
  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser); // Remove the user from the room
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom))); // Emit the updated user list

      socket.leave(currentRoom); // Leave the room
      currentRoom = null;
      currentUser = null;
    }
  });

  // Handle typing event to show typing indicator
  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  // Handle language change and broadcast it to other users in the room
  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser); // Remove user on disconnect
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom))); // Emit updated user list
    }
    console.log("User Disconnected");
  });
});

const port = 5000;

app.get("/", (req, res)=> {
    res.send("Hello World");
})

// const __dirname = path.resolve();

// app.use(express.static(path.join(__dirname, "/frontend/dist"))); // Serve the frontend

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
// });

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
