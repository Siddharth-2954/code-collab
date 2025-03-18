import { Users, Code, ChevronLeft, MessageSquare, Send, LogOut } from "lucide-react";

const Sidebar = ({
  darkMode,
  sidebarOpen,
  toggleSidebar,
  activeTab,
  setActiveTab,
  roomId,
  users,
  userName,
  messages,
  newMessage,
  setNewMessage,
  handleMessageSend,
  leaveRoom,
  typing,
  unreadCount,
  getColorForUser,
}) => {
  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "Invalid time";
    }
  };

  return (
    <div
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg flex flex-col transition-all duration-300 ${
        sidebarOpen ? "w-72" : "w-0"
      } overflow-hidden`}
    >
      <div className={`p-4 flex items-center justify-between border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
          <div className={`p-2 rounded-md ${darkMode ? 'bg-blue-600' : 'bg-blue-100'}`}>
            <Code className={`h-5 w-5 ${darkMode ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <h2 className={`text-lg font-semibold ml-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>CodeCollab</h2>
        </div>
        <button
          onClick={toggleSidebar}
          className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          className={`flex-1 py-3 ${
            activeTab === "users"
              ? darkMode
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-blue-600 border-b-2 border-blue-600"
              : darkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("users")}
        >
          <Users className="h-5 w-5 mx-auto" />
        </button>
        <button
          className={`flex-1 py-3 relative ${
            activeTab === "chat"
              ? darkMode
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-blue-600 border-b-2 border-blue-600"
              : darkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          <MessageSquare className="h-5 w-5 mx-auto" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-1/4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "users" && (
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className={`font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Room: {roomId}
          </h3>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user}
                className={`flex items-center p-2 rounded-md ${
                  user === userName
                    ? darkMode ? 'bg-gray-700' : 'bg-blue-50'
                    : darkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className={`h-8 w-8 rounded-full ${getColorForUser(user)} flex items-center justify-center text-white font-medium`}>
                  {user.charAt(0).toUpperCase()}
                </div>
                <span className={`ml-2 ${user === userName ? 'font-semibold' : ''}`}>
                  {user} {user === userName && "(You)"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="flex flex-col h-full">
          <div id="chat-messages" className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.sender === "system"
                    ? "text-center my-2"
                    : msg.sender === userName
                    ? "flex justify-end"
                    : "flex justify-start"
                }`}
              >
                {msg.sender === "system" ? (
                  <div className={`inline-block px-3 py-1 rounded-md text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.sender === userName
                        ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.sender !== userName && (
                      <div className="font-semibold text-xs mb-1">
                        {msg.sender}
                      </div>
                    )}
                    <p className="break-words">{msg.text}</p>
                    <div className="text-xs opacity-70 text-right mt-1">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className={`text-xs italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {typing}
              </div>
            )}
          </div>
          <div className={`p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex">
              <input
                type="text"
                className={`flex-1 px-3 py-2 rounded-l-md border focus:outline-none focus:ring-1 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                }`}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleMessageSend()}
              />
              <button
                className={`px-3 py-2 rounded-r-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                onClick={handleMessageSend}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`p-3 mt-auto border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={leaveRoom}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${
            darkMode
              ? 'bg-red-800 hover:bg-red-900 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default Sidebar;