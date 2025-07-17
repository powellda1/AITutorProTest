import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [userAnswer, setUserAnswer] = useState('');

  const handleSubmit = () => {
    onAnswer(userAnswer);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Extract the original number from the prompt
  const mixedNumberMatch = promptText.match(/(\d+)\s+(\d+)\/(\d+)/);
  const improperFractionMatch = promptText.match(/(\d+)\/(\d+)/);
  
  let originalNumber = '';
  let conversionDirection = '';
  
  if (mixedNumberMatch) {
    originalNumber = `${mixedNumberMatch[1]} ${mixedNumberMatch[2]}/${mixedNumberMatch[3]}`;
    conversionDirection = 'Mixed to Improper';
  } else if (improperFractionMatch) {
    originalNumber = `${improperFractionMatch[1]}/${improperFractionMatch[2]}`;
    conversionDirection = 'Improper to Mixed';
  }

  return (
    <Card className="rounded-lg border border-green-600 text-card-foreground shadow-sm mb-4 bg-[#14532d4d]">
      <CardHeader>
        <CardTitle className="text-lg text-white">Mixed Number Conversion</CardTitle>
        <CardDescription className="text-gray-300">
          Convert {originalNumber}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-800 mb-2">{originalNumber}</div>
              <div className="text-2xl text-gray-600 my-4">↓</div>
              <div className="text-xl text-gray-600">Convert this</div>
            </div>
          </div>

          <div className="text-sm text-gray-300 text-center">
            <p>
              {conversionDirection === 'Mixed to Improper' 
                ? 'Multiply whole number by denominator, then add numerator'
                : 'Divide numerator by denominator for whole part, remainder becomes new numerator'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={conversionDirection === 'Mixed to Improper' ? 'Enter improper fraction' : 'Enter mixed number'}
              className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300"
            />
            <Button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              disabled={!userAnswer.trim()}
            >
              Submit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MixedNumberConversionComponent;