import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import Editor from "@monaco-editor/react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditorArea = forwardRef(({
  darkMode,
  activeEditor,
  language,
  code,
  handleCodeChange,
  typing,
  notification,
  whiteboardData,
  handleWhiteboardChange,
  whiteboardMode,
  drawingData,
  setDrawingData,
  isDrawing,
  setIsDrawing,
  drawingColor,
  drawingSize,
  collaboratorCursors,
  cursorColors,
  userName,
  roomId,
  socket,
  isInitialLoad,
  setIsSaving,
}, ref) => {
  const quillRef = useRef(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const currentLineRef = useRef(null);

  // Expose canvas functions to parent component
  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      if (contextRef.current && canvasRef.current) {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setDrawingData([]);
        socket.emit("drawingChange", { roomId, drawingData: [] });
      }
    },
    saveCanvas: () => {
      if (canvasRef.current) {
        setIsSaving(true);
        try {
          const canvas = canvasRef.current;
          const link = document.createElement('a');
          link.download = `whiteboard-${roomId}-${new Date().toISOString().slice(0, 10)}.png`;
          link.href = canvas.toDataURL();
          link.click();
        } catch (error) {
          console.error('Error saving canvas:', error);
        } finally {
          setTimeout(() => setIsSaving(false), 1000);
        }
      }
    }
  }));

  useEffect(() => {
    if (activeEditor === 'whiteboard' && whiteboardMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      if (canvasContainerRef.current) {
        const container = canvasContainerRef.current;
        canvas.width = container.offsetWidth * 2;
        canvas.height = container.offsetHeight * 2;
      }

      const context = canvas.getContext('2d');
      context.scale(2, 2);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = drawingColor;
      context.lineWidth = drawingSize;
      contextRef.current = context;

      redrawCanvas(drawingData);

      if (isInitialLoad) {
        socket.emit("requestWhiteboardState", { roomId });
      }
    }
  }, [activeEditor, whiteboardMode, drawingColor, drawingSize, drawingData, isInitialLoad, roomId, socket]);

  const redrawCanvas = (lines) => {
    if (!contextRef.current || !canvasRef.current) return;

    const context = contextRef.current;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    lines.forEach(line => {
      if (line.points.length > 0) {
        context.beginPath();
        context.strokeStyle = line.color;
        context.lineWidth = line.size;
        context.moveTo(line.points[0].x, line.points[0].y);
        for (let i = 1; i < line.points.length; i++) {
          context.lineTo(line.points[i].x, line.points[i].y);
        }
        context.stroke();
      }
    });
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);

    currentLineRef.current = {
      id: Date.now(),
      color: drawingColor,
      size: drawingSize,
      points: [{ x: offsetX, y: offsetY }],
      user: userName
    };

    setDrawingData(prev => {
      const newData = [...prev, currentLineRef.current];
      socket.emit("drawingChange", { roomId, drawingData: newData });
      return newData;
    });
  };

  const draw = (e) => {
    if (!isDrawing || !currentLineRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    setDrawingData(prev => {
      if (!currentLineRef.current) return prev;

      const updatedData = prev.map(line => {
        if (line.id === currentLineRef.current.id) {
          return {
            ...line,
            points: [...line.points, { x: offsetX, y: offsetY }]
          };
        }
        return line;
      });
      socket.emit("drawingChange", { roomId, drawingData: updatedData });
      return updatedData;
    });
  };

  const finishDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    contextRef.current.closePath();
    socket.emit("drawingChange", { roomId, drawingData });
    currentLineRef.current = null;
  };

  const handleCursorMove = (e) => {
    if (!canvasContainerRef.current || whiteboardMode !== "draw") return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    socket.emit("cursorMove", { roomId, userName, x, y });
  };

  const renderCollaboratorCursors = () => {
    return Object.entries(collaboratorCursors).map(([user, cursor]) => {
      const userColor = cursorColors[user] || "#2563eb";
      return (
        <div
          key={user}
          className="absolute pointer-events-none z-50 flex flex-col items-start"
          style={{ left: cursor.x, top: cursor.y, transform: 'translate(8px, 8px)' }}
        >
          <div
            className="h-5 w-5 rounded-full mb-1 flex items-center justify-center"
            style={{ backgroundColor: userColor }}
          >
            <span className="text-white text-xs font-bold">
              {user.charAt(0).toUpperCase()}
            </span>
          </div>
          <div
            className="text-xs py-1 px-2 rounded whitespace-nowrap"
            style={{ backgroundColor: userColor, color: 'white' }}
          >
            {user}
          </div>
        </div>
      );
    });
  };

  const handleEditorMount = (editor, monaco) => editor.focus();

  return (
    <div className="flex-1 overflow-hidden relative">
      {notification && (
        <div className="absolute top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-out">
          {notification}
        </div>
      )}

      {renderCollaboratorCursors()}

      {activeEditor === "code" && (
        <div className="h-full">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme={darkMode ? "vs-dark" : "light"}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
          {typing && (
            <div className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
              {typing}
            </div>
          )}
        </div>
      )}

      {activeEditor === "whiteboard" && (
        <div className="h-full relative" ref={canvasContainerRef}>
          {whiteboardMode === "text" ? (
            <ReactQuill
              ref={quillRef}
              value={whiteboardData}
              onChange={handleWhiteboardChange}
              theme="snow"
              className={`h-full ${darkMode ? 'quill-dark' : ''}`}
            />
          ) : (
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={(e) => {
                draw(e);
                handleCursorMove(e);
              }}
              onMouseUp={finishDrawing}
              onMouseLeave={finishDrawing}
              className="w-full h-full cursor-crosshair"
              style={{ touchAction: 'none' }}
            />
          )}
        </div>
      )}
    </div>
  );
});

export default EditorArea;