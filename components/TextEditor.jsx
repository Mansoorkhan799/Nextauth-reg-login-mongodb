"use client";

import { useState, useEffect } from 'react';

export default function TextEditor() {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Only render the component after it's mounted on the client
  if (!mounted) {
    return <div className="bg-white rounded-lg">
      <div className="p-2">
        <div className="w-full h-[44px] rounded-lg border border-gray-200"></div>
      </div>
    </div>;
  }

  return (
    <div className="bg-white rounded-lg">
      {/* File List */}
      {files.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center bg-gray-50 rounded-full px-3 py-1 text-sm text-gray-600"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>{file.name}</span>
                <button 
                  type="button"
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-2 bg-white rounded-lg">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write here..."
            className="w-full pr-16 resize-none rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 p-3 max-h-32 min-h-[44px]"
            rows="1"
            suppressHydrationWarning
          />
          <div className="absolute right-1.5 bottom-1.5 flex items-center space-x-1">
            <label className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                suppressHydrationWarning
              />
              <svg 
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </label>
            <button
              type="submit"
              disabled={!text.trim()}
              className={`p-1.5 rounded-lg ${
                text.trim() 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-300'
              } transition-colors`}
              aria-label="Send message"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 