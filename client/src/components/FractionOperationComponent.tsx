import React, { useState } from 'react';


interface FractionOperationComponentProps {
  fraction1: string;
  fraction2: string;
  operation: 'multiply' | 'divide';
  correctAnswer: string;
  promptText: string;
  onAnswer: (answer: string) => void;
}

export default function FractionOperationComponent({
  fraction1,
  fraction2,
  operation,
  correctAnswer,
  promptText,
  onAnswer
}: FractionOperationComponentProps) {
  const [userAnswer, setUserAnswer] = useState('');

  const handleSubmit = () => {
    if (userAnswer.trim()) {
      onAnswer(userAnswer.trim());
    }
  };

  const operationSymbol = operation === 'multiply' ? '×' : '÷';

  return (
    <div className="interactive-card">
      <div className="p-6">
        <div className="text-center space-y-6">
          <div className="interactive-card-description">
            {promptText}
          </div>
          
          {/* Visual representation of the fraction operation */}
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-800">{fraction1.split('/')[0]}</div>
                <div className="border-t-4 border-gray-800 w-16 mx-auto my-2"></div>
                <div className="text-6xl font-bold text-gray-800">{fraction1.split('/')[1]}</div>
              </div>
              
              <div className="text-6xl font-bold text-blue-600">
                {operationSymbol}
              </div>
              
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-800">{fraction2.split('/')[0]}</div>
                <div className="border-t-4 border-gray-800 w-16 mx-auto my-2"></div>
                <div className="text-6xl font-bold text-gray-800">{fraction2.split('/')[1]}</div>
              </div>
              
              <div className="text-6xl font-bold text-gray-600">
                =
              </div>
              
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600">?</div>
                <div className="border-t-4 border-blue-600 w-16 mx-auto my-2"></div>
                <div className="text-6xl font-bold text-blue-600">?</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mt-4 text-center">
              {operation === 'multiply' ? 'Multiply the fractions' : 'Divide the fractions'}
            </div>
          </div>

          {/* Operation hint */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">
              {operation === 'multiply' ? 'To multiply fractions:' : 'To divide fractions:'}
            </div>
            <div className="text-sm font-medium text-gray-800">
              {operation === 'multiply' 
                ? 'Multiply numerators together and denominators together'
                : 'Multiply by the reciprocal (flip the second fraction)'}
            </div>
          </div>
          
          {/* Answer input */}
          <div className="flex items-center space-x-2">
            <div className="text-white">Your answer (as a fraction):</div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-32 text-white bg-gray-700 border-gray-600 placeholder-gray-400 text-center rounded px-2 py-1"
              placeholder="e.g., 1/2"
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
            Tip: Remember to simplify your answer if possible
          </div>
        </div>
      </div>
    </div>
  );
}