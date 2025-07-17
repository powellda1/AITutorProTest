import React, { useState, useEffect } from 'react';
import { generateUniversalPrompt, UniversalPromptConfig } from '../utils/universalRenderer';

interface FractionVisualInputComponentProps {
  originalFraction: string;
  correctAnswer: string;
  promptText: string;
  onAnswer: (answer: string) => void;
  standardCode?: string | null;
  lessonTitle?: string;
}

export default function FractionVisualInputComponent({
  originalFraction,
  correctAnswer,
  promptText,
  onAnswer,
  standardCode,
  lessonTitle
}: FractionVisualInputComponentProps) {
  const [userInput, setUserInput] = useState('');

  // Generate universal prompt
  const promptConfig: UniversalPromptConfig = {
    type: 'fraction-visual-input',
    standardCode: standardCode || '',
    lessonTitle: lessonTitle || ''
  };
  
  const universalPrompt = generateUniversalPrompt(promptConfig);

  // Parse fraction for visual display
  const parseFraction = (fraction: string) => {
    const match = fraction.match(/(\d+)\/(\d+)/);
    if (match) {
      return {
        numerator: parseInt(match[1]),
        denominator: parseInt(match[2])
      };
    }
    return { numerator: 1, denominator: 1 };
  };

  const { numerator, denominator } = parseFraction(originalFraction);

  // Create visual fraction representation
  const renderFractionVisual = () => {
    // Create a simple visual representation using blocks
    const blocks = [];
    for (let i = 0; i < denominator; i++) {
      const isShaded = i < numerator;
      blocks.push(
        <div
          key={i}
          className={`w-8 h-8 border-2 border-gray-600 ${
            isShaded ? 'bg-blue-500' : 'bg-white'
          } inline-block mx-1`}
        />
      );
    }
    return blocks;
  };

  const handleSubmit = () => {
    if (userInput.trim()) {
      onAnswer(userInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-600 to-gray-800 p-6 rounded-lg border border-gray-400/20 shadow-lg">
      {/* Universal prompt */}
      <div className="text-white text-2xl font-semibold mb-6 text-center">
        {universalPrompt}
      </div>
      
      {/* Original fraction display */}
      <div className="mb-6">
        <div className="text-white text-xl mb-2 text-center">
          Original Fraction: <span className="font-bold text-yellow-300">{originalFraction}</span>
        </div>
        
        {/* Visual representation */}
        <div className="flex justify-center mb-4">
          {renderFractionVisual()}
        </div>
        
        <div className="text-white text-center">
          <span className="text-blue-300">{numerator}</span> out of <span className="text-blue-300">{denominator}</span> parts are shaded
        </div>
      </div>
      
      {/* Simplification prompt */}
      <div className="text-white text-lg mb-4 text-center">
        Write this fraction in its simplest form:
      </div>
      
      {/* Input field */}
      <div className="flex justify-center items-center space-x-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter simplified fraction (e.g., 1/2)"
          className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={!userInput.trim()}
        >
          Submit
        </button>
      </div>
    </div>
  );
}