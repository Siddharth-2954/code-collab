import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    default: "// start code here",
  },
  whiteboardContent: {
    type: String,
    default: "",
  },
  drawingData: {
    type: Array,
    default: [],
  },
  cursorPosition: {
    type: Object,
    default: { x: 0, y: 0 },
  },
  chatMessages: {
    type: Array,
    default: [],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Create compound index for efficient queries
ProgressSchema.index({ roomId: 1, userName: 1 }, { unique: true });

export default mongoose.model("Progress", ProgressSchema);