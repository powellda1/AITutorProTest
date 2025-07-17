import React, { useState } from 'react';
import { generateUniversalPrompt } from '../utils/universalRenderer';

interface TextInputComponentProps {
  correctAnswer: string;
  promptText: string;
  onAnswer: (answer: string) => void;
  standardCode?: string;
  lessonTitle?: string;
}

export default function TextInputComponent({
  correctAnswer,
  promptText,
  onAnswer,
  standardCode,
  lessonTitle
}: TextInputComponentProps) {
  const [inputValue, setInputValue] = useState('');
  
  // Generate universal prompt if promptText is empty
  const displayPrompt = promptText || generateUniversalPrompt({
    type: 'text-input',
    standardCode: standardCode || '',
    lessonTitle: lessonTitle || ''
  });

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onAnswer(inputValue.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="p-6 rounded-lg bg-gradient-to-br from-gray-500/80 via-gray-600/80 to-gray-700/80 border border-gray-400/20 backdrop-blur-sm">
      <div className="space-y-4">
        {/* Display the prompt */}
        <div className="text-2xl font-bold text-white mb-4">
          {displayPrompt}
        </div>
        
        {/* Input and submit section */}
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300"
            placeholder="Enter answer"
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={!inputValue.trim()}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}