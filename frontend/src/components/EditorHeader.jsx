import {
  ChevronRight, Code, Edit3, Copy, Check, PenTool, Type, AlignLeft, Trash2, Save, Moon, Sun
} from "lucide-react";

const EditorHeader = ({
  darkMode,
  sidebarOpen,
  toggleSidebar,
  activeEditor,
  setActiveEditor,
  language,
  handleLanguageChange,
  handleCopyCode,
  copySuccess,
  whiteboardMode,
  setWhiteboardMode,
  drawingColor,
  setDrawingColor,
  drawingSize,
  setDrawingSize,
  isSaving,
  toggleDarkMode,
}) => {
  return (
    <div className={`${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'} flex items-center justify-between px-4 py-2 border-b`}>
      <div className="flex items-center">
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className={`mr-3 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveEditor("code")}
            className={`flex items-center px-3 py-1 rounded-md ${
              activeEditor === "code"
                ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Code className="h-4 w-4 mr-1" />
            <span>Code Editor</span>
          </button>
          <button
            onClick={() => setActiveEditor("whiteboard")}
            className={`flex items-center px-3 py-1 rounded-md ${
              activeEditor === "whiteboard"
                ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Edit3 className="h-4 w-4 mr-1" />
            <span>Whiteboard</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {activeEditor === "code" && (
          <>
            <select
              value={language}
              onChange={handleLanguageChange}
              className={`px-3 py-1 rounded-md border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="cpp">C++</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
            </select>
            <button
              onClick={handleCopyCode}
              className={`p-2 rounded-md ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              title="Copy code"
            >
              {copySuccess ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </>
        )}

        {activeEditor === "whiteboard" && (
          <div className="flex items-center space-x-2">
            {whiteboardMode === "draw" ? (
              <>
                <input
                  type="color"
                  value={drawingColor}
                  onChange={(e) => setDrawingColor(e.target.value)}
                  className="w-8 h-8 p-0 border-0 rounded-md"
                  title="Drawing color"
                />
                <select
                  value={drawingSize}
                  onChange={(e) => setDrawingSize(parseInt(e.target.value))}
                  className={`p-1 rounded-md ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  title="Brush size"
                >
                  <option value="1">Thin</option>
                  <option value="3">Medium</option>
                  <option value="5">Thick</option>
                  <option value="10">Extra Thick</option>
                </select>
                <button
                  onClick={() => {}} // Placeholder for clearCanvas (moved to EditorArea)
                  className={`p-2 rounded-md ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                  }`}
                  title="Clear whiteboard"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {}} // Placeholder for saveCanvas (moved to EditorArea)
                  className={`p-2 rounded-md ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                  }`}
                  title="Save whiteboard as image"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setWhiteboardMode("draw")}
                className={`p-2 rounded-md ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
                title="Switch to drawing mode"
              >
                <PenTool className="h-4 w-4" />
              </button>
            )}

            {whiteboardMode === "text" ? (
              <button
                onClick={() => setWhiteboardMode("draw")}
                className={`p-2 rounded-md ${
                  darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700'
                }`}
                title="Text mode active"
              >
                <Type className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setWhiteboardMode("text")}
                className={`p-2 rounded-md ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
                title="Switch to text mode"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-600'}`}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default EditorHeader;