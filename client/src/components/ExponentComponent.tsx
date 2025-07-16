import React, { useState } from 'react';


interface ExponentComponentProps {
  base: number;
  exponent: number;
  correctAnswer: number;
  promptText: string;
  onAnswer: (answer: string) => void;
}

export default function ExponentComponent({
  base,
  exponent,
  correctAnswer,
  promptText,
  onAnswer
}: ExponentComponentProps) {
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
          
          {/* Visual representation of the exponent */}
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
            <div className="text-8xl font-bold text-gray-800">
              {base}<sup className="text-4xl text-blue-400">{exponent}</sup>
            </div>
            <div className="text-xl text-gray-600 mt-4">
              {base} to the power of {exponent}
            </div>
          </div>

          {/* Show the multiplication breakdown */}
          <div className="bg-gray-600 p-4 rounded-lg">
            <div className="text-white mb-2">This equals:</div>
            <div className="text-lg font-medium text-white">
              {Array.from({ length: exponent }, (_, i) => base).join(' × ')}
            </div>
          </div>
          
          {/* Answer input */}
          <div className="flex items-center space-x-2">
            <div className="text-white">Your answer:</div>
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
          
          <div className="text-gray-300 mt-4">
            Tip: Calculate {base} multiplied by itself {exponent} times
          </div>
        </div>
      </div>
    </div>
  );
}