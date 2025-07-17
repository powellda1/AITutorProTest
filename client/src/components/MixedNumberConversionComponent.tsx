import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { generateUniversalCardHeader, generateUniversalComponentJSX, generateUniversalPrompt, UniversalPromptConfig, universalInputStyles, universalButtonStyles } from '../utils/universalRenderer';

interface MixedNumberConversionComponentProps {
  lesson: any;
  promptText: string;
  correctAnswer: string;
  onAnswer: (answer: string) => void;
  onAdvanceExample: () => void;
}

const MixedNumberConversionComponent: React.FC<MixedNumberConversionComponentProps> = ({
  lesson,
  promptText,
  correctAnswer,
  onAnswer,
  onAdvanceExample,
}) => {
  const [userInput, setUserInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const trimmedInput = userInput.trim();
      onAnswer(trimmedInput);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Determine conversion type and extract values
  const improperMatch = promptText.match(/convert\s+(\d+)\/(\d+)/i);
  const mixedMatch = promptText.match(/convert\s+(\d+)\s+(\d+)\/(\d+)/i);
  
  const isImproperToMixed = improperMatch && !mixedMatch;
  const isMixedToImproper = mixedMatch && !improperMatch;
  
  // Universal configuration for this component
  const universalConfig: UniversalPromptConfig = {
    type: 'mixed-number-conversion',
    standardCode: '6.NS.1.d',
    lessonTitle: lesson?.title || 'Mixed Number Conversion',
    context: { isImproperToMixed, isMixedToImproper }
  };

  const headerConfig = generateUniversalCardHeader(universalConfig);

  return (
    <div className="text-center mb-4">
      <div className="bg-gray-600 p-6 rounded-lg border-2 border-gray-400 mb-4">
        {/* Visual representation based on conversion type */}
        {isImproperToMixed && improperMatch && (
          <div className="mb-4">
            <div className="text-xl text-white font-semibold mb-2">Improper Fraction:</div>
            <div className="text-4xl text-blue-300 font-bold mb-4">{improperMatch[1]}/{improperMatch[2]}</div>
            
            {/* Visual division representation */}
            <div className="flex justify-center mb-4">
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-300 mb-2">Divide {improperMatch[1]} ÷ {improperMatch[2]}</div>
                <div className="flex">
                  {Array.from({length: parseInt(improperMatch[1])}, (_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 bg-blue-500 border border-blue-300 m-1"
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-300 mt-2">
                  Group into sets of {improperMatch[2]}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {isMixedToImproper && mixedMatch && (
          <div className="mb-4">
            <div className="text-xl text-white font-semibold mb-2">Mixed Number:</div>
            <div className="text-4xl text-blue-300 font-bold mb-4">{mixedMatch[1]} {mixedMatch[2]}/{mixedMatch[3]}</div>
            
            {/* Visual multiplication representation */}
            <div className="flex justify-center mb-4">
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-300 mb-2">
                  Whole parts: {mixedMatch[1]} × {mixedMatch[3]} = {parseInt(mixedMatch[1]) * parseInt(mixedMatch[3])}
                </div>
                <div className="flex">
                  {Array.from({length: parseInt(mixedMatch[1])}, (_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-green-500 border border-green-300 m-1 flex items-center justify-center text-white text-xs"
                    >
                      {mixedMatch[3]}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-300 mt-2">
                  Plus fraction part: {mixedMatch[2]}/{mixedMatch[3]}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-200 mt-4">
          {isImproperToMixed ? 'Convert to mixed number' : 'Convert to improper fraction'}
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isImproperToMixed ? "Enter mixed number (e.g., 2 3/4)" : "Enter improper fraction (e.g., 13/3)"}
          className={universalInputStyles}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !userInput.trim()}
          className={universalButtonStyles}
        >
          {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default MixedNumberConversionComponent;