import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import SuccessAnimation, { AnimationType } from "./SuccessAnimation";
import { analyzeLessonType, processLessonContent } from "../utils/lessonProcessor";
import NumberLineComponent from "./NumberLineComponent";
import ComparisonComponent from "./ComparisonComponent";
import WordProblemComponent from "./WordProblemComponent";
import ExponentComponent from "./ExponentComponent";
import PerfectSquareComponent from "./PerfectSquareComponent";
import FractionOperationComponent from "./FractionOperationComponent";
import ScalingComponent from "./ScalingComponent";
import GridComponent from "./GridComponent";
import { generateUniversalCardHeader, generateUniversalComponentJSX, generateUniversalPrompt, UniversalPromptConfig, universalInputStyles, universalButtonStyles } from '../utils/universalRenderer';

// StripComponent for strip model visualization
interface StripComponentProps {
  segments: number;
  shadedSegments: number;
  correctAnswer: number;
  promptText: string;
  onAnswer: (answer: number) => void;
}

const StripComponent: React.FC<StripComponentProps> = ({
  segments,
  shadedSegments,
  correctAnswer,
  promptText,
  onAnswer,
}) => {
  const [userInput, setUserInput] = useState('');

  const handleSubmit = () => {
    const userAnswer = parseFloat(userInput.replace('%', ''));
    if (!isNaN(userAnswer)) {
      onAnswer(userAnswer);
    }
  };

  // Universal configuration for this component
  const universalConfig: UniversalPromptConfig = {
    type: 'strip-percentage',
    standardCode: '6.NS.1.a',
    lessonTitle: 'Strip Model Practice',
    context: { segments, shadedSegments }
  };

  const headerConfig = generateUniversalCardHeader(universalConfig);

  return (
    <div className="text-center mb-4">
      <div className="bg-gray-600 p-4 rounded-lg border-2 border-gray-400 mb-4">
        {/* Remove the duplicate prompt text from component level */}
        <div className="flex justify-center">
          {Array.from({length: segments}, (_, i) => (
            <div
              key={i}
              className={`w-8 h-16 border border-gray-400 ${
                i < shadedSegments ? 'bg-green-500' : 'bg-white'
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-white mt-2 font-medium">
          {shadedSegments} out of {segments} segments shaded
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter percent (e.g., 20%)"
          className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
        <button 
          onClick={handleSubmit}
          disabled={!userInput.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

// Global feedback component that handles all feedback logic and styling
const FeedbackMessage = ({ 
  feedback, 
  attempts, 
  onRequestHelp, 
  context 
}: { 
  feedback: { correct: boolean; message: string } | null;
  attempts: number;
  onRequestHelp?: (question: string, context: string) => void;
  context?: { question: string; description: string; correctAnswer?: string };
}) => {
  if (!feedback) return null;
  
  return (
    <div className={`flex items-center space-x-2 p-3 rounded ${
      feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
    }`}>
      {feedback.correct ? (
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 flex-shrink-0" />
      )}
      <span className="text-sm">
        {feedback.message.split(/(\(Attempt \d+ of \d+\))/).map((part, index) => 
          part.match(/\(Attempt \d+ of \d+\)/) ? (
            <span key={index} className="bg-yellow-200 px-1 rounded font-medium text-gray-800">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    </div>
  );
};

// Centralized feedback logic hook with animation support
const useFeedbackLogic = (onRequestHelp?: (question: string, context: string) => void, correctAnswerCount?: number) => {
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState<AnimationType>('smiley');

  const handleWrongAnswer = (helpQuestion: string, helpContext: string, customMessage?: string) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= 3 && onRequestHelp) {
      onRequestHelp(helpQuestion, helpContext);
      setFeedback({
        correct: false,
        message: `I've asked the AI tutor for help with this problem. Check the chat panel for a detailed explanation.`
      });
    } else {
      setFeedback({
        correct: false,
        message: customMessage || `Not quite. Try again! (Attempt ${newAttempts} of 3)`
      });
    }
  };

  const handleCorrectAnswer = (message: string) => {
    console.log('🎯 handleCorrectAnswer called with message:', message);
    setFeedback({
      correct: true,
      message
    });
    
    // Trigger animation based on correct answer count
    const count = correctAnswerCount || 1;
    // Animation trigger complete
    if (count === 1) {
      setAnimationType('smiley');
      // Animation type set: smiley
    } else if (count === 2) {
      setAnimationType('star');
      // Animation type set: star
    } else {
      setAnimationType('fireworks');
      // Animation type set: fireworks
    }
    setShowAnimation(true);
    // Animation state set
  };

  const handleAnimationComplete = () => {
    // Animation complete callback
    setShowAnimation(false);
  };

  const resetFeedback = () => {
    setFeedback(null);
    setAttempts(0);
    setShowAnimation(false);
  };

  return {
    feedback,
    attempts,
    handleWrongAnswer,
    handleCorrectAnswer,
    resetFeedback,
    showAnimation,
    animationType,
    handleAnimationComplete
  };
};

interface InteractiveLessonProps {
  subLessons: Array<{
    id: number;
    title: string;
    code: string;
    explanation: string;
    examples: string[];
  }>;
  subStandardTitle: string;
  onRequestHelp?: (question: string, context: string) => void;
}

// Interactive grid component for percentage visualization
const PercentageGrid = ({ shadedSquares, totalSquares, description, onAnswer, onRequestHelp }: { 
  shadedSquares: number; 
  totalSquares: number; 
  description: string;
  onAnswer: (answer: number) => void;
  onRequestHelp: (question: string, context: string) => void;
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const { feedback, attempts, handleWrongAnswer, handleCorrectAnswer, resetFeedback, showAnimation, animationType, handleAnimationComplete } = useFeedbackLogic(onRequestHelp, 1);
  
  // Debug logging for animation state
  console.log('🎯 PercentageGrid render - showAnimation:', showAnimation, 'animationType:', animationType);

  const handleSubmit = () => {
    const answer = parseFloat(userAnswer);
    const correctAnswer = (shadedSquares / totalSquares) * 100;
    
    if (Math.abs(answer - correctAnswer) < 0.1) {
      console.log('🎯 Answer is correct! Calling handleCorrectAnswer');
      handleCorrectAnswer(`Correct! ${shadedSquares} out of ${totalSquares} squares are shaded, which equals ${correctAnswer}%.`);
      onAnswer(answer);
    } else {
      const helpQuestion = `How do I calculate the percentage when ${description}?`;
      const helpContext = `The student is trying to find what percentage of the grid is shaded when ${shadedSquares} out of ${totalSquares} squares are shaded. They have attempted this ${attempts + 1} times unsuccessfully.`;
      const customMessage = `Not quite. Look at how many squares are shaded compared to the total. Try again! (Attempt ${attempts + 1} of 3)`;
      
      handleWrongAnswer(helpQuestion, helpContext, customMessage);
    }
  };

  const resetQuestion = () => {
    setUserAnswer("");
    resetFeedback();
  };

  // Create grid visualization - handle different grid sizes
  const gridSize = totalSquares === 1000 ? 10 : Math.sqrt(totalSquares);
  const cellSize = totalSquares === 1000 ? 'w-2 h-2' : 'w-6 h-6';
  
  const squares = Array.from({ length: totalSquares }, (_, i) => (
    <div
      key={i}
      className={`${cellSize} border border-gray-400 ${
        i < shadedSquares ? 'bg-blue-500' : 'bg-white'
      }`}
    />
  ));

  return (
    <Card className="interactive-card">
      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showAnimation}
        animationType={animationType}
        onComplete={handleAnimationComplete}
      />
      <CardHeader>
        <CardTitle className="interactive-card-header">Grid Model Practice</CardTitle>
        <CardDescription className="text-white text-xl font-semibold text-center mb-4">
          What percentage of this grid is shaded?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Grid Display */}
          <div 
            className="grid gap-1 p-4 border-2 border-gray-300 rounded"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              width: 'fit-content'
            }}
          >
            {squares}
          </div>
          
          {/* Answer Input */}
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-48 text-center px-4 py-3 text-white bg-gray-700 border-2 border-gray-600 rounded-lg text-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              disabled={feedback?.correct}
            />
            <span className="text-sm text-white">%</span>
            <Button 
              onClick={handleSubmit}
              disabled={!userAnswer || feedback?.correct}
              className="ml-2 text-white bg-blue-600 hover:bg-blue-700"
            >
              Submit
            </Button>
            {feedback?.correct && (
              <Button 
                onClick={resetQuestion}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Next
              </Button>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`flex items-center space-x-2 p-3 rounded ${
              feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {feedback.correct ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">
                {feedback.message.split(/(\(Attempt \d+ of \d+\))/).map((part, index) => 
                  part.match(/\(Attempt \d+ of \d+\)/) ? (
                    <span key={index} className="bg-yellow-200 px-1 rounded font-medium text-gray-800">{part}</span>
                  ) : (
                    part
                  )
                )}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Interactive strip model component
const StripModel = ({ percentage, description, onAnswer, onRequestHelp }: { 
  percentage: number; 
  description: string;
  onAnswer: (answer: number) => void;
  onRequestHelp: (question: string, context: string) => void;
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = () => {
    const answer = parseFloat(userAnswer);
    
    if (Math.abs(answer - percentage) < 5) { // Allow 5% tolerance for benchmark estimates
      setFeedback({
        correct: true,
        message: `Great! You correctly identified this is approximately ${percentage}%.`
      });
      onAnswer(answer);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        // Request AI help after 3 wrong attempts
        const question = `How do I estimate the percentage when ${description}?`;
        const context = `The student is trying to estimate what percentage is represented by a strip model where ${description}. The correct answer is approximately ${percentage}%. They have attempted this ${newAttempts} times unsuccessfully.`;
        onRequestHelp(question, context);
        
        setFeedback({
          correct: false,
          message: `I've asked the AI tutor for help with this problem. Check the chat panel for a detailed explanation.`
        });
      } else {
        setFeedback({
          correct: false,
          message: `Try thinking about benchmark percentages like 10%, 25%, 33%, 50%. What's the closest benchmark? (Attempt ${newAttempts} of 3)`
        });
      }
    }
  };

  const resetQuestion = () => {
    setUserAnswer("");
    setFeedback(null);
    setAttempts(0);
  };

  return (
    <Card className="interactive-card">
      <CardHeader>
        <CardTitle className="interactive-card-header">Strip Model Practice</CardTitle>
        <CardDescription className="interactive-card-description">
          {description}. Use benchmark percentages to estimate what percentage this represents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Strip Display */}
          <div className="w-80 h-12 border-2 border-gray-300 rounded overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Benchmark Hints */}
          <div className="text-sm text-gray-300 text-center">
            <p>Benchmark percentages: 10%, 20%, 25%, 33%, 50%</p>
            <p>Think: What fraction of the strip is shaded?</p>
          </div>
          
          {/* Answer Input */}
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Estimate percentage"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-48 text-white bg-gray-700 border-gray-600 placeholder-gray-400"
              disabled={feedback?.correct}
            />
            <span className="text-sm text-white">%</span>
            <Button 
              onClick={handleSubmit}
              disabled={!userAnswer || feedback?.correct}
              className="ml-2 text-white bg-blue-600 hover:bg-blue-700"
            >
              Submit
            </Button>
            {feedback?.correct && (
              <Button 
                onClick={resetQuestion}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Next
              </Button>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`flex items-center space-x-2 p-3 rounded ${
              feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {feedback.correct ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">
                {feedback.message.split(/(\(Attempt \d+ of \d+\))/).map((part, index) => 
                  part.match(/\(Attempt \d+ of \d+\)/) ? (
                    <span key={index} className="bg-yellow-200 px-1 rounded font-medium text-gray-800">{part}</span>
                  ) : (
                    part
                  )
                )}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Interactive decimal-percent conversion component (Universal System)
const DecimalPercentConversion = ({ 
  value, 
  type, 
  description, 
  onAnswer, 
  onRequestHelp 
}: { 
  value: number; 
  type: 'decimal' | 'percent';
  description: string;
  onAnswer: (answer: number) => void;
  onRequestHelp: (question: string, context: string) => void;
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<string>("");
  const [attempts, setAttempts] = useState(0);

  // Universal configuration for this component
  const universalConfig: UniversalPromptConfig = {
    type: 'decimal-percent-conversion',
    standardCode: '6.NS.1.b',
    lessonTitle: 'Decimal-Percent Conversion',
    context: { value, type, description }
  };

  const promptText = generateUniversalPrompt(universalConfig);

  const handleSubmit = () => {
    const answer = parseFloat(userAnswer);
    let correctAnswer: number;
    
    if (type === 'decimal') {
      // Converting decimal to percent (multiply by 100)
      correctAnswer = value * 100;
    } else {
      // Converting percent to decimal (divide by 100)
      correctAnswer = value / 100;
    }
    
    if (Math.abs(answer - correctAnswer) < 0.001) {
      setFeedback('correct');
      setAttempts(0);
      onAnswer(answer);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        const question = `How do I convert ${type === 'decimal' ? 'decimal to percent' : 'percent to decimal'} when ${description}?`;
        const context = `The student is trying to convert ${type === 'decimal' ? `${value} to a percent` : `${value}% to a decimal`}. The correct answer is ${correctAnswer}. They have attempted this ${newAttempts} times unsuccessfully.`;
        onRequestHelp(question, context);
        
        // Reset after help request
        setTimeout(() => {
          setFeedback('');
          setUserAnswer('');
          setAttempts(0);
        }, 1000);
      } else {
        const feedbackMessage = `Not quite. Remember: ${type === 'decimal' ? 'multiply by 100 to get percent' : 'divide by 100 to get decimal'}. Try again! (Attempt ${newAttempts} of 3)`;
        setFeedback(feedbackMessage);
      }
    }
  };

  const formatFeedbackMessage = (message: string) => {
    if (message.includes('(Attempt')) {
      const parts = message.split('(Attempt');
      const beforeAttempt = parts[0].trim();
      const attemptPart = '(Attempt' + parts[1];
      
      return (
        <>
          {beforeAttempt} 
          <span className="bg-yellow-400 text-black px-1 rounded font-medium">{attemptPart}</span>
        </>
      );
    }
    return message;
  };

  return (
    <div className="text-center mb-4">
      {/* Main prompt in large white font */}
      <div className="text-white text-2xl font-bold mb-4">
        {type === 'decimal' ? `Convert ${value} to a percent` : `Convert ${value}% to a decimal`}
      </div>
      
      {/* Conversion Display */}
      <div className="bg-gray-300 p-6 rounded-lg border-2 border-gray-500 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {type === 'decimal' ? value : `${value}%`}
          </div>
          <div className="text-lg text-gray-600">
            Convert to {type === 'decimal' ? 'percent' : 'decimal'}
          </div>
        </div>
      </div>
      
      {/* Conversion Hint */}
      <div className="text-sm text-white mb-4 text-center">
        <p>
          {type === 'decimal' 
            ? 'To convert decimal to percent: multiply by 100' 
            : 'To convert percent to decimal: divide by 100'
          }
        </p>
      </div>
      
      {/* Universal input and submit section */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <input
          type="number"
          step="0.001"
          placeholder={type === 'decimal' ? 'Enter percent' : 'Enter decimal'}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
        <span className="text-sm text-white">
          {type === 'decimal' ? '%' : ''}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!userAnswer || feedback === 'correct'}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Submit
        </button>
      </div>
      
      {/* Universal Feedback Display */}
      {feedback && feedback !== 'correct' && (
        <div className="mt-4 p-3 rounded-lg border bg-red-600/80 border-red-500">
          <p className="text-white text-center font-bold">
            {formatFeedbackMessage(feedback)}
          </p>
        </div>
      )}
      
      {/* Success feedback is handled by parent component */}
    </div>
  );
};

// Export DecimalPercentConversion for use in other components
export { DecimalPercentConversion };

// Interactive Grid for Fraction-to-Percent conversion
const InteractiveGridActivity = ({ 
  fraction, 
  expectedPercent, 
  onComplete, 
  onRequestHelp 
}: {
  fraction: string;
  expectedPercent: number;
  onComplete: () => void;
  onRequestHelp: (question: string, context: string) => void;
}) => {
  const [shadedSquares, setShadedSquares] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'shade' | 'unshade' | null>(null);

  const toggleSquare = (index: number) => {
    const newShadedSquares = new Set(shadedSquares);
    if (newShadedSquares.has(index)) {
      newShadedSquares.delete(index);
    } else {
      newShadedSquares.add(index);
    }
    setShadedSquares(newShadedSquares);
  };

  const handleMouseDown = (index: number) => {
    setIsDragging(true);
    const isShaded = shadedSquares.has(index);
    setDragMode(isShaded ? 'unshade' : 'shade');
    toggleSquare(index);
  };

  const handleMouseEnter = (index: number) => {
    if (isDragging && dragMode) {
      const newShadedSquares = new Set(shadedSquares);
      if (dragMode === 'shade') {
        newShadedSquares.add(index);
      } else {
        newShadedSquares.delete(index);
      }
      setShadedSquares(newShadedSquares);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
  };

  // Add global mouse event listeners for drag functionality
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragMode(null);
    };

    const handleGlobalMouseLeave = () => {
      setIsDragging(false);
      setDragMode(null);
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mouseleave', handleGlobalMouseLeave);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseLeave);
    };
  }, [isDragging]);

  const clearGrid = () => {
    setShadedSquares(new Set());
    setFeedback(null);
  };

  const handleSubmit = () => {
    const actualPercent = (shadedSquares.size / 100) * 100;
    
    // For decimal answers like 37.5%, allow some tolerance
    const tolerance = expectedPercent % 1 !== 0 ? 2 : 1; // 2% tolerance for decimals, 1% for whole numbers
    
    if (Math.abs(actualPercent - expectedPercent) <= tolerance) {
      setFeedback({
        correct: true,
        message: `Excellent! You shaded ${shadedSquares.size} squares out of 100, which equals ${actualPercent}% (${fraction} = ${expectedPercent}%)`
      });
      onComplete();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        const question = `How do I convert ${fraction} to a percent using a grid model?`;
        const context = `The student is trying to convert ${fraction} to a percent. They should shade approximately ${expectedPercent} squares out of 100 to get ${expectedPercent}%. They have attempted this ${newAttempts} times unsuccessfully.`;
        onRequestHelp(question, context);
        
        setFeedback({
          correct: false,
          message: `I've asked the AI tutor for help with this problem. Check the chat panel for a detailed explanation.`
        });
      } else {
        // Provide a hint about how to convert the fraction
        const hint = fraction ? `Hint: To convert ${fraction} to a percent, think about what decimal this equals, then multiply by 100.` : '';
        setFeedback({
          correct: false,
          message: `Not quite right. You shaded ${shadedSquares.size} squares (${actualPercent}%). The correct answer is ${expectedPercent}%. ${hint} Try again! (Attempt ${newAttempts} of 3)`
        });
      }
    }
  };

  return (
    <Card className="bg-green-900/30 border-green-600">
      <CardHeader>
        <CardTitle className="text-green-200">Interactive Grid Practice</CardTitle>
        <CardDescription className="text-gray-300">
          Convert {fraction} to a percent by shading the correct number of squares
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-900/30 p-3 rounded border border-blue-600">
            <p className="text-blue-200 font-medium">Instructions:</p>
            <p className="text-gray-300">1. Click and drag to shade squares in the 10×10 grid below</p>
            <p className="text-gray-300">2. Shade the number of squares that represents {fraction}</p>
            <p className="text-gray-300">3. Click Submit when you're done</p>
          </div>

          {/* Interactive Grid */}
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded border-2 border-gray-300">
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 100 }, (_, i) => (
                  <div
                    key={i}
                    onMouseDown={() => handleMouseDown(i)}
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseUp={handleMouseUp}
                    className={`w-6 h-6 border border-gray-400 cursor-pointer transition-colors select-none ${
                      shadedSquares.has(i) ? 'bg-blue-500' : 'bg-white hover:bg-gray-100'
                    }`}
                    title={`Square ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-300">
                Shaded squares: {shadedSquares.size} out of 100 
                ({((shadedSquares.size / 100) * 100).toFixed(1)}%)
              </p>
            </div>

            {/* Centered Action Buttons */}
            <div className="flex space-x-2">
              <Button
                onClick={handleSubmit}
                disabled={shadedSquares.size === 0 || feedback?.correct}
                className="text-white bg-blue-600 hover:bg-blue-700"
              >
                Submit
              </Button>
              <Button
                onClick={clearGrid}
                variant="outline"
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                Clear Grid
              </Button>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`flex items-center space-x-2 p-3 rounded ${
              feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {feedback.correct ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">
                {feedback.message.split(/(\(Attempt \d+ of \d+\))/).map((part, index) => 
                  part.match(/\(Attempt \d+ of \d+\)/) ? (
                    <span key={index} className="bg-yellow-200 px-1 rounded font-medium text-gray-800">{part}</span>
                  ) : (
                    part
                  )
                )}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Decimal to Fraction Conversion Component
const DecimalToFractionActivity = ({ 
  examples, 
  onComplete, 
  onRequestHelp 
}: {
  examples: string[];
  onComplete: () => void;
  onRequestHelp: (question: string, context: string) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const { 
    feedback, 
    attempts, 
    handleWrongAnswer, 
    handleCorrectAnswer, 
    resetFeedback, 
    showAnimation, 
    animationType, 
    handleAnimationComplete 
  } = useFeedbackLogic(onRequestHelp, currentIndex + 1);

  const currentExample = examples[currentIndex];
  const [decimal, fraction] = currentExample.split(' = ').map(s => s.trim());

  const handleSubmit = () => {
    const correctAnswer = fraction.replace('.', '');
    
    if (userAnswer.trim() === correctAnswer) {
      handleCorrectAnswer(`Correct! ${decimal} = ${fraction}`);
      
      if (currentIndex < examples.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setUserAnswer("");
          resetFeedback();
        }, 2000);
      } else {
        onComplete();
      }
    } else {
      const question = `How do I convert ${decimal} to a fraction?`;
      const context = `The student is trying to convert ${decimal} to a fraction. The correct answer is ${fraction}. They have attempted this ${attempts + 1} times unsuccessfully.`;
      const customMessage = `Not quite. Write as a fraction over a power of 10, then simplify. Try again! (Attempt ${attempts + 1} of 3)`;
      
      handleWrongAnswer(question, context, customMessage);
    }
  };

  return (
    <Card className="interactive-card relative">
      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showAnimation}
        animationType={animationType}
        onComplete={handleAnimationComplete}
      />
      <CardHeader>
        <CardTitle className="text-lg text-white">Convert Decimal to Fraction</CardTitle>
        <CardDescription className="text-gray-300">
          Convert {decimal} to a fraction in lowest terms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-800 mb-2">{decimal}</div>
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
              placeholder="Enter fraction (e.g., 3/5)"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-48 text-white bg-gray-700 border-gray-600 placeholder-gray-400"
              disabled={feedback?.correct}
            />
            <Button 
              onClick={handleSubmit}
              disabled={!userAnswer || feedback?.correct}
              className="px-6 py-3 text-lg bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
            >
              Submit
            </Button>
          </div>

          {feedback && (
            <div className={`flex items-center space-x-2 p-3 rounded ${
              feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {feedback.correct ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">
                {feedback.message.split(/(\(Attempt \d+ of \d+\))/).map((part, index) => 
                  part.match(/\(Attempt \d+ of \d+\)/) ? (
                    <span key={index} className="bg-yellow-200 px-1 rounded font-medium text-gray-800">{part}</span>
                  ) : (
                    part
                  )
                )}
              </span>
            </div>
          )}
          
          <div className="text-sm text-gray-300">
            Problem {currentIndex + 1} of {examples.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Fraction to Decimal Conversion Component
const FractionToDecimalActivity = ({ 
  examples, 
  onComplete, 
  onRequestHelp 
}: {
  examples: string[];
  onComplete: () => void;
  onRequestHelp: (question: string, context: string) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const { 
    feedback, 
    attempts, 
    handleWrongAnswer, 
    handleCorrectAnswer, 
    resetFeedback, 
    showAnimation, 
    animationType, 
    handleAnimationComplete 
  } = useFeedbackLogic(onRequestHelp, currentIndex + 1);

  const currentExample = examples[currentIndex];
  const [fraction, decimal] = currentExample.split(' = ').map(s => s.trim());

  const handleSubmit = () => {
    const correctAnswer = decimal.replace('.', '');
    
    if (userAnswer.trim() === correctAnswer) {
      handleCorrectAnswer(`Correct! ${fraction} = ${decimal}`);
      
      if (currentIndex < examples.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setUserAnswer("");
          resetFeedback();
        }, 2000);
      } else {
        onComplete();
      }
    } else {
      const question = `How do I convert ${fraction} to a decimal?`;
      const context = `The student is trying to convert ${fraction} to a decimal. The correct answer is ${decimal}. They have attempted this ${attempts + 1} times unsuccessfully.`;
      const customMessage = `Not quite. Divide the numerator by the denominator. Try again! (Attempt ${attempts + 1} of 3)`;
      
      handleWrongAnswer(question, context, customMessage);
    }
  };

  return (
    <Card className="rounded-lg border border-green-600 text-card-foreground shadow-sm mb-4 bg-[#14532d4d] relative">
      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showAnimation}
        animationType={animationType}
        onComplete={handleAnimationComplete}
      />
      <CardHeader>
        <CardTitle className="text-lg text-white">Convert Fraction to Decimal</CardTitle>
        <CardDescription className="text-gray-300">
          Convert {fraction} to a decimal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-800 mb-2">{fraction}</div>
              <div className="text-2xl text-gray-600 my-4">↓</div>
              <div className="text-xl text-gray-600">Convert to decimal</div>
            </div>
          </div>

          <div className="text-sm text-gray-300 text-center">
            <p>Divide the numerator by the denominator</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter decimal (e.g., 0.6)"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-48 text-white bg-gray-700 border-gray-600 placeholder-gray-400"
              disabled={feedback?.correct}
            />
            <Button 
              onClick={handleSubmit}
              disabled={!userAnswer || feedback?.correct}
              className="px-6 py-3 text-lg bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
            >
              Submit
            </Button>
          </div>

          {feedback && (
            <div className={`flex items-center space-x-2 p-3 rounded ${
              feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {feedback.correct ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">
                {feedback.message.split(/(\(Attempt \d+ of \d+\))/).map((part, index) => 
                  part.match(/\(Attempt \d+ of \d+\)/) ? (
                    <span key={index} className="bg-yellow-200 px-1 rounded font-medium text-gray-800">{part}</span>
                  ) : (
                    part
                  )
                )}
              </span>
            </div>
          )}
          
          <div className="text-sm text-gray-300">
            Problem {currentIndex + 1} of {examples.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Fraction Simplification Component
const FractionSimplificationActivity = ({ 
  examples, 
  onComplete, 
  onRequestHelp 
}: {
  examples: string[];
  onComplete: () => void;
  onRequestHelp: (question: string, context: string) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const { 
    feedback, 
    attempts, 
    handleWrongAnswer, 
    handleCorrectAnswer, 
    resetFeedback, 
    showAnimation, 
    animationType, 
    handleAnimationComplete 
  } = useFeedbackLogic(onRequestHelp, currentIndex + 1);

  const currentExample = examples[currentIndex];
  const [original, simplified] = currentExample.split(' simplified to ').map(s => s.trim());

  const handleSubmit = () => {
    const correctAnswer = simplified.replace('.', '');
    
    if (userAnswer.trim() === correctAnswer) {
      handleCorrectAnswer(`Correct! ${original} = ${simplified}`);
      
      if (currentIndex < examples.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setUserAnswer("");
          resetFeedback();
        }, 2000);
      } else {
        onComplete();
      }
    } else {
      const question = `How do I simplify the fraction ${original}?`;
      const context = `The student is trying to simplify ${original} to lowest terms. The correct answer is ${simplified}. They have attempted this ${attempts + 1} times unsuccessfully.`;
      const customMessage = `Not quite. Find the greatest common factor (GCF) and divide both numerator and denominator by it. Try again! (Attempt ${attempts + 1} of 3)`;
      
      handleWrongAnswer(question, context, customMessage);
    }
  };

  return (
    <Card className="rounded-lg border border-green-600 text-card-foreground shadow-sm mb-4 bg-[#14532d4d] relative">
      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showAnimation}
        animationType={animationType}
        onComplete={handleAnimationComplete}
      />
      <CardHeader>
        <CardTitle className="text-lg text-white">Simplify Fractions</CardTitle>
        <CardDescription className="text-gray-300">
          Simplify {original} to its lowest terms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-800 mb-2">{original}</div>
              <div className="text-2xl text-gray-600 my-4">↓</div>
              <div className="text-xl text-gray-600">Simplify to lowest terms</div>
            </div>
          </div>

          <div className="text-sm text-gray-300 text-center">
            <p>Find the GCF of numerator and denominator, then divide both by it</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter simplified fraction"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-48 text-white bg-gray-700 border-gray-600 placeholder-gray-400"
              disabled={feedback?.correct}
            />
            <Button 
              onClick={handleSubmit}
              disabled={!userAnswer || feedback?.correct}
              className="px-6 py-3 text-lg bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
            >
              Submit
            </Button>
          </div>

          {feedback && (
            <div className={`flex items-center space-x-2 p-3 rounded ${
              feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {feedback.correct ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">
                {feedback.message.split(/(\(Attempt \d+ of \d+\))/).map((part, index) => 
                  part.match(/\(Attempt \d+ of \d+\)/) ? (
                    <span key={index} className="bg-yellow-200 px-1 rounded font-medium text-gray-800">{part}</span>
                  ) : (
                    part
                  )
                )}
              </span>
            </div>
          )}
          
          <div className="text-sm text-gray-300">
            Problem {currentIndex + 1} of {examples.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mixed Number Conversion Component
const MixedNumberConversionActivity = ({ 
  examples, 
  onComplete, 
  onRequestHelp 
}: {
  examples: string[];
  onComplete: () => void;
  onRequestHelp: (question: string, context: string) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const { 
    feedback, 
    attempts, 
    handleWrongAnswer, 
    handleCorrectAnswer, 
    resetFeedback, 
    showAnimation, 
    animationType, 
    handleAnimationComplete 
  } = useFeedbackLogic(onRequestHelp, currentIndex + 1);

  const currentExample = examples[currentIndex];
  const [original, converted] = currentExample.split(' = ').map(s => s.trim());

  const handleSubmit = () => {
    const correctAnswer = converted.replace('.', '');
    
    if (userAnswer.trim() === correctAnswer) {
      handleCorrectAnswer(`Correct! ${original} = ${converted}`);
      
      if (currentIndex < examples.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setUserAnswer("");
          resetFeedback();
        }, 2000);
      } else {
        onComplete();
      }
    } else {
      const question = `How do I convert ${original}?`;
      const context = `The student is trying to convert ${original}. The correct answer is ${converted}. They have attempted this ${attempts + 1} times unsuccessfully.`;
      const customMessage = `Not quite. ${original.includes('/') && !original.includes(' ') ? 'Divide the numerator by denominator for whole part' : 'Multiply whole number by denominator, add numerator'}. Try again! (Attempt ${attempts + 1} of 3)`;
      
      handleWrongAnswer(question, context, customMessage);
    }
  };

  return (
    <Card className="rounded-lg border border-green-600 text-card-foreground shadow-sm mb-4 bg-[#14532d4d] relative">
      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showAnimation}
        animationType={animationType}
        onComplete={handleAnimationComplete}
      />
      <CardHeader>
        <CardTitle className="text-lg text-white">Mixed Number Conversion</CardTitle>
        <CardDescription className="text-gray-300">
          Convert {original}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-800 mb-2">{original}</div>
              <div className="text-2xl text-gray-600 my-4">↓</div>
              <div className="text-xl text-gray-600">Convert this</div>
            </div>
          </div>

          <div className="text-sm text-gray-300 text-center">
            <p>{original.includes('/') && !original.includes(' ') ? 'Improper fraction → mixed number' : 'Mixed number → improper fraction'}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-48 text-white bg-gray-700 border-gray-600 placeholder-gray-400"
              disabled={feedback?.correct}
            />
            <Button 
              onClick={handleSubmit}
              disabled={!userAnswer || feedback?.correct}
              className="px-6 py-3 text-lg bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
            >
              Submit
            </Button>
          </div>

          {feedback && (
            <div className={`flex items-center space-x-2 p-3 rounded ${
              feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {feedback.correct ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">
                {feedback.message.split(/(\(Attempt \d+ of \d+\))/).map((part, index) => 
                  part.match(/\(Attempt \d+ of \d+\)/) ? (
                    <span key={index} className="bg-yellow-200 px-1 rounded font-medium text-gray-800">{part}</span>
                  ) : (
                    part
                  )
                )}
              </span>
            </div>
          )}
          
          <div className="text-sm text-gray-300">
            Problem {currentIndex + 1} of {examples.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Triple Conversion Component (fraction ↔ decimal ↔ percent)
const TripleConversionActivity = ({ 
  examples, 
  onComplete, 
  onRequestHelp 
}: {
  examples: string[];
  onComplete: () => void;
  onRequestHelp: (question: string, context: string) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({ decimal: "", percent: "" });
  const { 
    feedback, 
    attempts, 
    handleWrongAnswer, 
    handleCorrectAnswer, 
    resetFeedback, 
    showAnimation, 
    animationType, 
    handleAnimationComplete 
  } = useFeedbackLogic(onRequestHelp, currentIndex + 1);

  const currentExample = examples[currentIndex];
  const parts = currentExample.split(' = ');
  const fraction = parts[0];
  const decimal = parts[1];
  const percent = parts[2] || ''; // Add fallback for undefined percent

  const handleSubmit = () => {
    const correctDecimal = decimal?.trim() || '';
    const correctPercent = percent?.trim() || '';
    
    // Handle cases where we don't have all three parts
    if (!fraction || !decimal) {
      handleWrongAnswer('', '', 'Invalid example format. Please contact support.');
      return;
    }
    
    if (userAnswers.decimal.trim() === correctDecimal && userAnswers.percent.trim() === correctPercent) {
      handleCorrectAnswer(`Correct! ${fraction} = ${decimal}${percent ? ' = ' + percent : ''}`);
      
      if (currentIndex < examples.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setUserAnswers({ decimal: "", percent: "" });
          resetFeedback();
        }, 2000);
      } else {
        onComplete();
      }
    } else {
      const question = `How do I convert ${fraction} to decimal and percent?`;
      const context = `The student is trying to convert ${fraction} to decimal and percent. The correct answers are ${decimal} and ${percent}. They have attempted this ${attempts + 1} times unsuccessfully.`;
      const customMessage = `Not quite. Divide numerator by denominator for decimal, then multiply by 100 for percent. Try again! (Attempt ${attempts + 1} of 3)`;
      
      handleWrongAnswer(question, context, customMessage);
    }
  };

  return (
    <Card className="rounded-lg border border-green-600 text-card-foreground shadow-sm mb-4 bg-[#14532d4d] relative">
      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showAnimation}
        animationType={animationType}
        onComplete={handleAnimationComplete}
      />
      <CardHeader>
        <CardTitle className="text-lg text-white">Triple Conversion</CardTitle>
        <CardDescription className="text-gray-300">
          Convert {fraction} to decimal and percent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-800 mb-2">{fraction}</div>
              <div className="text-2xl text-gray-600 my-4">↓</div>
              <div className="text-xl text-gray-600">Convert to decimal and percent</div>
            </div>
          </div>

          <div className="text-sm text-gray-300 text-center">
            <p>Divide for decimal, then multiply by 100 for percent</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-white w-20">Decimal:</span>
              <Input
                type="text"
                placeholder="0.X"
                value={userAnswers.decimal}
                onChange={(e) => setUserAnswers({...userAnswers, decimal: e.target.value})}
                className="w-32 text-white bg-gray-700 border-gray-600 placeholder-gray-400"
                disabled={feedback?.correct}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-white w-20">Percent:</span>
              <Input
                type="text"
                placeholder="X%"
                value={userAnswers.percent}
                onChange={(e) => setUserAnswers({...userAnswers, percent: e.target.value})}
                className="w-32 text-white bg-gray-700 border-gray-600 placeholder-gray-400"
                disabled={feedback?.correct}
              />
            </div>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!userAnswers.decimal || !userAnswers.percent || feedback?.correct}
            className="px-6 py-3 text-lg bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
          >
            Submit
          </Button>

          {feedback && (
            <div className={`flex items-center space-x-2 p-3 rounded ${
              feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {feedback.correct ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">
                {feedback.message.split(/(\(Attempt \d+ of \d+\))/).map((part, index) => 
                  part.match(/\(Attempt \d+ of \d+\)/) ? (
                    <span key={index} className="bg-yellow-200 px-1 rounded font-medium text-gray-800">{part}</span>
                  ) : (
                    part
                  )
                )}
              </span>
            </div>
          )}
          
          <div className="text-sm text-gray-300">
            Problem {currentIndex + 1} of {examples.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Ordering Activity Component for 6.NS.1.e with dynamic logic
const OrderingActivity = ({ 
  examples, 
  onComplete, 
  onRequestHelp,
  subLesson 
}: {
  examples: string[];
  onComplete: () => void;
  onRequestHelp: (question: string, context: string) => void;
  subLesson: any;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { feedback, attempts, handleWrongAnswer, handleCorrectAnswer, resetFeedback, showAnimation, animationType, handleAnimationComplete } = useFeedbackLogic(onRequestHelp, currentIndex + 1);

  const currentExample = examples[currentIndex];
  
  // Dynamic processing similar to 6.NS.2.a - extract numbers without revealing answer
  const processOrderingExample = (example: string) => {
    const match = example.match(/^([^:]+):\s*(.+)\.$/);
    if (match) {
      const numbersText = match[1].trim();
      const answerText = match[2].trim();
      
      // Extract individual numbers
      const numbers = numbersText.split(',').map(n => n.trim());
      
      // Extract correct order (remove decimal conversions in parentheses)
      const correctOrder = answerText.split(',').map(n => n.trim().replace(/\s*\([^)]*\)/, ''));
      
      // Generate interactive prompt without revealing answer
      const interactiveText = `Order these numbers from least to greatest: ${numbers.join(', ')}`;
      
      return { numbers, correctOrder, interactiveText };
    }
    return null;
  };

  const problemData = processOrderingExample(currentExample);
  
  if (!problemData) {
    return (
      <div className="text-gray-300 text-center p-4">
        <p>Unable to parse ordering problem from: {currentExample}</p>
      </div>
    );
  }

  const { numbers, correctOrder, interactiveText } = problemData;

  // Initialize user order with shuffled numbers
  useEffect(() => {
    if (userOrder.length === 0) {
      setUserOrder([...numbers]);
    }
  }, [numbers]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const newOrder = [...userOrder];
    const draggedItem = newOrder[draggedIndex];
    
    // Remove dragged item
    newOrder.splice(draggedIndex, 1);
    
    // Insert at new position
    newOrder.splice(dropIndex, 0, draggedItem);
    
    setUserOrder(newOrder);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = () => {
    const isCorrect = userOrder.length === correctOrder.length && 
                     userOrder.every((num, index) => num === correctOrder[index]);

    if (isCorrect) {
      handleCorrectAnswer(`Correct! The order from least to greatest is: ${correctOrder.join(', ')}`);
      
      if (currentIndex < examples.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setUserOrder([]);
          resetFeedback();
        }, 2000);
      } else {
        onComplete();
      }
    } else {
      const question = `How do I order these numbers from least to greatest: ${numbers.join(', ')}?`;
      const context = `The student is trying to order ${numbers.join(', ')} from least to greatest. The correct order is ${correctOrder.join(', ')}. They have attempted this ${attempts + 1} times unsuccessfully.`;
      const customMessage = `Not quite right. Try converting all numbers to the same form (like decimals) to compare them easily. (Attempt ${attempts + 1} of 3)`;
      
      handleWrongAnswer(question, context, customMessage);
    }
  };

  const resetOrder = () => {
    setUserOrder([...numbers]);
    resetFeedback();
  };

  return (
    <Card className="rounded-lg border border-gray-400/20 text-card-foreground shadow-2xl mb-4 bg-gradient-to-br from-gray-600 to-gray-800 relative">
      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showAnimation}
        animationType={animationType}
        onComplete={handleAnimationComplete}
      />
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white">
          {subLesson.title}
        </CardTitle>
        <CardDescription className="text-gray-300">
          Complete the interactive activity
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Interactive Practice Section with Modern Gradient */}
        <div className="bg-gradient-to-r from-gray-500/80 via-gray-600/80 to-gray-700/80 p-4 rounded-lg border border-gray-400/20 shadow-xl">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-lg shadow-inner">
            <div className="text-gray-700 text-center mb-4">
              <h3 className="font-semibold mb-2 text-gray-800">{interactiveText}</h3>
              
              {/* Draggable number cards */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {userOrder.map((number, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`px-4 py-3 bg-blue-100 border-2 border-blue-300 rounded-lg cursor-move transition-all duration-200 hover:shadow-md hover:scale-105 ${
                      draggedIndex === index ? 'opacity-50 rotate-2' : ''
                    }`}
                  >
                    {number}
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-blue-600 mb-4">
                Think about: Convert to decimals or use number line visualization
              </div>
              
              <div className="flex justify-center">
                <Button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Submit Order
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Feedback Display */}
        <FeedbackMessage
          feedback={feedback}
          attempts={attempts}
          onRequestHelp={onRequestHelp}
          context={{
            question: `How do I order these numbers from least to greatest: ${numbers.join(', ')}?`,
            description: `Order ${numbers.join(', ')} from least to greatest`,
            correctAnswer: correctOrder.join(', ')
          }}
        />
        
        {/* Progress indicator */}
        <div className="text-center text-sm text-gray-400">
          Example {currentIndex + 1} of {examples.length}
        </div>
      </CardContent>
    </Card>
  );
};

// Comparison Activity Component for 6.NS.1.e
const ComparisonActivity = ({ 
  examples, 
  onComplete, 
  onRequestHelp,
  subLesson 
}: {
  examples: string[];
  onComplete: () => void;
  onRequestHelp: (question: string, context: string) => void;
  subLesson: any;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const { feedback, attempts, handleWrongAnswer, handleCorrectAnswer, resetFeedback, showAnimation, animationType, handleAnimationComplete } = useFeedbackLogic(onRequestHelp, currentIndex + 1);

  const currentExample = examples[currentIndex];
  
  // Parse the example to extract comparison
  const parseComparisonProblem = (example: string) => {
    // Examples like "60% vs 2/3: 2/3 = 66.67%, so 2/3 > 60%."
    const match = example.match(/^([^:]+):\s*(.+)\.$/);
    if (match) {
      const comparisonText = match[1].trim();
      const explanationText = match[2].trim();
      
      // Extract the two numbers being compared
      const numbers = comparisonText.split(' vs ').map(n => n.trim());
      
      // Determine the correct relationship
      let correctAnswer = "";
      if (explanationText.includes(' > ')) {
        const parts = explanationText.split(' > ');
        if (parts[0].includes(numbers[1]) || parts[0].includes(numbers[1].replace('%', ''))) {
          correctAnswer = "greater";
        } else {
          correctAnswer = "less";
        }
      } else if (explanationText.includes(' < ')) {
        const parts = explanationText.split(' < ');
        if (parts[0].includes(numbers[0]) || parts[0].includes(numbers[0].replace('%', ''))) {
          correctAnswer = "less";
        } else {
          correctAnswer = "greater";
        }
      } else if (explanationText.toLowerCase().includes('equal')) {
        correctAnswer = "equal";
      }
      
      return { numbers, correctAnswer, explanation: explanationText };
    }
    return null;
  };

  const problemData = parseComparisonProblem(currentExample);
  
  if (!problemData) {
    return (
      <div className="text-gray-300 text-center p-4">
        <p>Unable to parse comparison problem from: {currentExample}</p>
      </div>
    );
  }

  const { numbers, correctAnswer } = problemData;

  const handleSubmit = () => {
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

    if (isCorrect) {
      handleCorrectAnswer(`Correct! ${numbers[0]} is ${correctAnswer} ${correctAnswer !== 'equal' ? 'than ' : 'to '}${numbers[1]}.`);
      
      if (currentIndex < examples.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setUserAnswer("");
          resetFeedback();
        }, 2000);
      } else {
        onComplete();
      }
    } else {
      const question = `How do I compare ${numbers[0]} and ${numbers[1]}?`;
      const context = `The student is trying to compare ${numbers[0]} and ${numbers[1]}. ${numbers[0]} is ${correctAnswer} ${correctAnswer !== 'equal' ? 'than ' : 'to '}${numbers[1]}. They have attempted this ${attempts + 1} times unsuccessfully.`;
      const customMessage = `Not quite right. Try converting both numbers to the same form (like decimals or percents) to compare them. (Attempt ${attempts + 1} of 3)`;
      
      handleWrongAnswer(question, context, customMessage);
    }
  };

  return (
    <Card className="rounded-lg border border-green-600 text-card-foreground shadow-sm mb-4 bg-[#14532d4d] relative">
      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showAnimation}
        animationType={animationType}
        onComplete={handleAnimationComplete}
      />
      <CardHeader>
        <CardTitle className="text-lg text-white">{subLesson.title}</CardTitle>
        <CardDescription className="text-gray-300">
          Compare {numbers[0]} and {numbers[1]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          
          {/* Comparison Display */}
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {numbers[0]} ___ {numbers[1]}
              </div>
              <div className="text-lg text-gray-600">
                Which is greater, or are they equal?
              </div>
            </div>
          </div>

          {/* Answer Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={() => setUserAnswer("less")}
              variant={userAnswer === "less" ? "default" : "outline"}
              className={userAnswer === "less" ? "bg-blue-600 text-white" : ""}
              disabled={feedback?.correct}
            >
              {numbers[0]} is less
            </Button>
            <Button
              onClick={() => setUserAnswer("equal")}
              variant={userAnswer === "equal" ? "default" : "outline"}
              className={userAnswer === "equal" ? "bg-blue-600 text-white" : ""}
              disabled={feedback?.correct}
            >
              They are equal
            </Button>
            <Button
              onClick={() => setUserAnswer("greater")}
              variant={userAnswer === "greater" ? "default" : "outline"}
              className={userAnswer === "greater" ? "bg-blue-600 text-white" : ""}
              disabled={feedback?.correct}
            >
              {numbers[0]} is greater
            </Button>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!userAnswer || feedback?.correct}
            className="text-white bg-blue-600 hover:bg-blue-700"
          >
            Submit Answer
          </Button>

          {/* Feedback */}
          {feedback && (
            <div className={`flex items-center space-x-2 p-3 rounded ${
              feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {feedback.correct ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">
                {feedback.message.split(/(\(Attempt \d+ of \d+\))/).map((part, index) => 
                  part.match(/\(Attempt \d+ of \d+\)/) ? (
                    <span key={index} className="bg-yellow-200 px-1 rounded font-medium text-gray-800">{part}</span>
                  ) : (
                    part
                  )
                )}
              </span>
            </div>
          )}
          
          <div className="text-sm text-gray-300">
            Problem {currentIndex + 1} of {examples.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Word Problem Activity Component for 6.NS.1.e word problems
function WordProblemActivity({ 
  examples, 
  onComplete, 
  onRequestHelp,
  subLesson 
}: {
  examples: string[];
  onComplete: () => void;
  onRequestHelp: (question: string, context: string) => void;
  subLesson: any;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const { feedback, attempts, handleWrongAnswer, handleCorrectAnswer, resetFeedback, showAnimation, animationType, handleAnimationComplete } = useFeedbackLogic(onRequestHelp, currentIndex + 1);

  const currentExample = examples[currentIndex];
  
  // Parse the word problem example to extract the question and answer
  const parseWordProblem = (example: string) => {
    console.log("Parsing word problem:", example);
    
    // Try multiple patterns to match different formats
    
    // Pattern 1: "Question? (calculation, result)."
    let match = example.match(/^([^?]+\?)\s*\(([^)]+)\)\.?$/);
    if (match) {
      const question = match[1].trim();
      const calculation = match[2].trim();
      
      console.log("Pattern 1 matched - Question:", question, "Calculation:", calculation);
      
      // Extract the answer from the calculation
      let correctAnswer = "";
      if (calculation.includes(', equal') || calculation.includes('equal')) {
        correctAnswer = "equal";
      } else if (calculation.includes(' is more') || calculation.includes(' > ') || calculation.includes('greater')) {
        const parts = calculation.split(',');
        const lastPart = parts[parts.length - 1].trim();
        
        // Check if the last part indicates which is greater
        if (lastPart.includes('%') && !lastPart.includes('/')) {
          correctAnswer = "first";
        } else if (lastPart.includes('/') && !lastPart.includes('%')) {
          correctAnswer = "second";
        } else if (lastPart.includes('first') || lastPart.includes('20%')) {
          correctAnswer = "first";
        } else if (lastPart.includes('second') || lastPart.includes('1/4')) {
          correctAnswer = "second";
        }
      }
      
      return { question, calculation, correctAnswer };
    }
    
    // Pattern 2: "Compare X to Y (calculation)"
    match = example.match(/^(Compare [^(]+)\s*\(([^)]+)\)\.?$/);
    if (match) {
      const questionText = match[1].trim();
      const calculation = match[2].trim();
      
      console.log("Pattern 2 matched - Compare format - Question:", questionText, "Calculation:", calculation);
      
      // Convert "Compare X to Y" into a question
      const question = questionText + " - which is greater?";
      
      // Extract the answer from the calculation
      let correctAnswer = "";
      if (calculation.includes(', equal') || calculation.includes('equal')) {
        correctAnswer = "equal";
      } else if (calculation.includes(' is more') || calculation.includes('more') || calculation.includes('greater')) {
        const parts = calculation.split(',');
        const lastPart = parts[parts.length - 1].trim();
        
        // Check which option is mentioned as greater in the last part
        if (lastPart.includes('%') && !lastPart.includes('/')) {
          correctAnswer = "second"; // Percent is typically the second option in "Compare X to Y%" format
        } else if (lastPart.includes('/') && !lastPart.includes('%')) {
          correctAnswer = "first"; // Fraction is typically the first option
        } else if (lastPart.includes('30%')) {
          correctAnswer = "second";
        } else if (lastPart.includes('1/3')) {
          correctAnswer = "first";
        }
      }
      
      console.log("Extracted answer:", correctAnswer);
      return { question, calculation, correctAnswer };
    }
    
    // Pattern 3: Just a question without parentheses
    match = example.match(/^([^?]+\?)(.*)$/);
    if (match) {
      const question = match[1].trim();
      const rest = match[2].trim();
      
      console.log("Pattern 3 matched - Question:", question, "Rest:", rest);
      
      // Default to "first" for now, user will need to figure it out
      return { question, calculation: "Calculate both values to compare", correctAnswer: "first" };
    }
    
    console.log("No pattern matched for:", example);
    return null;
  };

  const problemData = parseWordProblem(currentExample);
  
  if (!problemData) {
    return (
      <div className="text-gray-300 text-center p-4">
        <p>Unable to parse word problem from: {currentExample}</p>
      </div>
    );
  }

  const { question, calculation, correctAnswer } = problemData;

  const handleSubmit = () => {
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

    if (isCorrect) {
      let resultMessage = "";
      if (correctAnswer === "equal") {
        resultMessage = "Correct! Both options are equal.";
      } else if (correctAnswer === "first") {
        resultMessage = "Correct! The first option is greater.";
      } else if (correctAnswer === "second") {
        resultMessage = "Correct! The second option is greater.";
      }
      
      handleCorrectAnswer(`${resultMessage} ${calculation}`);
      
      if (currentIndex < examples.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setUserAnswer("");
          resetFeedback();
        }, 3000);
      } else {
        onComplete();
      }
    } else {
      const helpQuestion = `How do I solve this word problem: ${question}`;
      const context = `The student is solving word problems involving percent and fraction comparisons. They are working on: ${question}. The calculation shows: ${calculation}. The correct answer is ${correctAnswer}. They have attempted this ${attempts + 1} times unsuccessfully.`;
      const customMessage = `Not quite right. Try calculating both values step by step. (Attempt ${attempts + 1} of 3)`;
      
      handleWrongAnswer(helpQuestion, context, customMessage);
    }
  };

  return (
    <Card className="rounded-lg border border-green-600 text-card-foreground shadow-sm mb-4 bg-[#14532d4d] relative">
      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showAnimation}
        animationType={animationType}
        onComplete={handleAnimationComplete}
      />
      <CardHeader>
        <CardTitle className="text-lg text-white">{subLesson.title}</CardTitle>
        <CardDescription className="text-gray-300">
          Read the problem and compare the two options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          
          {/* Word Problem Display */}
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300 max-w-lg">
            <div className="text-center">
              <div className="text-lg font-medium text-gray-800 mb-4">
                {question}
              </div>
              <div className="text-sm text-gray-600 italic">
                Calculate each option to compare them
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => setUserAnswer("first")}
              variant={userAnswer === "first" ? "default" : "outline"}
              className={`w-48 ${userAnswer === "first" ? "bg-blue-600 text-white" : ""}`}
              disabled={feedback?.correct}
            >
              First option is greater
            </Button>
            <Button
              onClick={() => setUserAnswer("second")}
              variant={userAnswer === "second" ? "default" : "outline"}
              className={`w-48 ${userAnswer === "second" ? "bg-blue-600 text-white" : ""}`}
              disabled={feedback?.correct}
            >
              Second option is greater
            </Button>
            <Button
              onClick={() => setUserAnswer("equal")}
              variant={userAnswer === "equal" ? "default" : "outline"}
              className={`w-48 ${userAnswer === "equal" ? "bg-blue-600 text-white" : ""}`}
              disabled={feedback?.correct}
            >
              They are equal
            </Button>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!userAnswer || feedback?.correct}
            className="text-white bg-blue-600 hover:bg-blue-700"
          >
            Submit Answer
          </Button>

          {/* Feedback */}
          {feedback && (
            <div className={`flex items-center space-x-2 p-3 rounded max-w-lg ${
              feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {feedback.correct ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">{feedback.message}</span>
            </div>
          )}
          
          <div className="text-sm text-gray-300">
            Problem {currentIndex + 1} of {examples.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Interactive Practice Renderer - Complete universal system
const InteractivePracticeRenderer = ({ 
  lesson,
  currentExample,
  onAnswerSubmitted,
  subLesson,
  subLessonIndex, 
  onRequestHelp, 
  onActivityComplete,
  resetTrigger 
}: {
  lesson?: any;
  currentExample?: string;
  onAnswerSubmitted?: (answer: any) => void;
  subLesson?: any;
  subLessonIndex?: number;
  onRequestHelp?: (question: string, context: string) => void;
  onActivityComplete?: (index: number) => void;
  resetTrigger?: number;
}) => {
  // Handle both old and new parameter formats
  const actualLesson = lesson || subLesson;
  const actualExample = currentExample || (actualLesson?.examples?.[subLessonIndex || 0]);
  
  if (!actualLesson || !actualExample) {
    return null;
  }

  const title = actualLesson.title.toLowerCase();
  const explanation = actualLesson.explanation || '';
  const examples = actualLesson.examples || [];
  
  const handleAnswer = (answer: any) => {
    if (onAnswerSubmitted) {
      onAnswerSubmitted(answer);
    }
    // Don't call onActivityComplete here - let the parent handle progression
  };
  


  // PHASE 4: Use lessonProcessor for universal content analysis
  const lessonAnalysis = analyzeLessonType(actualLesson.explanation || '', actualLesson.title, actualLesson.code);
  
  console.log('🔍 InteractivePracticeRenderer lessonAnalysis:', lessonAnalysis);
  console.log('🔍 InteractivePracticeRenderer actualExample:', actualExample);
  
  if (lessonAnalysis.requiresInteraction) {
    try {
      const processedContent = processLessonContent(actualExample, actualLesson.explanation || '', lessonAnalysis);
      console.log('🔍 InteractivePracticeRenderer processedContent:', processedContent);
      
      if (processedContent && processedContent.componentType === 'grid') {
        return (
          <div className="text-center mb-4">
            <GridComponent
              key={`grid-${actualLesson.id}-${subLessonIndex}`}
              gridSize={processedContent.gridSize!}
              columns={processedContent.columns!}
              preShadedCells={processedContent.preShadedCells!}
              mode={processedContent.gridMode!}
              correctAnswer={processedContent.correctAnswer as number}
              promptText={processedContent.interactiveText}
              onAnswer={handleAnswer}
              resetTrigger={resetTrigger}
              standardCode={actualLesson.code}
              lessonTitle={actualLesson.title}
            />
          </div>
        );
      }
      
      if (processedContent && processedContent.componentType === 'strip') {
        return (
          <div className="text-center mb-4">
            <StripComponent
              key={`strip-${actualLesson.id}-${subLessonIndex}`}
              segments={processedContent.additionalData?.segments || 20}
              shadedSegments={processedContent.additionalData?.shadedSegments || 0}
              correctAnswer={processedContent.correctAnswer as number}
              promptText={processedContent.interactiveText}
              onAnswer={handleAnswer}
            />
          </div>
        );
      }

      if (processedContent && processedContent.componentType === 'decimal-percent') {
        return (
          <div className="text-center mb-4">
            <DecimalPercentConversion
              key={`decimal-percent-${actualLesson.id}-${subLessonIndex}`}
              type={processedContent.conversionType!}
              value={processedContent.value!}
              description={processedContent.interactiveText}
              onAnswer={handleAnswer}
              onRequestHelp={onRequestHelp || (() => {})}
            />
          </div>
        );
      }
      
      if (processedContent && processedContent.componentType === 'fraction-operation') {
        return (
          <div className="text-center mb-4">
            <FractionOperationComponent
              key={`fraction-operation-${actualLesson.id}-${subLessonIndex}`}
              problem={processedContent.interactiveText}
              correctAnswer={processedContent.correctAnswer}
              onAnswer={handleAnswer}
              onRequestHelp={onRequestHelp || (() => {})}
            />
          </div>
        );
      }
      
      // If we processed content but it's not a supported component, return null to prevent fallback
      if (processedContent) {
        return null;
      }
    } catch (error) {
      return (
        <div className="text-center mb-4">
          <p className="text-red-300 mb-2">Error processing lesson: {error instanceof Error ? error.message : String(error)}</p>
          <p className="text-gray-300">Example: {actualExample}</p>
        </div>
      );
    }
  }

  // If no interactive content was processed, return null (no fallback)
  return null;
};

// Legacy components below (not used by universal system)
const LegacyOrderingActivity = ({ examples, onComplete, onRequestHelp, subLesson }) => {
  if (false) { // Disabled - using universal system instead
    return (
      <OrderingActivity
        examples={examples}
        onComplete={handleActivityComplete}
        onRequestHelp={onRequestHelp}
        subLesson={subLesson}
      />
    );
  }
  
  if (title.includes('compare') && (title.includes('percent') || title.includes('fraction'))) {
    if (title.includes('word problem')) {
      return (
        <WordProblemActivity
          examples={examples}
          onComplete={handleActivityComplete}
          onRequestHelp={onRequestHelp}
          subLesson={subLesson}
        />
      );
    } else {
      return (
        <ComparisonActivity
          examples={examples}
          onComplete={handleActivityComplete}
          onRequestHelp={onRequestHelp}
          subLesson={subLesson}
        />
      );
    }
  }
  
  if (title.includes('real-world') || title.includes('apply') || title.includes('solve') && title.includes('problem')) {
    return (
      <WordProblemActivity
        examples={examples}
        onComplete={handleActivityComplete}
        onRequestHelp={onRequestHelp}
        subLesson={subLesson}
      />
    );
  }
  
  if (title.includes('lowest terms') || title.includes('simplify')) {
    return (
      <FractionSimplificationActivity
        examples={examples}
        onComplete={handleActivityComplete}
        onRequestHelp={onRequestHelp}
      />
    );
  }
  
  if (title.includes('improper') || title.includes('mixed number')) {
    return (
      <MixedNumberConversionActivity
        examples={examples}
        onComplete={handleActivityComplete}
        onRequestHelp={onRequestHelp}
      />
    );
  }
  
  if (title.includes('decimals to fractions')) {
    return (
      <DecimalToFractionActivity
        examples={examples}
        onComplete={handleActivityComplete}
        onRequestHelp={onRequestHelp}
      />
    );
  }
  
  if (title.includes('fractions to decimals')) {
    return (
      <FractionToDecimalActivity
        examples={examples}
        onComplete={handleActivityComplete}
        onRequestHelp={onRequestHelp}
      />
    );
  }
  
  if (title.includes('percents') && title.includes('fractions') && title.includes('decimals')) {
    return (
      <TripleConversionActivity
        examples={examples}
        onComplete={handleActivityComplete}
        onRequestHelp={onRequestHelp}
      />
    );
  }
  
  if (title.includes('percents') && title.includes('decimals') && title.includes('convert')) {
    return (
      <GenericConversionActivity
        subLesson={subLesson}
        examples={examples}
        onComplete={handleActivityComplete}
        onRequestHelp={onRequestHelp}
      />
    );
  }

  // Generic conversion activity for other types
  return (
    <GenericConversionActivity
      subLesson={subLesson}
      examples={examples}
      onComplete={handleActivityComplete}
      onRequestHelp={onRequestHelp}
    />
  );
};

// Generic Conversion Activity Component
const GenericConversionActivity = ({ 
  subLesson,
  examples, 
  onComplete, 
  onRequestHelp 
}: {
  subLesson: any;
  examples: string[];
  onComplete: () => void;
  onRequestHelp: (question: string, context: string) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const { 
    feedback, 
    attempts, 
    handleWrongAnswer, 
    handleCorrectAnswer, 
    resetFeedback, 
    showAnimation, 
    animationType, 
    handleAnimationComplete 
  } = useFeedbackLogic(onRequestHelp, currentIndex + 1);

  const currentExample = examples[currentIndex];
  
  // Parse the example to determine what to ask for
  let question = "";
  let correctAnswer = "";
  let placeholder = "";
  
  if (currentExample.includes(' = ')) {
    const parts = currentExample.split(' = ');
    if (parts.length === 2) {
      // Show first part, ask for second
      question = `Convert ${parts[0]}`;
      correctAnswer = parts[1].trim();
      placeholder = "Enter your answer";
    }
  } else if (currentExample.includes(' simplified to ')) {
    const parts = currentExample.split(' simplified to ');
    question = `Simplify ${parts[0]}`;
    correctAnswer = parts[1].trim();
    placeholder = "Enter simplified fraction";
  } else {
    // Just show the example for review
    question = "Study this example";
    correctAnswer = "studied";
    placeholder = "Type 'studied' when ready";
  }

  const handleSubmit = () => {
    if (userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase().replace('.', '')) {
      handleCorrectAnswer(`Correct! ${currentExample}`);
      
      if (currentIndex < examples.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setUserAnswer("");
          resetFeedback();
        }, 2000);
      } else {
        onComplete();
      }
    } else {
      const helpQuestion = `How do I solve: ${question}?`;
      const context = `The student is working on ${subLesson.title}. They are trying to solve: ${question}. The correct answer is ${correctAnswer}. They have attempted this ${attempts + 1} times unsuccessfully.`;
      const customMessage = `Not quite. Try again! (Attempt ${attempts + 1} of 3)`;
      
      handleWrongAnswer(helpQuestion, context, customMessage);
    }
  };

  return (
    <Card className="rounded-lg border border-green-600 text-card-foreground shadow-sm mb-4 bg-[#14532d4d] relative">
      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showAnimation}
        animationType={animationType}
        onComplete={handleAnimationComplete}
      />
      <CardHeader>
        <CardTitle className="text-lg text-white">{subLesson.title}</CardTitle>
        <CardDescription className="text-gray-300">
          {question}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {currentExample.includes(' = ') ? currentExample.split(' = ')[0] : 
                 currentExample.includes(' simplified to ') ? currentExample.split(' simplified to ')[0] :
                 currentExample}
              </div>
              <div className="text-lg text-gray-600">{question}</div>
            </div>
          </div>

          <div className="text-sm text-gray-300 text-center">
            <p>Follow the steps from the lesson explanation</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder={placeholder}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-48 text-white bg-gray-700 border-gray-600 placeholder-gray-400"
              disabled={feedback?.correct}
            />
            <Button 
              onClick={handleSubmit}
              disabled={!userAnswer || feedback?.correct}
              className="ml-2 text-white bg-blue-600 hover:bg-blue-700"
            >
              Submit
            </Button>
          </div>

          {feedback && (
            <div className={`flex items-center space-x-2 p-3 rounded ${
              feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {feedback.correct ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">
                {feedback.message.split(/(\(Attempt \d+ of \d+\))/).map((part, index) => 
                  part.match(/\(Attempt \d+ of \d+\)/) ? (
                    <span key={index} className="bg-yellow-200 px-1 rounded font-medium text-gray-800">{part}</span>
                  ) : (
                    part
                  )
                )}
              </span>
            </div>
          )}
          
          <div className="text-sm text-gray-300">
            Problem {currentIndex + 1} of {examples.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Interactive Grid component - user clicks/drags to shade squares
interface InteractiveGridProps {
  subLesson: any;
  subLessonIndex: number;
  onRequestHelp: (question: string, context: string) => void;
  onActivityComplete: (activityIndex: number) => void;
}

const InteractiveGridRenderer: React.FC<InteractiveGridProps> = ({
  subLesson,
  subLessonIndex,
  onRequestHelp,
  onActivityComplete,
}) => {
  const [currentExample, setCurrentExample] = useState(0);
  const [shadedSquares, setShadedSquares] = useState<Set<number>>(new Set());
  const [userAnswer, setUserAnswer] = useState("");
  const { feedback, attempts, handleWrongAnswer, handleCorrectAnswer, resetFeedback, showAnimation, animationType, handleAnimationComplete } = useFeedbackLogic(onRequestHelp, currentExample + 1);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Parse database examples
  const parseExample = (example: string) => {
    const fractionMatch = example.match(/^(\d+\/\d+)/);
    const percentMatch = example.match(/(\d+(?:\.\d+)?)%/);
    
    if (fractionMatch && percentMatch) {
      return {
        fraction: fractionMatch[1],
        expectedPercent: parseFloat(percentMatch[1]),
        description: `Shade the grid to represent ${fractionMatch[1]}, then convert to percent`
      };
    }
    return null;
  };

  const examples = subLesson.examples?.map(parseExample).filter(Boolean) || [];
  const currentExampleData = examples[currentExample];

  if (!currentExampleData) {
    return <div className="text-gray-300">No valid examples found</div>;
  }

  const handleSquareInteraction = (index: number, isShading: boolean) => {
    if (feedback?.correct) return;
    
    setShadedSquares(prev => {
      const newSet = new Set(prev);
      if (isShading) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  };

  const handleMouseDown = (index: number) => {
    setIsMouseDown(true);
    const shouldShade = !shadedSquares.has(index);
    handleSquareInteraction(index, shouldShade);
  };

  const handleMouseEnter = (index: number) => {
    if (isMouseDown) {
      const shouldShade = !shadedSquares.has(index);
      handleSquareInteraction(index, shouldShade);
    }
  };

  const handleSubmit = () => {
    const shadedCount = shadedSquares.size;
    const userPercent = parseFloat(userAnswer.replace('%', ''));
    const calculatedPercent = shadedCount;
    
    // Check if the shaded squares and entered percent match the expected values
    if (Math.abs(calculatedPercent - currentExampleData.expectedPercent) < 1 && 
        Math.abs(userPercent - currentExampleData.expectedPercent) < 1) {
      
      handleCorrectAnswer(`Correct! ${currentExampleData.fraction} = ${currentExampleData.expectedPercent}%`);
      
      if (currentExample < examples.length - 1) {
        // Mark this example as complete and move to next
        setTimeout(() => {
          onActivityComplete(subLessonIndex * examples.length + currentExample);
          setCurrentExample(currentExample + 1);
          setShadedSquares(new Set());
          setUserAnswer("");
          resetFeedback();
        }, 2000);
      } else {
        // Mark final example as complete
        setTimeout(() => {
          onActivityComplete(subLessonIndex * examples.length + currentExample);
        }, 2000);
      }
    } else {
      const helpQuestion = `How do I represent ${currentExampleData.fraction} on a grid and convert it to a percent?`;
      const context = `The student is working on representing fractions using grid models and converting to percents. They are trying to represent ${currentExampleData.fraction} which should equal ${currentExampleData.expectedPercent}%. They have shaded ${shadedCount} squares and entered ${userPercent}%. They have attempted this ${attempts + 1} times unsuccessfully.`;
      const customMessage = `Not quite. You shaded ${shadedCount} squares (${shadedCount}%) but entered ${userPercent}%. Try again! (Attempt ${attempts + 1} of 3)`;
      
      handleWrongAnswer(helpQuestion, context, customMessage);
    }
  };

  const clearGrid = () => {
    setShadedSquares(new Set());
    setUserAnswer("");
    resetFeedback();
  };

  // Generate a 10x10 grid
  const generateGrid = () => {
    const squares = [];
    for (let i = 0; i < 100; i++) {
      squares.push(
        <div
          key={i}
          className={`w-6 h-6 border border-gray-400 cursor-pointer transition-colors ${
            shadedSquares.has(i) ? 'bg-green-500' : 'bg-white hover:bg-gray-200'
          }`}
          onMouseDown={() => handleMouseDown(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseUp={() => setIsMouseDown(false)}
        />
      );
    }
    return squares;
  };

  return (
    <Card className="rounded-lg border border-green-600 text-card-foreground shadow-sm mb-4 bg-[#14532d4d] relative">
      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showAnimation}
        animationType={animationType}
        onComplete={handleAnimationComplete}
      />
      <CardHeader>
        <CardTitle className="text-lg text-white">{subLesson.title}</CardTitle>
        <CardDescription className="text-gray-300">
          {currentExampleData.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {currentExampleData.fraction}
            </div>
            <div className="text-lg text-gray-300">Click and drag to shade squares</div>
          </div>

          {/* Interactive 10x10 Grid */}
          <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-300 select-none">
            <div 
              className="grid grid-cols-10 gap-0 w-fit"
              onMouseLeave={() => setIsMouseDown(false)}
            >
              {generateGrid()}
            </div>
            <div className="text-center mt-2 text-sm text-gray-600">
              {shadedSquares.size} out of 100 squares shaded ({shadedSquares.size}%)
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={clearGrid}
              variant="outline"
              className="text-gray-700 border-gray-300"
            >
              Clear Grid
            </Button>
          </div>

          <div className="text-sm text-gray-300 text-center">
            <p>Shade the grid to represent the fraction, then enter the percent</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter percent (e.g., 40%)"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-48 text-white bg-gray-700 border-gray-600 placeholder-gray-400"
              disabled={feedback?.correct}
            />
            <Button 
              onClick={handleSubmit}
              disabled={!userAnswer || feedback?.correct}
              className="ml-2 text-white bg-blue-600 hover:bg-blue-700"
            >
              Submit
            </Button>
          </div>

          {feedback && (
            <div className={`flex items-center space-x-2 p-3 rounded ${
              feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {feedback.correct ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">
                {feedback.message.split(/(\(Attempt \d+ of \d+\))/).map((part, index) => 
                  part.match(/\(Attempt \d+ of \d+\)/) ? (
                    <span key={index} className="bg-yellow-200 px-1 rounded font-medium text-gray-800">{part}</span>
                  ) : (
                    part
                  )
                )}
              </span>
            </div>
          )}
          
          <div className="text-sm text-gray-300">
            Example {currentExample + 1} of {examples.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// PreShadedGridRenderer component for 6.NS.1.a - shows pre-shaded grids for percentage identification
interface PreShadedGridProps {
  subLesson: any;
  subLessonIndex: number;
  onRequestHelp: (question: string, context: string) => void;
  onActivityComplete: (activityIndex: number) => void;
}

const PreShadedGridRenderer: React.FC<PreShadedGridProps> = ({
  subLesson,
  subLessonIndex,
  onRequestHelp,
  onActivityComplete,
}) => {
  const [currentExample, setCurrentExample] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const { feedback, attempts, handleWrongAnswer, handleCorrectAnswer, resetFeedback, showAnimation, animationType, handleAnimationComplete } = useFeedbackLogic(onRequestHelp, currentExample + 1);
  
  // Debug logging for PreShadedGridRenderer
  console.log('🎯 PreShadedGridRenderer render - showAnimation:', showAnimation, 'animationType:', animationType);
  console.log('🎯 PreShadedGridRenderer subLesson:', subLesson);
  console.log('🎯 PreShadedGridRenderer subLessonIndex:', subLessonIndex);
  console.log('🎯 PreShadedGridRenderer examples:', subLesson.examples);

  // Parse database examples for pre-shaded grids
  const parseExample = (example: string) => {
    console.log('🎯 parseExample called with:', example);
    // Parse examples like "A grid has 80 shaded squares out of 100, so the percent is 80%."
    const gridMatch = example.match(/(\d+(?:\.\d+)?)\s+shaded squares out of (\d+)/);
    const percentMatch = example.match(/(\d+(?:\.\d+)?)%/);
    const stripMatch = example.match(/(\d+(?:\.\d+)?)\s+shaded parts out of (\d+)/);
    const diagramMatch = example.match(/(\d+(?:\.\d+)?)\s+shaded out of (\d+)/);
    
    console.log('🎯 parseExample regex matches:', {
      gridMatch, percentMatch, stripMatch, diagramMatch
    });
    
    if (gridMatch && percentMatch) {
      return {
        shadedSquares: parseFloat(gridMatch[1]),
        totalSquares: parseInt(gridMatch[2]),
        expectedPercent: parseFloat(percentMatch[1]),
        description: `What percentage of this grid is shaded?`,
        type: 'grid'
      };
    } else if (stripMatch && percentMatch) {
      return {
        shadedSquares: parseFloat(stripMatch[1]),
        totalSquares: parseInt(stripMatch[2]),
        expectedPercent: parseFloat(percentMatch[1]),
        description: `What percentage does this strip model show?`,
        type: 'strip'
      };
    } else if (diagramMatch && percentMatch) {
      return {
        shadedSquares: parseFloat(diagramMatch[1]),
        totalSquares: parseInt(diagramMatch[2]),
        expectedPercent: parseFloat(percentMatch[1]),
        description: `What percentage is shaded in this diagram?`,
        type: 'diagram'
      };
    }
    
    // Handle strip model descriptions dynamically based on percentage
    if (percentMatch && (example.includes('strip') || example.includes('one-fifth') || example.includes('one-third') || example.includes('half'))) {
      const expectedPercent = parseFloat(percentMatch[1]);
      // Dynamic calculation based on the percentage
      const totalSquares = 100;
      const shadedSquares = (expectedPercent / 100) * totalSquares;
      return {
        shadedSquares,
        totalSquares,
        expectedPercent,
        description: `What percentage does this strip model show?`,
        type: 'strip'
      };
    }
    
    return null;
  };

  const examples = subLesson.examples?.map(parseExample).filter(Boolean) || [];
  const currentExampleData = examples[currentExample];
  
  // Enhanced debugging
  console.log('🎯 PreShadedGridRenderer parsed examples:', examples);
  console.log('🎯 PreShadedGridRenderer currentExampleData:', currentExampleData);
  console.log('🎯 PreShadedGridRenderer currentExample:', currentExample);

  if (!currentExampleData) {
    console.log('🎯 PreShadedGridRenderer NO VALID EXAMPLES - raw examples:', subLesson.examples);
    return <div className="text-gray-300">No valid examples found</div>;
  }

  const handleSubmit = () => {
    const userPercent = parseFloat(userAnswer.replace('%', ''));
    console.log('🎯 PreShadedGrid handleSubmit called - userPercent:', userPercent, 'expected:', currentExampleData.expectedPercent);
    
    // Dynamic tolerance based on precision
    const tolerance = currentExampleData.expectedPercent < 1 ? 0.1 : 0.5;
    if (Math.abs(userPercent - currentExampleData.expectedPercent) < tolerance) {
      console.log('🎯 PreShadedGrid answer is correct! Calling handleCorrectAnswer');
      handleCorrectAnswer(`Correct! The shaded area represents ${currentExampleData.expectedPercent}%`);
      
      if (currentExample < examples.length - 1) {
        // Mark this example as complete and move to next
        setTimeout(() => {
          onActivityComplete(subLessonIndex * examples.length + currentExample);
          setCurrentExample(currentExample + 1);
          setUserAnswer("");
          resetFeedback();
        }, 2000);
      } else {
        // Mark final example as complete
        setTimeout(() => {
          onActivityComplete(subLessonIndex * examples.length + currentExample);
        }, 2000);
      }
    } else {
      const helpQuestion = `How do I identify what percentage is represented by ${currentExampleData.shadedSquares} shaded parts out of ${currentExampleData.totalSquares}?`;
      const context = `The student is working on identifying percentages from shaded models. They need to find what percentage is represented when ${currentExampleData.shadedSquares} out of ${currentExampleData.totalSquares} parts are shaded. The correct answer is ${currentExampleData.expectedPercent}%. They have attempted this ${attempts + 1} times unsuccessfully.`;
      const customMessage = `Not quite. Look carefully at the shaded area. Try again! (Attempt ${attempts + 1} of 3)`;
      
      handleWrongAnswer(helpQuestion, context, customMessage);
    }
  };

  // Generate grid based on the example data - FULLY DYNAMIC
  const generateGrid = () => {
    const squares = [];
    const totalSquares = currentExampleData.totalSquares;
    const shadedCount = Math.floor(currentExampleData.shadedSquares);
    
    for (let i = 0; i < totalSquares; i++) {
      squares.push(
        <div
          key={i}
          className={`w-4 h-4 border border-gray-400 ${
            i < shadedCount ? 'bg-green-500' : 'bg-white'
          }`}
        />
      );
    }
    return squares;
  };

  // Universal configuration for this component
  const universalConfig: UniversalPromptConfig = {
    type: currentExampleData.type === 'strip' ? 'strip-percentage' : 'grid-percentage',
    standardCode: subLesson.code,
    lessonTitle: subLesson.title,
    context: currentExampleData
  };
  
  const headerConfig = generateUniversalCardHeader(universalConfig);
  const componentJSX = generateUniversalComponentJSX({
    config: universalConfig,
    userAnswer,
    onAnswerChange: setUserAnswer,
    onSubmit: handleSubmit,
    disabled: feedback?.correct,
    feedback
  });

  return (
    <Card className="rounded-lg border border-green-600 text-card-foreground shadow-sm mb-4 bg-[#14532d4d] relative">
      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showAnimation}
        animationType={animationType}
        onComplete={handleAnimationComplete}
      />
      <CardHeader>
        <CardTitle className="text-lg text-white">{headerConfig.title}</CardTitle>
        <CardDescription className={headerConfig.descriptionClasses}>
          {headerConfig.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">

          {/* Pre-shaded Grid or Strip */}
          <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-300">
            {currentExampleData.type === 'strip' ? (
              // Strip model for benchmark percents - FULLY DYNAMIC
              <div className="flex">
                {Array.from({length: 20}, (_, i) => {
                  const shadedSegments = Math.round((currentExampleData.expectedPercent / 100) * 20);
                  console.log('🎯 Strip rendering - segment', i, 'shadedSegments:', shadedSegments, 'expectedPercent:', currentExampleData.expectedPercent);
                  return (
                    <div
                      key={i}
                      className={`w-8 h-16 border border-gray-400 ${
                        i < shadedSegments ? 'bg-green-500' : 'bg-white'
                      }`}
                    />
                  );
                })}
              </div>
            ) : (
              // Grid model - FULLY DYNAMIC COLUMNS
              <div className={`grid gap-0 w-fit`} style={{
                gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(currentExampleData.totalSquares))}, 1fr)`
              }}>
                {generateGrid()}
              </div>
            )}
            <div className="text-center mt-2 text-sm text-gray-600">
              {currentExampleData.shadedSquares} out of {currentExampleData.totalSquares} parts shaded
            </div>
          </div>


          
          <div className="flex items-center space-x-2">
            <input {...componentJSX.inputProps} />
            <Button {...componentJSX.buttonProps} />
          </div>

          {feedback && (
            <div className={`flex items-center space-x-2 p-3 rounded ${
              feedback.correct ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {feedback.correct ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">
                {feedback.message.split(/(\(Attempt \d+ of \d+\))/).map((part, index) => 
                  part.match(/\(Attempt \d+ of \d+\)/) ? (
                    <span key={index} className="bg-yellow-200 px-1 rounded font-medium text-gray-800">{part}</span>
                  ) : (
                    part
                  )
                )}
              </span>
            </div>
          )}
          
          <div className="text-sm text-gray-300">
            Example {currentExample + 1} of {examples.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { InteractivePracticeRenderer };

export default function InteractiveLesson({ subLessons, subStandardTitle, onRequestHelp }: InteractiveLessonProps) {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<number[]>([]);

  // Handle loading state
  if (!subLessons || subLessons.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <p className="text-gray-500">Loading interactive lesson...</p>
        </div>
      </div>
    );
  }

  // Determine the sub-standard type based on the first sub-lesson code
  const isDecimalPercentStandard = subLessons[0]?.code?.includes('6.NS.1.b');
  const isConversionStandard = subLessons[0]?.code?.includes('6.NS.1.d') || subLessons[0]?.code?.includes('6.NS.1.e') || subLessons[0]?.code?.includes('6-G');
  const isGridStandard = subLessons[0]?.code?.includes('6.NS.1.a') || subLessons[0]?.code?.includes('6.NS.1.c') || subLessons[0]?.code?.includes('6-U');
  const hasInteractiveContent = subLessons.some(lesson => lesson.explanation?.includes('**Interactive Practice:**'));
  const isInteractiveContentOnly = hasInteractiveContent && subLessons.length === 1;
  
  // ALL EXAMPLES MUST COME FROM DATABASE - NO HARDCODED EXAMPLES



  // ALL EXAMPLES MUST COME FROM DATABASE - NO HARDCODED EXAMPLES

  const handleActivityComplete = (activityIndex: number) => {
    if (!completedActivities.includes(activityIndex)) {
      setCompletedActivities([...completedActivities, activityIndex]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        {subStandardTitle && <h2 className="text-2xl font-bold text-white mb-2">{subStandardTitle}</h2>}
        
        {/* Progress indicator */}
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-sm font-medium">Progress:</span>
          <div className="flex space-x-1">
            {[...Array(isConversionStandard ? subLessons.length : (isDecimalPercentStandard ? 9 : (isGridStandard ? 6 : (isInteractiveContentOnly ? 3 : 6))))].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  completedActivities.includes(i) ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {completedActivities.length} / {isConversionStandard ? subLessons.length : (isDecimalPercentStandard ? 9 : (isGridStandard ? 6 : (isInteractiveContentOnly ? 3 : 6)))} completed
          </span>
        </div>
      </div>

      {/* Sub-lessons with interactive activities */}
      <div className="space-y-8">
        {subLessons.map((subLesson, subLessonIndex) => (
          <div key={subLesson.id} className="space-y-6">
            {/* Sub-lesson Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
                  {subLesson.code}
                </span>
              </div>
              <h3 className="text-xl font-medium text-white mb-4">
                {subLesson.title}
              </h3>

              {/* Explanation */}
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-300 mb-2">Explanation:</h4>
                {hasInteractiveContent && subLesson.explanation?.includes('**Interactive Practice:**') ? (
                  <div className="text-white text-lg whitespace-pre-wrap">
                    {subLesson.explanation?.split('**Interactive Practice:**')[0]}
                  </div>
                ) : (
                  <p className="text-white text-lg">{subLesson.explanation}</p>
                )}
              </div>


            </div>

            {/* Interactive Activities for this sub-lesson */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Interactive Practice:</h4>
              
              {isGridStandard && (subLesson.code?.includes('6.NS.1.c') || subLesson.code?.includes('6-U.3')) && subLesson.examples && subLesson.examples.length > 0 ? (
                // Use universal system for 6.NS.1.c lessons - route through InteractivePracticeRenderer
                <InteractivePracticeRenderer
                  subLesson={subLesson}
                  subLessonIndex={subLessonIndex}
                  onRequestHelp={onRequestHelp || (() => {})}
                  onActivityComplete={handleActivityComplete}
                />
              ) : isDecimalPercentStandard && subLesson.examples && subLesson.examples.length > 0 ? (
                // Database-driven interactive content for 6.NS.1.b (decimal-percent conversions)
                <InteractivePracticeRenderer
                  subLesson={subLesson}
                  subLessonIndex={subLessonIndex}
                  onRequestHelp={onRequestHelp || (() => {})}
                  onActivityComplete={handleActivityComplete}
                />
              ) : isConversionStandard && subLesson.examples && subLesson.examples.length > 0 ? (
                // Database-driven interactive content for 6.NS.1.d and 6.NS.1.e (fraction conversions)
                <InteractivePracticeRenderer
                  subLesson={subLesson}
                  subLessonIndex={subLessonIndex}
                  onRequestHelp={onRequestHelp || (() => {})}
                  onActivityComplete={handleActivityComplete}
                />
              ) : hasInteractiveContent && subLesson.explanation?.includes('**Interactive Practice:**') ? (
                // Legacy text-based interactive content
                <div className="text-white text-lg whitespace-pre-wrap">
                  {subLesson.explanation?.split('**Interactive Practice:**')[1]}
                </div>
              ) : subLesson.examples && subLesson.examples.length > 0 ? (
                // Fallback: Render database-driven interactive content for other standards
                <InteractivePracticeRenderer
                  subLesson={subLesson}
                  subLessonIndex={subLessonIndex}
                  onRequestHelp={onRequestHelp || (() => {})}
                  onActivityComplete={handleActivityComplete}
                />
              ) : (
                // Other standards fallback
                <div className="text-gray-300">
                  Interactive activities not available for this sub-standard.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {completedActivities.length === (isConversionStandard ? subLessons.length : (isDecimalPercentStandard ? 9 : (isGridStandard ? 6 : (isInteractiveContentOnly ? 3 : 6)))) && (
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Excellent Work!</h3>
                <p className="text-green-600">
                  You've completed all {isDecimalPercentStandard ? 'decimal-percent conversion' : isGridStandard ? 'grid and visual model' : 'fraction-to-percent conversion'} activities for all sub-lessons.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}