import React, { useState } from 'react';
import { generateUniversalPrompt, UniversalPromptConfig } from '../utils/universalRenderer';

interface StripComponentProps {
  segments: number;
  shadedSegments: number;
  correctAnswer: number;
  onAnswer: (answer: number) => void;
  resetTrigger?: number;
  standardCode?: string;
  lessonTitle?: string;
}

const StripComponent: React.FC<StripComponentProps> = ({
  segments,
  shadedSegments,
  correctAnswer,
  onAnswer,
  resetTrigger = 0,
  standardCode,
  lessonTitle
}) => {
  const [userInput, setUserInput] = useState('');

  // Reset input when resetTrigger changes
  React.useEffect(() => {
    setUserInput('');
  }, [resetTrigger]);

  const handleSubmit = () => {
    const userAnswer = parseFloat(userInput.replace('%', ''));
    if (!isNaN(userAnswer)) {
      onAnswer(userAnswer);
    }
  };

  // Generate universal prompt
  const universalConfig: UniversalPromptConfig = {
    type: 'strip-percentage',
    standardCode: standardCode || '6.NS.1.a',
    lessonTitle: lessonTitle || 'Strip Model Practice',
    context: { segments, shadedSegments }
  };

  const promptText = generateUniversalPrompt(universalConfig);

  return (
    <div className="text-center mb-4">
      {/* Universal prompt text */}
      <div className="text-2xl font-semibold mb-4 text-white">
        {promptText}
      </div>
      
      <div className="bg-gray-600 p-4 rounded-lg border-2 border-gray-400 mb-4">
        <div className="flex justify-center">
          {Array.from({length: segments}, (_, i) => (
            <div
              key={i}
              className={`w-8 h-16 border border-gray-400 ${
                i < shadedSegments ? 'bg-green-500' : 'bg-white'
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-white mt-2 font-medium">
          {shadedSegments} out of {segments} segments shaded
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter percentage..."
          className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
        <span className="text-white">%</span>
        <button 
          onClick={handleSubmit}
          disabled={!userInput.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default StripComponent;