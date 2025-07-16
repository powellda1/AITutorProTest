import React, { useState } from 'react';


interface ScalingComponentProps {
  originalValue: number;
  scaleFactor: number;
  correctAnswer: number;
  promptText: string;
  onAnswer: (answer: string) => void;
}

export default function ScalingComponent({
  originalValue,
  scaleFactor,
  correctAnswer,
  promptText,
  onAnswer
}: ScalingComponentProps) {
  const [userAnswer, setUserAnswer] = useState('');

  const handleSubmit = () => {
    if (userAnswer.trim()) {
      onAnswer(userAnswer.trim());
    }
  };

  const scaleType = scaleFactor > 1 ? 'up' : 'down';

  return (
    <div className="interactive-card">
      <div className="p-6">
        <div className="text-center space-y-6">
          <div className="interactive-card-description">
            {promptText}
          </div>
          
          {/* Visual representation of scaling */}
          <div className="bg-white p-6 rounded-lg border-2 border-gray-300 shadow-inner">
            <div className="space-y-4">
              <div className="text-lg font-bold text-gray-800">
                Original Value: {originalValue}
              </div>
              
              <div className="flex items-center justify-center space-x-4 text-2xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">
                    {originalValue}
                  </div>
                  <div className="text-sm text-gray-600">Original</div>
                </div>
                
                <div className="text-4xl text-blue-600">
                  ×
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {scaleFactor}
                  </div>
                  <div className="text-sm text-gray-600">Scale Factor</div>
                </div>
                
                <div className="text-4xl text-gray-600">
                  =
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-400">
                    ?
                  </div>
                  <div className="text-sm text-gray-600">Result</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 text-center">
                Scaling {scaleType} by a factor of {scaleFactor}
              </div>
            </div>
          </div>

          {/* Visual bars to show scaling effect */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-3">Visual representation:</div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600 w-16">Original:</div>
                <div 
                  className="bg-blue-400 h-6 rounded"
                  style={{ width: `${originalValue * 10}px` }}
                />
                <div className="text-sm font-medium">{originalValue}</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600 w-16">Scaled:</div>
                <div 
                  className="bg-green-400 h-6 rounded"
                  style={{ width: `${originalValue * scaleFactor * 10}px` }}
                />
                <div className="text-sm font-medium">?</div>
              </div>
            </div>
          </div>
          
          {/* Answer input */}
          <div className="space-y-4">
            <div className="text-lg text-gray-600">Your answer:</div>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-32 p-3 text-xl font-bold text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="?"
            />
          </div>
          
          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            className={`mt-6 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg ${
              userAnswer.trim() 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 hover:shadow-xl transform hover:scale-105 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Answer
          </button>
          
          <div className="text-sm text-gray-600 mt-4">
            Tip: Multiply the original value by the scale factor
          </div>
        </div>
      </div>
    </div>
  );
}