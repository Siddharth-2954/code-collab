import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import cors from "cors"; // Add this import

import connectDB from "./config/db.js";
import progressRoutes from "./routes/progressRoutes.js";
import Progress from "./models/Progress.js";

dotenv.config();

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Add CORS middleware for HTTP requests
app.use(cors({
  // origin: "http://localhost:5173", // Your frontend URL
  origin: "https://code-collab-1-ursc.onrender.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Middleware to parse JSON
app.use(express.json());

// Progress Routes
app.use("/progress", progressRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: "http://localhost:5173", // Update for frontend origin
    origin: "https://code-collab-1-ursc.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  let currentRoom = null;
  let currentUser = null;

  // When a user joins a room
  socket.on("join", async ({ roomId, userName }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom)?.delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom) || []));
    }

    currentRoom = roomId;
    currentUser = userName;

    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    rooms.get(roomId).add(userName);

    try {
      // Fetch existing progress or create default
      let progress = await Progress.findOne({ roomId, userName });
      if (!progress) {
        progress = await Progress.create({
          roomId,
          userName,
          code: "// start code here",
          whiteboardContent: "",
          drawingData: [],
          cursorPosition: { x: 0, y: 0 },
        });
        console.log(`Default progress created for ${userName} in room ${roomId}`);
      }

      // Emit progress to the current user
      socket.emit("progressFetched", progress);

    } catch (err) {
      console.error("Error fetching or creating progress:", err);
    }

    // Notify other users in the room
    io.to(roomId).emit("userJoined", Array.from(rooms.get(roomId) || []));
  });

  // Handle code change
  socket.on("codeChange", async ({ roomId, code }) => {
    socket.to(roomId).emit("codeUpdate", code);
    try {
      await Progress.findOneAndUpdate(
        { roomId, userName: currentUser },
        { $set: { code } },
        { upsert: true }
      );
    } catch (err) {
      console.error("Failed to save code progress:", err);
    }
  });

  // Handle whiteboard content change
  socket.on("whiteboardChange", async ({ roomId, content }) => {
    socket.to(roomId).emit("whiteboardUpdate", content);
    try {
      await Progress.findOneAndUpdate(
        { roomId, userName: currentUser },
        { $set: { whiteboardContent: content } },
        { upsert: true }
      );
    } catch (err) {
      console.error("Failed to save whiteboard progress:", err);
    }
  });

  // Handle drawing change
  socket.on("drawingChange", async ({ roomId, drawingData }) => {
    socket.to(roomId).emit("drawingUpdate", drawingData);
    try {
      await Progress.findOneAndUpdate(
        { roomId, userName: currentUser },
        { $set: { drawingData } },
        { upsert: true }
      );
    } catch (err) {
      console.error("Failed to save drawing progress:", err);
    }
  });

  // Handle cursor move
  socket.on("cursorMove", async ({ roomId, position }) => {
    socket.to(roomId).emit("cursorPosition", { userName: currentUser, position });
    try {
      await Progress.findOneAndUpdate(
        { roomId, userName: currentUser },
        { $set: { cursorPosition: position } },
        { upsert: true }
      );
    } catch (err) {
      console.error("Failed to save cursor position:", err);
    }
  });

  // Handle leaving a room
  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom)?.delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom) || []));
      io.to(currentRoom).emit("userLeft", currentUser);

      socket.leave(currentRoom);
      currentRoom = null;
      currentUser = null;
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom)?.delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom) || []));
      io.to(currentRoom).emit("userLeft", currentUser);
    }
    console.log("User Disconnected:", socket.id);
  });
});

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});