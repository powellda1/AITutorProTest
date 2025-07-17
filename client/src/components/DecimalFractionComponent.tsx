import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DecimalFractionComponentProps {
  originalDecimal: number;
  targetNumerator: number;
  targetDenominator: number;
  correctAnswer: string;
  onAnswer: (answer: string) => void;
  lesson?: any;
  promptText?: string;
}

export default function DecimalFractionComponent({
  originalDecimal,
  targetNumerator,
  targetDenominator,
  correctAnswer,
  onAnswer,
  lesson,
  promptText
}: DecimalFractionComponentProps) {
  const [userAnswer, setUserAnswer] = useState('');

  const handleSubmit = () => {
    onAnswer(userAnswer);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Card className="rounded-lg border border-green-600 text-card-foreground shadow-sm mb-4 bg-[#14532d4d]">
      <CardHeader>
        <CardTitle className="text-lg text-white">Convert Fraction to Decimal</CardTitle>
        <CardDescription className="text-gray-300">
          Convert {originalDecimal} to a fraction in lowest terms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-800 mb-2">{originalDecimal}</div>
              <div className="text-2xl text-gray-600 my-4">↓</div>
              <div className="text-xl text-gray-600">Convert to fraction</div>
            </div>
          </div>

          <div className="text-sm text-gray-300 text-center">
            <p>Write as a fraction over a power of 10, then simplify to lowest terms</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter fraction (e.g., 1/4)"
              className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300"
            />
            <Button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Submit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}