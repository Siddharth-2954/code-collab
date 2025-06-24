import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  userName: { type: String, required: true },
  code: { type: String, default: "" },
  whiteboardContent: { type: String, default: "" },
  cursorPosition: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
  drawingData: { type: Array, default: [] },
  lastUpdated: { type: Date, default: Date.now },
});

const Progress = mongoose.model("Progress", ProgressSchema);

export default Progress;
