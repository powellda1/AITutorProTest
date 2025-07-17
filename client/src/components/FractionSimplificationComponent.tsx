import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { generateUniversalCardHeader, generateUniversalComponentJSX, generateUniversalPrompt, UniversalPromptConfig, universalInputStyles, universalButtonStyles } from '../utils/universalRenderer';

interface FractionSimplificationComponentProps {
  lesson: any;
  promptText: string;
  correctAnswer: string;
  onAnswer: (answer: string) => void;
  onAdvanceExample: () => void;
}

const FractionSimplificationComponent: React.FC<FractionSimplificationComponentProps> = ({
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

  // Extract the original fraction from the prompt
  const fractionMatch = promptText.match(/(\d+)\/(\d+)/);
  const originalFraction = fractionMatch ? `${fractionMatch[1]}/${fractionMatch[2]}` : '';
  const numerator = fractionMatch ? parseInt(fractionMatch[1]) : 0;
  const denominator = fractionMatch ? parseInt(fractionMatch[2]) : 1;

  // Universal configuration for this component
  const universalConfig: UniversalPromptConfig = {
    type: 'fraction-simplification',
    standardCode: '6.NS.1.d',
    lessonTitle: lesson?.title || 'Fraction Simplification',
    context: { originalFraction, numerator, denominator }
  };

  const headerConfig = generateUniversalCardHeader(universalConfig);

  return (
    <div className="text-center mb-4">
      <div className="bg-gray-600 p-6 rounded-lg border-2 border-gray-400 mb-4">
        {/* Visual representation of the fraction */}
        <div className="mb-4">
          <div className="text-xl text-white font-semibold mb-2">Original Fraction:</div>
          <div className="text-4xl text-blue-300 font-bold mb-4">{originalFraction}</div>
          
          {/* Visual fraction bars */}
          <div className="flex justify-center mb-4">
            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-300 mb-2">Numerator: {numerator}</div>
              <div className="flex">
                {Array.from({length: numerator}, (_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 bg-blue-500 border border-blue-300 m-1"
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-300 mb-2">Denominator: {denominator}</div>
              <div className="flex">
                {Array.from({length: denominator}, (_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 border border-gray-300 m-1 ${
                      i < numerator ? 'bg-blue-500' : 'bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-200 mt-4">
          Find the greatest common factor and simplify to lowest terms
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter simplified fraction (e.g., 1/2)"
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

export default FractionSimplificationComponent;