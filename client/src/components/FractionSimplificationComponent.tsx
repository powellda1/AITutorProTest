import { useState } from 'react';
import { generateUniversalPrompt, UniversalPromptConfig } from '../utils/universalRenderer';

interface FractionSimplificationComponentProps {
  fractionToSimplify: string;
  correctAnswer: string;
  onAnswer: (answer: string) => void;
  interactiveText: string;
}

export default function FractionSimplificationComponent({
  fractionToSimplify,
  correctAnswer,
  onAnswer,
  interactiveText
}: FractionSimplificationComponentProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      setIsSubmitted(true);
      onAnswer(inputValue.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Parse the fraction to display it visually
  const parts = fractionToSimplify.split('/');
  const numerator = parts[0] || '1';
  const denominator = parts[1] || '1';

  // Generate universal prompt using the universal system
  const promptConfig: UniversalPromptConfig = {
    type: 'text-input',
    interactiveText,
    inputType: 'text'
  };

  const universalPrompt = generateUniversalPrompt(promptConfig);

  return (
    <div className="bg-gradient-to-br from-gray-600 to-gray-800 p-6 rounded-lg border-4 border-green-500 mb-6">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg">
        <div className="text-center space-y-6">
          {/* Universal prompt display */}
          <div className="text-2xl font-bold text-black mb-4">
            {universalPrompt}
          </div>
          
          {/* Visual fraction display */}
          <div className="bg-white p-6 rounded-lg border-2 border-gray-300 shadow-lg">
            <div className="flex items-center justify-center space-x-8">
              {/* Original fraction */}
              <div className="text-center">
                <div className="text-6xl font-bold text-black">{numerator}</div>
                <div className="border-t-4 border-black w-20 mx-auto my-2"></div>
                <div className="text-6xl font-bold text-black">{denominator}</div>
              </div>
              
              {/* Equals sign */}
              <div className="text-6xl font-bold text-blue-600">
                =
              </div>
              
              {/* Simplified fraction placeholder */}
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600">?</div>
                <div className="border-t-4 border-blue-600 w-20 mx-auto my-2"></div>
                <div className="text-6xl font-bold text-blue-600">?</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mt-4 text-center">
              Simplify this fraction to its lowest terms
            </div>
          </div>

          {/* Input section */}
          <div className="space-y-3">
            <div className="text-lg font-semibold text-black">
              Enter the simplified fraction:
            </div>
            
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 1/2"
              className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300"
              disabled={isSubmitted}
            />
            
            {/* Submit button */}
            <div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitted || !inputValue.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Submit
              </button>
            </div>
          </div>
          
          {/* Helpful hint */}
          <div className="text-sm text-gray-700 mt-4">
            Tip: Find the greatest common factor (GCF) of the numerator and denominator, then divide both by it.
          </div>
        </div>
      </div>
    </div>
  );
}