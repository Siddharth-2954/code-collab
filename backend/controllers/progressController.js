import Progress from "../models/Progress.js";

// Save user progress
export const saveProgress = async (req, res) => {
  console.log("Save progress request received:", req.body);
  const { roomId, userName, code, whiteboardContent, cursorPosition, drawingData } = req.body;

  try {
    const progress = await Progress.findOneAndUpdate(
      { roomId, userName },
      {
        $set: {
          code: code || "// start code here",
          whiteboardContent: whiteboardContent || "",
          cursorPosition: cursorPosition || { x: 0, y: 0 },
          drawingData: drawingData || [],
          lastUpdated: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    console.log("Progress saved successfully:", progress);
    res.status(200).json({ message: "Progress saved successfully", progress });
  } catch (err) {
    console.error("Error saving progress:", err);
    res.status(500).json({ error: "Failed to save progress", details: err.message });
  }
};

// Retrieve user progress
export const getProgress = async (req, res) => {
  console.log("Get progress request:", req.params);
  const { roomId, userName } = req.params;

  if (!roomId || !userName) {
    return res.status(400).json({ error: "roomId and userName are required" });
  }

  try {
    const progress = await Progress.findOne({ roomId, userName });

    if (progress) {
      console.log("Progress found:", progress);
      res.status(200).json(progress);
    } else {
      console.log("No progress found for:", { roomId, userName });
      // Return default progress instead of 404
      const defaultProgress = {
        roomId,
        userName,
        code: "// start code here",
        whiteboardContent: "",
        cursorPosition: { x: 0, y: 0 },
        drawingData: [],
        lastUpdated: new Date()
      };
      res.status(200).json(defaultProgress);
    }
  } catch (err) {
    console.error("Error retrieving progress:", err);
    res.status(500).json({ error: "Failed to retrieve progress", details: err.message });
  }
};