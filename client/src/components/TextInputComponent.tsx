import { useState } from 'react';
import { generateUniversalPrompt, UniversalPromptConfig } from '../utils/universalRenderer';

interface TextInputComponentProps {
  interactiveText: string;
  correctAnswer: string;
  onAnswer: (answer: string) => void;
  inputType?: 'text' | 'number';
  placeholder?: string;
}

export default function TextInputComponent({
  interactiveText,
  correctAnswer,
  onAnswer,
  inputType = 'text',
  placeholder = 'Enter your answer...'
}: TextInputComponentProps) {
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

  // Generate universal prompt using the universal system
  const promptConfig: UniversalPromptConfig = {
    componentType: 'text-input',
    interactiveText,
    inputType: inputType as 'text' | 'number'
  };

  const universalPrompt = generateUniversalPrompt(promptConfig);

  return (
    <div className="bg-gradient-to-br from-gray-600 to-gray-800 p-6 rounded-lg border-2 border-green-400">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg">
        <div className="text-center space-y-4">
          {/* Universal prompt display */}
          <div className="text-2xl font-bold text-black mb-4">
            {universalPrompt}
          </div>
          
          {/* Input field */}
          <div className="space-y-3">
            <input
              type={inputType}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
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
        </div>
      </div>
    </div>
  );
}