import { Code, Moon, Sun } from "lucide-react";

const JoinRoom = ({
  darkMode,
  roomId,
  userName,
  setRoomId,
  setUserName,
  joinRoom,
  isJoining,
  toggleDarkMode,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-800'}`}>
      <div className={`backdrop-blur-sm rounded-xl shadow-xl p-8 max-w-md w-full transition-all duration-300 transform ${darkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white bg-opacity-90'}`}>
        <div className="flex flex-col items-center mb-8">
          <div className={`flex items-center mb-4 p-3 rounded-full ${darkMode ? 'bg-blue-600' : 'bg-blue-100'}`}>
            <Code className={`h-10 w-10 ${darkMode ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>CodeCollab</h1>
          <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Real-time collaborative coding with integrated whiteboard & chat
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="roomId" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Room ID
            </label>
            <input
              type="text"
              id="roomId"
              className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="userName" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Your Name
            </label>
            <input
              type="text"
              id="userName"
              className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <button
            className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all duration-300 ${
              isJoining ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            onClick={joinRoom}
            disabled={isJoining || !roomId || !userName}
          >
            {isJoining ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining...
              </span>
            ) : (
              "Join Room"
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;