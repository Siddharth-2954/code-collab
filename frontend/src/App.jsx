



import { useState, useEffect } from "react";
import io from "socket.io-client";
import JoinRoom from "./components/JoinRoom";
import Sidebar from "./components/Sidebar";
import EditorHeader from "./components/EditorHeader";
import EditorArea from "./components/EditorArea";

import { useRef } from 'react';

// Dynamic API URL configuration
const API_BASE_URL = "https://code-collab-1sen.onrender.com";
//  "http://localhost:5000";

const socket = io(API_BASE_URL);

const App = () => {
  // Session persistence keys
  const SESSION_KEYS = {
    JOINED: 'codecollab_joined',
    ROOM_ID: 'codecollab_roomId',
    USER_NAME: 'codecollab_userName',
    LANGUAGE: 'codecollab_language',
    DARK_MODE: 'codecollab_darkMode',
    ACTIVE_TAB: 'codecollab_activeTab',
    ACTIVE_EDITOR: 'codecollab_activeEditor'
  };

  // Initialize state with session storage
  const [joined, setJoined] = useState(() => {
    return sessionStorage.getItem(SESSION_KEYS.JOINED) === 'true';
  });
  const [roomId, setRoomId] = useState(() => {
    return sessionStorage.getItem(SESSION_KEYS.ROOM_ID) || "";
  });
  const [userName, setUserName] = useState(() => {
    return sessionStorage.getItem(SESSION_KEYS.USER_NAME) || "";
  });
  const [language, setLanguage] = useState(() => {
    return sessionStorage.getItem(SESSION_KEYS.LANGUAGE) || "javascript";
  });
  const [darkMode, setDarkMode] = useState(() => {
    return sessionStorage.getItem(SESSION_KEYS.DARK_MODE) === 'true';
  });
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem(SESSION_KEYS.ACTIVE_TAB) || "users";
  });
  const [activeEditor, setActiveEditor] = useState(() => {
    return sessionStorage.getItem(SESSION_KEYS.ACTIVE_EDITOR) || "code";
  });

  const [code, setCode] = useState("// start code here");
  const [copySuccess, setCopySuccess] = useState(false);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [notification, setNotification] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [whiteboardData, setWhiteboardData] = useState("");
  const [cursorColors, setCursorColors] = useState({});
  const [whiteboardMode, setWhiteboardMode] = useState("text");
  const [drawingData, setDrawingData] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState("#000000");
  const [drawingSize, setDrawingSize] = useState(3);
  const [collaboratorCursors, setCollaboratorCursors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [userColors] = useState({});
  const [isReconnecting, setIsReconnecting] = useState(false);

  const editorAreaRef = useRef(null);

  const clearCanvas = () => {
  if (editorAreaRef.current) {
    editorAreaRef.current.clearCanvas();
  }
};

const saveCanvas = () => {
  if (editorAreaRef.current) {
    editorAreaRef.current.saveCanvas();
  }
};

  const getColorForUser = (user) => {
    if (!userColors[user]) {
      const colors = [
        "bg-blue-600", "bg-purple-600", "bg-green-600", "bg-pink-600",
        "bg-yellow-500", "bg-red-600", "bg-indigo-600", "bg-teal-600",
        "bg-orange-600",
      ];
      userColors[user] = colors[Object.keys(userColors).length % colors.length];
    }
    return userColors[user];
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio(
        // "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLHPM+N2APRIbQ6/y8cJ9UDB1kNHY0LFuEAAdWLTu8tiPTg8gRZXj+OG4ZxkWPXrN19e6hzgYL1iw8OXQpF4kKk2U4u/k1qNkKjFwserLv6JlIVeY6P/5xpFEKkq/5+3OoXYwM2uk8/7atGsVKV7Q6/fovooyLVm78fftwp1beYC95dm5hlgZRaTt/fS7ZxknW9X8/+28cCU2YL7v8tiETC5NktPk6duhbEBwp97Uw51YIzFps+TNz7OTVjNTltzj4s6ia1Oq4O/x2bJrHTlxueLs5tW9gk9WfLfZ3N/Rr3xmSZPl5ObZtYVBcq3j9f7vyKinYy4wbK/Z5eW4iDhHpe3z/em9gVlwm9ju8/XhvIxcwuX1/ebCaBxCidbp9e/ju4pVu+v6/+a2/LDciUFLHPM+N2APRIbQ6/y8cJ9UDB1kNHY0LFuEAAdWLTu8tiPTg8gRZXj+OG4ZxkWPXrN19e6hzgYL1iw8OXQpF4kKk2U4u/k1qNkKjFwserLv6JlIVeY6P/5xpFEKkq/5+3OoXYwM2uk8/7atGsVKV7Q6/fovooyLVm78fftwp1beYC95dm5hlgZRaTt/fS7ZxknW9X8/+28cCU2YL7v8tiETC5NktPk6duhbEBwp97Uw51YIzFps+TNz7OTVjNTltzj4s6ia1Oq4O/x2bJrHTlxueLs5tW9gk9WfLfZ3N/Rr3xmSZPl5ObZtYVBcq3j9f7vyKinYy4wbK/Z5eW4iDhHpe3z/em9gVlwm9ju8/XhvIxcwuX1/ebCA"
      );
      audio.play().catch(e => console.log("Audio play failed:", e));
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Enhanced error handling for API calls
  const makeApiCall = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const fetchProgress = async () => {
    if (!roomId || !userName) return;
    
    try {
      const data = await makeApiCall(`${API_BASE_URL}/progress/${roomId}/${userName}`);
      
      if (data) {
        setCode(data.code || "// start code here");
        setWhiteboardData(data.whiteboardContent || "");
        setDrawingData(data.drawingData || []);
        setCollaboratorCursors(prev => ({
          ...prev,
          [userName]: data.cursorPosition || { x: 0, y: 0, lastUpdated: Date.now() }
        }));
        setIsInitialLoad(false);
        showNotification("Progress loaded successfully");
      } else {
        showNotification("No previous progress found");
        setIsInitialLoad(false);
      }
    } catch (err) {
      console.error("Failed to fetch progress:", err);
      showNotification("Failed to load progress - using defaults");
      setIsInitialLoad(false);
    }
  };

  const saveProgress = async (progressData) => {
    if (!progressData.roomId || !progressData.userName) return;
    
    try {
      setIsSaving(true);
      await makeApiCall(`${API_BASE_URL}/progress/save`, {
        method: "POST",
        body: JSON.stringify(progressData),
      });
      console.log("Progress saved successfully");
    } catch (err) {
      console.error("Error saving progress:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Persist state to session storage
  const persistState = (key, value) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error("Failed to persist state:", error);
    }
  };

  // Auto-rejoin room on page refresh
  useEffect(() => {
    if (joined && roomId && userName && !isReconnecting) {
      setIsReconnecting(true);
      
      // Small delay to ensure socket connection is established
      setTimeout(() => {
        socket.emit("join", { roomId, userName });
        fetchProgress();
        setIsReconnecting(false);
      }, 1000);
    }
  }, []);

  // Socket event handlers
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      // If user was previously joined, rejoin the room
      if (joined && roomId && userName) {
        socket.emit("join", { roomId, userName });
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      showNotification("Connection lost. Attempting to reconnect...");
    });

    socket.on("userJoined", (users) => {
      setUsers(users);
      if (joined && users.length > 1) {
        const newUser = users[users.length - 1];
        if (newUser !== userName) {
          showNotification(`${newUser} joined the room`);
          setMessages((prev) => [...prev, {
            sender: "system",
            text: `${newUser} joined the room`,
            timestamp: new Date().toISOString(),
          }]);
        }
      }
    });

    socket.on("codeUpdate", (newCode) => setCode(newCode));
    
    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)}... is typing`);
      setTimeout(() => setTyping(""), 2000);
    });
    
    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
      persistState(SESSION_KEYS.LANGUAGE, newLanguage);
      showNotification(`Language changed to ${newLanguage}`);
    });

    socket.on("chatMessage", (message) => {
      setMessages((prev) => {
        const messageExists = prev.some(
          (m) => m.timestamp === message.timestamp &&
            m.sender === message.sender &&
            m.text === message.text
        );
        if (!messageExists) return [...prev, message];
        return prev;
      });
      if (activeTab !== "chat") setUnreadCount((prev) => prev + 1);
      playNotificationSound();
    });

    socket.on("userLeft", (leftUser) => {
      if (leftUser && leftUser !== userName) {
        setMessages((prev) => [...prev, {
          sender: "system",
          text: `${leftUser} left the room`,
          timestamp: new Date().toISOString(),
        }]);
        showNotification(`${leftUser} left the room`);
        setCollaboratorCursors(prev => {
          const newCursors = { ...prev };
          delete newCursors[leftUser];
          return newCursors;
        });
      }
    });

    socket.on("whiteboardUpdate", (data) => {
      if (data !== whiteboardData) setWhiteboardData(data);
    });

    socket.on("drawingUpdate", (newDrawingData) => setDrawingData(newDrawingData));
    
    socket.on("cursorPosition", ({ userName: remoteUser, x, y }) => {
      if (remoteUser !== userName) {
        setCollaboratorCursors(prev => ({
          ...prev,
          [remoteUser]: { x, y, lastUpdated: Date.now() }
        }));
      }
    });

    socket.on("initialWhiteboardState", ({ textContent, drawingLines }) => {
      if (isInitialLoad) {
        setWhiteboardData(textContent || "");
        setDrawingData(drawingLines || []);
        setIsInitialLoad(false);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("chatMessage");
      socket.off("userLeft");
      socket.off("whiteboardUpdate");
      socket.off("drawingUpdate");
      socket.off("cursorPosition");
      socket.off("initialWhiteboardState");
    };
  }, [joined, userName, activeTab, whiteboardData, isInitialLoad]);

  // Cursor cleanup interval
  useEffect(() => {
    const cursorCleanupInterval = setInterval(() => {
      const now = Date.now();
      setCollaboratorCursors(prev => {
        const newCursors = { ...prev };
        Object.keys(newCursors).forEach(user => {
          if (now - newCursors[user].lastUpdated > 5000) {
            delete newCursors[user];
          }
        });
        return newCursors;
      });
    }, 1000);
    return () => clearInterval(cursorCleanupInterval);
  }, []);

  // Handle chat tab changes and scroll
  useEffect(() => {
    if (activeTab === "chat") {
      setUnreadCount(0);
      setTimeout(() => {
        const chatContainer = document.getElementById("chat-messages");
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 100);
    }
    persistState(SESSION_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab, messages]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom", { roomId, userName });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [roomId, userName]);

  // Set cursor colors for users
  useEffect(() => {
    if (joined && userName) {
      const userColor = getColorForUser(userName).replace("bg-", "");
      const colorMap = {
        "blue-600": "#2563eb", "purple-600": "#9333ea", "green-600": "#16a34a",
        "pink-600": "#db2777", "yellow-500": "#eab308", "red-600": "#dc2626",
        "indigo-600": "#4f46e5", "teal-600": "#0d9488", "orange-600": "#ea580c",
      };
      setCursorColors(prev => ({
        ...prev,
        [userName]: colorMap[userColor] || "#2563eb",
      }));
    }
  }, [joined, userName]);

  // Persist state changes
  useEffect(() => {
    persistState(SESSION_KEYS.JOINED, joined.toString());
  }, [joined]);

  useEffect(() => {
    persistState(SESSION_KEYS.ROOM_ID, roomId);
  }, [roomId]);

  useEffect(() => {
    persistState(SESSION_KEYS.USER_NAME, userName);
  }, [userName]);

  useEffect(() => {
    persistState(SESSION_KEYS.DARK_MODE, darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    persistState(SESSION_KEYS.ACTIVE_EDITOR, activeEditor);
  }, [activeEditor]);

  const joinRoom = () => {
    if (roomId && userName) {
      setIsJoining(true);
      setTimeout(() => {
        socket.emit("join", { roomId, userName });
        setJoined(true);
        setIsJoining(false);
        setMessages([{
          sender: "system",
          text: `Welcome to the room! You joined as ${userName}.`,
          timestamp: new Date().toISOString(),
        }]);
        fetchProgress();
      }, 800);
    }
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom", { roomId, userName });
    setJoined(false);
    setUsers([]);
    setMessages([]);
    setActiveTab("users");
    setSidebarOpen(true);
    setIsInitialLoad(true);
    
    // Clear session storage
    Object.values(SESSION_KEYS).forEach(key => {
      sessionStorage.removeItem(key);
    });
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
    saveProgress({ roomId, userName, code: newCode });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleMessageSend = () => {
    if (newMessage.trim()) {
      const messageData = {
        sender: userName,
        text: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };
      socket.emit("sendMessage", { roomId, message: messageData });
      setMessages((prev) => [...prev, messageData]);
      setNewMessage("");
    }
  };

  const handleWhiteboardChange = (content) => {
    if (content !== whiteboardData) {
      setWhiteboardData(content);
      socket.emit("whiteboardChange", { roomId, content });
      saveProgress({ roomId, userName, whiteboardContent: content });
    }
  };

  const handleDrawingChange = (newDrawingData) => {
    setDrawingData(newDrawingData);
    socket.emit("drawingChange", { roomId, drawingData: newDrawingData });
    saveProgress({ roomId, userName, drawingData: newDrawingData });
  };

  const handleCursorMove = (position) => {
    socket.emit("cursorMove", { roomId, userName, position });
    saveProgress({ roomId, userName, cursorPosition: position });
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Show loading state during reconnection
  if (isReconnecting) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Reconnecting to room...</p>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <JoinRoom
        darkMode={darkMode}
        roomId={roomId}
        userName={userName}
        setRoomId={setRoomId}
        setUserName={setUserName}
        joinRoom={joinRoom}
        isJoining={isJoining}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} overflow-hidden`}>
      <Sidebar
        darkMode={darkMode}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        roomId={roomId}
        users={users}
        userName={userName}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleMessageSend={handleMessageSend}
        leaveRoom={leaveRoom}
        typing={typing}
        unreadCount={unreadCount}
        getColorForUser={getColorForUser}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <EditorHeader
          darkMode={darkMode}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeEditor={activeEditor}
          clearCanvas={clearCanvas}
  saveCanvas={saveCanvas}
          setActiveEditor={setActiveEditor}
          language={language}
          handleLanguageChange={handleLanguageChange}
          handleCopyCode={handleCopyCode}
          copySuccess={copySuccess}
          whiteboardMode={whiteboardMode}
          setWhiteboardMode={setWhiteboardMode}
          drawingColor={drawingColor}
          setDrawingColor={setDrawingColor}
          drawingSize={drawingSize}
          setDrawingSize={setDrawingSize}
          isSaving={isSaving}
          toggleDarkMode={toggleDarkMode}
        />
        <EditorArea
          darkMode={darkMode}
          activeEditor={activeEditor}
          language={language}
           ref={editorAreaRef}
            setIsSaving={setIsSaving}
          code={code}
          handleCodeChange={handleCodeChange}
          typing={typing}
          notification={notification}
          whiteboardData={whiteboardData}
          handleWhiteboardChange={handleWhiteboardChange}
          whiteboardMode={whiteboardMode}
          drawingData={drawingData}
          setDrawingData={setDrawingData}
          handleDrawingChange={handleDrawingChange}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
          drawingColor={drawingColor}
          drawingSize={drawingSize}
          collaboratorCursors={collaboratorCursors}
          cursorColors={cursorColors}
          userName={userName}
          roomId={roomId}
          socket={socket}
          isInitialLoad={isInitialLoad}
          handleCursorMove={handleCursorMove}
        />
      </div>
    </div>
  );
};

export default App;