import React, { useState } from 'react';


interface PerfectSquareComponentProps {
  number: number;
  correctAnswer: number;
  promptText: string;
  onAnswer: (answer: string) => void;
}

export default function PerfectSquareComponent({
  number,
  correctAnswer,
  promptText,
  onAnswer
}: PerfectSquareComponentProps) {
  const [userAnswer, setUserAnswer] = useState('');

  const handleSubmit = () => {
    if (userAnswer.trim()) {
      onAnswer(userAnswer.trim());
    }
  };

  return (
    <div className="interactive-card">
      <div className="p-6">
        <div className="text-center space-y-6">
          <div className="interactive-card-description">
            {promptText}
          </div>
          
          {/* Visual grid representation */}
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
            <div className="text-8xl font-bold text-gray-800 mb-6">
              {number}
            </div>
            
            {/* Create a visual grid if it's a perfect square */}
            {correctAnswer > 0 && (
              <div className="flex justify-center mb-6">
                <div 
                  className="grid gap-2 bg-gray-200 p-4 rounded-lg"
                  style={{ 
                    gridTemplateColumns: `repeat(${correctAnswer}, 1fr)`,
                    width: `${Math.min(correctAnswer * 30 + 32, 300)}px`
                  }}
                >
                  {Array.from({ length: number }, (_, i) => (
                    <div 
                      key={i}
                      className="w-6 h-6 bg-blue-400 border border-blue-500 rounded-sm"
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-xl text-gray-600">
              Can {number} be arranged in a perfect square?
            </div>
          </div>
          
          {/* Answer input */}
          <div className="flex items-center space-x-2">
            <div className="text-white">
              What is the square root of {number}?
            </div>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-24 text-white bg-gray-700 border-gray-600 placeholder-gray-400 text-center rounded px-2 py-1"
              placeholder="?"
            />
          </div>
          
          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            className="px-6 py-3 text-lg bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            Submit Answer
          </button>
          
          <div className="text-sm text-gray-600 mt-4">
            Tip: What number times itself equals {number}?
          </div>
        </div>
      </div>
    </div>
  );
}