import { useState, useMemo, useEffect } from "react";
import type { Lesson } from "@shared/schema";
// REMOVED: InteractivePracticeRenderer - now using universal system components directly
import SuccessAnimation, { type AnimationType } from "./SuccessAnimation";
import NumberLineComponent from "./NumberLineComponent";
import OrderingComponent from "./OrderingComponent";
import ComparisonComponent from "./ComparisonComponent";
import WordProblemComponent from "./WordProblemComponent";
import ExponentComponent from "./ExponentComponent";
import PerfectSquareComponent from "./PerfectSquareComponent";
import FractionOperationComponent from "./FractionOperationComponent";
import ScalingComponent from "./ScalingComponent";
import GridComponent from "./GridComponent";
import StripComponent from "./StripComponent";
import TextInputComponent from "./TextInputComponent";
import FractionVisualInputComponent from "./FractionVisualInputComponent";
import MixedNumberVisualComponent from "./MixedNumberVisualComponent";
import { DecimalPercentConversion } from "./interactive-lesson";
import { analyzeLessonType, processLessonContent } from "../utils/lessonProcessor";
// Removed legacy theme imports - now using universal system
import AiHelpPopup from "./AiHelpPopup";
import { TabLabelGenerator } from "../utils/tabLabelGenerator";
import { generateUniversalPrompt, UniversalPromptConfig, handleUniversalAnswer, universalFeedbackMessages, universalFeedbackStyles, formatUniversalFeedbackMessage, universalCompletionStyles } from "../utils/universalRenderer";

// REMOVED: extractCorrectAnswer - now using universal system processedContent.correctAnswer

// Simplified handleCorrectAnswer for universal system (matches universal baseline)
function handleCorrectAnswer(lessonId: number) {
  // This will be handled by the main lesson panel animation system
  // The complex version below is for legacy non-universal lessons
}

// REMOVED: Legacy handleCorrectAnswerLegacy function replaced by universal system

// Simplified handleIncorrectAnswer for universal system (matches universal baseline)
function handleIncorrectAnswer(lessonId: number) {
  // This will be handled by the main lesson panel animation system
  // The complex version below is for legacy non-universal lessons
}

// REMOVED: handleIncorrectAnswerLegacy - now using universal system handleUniversalAnswer

// Request AI help for a lesson
async function requestAiHelp(lessonId: number, correctAnswer: string) {
  // This is a placeholder for the AI help request logic
  // In a real implementation, this would make an API call to get AI help
  console.log('Requesting AI help for lesson:', lessonId, 'with correct answer:', correctAnswer);
}

interface LessonPanelProps {
  lessons: Lesson[];
  selectedStandard: string | null;
  standardDescription: string | null;
  height: number;
  onAiResponse?: (response: any) => void;
  sessionId?: string;
  selectedLesson?: Lesson | null;
  onLessonSelect?: (lesson: Lesson) => void;
}

export default function LessonPanel({ lessons, selectedStandard, standardDescription, height, onAiResponse, sessionId, selectedLesson, onLessonSelect }: LessonPanelProps) {
  const [currentExampleIndex, setCurrentExampleIndex] = useState<{[key: number]: number}>({});
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({});
  const [showFeedback, setShowFeedback] = useState<{[key: string]: string}>({});
  const [attemptCounts, setAttemptCounts] = useState<{[key: string]: number}>({});
  const [aiHelpRequested, setAiHelpRequested] = useState<{[key: string]: boolean}>({});
  const [showAiHelpPopup, setShowAiHelpPopup] = useState(false);
  const [aiHelpData, setAiHelpData] = useState<{question: string; context: string} | null>(null);
  const [aiResponseReceived, setAiResponseReceived] = useState(false);
  const [showAnimation, setShowAnimation] = useState<{[key: string]: boolean}>({});
  const [animationType, setAnimationType] = useState<{[key: string]: AnimationType}>({});
  const [correctAnswerCount, setCorrectAnswerCount] = useState<{[key: string]: number}>({});
  const [selectedNumberValue, setSelectedNumberValue] = useState<{[key: string]: number | null}>({});
  const [lessonAnalysisCache, setLessonAnalysisCache] = useState<{[key: string]: any}>({});
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  // REMOVED: completedLessons state variable - now using showFeedback['lesson-${id}'] === 'completed' consistently
  const [resetTrigger, setResetTrigger] = useState(0);

  // Reset tab selection when lessons change
  useEffect(() => {
    setSelectedTabIndex(0);
  }, [lessons]);

  // REMOVED: Legacy handleCorrectAnswerSimple function - universal system handles this;

  // REMOVED: Legacy handleIncorrectAnswerSimple function - universal system handles this;

  // Get the currently selected lesson based on tab index
  const currentLesson = lessons[selectedTabIndex];

  // Handle tab selection
  const handleTabSelect = (index: number) => {
    setSelectedTabIndex(index);
    if (onLessonSelect && lessons[index]) {
      onLessonSelect(lessons[index]);
    }
  };

  if (!lessons || lessons.length === 0) {
    return (
      <div 
        className="bg-gray-800 border-b border-gray-700 overflow-y-auto flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Select a Standard</h2>
          <p className="text-gray-500">Choose a standard from the curriculum to begin learning</p>
        </div>
      </div>
    );
  }

  // REMOVED: Legacy handleSubmit function - universal system handles this through handleUniversalAnswer

  // REMOVED: Legacy checkAnswer function - universal system handles this through handleUniversalAnswer

  // REMOVED: Legacy checkOrderAnswer function - universal system handles this through handleUniversalAnswer

  const handleAnimationComplete = (lessonId: number) => {
    const inputKey = `lesson-${lessonId}`;
    setShowAnimation({...showAnimation, [inputKey]: false});
    
    // Animation complete - no additional state management needed
    // Completion state is already handled by the universal system via showFeedback
  };

  // Helper function to get the input placeholder for a lesson
  const getInputPlaceholder = (lesson: Lesson) => {
    if (lesson.title.includes('Understanding integers') || lesson.title.includes('Integers on number lines')) {
      return 'Enter integer (e.g., -3)';
    } else if (lesson.title.includes('Graph integers on horizontal and vertical number lines')) {
      return 'Enter integer (e.g., -5)';
    } else if (lesson.title.includes('Understanding opposite integers')) {
      return 'Enter opposite (e.g., 4)';
    } else if (lesson.title.includes('Write multiplication expressions using exponents') || lesson.title.includes('exponents')) {
      return 'Enter exponent (e.g., 10^3)';
    } else if (lesson.title.includes('Recognize perfect squares') || lesson.title.includes('perfect squares')) {
      return 'Enter result (e.g., 16)';
    } else if (lesson.title.includes('Square numbers') || lesson.title.includes('square')) {
      return 'Enter result (e.g., 25)';
    } else if (lesson.title.includes('Understanding absolute value') || lesson.title.includes('Absolute value')) {
      return 'Enter absolute value (e.g., 6)';
    } else if (lesson.title.includes('Compare integers')) {
      return 'Enter symbol (e.g., <, >, =)';
    } else if (lesson.title.includes('Put integers in order')) {
      return 'Enter ordered list (e.g., -4, -2, 0, 1)';
    } else if (lesson.title.includes('Multiply') && lesson.title.includes('mixed number')) {
      return 'Enter result (e.g., 2 1/2)';
    } else if (lesson.title.includes('Scaling') || lesson.title.includes('justify')) {
      return 'Enter answer (e.g., greater)';
    } else if (lesson.title.includes('Divide') && lesson.title.includes('unit fraction')) {
      return 'Enter result (e.g., 12)';
    } else {
      return 'Enter percent (e.g., 80%)';
    }
  };

  // REMOVED: getCorrectAnswer function - now using universal system processedContent.correctAnswer

  const requestAiHelp = async (lessonId: number, correctAnswer: string) => {
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      const currentIndex = currentExampleIndex[lessonId] || 0;
      const currentExample = lesson?.examples?.[currentIndex] || '';
      
      // Show AI help popup
      const helpQuestion = `How do I solve this ${lesson?.title || 'problem'}?`;
      const helpContext = `The student is working on ${lesson?.title || 'this lesson'} and needs help with: ${currentExample}`;
      
      setAiHelpData({ question: helpQuestion, context: helpContext });
      setShowAiHelpPopup(true);
      setAiResponseReceived(false); // Reset response state for new request
      
      let prompt = '';
      
      if (lesson?.title.includes('Write fractions in lowest terms')) {
        // 6.NS.1.d - Fraction simplification
        const fractionMatch = currentExample.match(/(\d+)\/(\d+)/);
        const fraction = fractionMatch ? `${fractionMatch[1]}/${fractionMatch[2]}` : '6/12';
        
        prompt = `A 6th grade student is working on writing fractions in the lowest terms. They are having trouble determining the lowest term for ${fraction}. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Convert between improper fractions and mixed numbers')) {
        // 6.NS.1.d - Mixed number conversions
        const improperMatch = currentExample.match(/(\d+)\/(\d+)/);
        const mixedMatch = currentExample.match(/(\d+)\s+(\d+)\/(\d+)/);
        
        if (improperMatch) {
          const fraction = `${improperMatch[1]}/${improperMatch[2]}`;
          prompt = `A 6th grade student is working on converting improper fractions to mixed numbers. They need to convert ${fraction} to a mixed number. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
        } else if (mixedMatch) {
          const mixed = `${mixedMatch[1]} ${mixedMatch[2]}/${mixedMatch[3]}`;
          prompt = `A 6th grade student is working on converting mixed numbers to improper fractions. They need to convert ${mixed} to an improper fraction. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
        }
      } else if (lesson?.title.includes('Convert decimals to fractions')) {
        // 6.NS.1.d - Decimal to fraction conversion
        const decimalMatch = currentExample.match(/(\d+\.\d+)/);
        const decimal = decimalMatch ? decimalMatch[1] : '0.6';
        
        prompt = `A 6th grade student is working on converting decimals to fractions. They need to convert ${decimal} to a fraction in lowest terms. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Convert fractions to decimals')) {
        // 6.NS.1.d - Fraction to decimal conversion
        const fractionMatch = currentExample.match(/(\d+)\/(\d+)/);
        const fraction = fractionMatch ? `${fractionMatch[1]}/${fractionMatch[2]}` : '3/5';
        
        prompt = `A 6th grade student is working on converting fractions to decimals. They need to convert ${fraction} to a decimal. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('repeating decimals')) {
        // 6.NS.1.d - Repeating decimals
        const fractionMatch = currentExample.match(/(\d+)\/(\d+)/);
        const fraction = fractionMatch ? `${fractionMatch[1]}/${fractionMatch[2]}` : '1/3';
        
        prompt = `A 6th grade student is working on converting fractions to repeating decimals. They need to convert ${fraction} to a repeating decimal and identify the pattern. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Convert between percents, fractions, and decimals')) {
        // 6.NS.1.d - Triple conversions
        const percentMatch = currentExample.match(/(\d+(?:\.\d+)?)%/);
        const decimalMatch = currentExample.match(/(\d+\.\d+)/);
        const fractionMatch = currentExample.match(/(\d+)\/(\d+)/);
        
        let conversionText = '';
        if (percentMatch && decimalMatch) {
          conversionText = `${percentMatch[0]} and ${decimalMatch[1]}`;
        } else if (percentMatch && fractionMatch) {
          conversionText = `${percentMatch[0]} and ${fractionMatch[1]}/${fractionMatch[2]}`;
        } else if (decimalMatch && fractionMatch) {
          conversionText = `${decimalMatch[1]} and ${fractionMatch[1]}/${fractionMatch[2]}`;
        }
        
        prompt = `A 6th grade student is working on converting between percents, fractions, and decimals. They need to find the equivalent forms for ${conversionText}. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Convert between percents and decimals')) {
        // 6.NS.1.b - Decimal-percent conversion
        const percentMatch = currentExample.match(/(\d+(?:\.\d+)?)%/);
        const decimalMatch = currentExample.match(/(\d+\.\d+)/);
        
        let conversionText = '';
        if (percentMatch && decimalMatch) {
          conversionText = `${percentMatch[0]} and ${decimalMatch[1]}`;
        } else if (percentMatch) {
          conversionText = `${percentMatch[0]} to a decimal`;
        } else if (decimalMatch) {
          conversionText = `${decimalMatch[1]} to a percent`;
        } else {
          conversionText = 'between percents and decimals';
        }
        
        prompt = `A 6th grade student is working on converting between percents and decimals. They need to convert ${conversionText}. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Convert fractions to percents')) {
        // Fraction to percent conversion
        const fractionMatch = currentExample.match(/(\d+)\/(\d+)/);
        const fraction = fractionMatch ? `${fractionMatch[1]}/${fractionMatch[2]}` : '2/5';
        
        prompt = `A 6th grade student is working on converting fractions to percents using grid models. They need to convert ${fraction} to a percent. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Compare percents to each other and to fractions')) {
        // 6.NS.1.e - Compare percents and fractions
        const comparisonMatch = currentExample.match(/^([^:]+):/);
        const comparison = comparisonMatch ? comparisonMatch[1] : '60% vs 2/3';
        
        prompt = `A 6th grade student is working on comparing percents and fractions. They need to compare ${comparison} and determine which is greater. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Compare percents and fractions: word problems')) {
        // 6.NS.1.e - Word problems comparing percents and fractions
        const problemMatch = currentExample.match(/^([^?]+\?)/);
        const problem = problemMatch ? problemMatch[1] : 'Is 20% of a $50 item or 1/4 of a $40 item more?';
        
        prompt = `A 6th grade student is working on word problems that compare percents and fractions. They need to solve: "${problem}" They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Understanding integers') || lesson?.title.includes('Integers on number lines')) {
        // 6.NS.2.a - Integer identification
        const integerMatch = currentExample.match(/(-?\d+)/);
        const integer = integerMatch ? integerMatch[1] : '-3';
        
        prompt = `A 6th grade student is working on understanding integers in real-world contexts. They need to identify the integer from this example: "${currentExample}". They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Graph integers on horizontal and vertical number lines')) {
        // 6.NS.2.a - Graphing integers
        const integerMatch = currentExample.match(/(-?\d+)/);
        const integer = integerMatch ? integerMatch[1] : '-5';
        const directionMatch = currentExample.match(/(horizontal|vertical)/i);
        const direction = directionMatch ? directionMatch[1] : 'horizontal';
        
        prompt = `A 6th grade student is working on graphing integers on number lines. They need to graph ${integer} on a ${direction} number line. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Understanding opposite integers')) {
        // 6.NS.2.a - Opposite integers
        const integerMatch = currentExample.match(/(-?\d+)/);
        const integer = integerMatch ? integerMatch[1] : '4';
        
        prompt = `A 6th grade student is working on understanding opposite integers. They need to find the opposite of ${integer}. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Understanding absolute value') || lesson?.title.includes('Absolute value')) {
        // 6.NS.2.d - Absolute value
        const absoluteMatch = currentExample.match(/\|(-?\d+)\|/);
        const integer = absoluteMatch ? absoluteMatch[1] : '-6';
        
        prompt = `A 6th grade student is working on understanding absolute value. They need to find the absolute value of ${integer} (|${integer}|). They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Compare integers')) {
        // 6.NS.2.b/c - Integer comparison
        const comparisonMatch = currentExample.match(/(-?\d+)\s*([<>=])\s*(-?\d+)/);
        const num1 = comparisonMatch ? comparisonMatch[1] : '-3';
        const num2 = comparisonMatch ? comparisonMatch[3] : '-7';
        
        prompt = `A 6th grade student is working on comparing integers. They need to compare ${num1} and ${num2} using <, >, or =. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Put integers in order')) {
        // 6.NS.2.b - Ordering integers
        const orderMatch = currentExample.match(/(-?\d+(?:,\s*-?\d+)*)/);
        const integers = orderMatch ? orderMatch[1] : '-4, 1, -2, 0';
        
        prompt = `A 6th grade student is working on ordering integers. They need to put these integers in order from least to greatest: ${integers}. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Write multiplication expressions using exponents') || lesson?.title.includes('exponents')) {
        // 6.NS.2.b - Exponent expressions
        const baseMatch = currentExample.match(/(\d+)\s*×\s*(\d+)/g);
        const expanded = baseMatch ? baseMatch.join(' × ') : '2 × 2 × 2';
        
        prompt = `A 6th grade student is working on writing multiplication expressions using exponents. They need to convert the repeated multiplication "${expanded}" into exponential form. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Multiply') && lesson?.title.includes('mixed number') && lesson?.title.includes('whole number')) {
        // 6.NS.3.a - Mixed number multiplication with whole numbers
        const mixedMatch = currentExample.match(/(\d+)\s+(\d+)\/(\d+)/);
        const wholeMatch = currentExample.match(/×\s*(\d+)/);
        const mixed = mixedMatch ? `${mixedMatch[1]} ${mixedMatch[2]}/${mixedMatch[3]}` : '2 1/3';
        const multiplier = wholeMatch ? wholeMatch[1] : '4';
        
        prompt = `A 6th grade student is working on multiplying mixed numbers by whole numbers. They need to multiply ${mixed} × ${multiplier} using area models or distribution. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Multiply') && lesson?.title.includes('fraction') && lesson?.title.includes('model')) {
        // 6.NS.3.b/d - Fraction multiplication with models
        const fractionMatch = currentExample.match(/(\d+)\/(\d+)\s*×\s*(\d+)\/(\d+)/);
        const fractionExpression = fractionMatch ? `${fractionMatch[1]}/${fractionMatch[2]} × ${fractionMatch[3]}/${fractionMatch[4]}` : '2/3 × 3/5';
        
        prompt = `A 6th grade student is working on multiplying fractions using area models. They need to multiply ${fractionExpression} and show their work using visual models. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Divide') && lesson?.title.includes('unit fraction') && lesson?.title.includes('whole number')) {
        // 6.NS.3.c - Division with unit fractions
        const divisionMatch = currentExample.match(/(\d+)\s*÷\s*(\d+)\/(\d+)/);
        const divisionExpression = divisionMatch ? `${divisionMatch[1]} ÷ ${divisionMatch[2]}/${divisionMatch[3]}` : '6 ÷ 1/2';
        
        prompt = `A 6th grade student is working on dividing whole numbers by unit fractions. They need to solve ${divisionExpression} using area models or the "flip and multiply" method. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Write powers of ten with exponents') || lesson?.title.includes('powers of ten')) {
        // 6.NS.2.b - Powers of ten with exponents
        const valueMatch = currentExample.match(/(\d+(?:,\d+)*)/);
        const value = valueMatch ? valueMatch[1] : '1,000';
        
        prompt = `A 6th grade student is working on writing powers of ten using exponents. They need to convert ${value} to exponential form (like 10^3). They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Recognize perfect squares') || lesson?.title.includes('perfect squares')) {
        // 6.NS.2.c - Perfect squares
        const squareMatch = currentExample.match(/(\d+)\^2/);
        const base = squareMatch ? squareMatch[1] : '4';
        
        prompt = `A 6th grade student is working on recognizing perfect squares. They need to calculate ${base}^2 and understand what makes it a perfect square. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Square numbers') || lesson?.title.includes('square')) {
        // 6.NS.2.d - Square numbers
        const numberMatch = currentExample.match(/(\d+)/);
        const number = numberMatch ? numberMatch[1] : '5';
        
        prompt = `A 6th grade student is working on squaring numbers. They need to find the square of ${number} (${number}^2). They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Multiply mixed numbers') || lesson?.title.includes('Multiply fractions and whole numbers') || lesson?.title.includes('Estimate products')) {
        // 6.NS.3.b - Fraction multiplication
        const problemMatch = currentExample.match(/([^=]+)/);
        const problem = problemMatch ? problemMatch[1].trim() : '2 1/3 × 1/4';
        
        prompt = `A 6th grade student is working on multiplying fractions and mixed numbers. They need to solve ${problem} using area models or the standard algorithm. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Scaling') || lesson?.title.includes('justify your answer')) {
        // 6.NS.3.d - Scaling problems
        const problemMatch = currentExample.match(/([^=]+)/);
        const problem = problemMatch ? problemMatch[1].trim() : 'What happens when you multiply by 3/4?';
        
        prompt = `A 6th grade student is working on scaling problems with fractions. They need to understand and justify their answer for: ${problem}. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Convert between improper fractions and mixed numbers')) {
        // 6.NS.1.d - Mixed number conversion
        const fractionMatch = currentExample.match(/(\d+)\/(\d+)/);
        const mixedMatch = currentExample.match(/(\d+) (\d+)\/(\d+)/);
        
        let conversionText = '';
        if (fractionMatch && mixedMatch) {
          conversionText = `${fractionMatch[1]}/${fractionMatch[2]} to ${mixedMatch[1]} ${mixedMatch[2]}/${mixedMatch[3]}`;
        } else if (fractionMatch) {
          conversionText = `${fractionMatch[1]}/${fractionMatch[2]} to a mixed number`;
        } else if (mixedMatch) {
          conversionText = `${mixedMatch[1]} ${mixedMatch[2]}/${mixedMatch[3]} to an improper fraction`;
        } else {
          conversionText = 'between improper fractions and mixed numbers';
        }
        
        prompt = `A 6th grade student is working on converting between improper fractions and mixed numbers using visual grouping models. They need to convert ${conversionText} using grouping strategies. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else {
        // 6.NS.1.a - Percentage identification from shaded models
        const shadedMatch = currentExample.match(/(\d+)\s+shaded/);
        const shadedCount = shadedMatch ? parseInt(shadedMatch[1]) : 80;
        
        prompt = `A 6th grade student is working on identifying percentages from shaded models. They need to find what percentage is represented when ${shadedCount} out of 100 parts are shaded. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          sender: 'user',
          sessionId: sessionId || `lesson-help-${lessonId}-${Date.now()}`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Set response received state to true
        setAiResponseReceived(true);
        
        // Pass the AI response to the parent component
        if (onAiResponse) {
          // Extract the aiResponse from the data structure and format it properly
          const aiResponseData = {
            question: data.userMessage?.message || prompt,
            response: data.aiMessage?.message || data.aiResponse?.response || '',
            explanation: data.aiResponse?.explanation || '',
            examples: data.aiResponse?.examples || []
          };
          console.log('AI response data:', aiResponseData);
          onAiResponse(aiResponseData);
        }
        
        // Don't close popup immediately - let AiHelpPopup component handle closing when response is ready
        // setShowAiHelpPopup(false);
        // setAiHelpData(null);
        console.log('AI help requested successfully');
      }
    } catch (error) {
      console.error('Error requesting AI help:', error);
    }
  };

  // REMOVED: isUsingUniversalSystem - now using pure universal analysis via analyzeLessonType

  const renderInteractiveContent = (lesson: Lesson) => {
    const explanation = lesson.explanation || '';
    const currentIndex = currentExampleIndex[lesson.id] || 0;
    const examples = lesson.examples || [];
    
    // If we've completed all examples, stay on the last example
    const safeIndex = Math.min(currentIndex, examples.length - 1);
    const currentExample = examples[safeIndex];
    
    if (!currentExample) return null;
    
    // Dynamic lesson analysis with caching
    const cacheKey = `${lesson.id}-${lesson.title}`;
    let lessonAnalysis = lessonAnalysisCache[cacheKey];
    
    // Only log for first lesson to reduce noise
    if (lesson.id === 3549) {
      console.log('🔍 LESSON PANEL: Processing lesson:', lesson.title, 'ID:', lesson.id);
      console.log('🔍 LESSON PANEL: Explanation:', explanation);
      console.log('🔍 LESSON PANEL: Cache key:', cacheKey);
    }
    
    if (!lessonAnalysis) {
      if (lesson.id === 3549) {
        console.log('🔍 LESSON PANEL: Calling analyzeLessonType');
      }
      lessonAnalysis = analyzeLessonType(explanation, lesson.title, selectedStandard, standardDescription);
      if (lesson.id === 3549) {
        console.log('🔍 LESSON PANEL: lessonAnalysis result:', lessonAnalysis);
      }
      setLessonAnalysisCache({...lessonAnalysisCache, [cacheKey]: lessonAnalysis});
    }
    // Cached lesson analysis complete
    
    // UNIVERSAL SYSTEM - Process lessons directly without InteractivePracticeRenderer
    console.log('🔍 DEBUG STEP 1: Lesson analysis for', lesson.title, ':', lessonAnalysis);
    console.log('🔍 DEBUG STEP 1: requiresInteraction =', lessonAnalysis.requiresInteraction);
    console.log('🔍 DEBUG STEP 1: Will enter universal system?', lessonAnalysis.requiresInteraction);
    
    // PHASE 1 DEBUG: Track 6.NS.1.d lesson processing paths
    if (lesson.title.includes('6.NS.1.d')) {
      console.log('🔍 PHASE 1 DEBUG: 6.NS.1.d lesson detected:', lesson.title);
      console.log('🔍 PHASE 1 DEBUG: lessonAnalysis.requiresInteraction =', lessonAnalysis.requiresInteraction);
      console.log('🔍 PHASE 1 DEBUG: Will use universal system?', lessonAnalysis.requiresInteraction);
    }
    
    if (lessonAnalysis.requiresInteraction) {
      console.log('✅ DEBUG STEP 1: ENTERING UNIVERSAL SYSTEM for lesson:', lesson.title);
      
      const isCompleted = currentIndex >= examples.length;
      
      // Check if this lesson has been completed (user has gone through all examples)
      const hasCompletedAllExamples = currentIndex >= examples.length;
      
      // Process the lesson content using the universal system
      const processedContent = processLessonContent(currentExample, explanation, lessonAnalysis);
      
      if (!processedContent) {
        console.log('❌ LESSON PANEL: No processed content returned');
        return null;
      }
      
      console.log('🔍 LESSON PANEL: Using universal system with processedContent:', processedContent);
      
      return (
        <div>
          {hasCompletedAllExamples && (
            <div className={universalCompletionStyles.container}>
              <h3 className={universalCompletionStyles.heading}>🎉 Lesson Completed!</h3>
              <p className={universalCompletionStyles.text}>
                You've successfully completed all {examples.length} examples for this lesson. 
                The interactive element remains available for review.
              </p>
            </div>
          )}
          
          {/* Render component directly based on type */}
          {processedContent.componentType === 'grid' && (
            <GridComponent
              key={`grid-${lesson.id}-${safeIndex}`}
              gridSize={processedContent.gridSize!}
              columns={processedContent.columns!}
              preShadedCells={processedContent.preShadedCells!}
              mode={processedContent.gridMode!}
              correctAnswer={processedContent.correctAnswer as number}
              promptText={processedContent.interactiveText}
              onAnswer={(answer) => {
                const correctAnswer = processedContent.correctAnswer;
                
                // Handle close approximations for non-whole percentages
                const userAnswer = parseFloat(answer.toString());
                const expectedAnswer = parseFloat(correctAnswer.toString());
                
                // Check if the correct answer is a non-whole number (has decimal places)
                const isNonWholePercentage = expectedAnswer % 1 !== 0;
                
                let isCorrect;
                if (isNonWholePercentage) {
                  // For non-whole percentages, accept answers within 1% tolerance
                  const tolerance = 1.0;
                  const difference = Math.abs(userAnswer - expectedAnswer);
                  isCorrect = difference <= tolerance;
                  
                  console.log(`📊 Non-whole percentage check: User: ${userAnswer}%, Expected: ${expectedAnswer}%, Difference: ${difference}%, Tolerance: ${tolerance}%, Correct: ${isCorrect}`);
                } else {
                  // For whole percentages, use exact matching
                  isCorrect = userAnswer === expectedAnswer;
                }
                
                // UNIVERSAL SYSTEM: Use new universal answer handler
                const inputKey = `lesson-${lesson.id}`;
                const currentAttempts = attemptCounts[inputKey] || 0;
                const correctCount = correctAnswerCount[inputKey] || 0;
                
                handleUniversalAnswer({
                  lessonId: lesson.id,
                  isCorrect,
                  currentAttempts,
                  correctCount,
                  onSuccess: (animationType) => {
                    // Show success feedback
                    setShowFeedback(prev => ({...prev, [inputKey]: 'correct'}));
                    
                    // Trigger animation
                    setAnimationType(prev => ({...prev, [inputKey]: animationType}));
                    setShowAnimation(prev => ({...prev, [inputKey]: true}));
                    setCorrectAnswerCount(prev => ({...prev, [inputKey]: correctCount + 1}));
                  },
                  onError: (attemptMessage) => {
                    // Show error feedback with attempt counter
                    setShowFeedback(prev => ({...prev, [inputKey]: attemptMessage}));
                    setAttemptCounts(prev => ({...prev, [inputKey]: currentAttempts + 1}));
                  },
                  onAIHelp: (question, context) => {
                    // Trigger AI help popup
                    setAiHelpData({ question, context });
                    setShowAiHelpPopup(true);
                    requestAiHelp(lesson.id, correctAnswer);
                  },
                  onAdvanceExample: () => {
                    // Advance to next example
                    const nextIndex = currentIndex + 1;
                    setCurrentExampleIndex(prev => ({...prev, [lesson.id]: nextIndex}));
                    
                    // Check if all examples are completed
                    if (nextIndex >= examples.length) {
                      // Set completion state for tab checkmarks
                      setShowFeedback(prev => ({...prev, [inputKey]: 'completed'}));
                      console.log('✅ DEBUG STEP 2: Set completion state for lesson:', lesson.id, 'to completed');
                    } else {
                      // Clear feedback for next example
                      setShowFeedback(prev => {
                        const newState = { ...prev };
                        delete newState[inputKey];
                        return newState;
                      });
                    }
                    
                    setShowAnimation(prev => {
                      const newState = { ...prev };
                      delete newState[inputKey];
                      return newState;
                    });
                  },
                  onResetLesson: () => {
                    // Reset lesson state after AI help
                    setShowFeedback(prev => {
                      const newState = { ...prev };
                      delete newState[inputKey];
                      return newState;
                    });
                    setAttemptCounts(prev => {
                      const newState = { ...prev };
                      delete newState[inputKey];
                      return newState;
                    });
                    setResetTrigger(prev => prev + 1);
                  }
                });
              }}
              resetTrigger={resetTrigger}
              standardCode={selectedStandard}
              lessonTitle={lesson.title}
            />
          )}
          
          {processedContent.componentType === 'decimal-percent' && (
            <DecimalPercentConversion
              key={`decimal-percent-${lesson.id}-${safeIndex}`}
              type={processedContent.conversionType!}
              value={processedContent.value!}
              description={processedContent.interactiveText}
              onAnswer={(answer) => {
                const correctAnswer = processedContent.correctAnswer;
                const isCorrect = answer.toString() === correctAnswer.toString();
                
                // UNIVERSAL SYSTEM: Use new universal answer handler
                const inputKey = `lesson-${lesson.id}`;
                const currentAttempts = attemptCounts[inputKey] || 0;
                const correctCount = correctAnswerCount[inputKey] || 0;
                
                handleUniversalAnswer({
                  lessonId: lesson.id,
                  isCorrect,
                  currentAttempts,
                  correctCount,
                  onSuccess: (animationType) => {
                    setShowFeedback(prev => ({...prev, [inputKey]: 'correct'}));
                    setAnimationType(prev => ({...prev, [inputKey]: animationType}));
                    setShowAnimation(prev => ({...prev, [inputKey]: true}));
                    setCorrectAnswerCount(prev => ({...prev, [inputKey]: correctCount + 1}));
                  },
                  onError: (attemptMessage) => {
                    setShowFeedback(prev => ({...prev, [inputKey]: attemptMessage}));
                    setAttemptCounts(prev => ({...prev, [inputKey]: currentAttempts + 1}));
                  },
                  onAIHelp: (question, context) => {
                    setAiHelpData({ question, context });
                    setShowAiHelpPopup(true);
                    requestAiHelp(lesson.id, correctAnswer);
                  },
                  onAdvanceExample: () => {
                    // Advance to next example
                    const nextIndex = currentIndex + 1;
                    setCurrentExampleIndex(prev => ({...prev, [lesson.id]: nextIndex}));
                    
                    // Check if all examples are completed
                    if (nextIndex >= examples.length) {
                      // Set completion state for tab checkmarks
                      setShowFeedback(prev => ({...prev, [inputKey]: 'completed'}));
                      console.log('✅ DEBUG STEP 2: Set completion state for lesson:', lesson.id, 'to completed');
                    } else {
                      // Clear feedback for next example
                      setShowFeedback(prev => {
                        const newState = { ...prev };
                        delete newState[inputKey];
                        return newState;
                      });
                    }
                    
                    setShowAnimation(prev => {
                      const newState = { ...prev };
                      delete newState[inputKey];
                      return newState;
                    });
                  },
                  onResetLesson: () => {
                    setShowFeedback(prev => {
                      const newState = { ...prev };
                      delete newState[inputKey];
                      return newState;
                    });
                    setAttemptCounts(prev => {
                      const newState = { ...prev };
                      delete newState[inputKey];
                      return newState;
                    });
                    setResetTrigger(prev => prev + 1);
                  }
                });
              }}
              onRequestHelp={(question, context) => {
                setAiHelpData({ question, context });
                setShowAiHelpPopup(true);
                requestAiHelp(lesson.id, processedContent.correctAnswer);
              }}
            />
          )}
          
          {processedContent.componentType === 'number-line' && (
            <NumberLineComponent
              key={`number-line-${lesson.id}-${safeIndex}`}
              range={processedContent.range!}
              mode={processedContent.mode!}
              targetValue={processedContent.targetValue}
              markedValue={processedContent.markedValue}
              correctAnswer={processedContent.correctAnswer as number}
              onAnswer={(answer) => {
                const correctAnswer = processedContent.correctAnswer;
                const isCorrect = answer.toString() === correctAnswer.toString();
                
                // Bridge to existing lesson panel state management
                if (isCorrect) {
                  // Update correct answer count and trigger animation
                  const currentCount = correctAnswerCount[`lesson-${lesson.id}`] || 0;
                  const newCount = currentCount + 1;
                  setCorrectAnswerCount(prev => ({...prev, [`lesson-${lesson.id}`]: newCount}));
                  
                  // Determine animation type based on correct answer count
                  let newAnimationType: AnimationType;
                  if (newCount === 1) {
                    newAnimationType = 'smiley';
                  } else if (newCount === 2) {
                    newAnimationType = 'star';
                  } else {
                    newAnimationType = 'fireworks';
                  }
                  
                  // Start animation
                  setAnimationType(prev => ({...prev, [`lesson-${lesson.id}`]: newAnimationType}));
                  setShowAnimation(prev => ({...prev, [`lesson-${lesson.id}`]: true}));
                  
                  // Reset attempt count for this lesson
                  setAttemptCounts(prev => ({...prev, [`lesson-${lesson.id}`]: 0}));
                  
                  // Move to next example after 1 second
                  setTimeout(() => {
                    const currentIndex = currentExampleIndex[lesson.id] || 0;
                    const maxExamples = lesson.examples?.length || 3;
                    
                    if (currentIndex < maxExamples - 1) {
                      setCurrentExampleIndex(prev => ({...prev, [lesson.id]: currentIndex + 1}));
                      setInputValues(prev => ({...prev, [lesson.id]: ''}));
                      setShowFeedback(prev => ({...prev, [`lesson-${lesson.id}`]: ''}));
                    } else {
                      setShowFeedback(prev => ({...prev, [`lesson-${lesson.id}`]: 'completed'}));
                    }
                  }, 1000);
                } else {
                  // Increment attempt count
                  const currentAttempts = attemptCounts[`lesson-${lesson.id}`] || 0;
                  const newAttempts = currentAttempts + 1;
                  setAttemptCounts(prev => ({...prev, [`lesson-${lesson.id}`]: newAttempts}));
                  
                  if (newAttempts >= 3) {
                    // Trigger AI help popup on third attempt
                    const question = `How do I solve this problem?`;
                    const context = `The student is working on ${lesson.title}. They need help after 3 unsuccessful attempts.`;
                    
                    setAiHelpData({ question, context });
                    setShowAiHelpPopup(true);
                    requestAiHelp(lesson.id, processedContent.correctAnswer);
                    
                    // Clear lesson state after AI help is triggered
                    setTimeout(() => {
                      setShowFeedback(prev => {
                        const newState = { ...prev };
                        delete newState[`lesson-${lesson.id}`];
                        return newState;
                      });
                      
                      setInputValues(prev => {
                        const newState = { ...prev };
                        delete newState[lesson.id];
                        return newState;
                      });
                      
                      setAttemptCounts(prev => {
                        const newState = { ...prev };
                        delete newState[`lesson-${lesson.id}`];
                        return newState;
                      });
                      
                      setResetTrigger(prev => prev + 1);
                    }, 1000);
                  } else {
                    // Show detailed incorrect feedback with attempt counter
                    const feedbackMessage = `Not quite. Try again! (Attempt ${newAttempts} of 3)`;
                    setShowFeedback(prev => ({...prev, [`lesson-${lesson.id}`]: feedbackMessage}));
                  }
                }
              }}
              standardCode={selectedStandard}
              lessonTitle={lesson.title}
            />
          )}
          
          {processedContent.componentType === 'strip' && (
            <StripComponent
              key={`strip-${lesson.id}-${safeIndex}`}
              segments={processedContent.additionalData?.segments || 20}
              shadedSegments={processedContent.additionalData?.shadedSegments || 0}
              correctAnswer={processedContent.correctAnswer as number}
              onAnswer={(answer) => {
                const correctAnswer = processedContent.correctAnswer;
                const isCorrect = answer.toString() === correctAnswer.toString();
                
                // UNIVERSAL SYSTEM: Use new universal answer handler
                const inputKey = `lesson-${lesson.id}`;
                const currentAttempts = attemptCounts[inputKey] || 0;
                const correctCount = correctAnswerCount[inputKey] || 0;
                
                handleUniversalAnswer({
                  lessonId: lesson.id,
                  isCorrect,
                  currentAttempts,
                  correctCount,
                  inputKey,
                  correctAnswer
                });
              }}
              standardCode={selectedStandard}
              lessonTitle={lesson.title}
            />
          )}
          
          {processedContent.componentType === 'text-input' && (
            <TextInputComponent
              key={`text-input-${lesson.id}-${safeIndex}`}
              correctAnswer={processedContent.correctAnswer as string}
              promptText={processedContent.interactiveText}
              onAnswer={(answer) => {
                const correctAnswer = processedContent.correctAnswer;
                const isCorrect = answer.toString() === correctAnswer.toString();
                
                // UNIVERSAL SYSTEM: Use new universal answer handler
                const inputKey = `lesson-${lesson.id}`;
                const currentAttempts = attemptCounts[inputKey] || 0;
                const correctCount = correctAnswerCount[inputKey] || 0;
                
                handleUniversalAnswer({
                  lessonId: lesson.id,
                  isCorrect,
                  currentAttempts,
                  correctCount,
                  inputKey,
                  correctAnswer
                });
              }}
              standardCode={selectedStandard}
              lessonTitle={lesson.title}
            />
          )}
          
          {processedContent.componentType === 'fraction-visual-input' && (
            <FractionVisualInputComponent
              key={`fraction-visual-input-${lesson.id}-${safeIndex}`}
              originalFraction={processedContent.additionalData?.originalFraction || "6/12"}
              correctAnswer={processedContent.correctAnswer as string}
              promptText={processedContent.interactiveText}
              onAnswer={(answer) => {
                const correctAnswer = processedContent.correctAnswer;
                const isCorrect = answer.toString() === correctAnswer.toString();
                
                // UNIVERSAL SYSTEM: Use new universal answer handler
                const inputKey = `lesson-${lesson.id}`;
                const currentAttempts = attemptCounts[inputKey] || 0;
                const correctCount = correctAnswerCount[inputKey] || 0;
                
                handleUniversalAnswer({
                  lessonId: lesson.id,
                  isCorrect,
                  currentAttempts,
                  correctCount,
                  onSuccess: (animationType) => {
                    // Show success feedback
                    setShowFeedback(prev => ({...prev, [inputKey]: 'correct'}));
                    
                    // Trigger animation
                    setAnimationType(prev => ({...prev, [inputKey]: animationType}));
                    setShowAnimation(prev => ({...prev, [inputKey]: true}));
                    setCorrectAnswerCount(prev => ({...prev, [inputKey]: correctCount + 1}));
                  },
                  onError: (attemptMessage) => {
                    // Show error feedback with attempt counter
                    setShowFeedback(prev => ({...prev, [inputKey]: attemptMessage}));
                    setAttemptCounts(prev => ({...prev, [inputKey]: currentAttempts + 1}));
                  },
                  onAIHelp: (question, context) => {
                    // Trigger AI help popup
                    setAiHelpData({ question, context });
                    setShowAiHelpPopup(true);
                    requestAiHelp(lesson.id, correctAnswer);
                  },
                  onAdvanceExample: () => {
                    // Advance to next example
                    const nextIndex = currentIndex + 1;
                    setCurrentExampleIndex(prev => ({...prev, [lesson.id]: nextIndex}));
                    
                    // Check if all examples are completed
                    if (nextIndex >= examples.length) {
                      // Set completion state for tab checkmarks
                      setShowFeedback(prev => ({...prev, [inputKey]: 'completed'}));
                      console.log('✅ DEBUG STEP 2: Set completion state for lesson:', lesson.id, 'to completed');
                    } else {
                      // Clear feedback for next example
                      setShowFeedback(prev => {
                        const newState = { ...prev };
                        delete newState[inputKey];
                        return newState;
                      });
                      setAttemptCounts(prev => ({...prev, [inputKey]: 0}));
                    }
                  },
                  onResetLesson: () => {
                    // Reset lesson state after AI help
                    setShowFeedback(prev => {
                      const newState = { ...prev };
                      delete newState[inputKey];
                      return newState;
                    });
                    setAttemptCounts(prev => ({...prev, [inputKey]: 0}));
                    setShowAiHelpPopup(false);
                  }
                });
              }}
              standardCode={selectedStandard}
              lessonTitle={lesson.title}
            />
          )}

          {processedContent.componentType === 'mixed-number-visual' && (
            <MixedNumberVisualComponent
              key={`mixed-number-visual-${lesson.id}-${safeIndex}`}
              originalFraction={processedContent.additionalData?.originalFraction || "11/4"}
              correctAnswer={processedContent.correctAnswer as string}
              promptText={processedContent.interactiveText}
              onAnswer={(answer) => {
                const correctAnswer = processedContent.correctAnswer;
                const isCorrect = answer.toString() === correctAnswer.toString();
                
                // UNIVERSAL SYSTEM: Use new universal answer handler
                const inputKey = `lesson-${lesson.id}`;
                const currentAttempts = attemptCounts[inputKey] || 0;
                const correctCount = correctAnswerCount[inputKey] || 0;
                
                handleUniversalAnswer({
                  lessonId: lesson.id,
                  isCorrect,
                  currentAttempts,
                  correctCount,
                  onSuccess: (animationType) => {
                    // Show success feedback
                    setShowFeedback(prev => ({...prev, [inputKey]: 'correct'}));
                    
                    // Trigger animation
                    setAnimationType(prev => ({...prev, [inputKey]: animationType}));
                    setShowAnimation(prev => ({...prev, [inputKey]: true}));
                    setCorrectAnswerCount(prev => ({...prev, [inputKey]: correctCount + 1}));
                  },
                  onError: (attemptMessage) => {
                    // Show error feedback with attempt counter
                    setShowFeedback(prev => ({...prev, [inputKey]: attemptMessage}));
                    setAttemptCounts(prev => ({...prev, [inputKey]: currentAttempts + 1}));
                  },
                  onAIHelp: (question, context) => {
                    // Trigger AI help popup
                    setAiHelpData({ question, context });
                    setShowAiHelpPopup(true);
                    requestAiHelp(lesson.id, correctAnswer);
                  },
                  onAdvanceExample: () => {
                    // Advance to next example
                    const nextIndex = currentIndex + 1;
                    setCurrentExampleIndex(prev => ({...prev, [lesson.id]: nextIndex}));
                    
                    // Check if all examples are completed
                    if (nextIndex >= examples.length) {
                      // Set completion state for tab checkmarks
                      setShowFeedback(prev => ({...prev, [inputKey]: 'completed'}));
                      console.log('✅ DEBUG STEP 2: Set completion state for lesson:', lesson.id, 'to completed');
                    } else {
                      // Clear feedback for next example
                      setShowFeedback(prev => {
                        const newState = { ...prev };
                        delete newState[inputKey];
                        return newState;
                      });
                      setAttemptCounts(prev => ({...prev, [inputKey]: 0}));
                    }
                  },
                  onResetLesson: () => {
                    // Reset lesson state after AI help
                    setShowFeedback(prev => {
                      const newState = { ...prev };
                      delete newState[inputKey];
                      return newState;
                    });
                    setAttemptCounts(prev => ({...prev, [inputKey]: 0}));
                    setShowAiHelpPopup(false);
                  }
                });
              }}
              standardCode={selectedStandard}
              lessonTitle={lesson.title}
            />
          )}

          {/* Progress indicator */}
          <div className="text-center mt-4">
            <span className="text-sm text-orange-400">
              {currentIndex + 1}/{examples.length}
            </span>
          </div>
        </div>
      );
    }
    
    // Fall back to default display for non-interactive lessons
    console.log('❌ DEBUG STEP 1: LESSON DID NOT ENTER UNIVERSAL SYSTEM:', lesson.title);
    console.log('❌ DEBUG STEP 1: Falling back to legacy code paths - this should not happen for converted lessons');
    console.log('🔍 LESSON PANEL: Checking lesson title:', lesson.title);
    console.log('🔍 LESSON PANEL: Includes "Integers on number lines"?', lesson.title.includes('Integers on number lines'));
    console.log('🔍 LESSON PANEL: Includes "Understanding integers"?', lesson.title.includes('Understanding integers'));
    
    if (lesson.title.includes('Integers on number lines') || lesson.title.includes('Understanding integers')) {
      console.log('🔍 LESSON PANEL: About to call InteractivePracticeRenderer for lesson:', lesson.title);
      // 6.NS.2.a - Use dynamic processing for understanding integers
      return (
        <InteractivePracticeRenderer
          lesson={lesson}
          currentExample={currentExample}
          onAnswerSubmitted={(answer) => {
            const correctAnswer = processedContent.correctAnswer;
            const isCorrect = answer === correctAnswer;
            
            if (isCorrect) {
              handleCorrectAnswer(lesson.id);
            } else {
              handleIncorrectAnswer(lesson.id);
            }
          }}
        />
      );
    } else if (lesson.title.includes('Graph integers on horizontal and vertical number lines')) {
      // 6.NS.2.a - Use dynamic processing for graphing integers
      return (
        <InteractivePracticeRenderer
          lesson={lesson}
          currentExample={currentExample}
          onAnswerSubmitted={(answer) => {
            const correctAnswer = processedContent.correctAnswer;
            const isCorrect = answer === correctAnswer;
            
            if (isCorrect) {
              handleCorrectAnswer(lesson.id);
            } else {
              handleIncorrectAnswer(lesson.id);
            }
          }}
        />
      );
    } else if (lesson.title.includes('Understanding opposite integers')) {
      // 6.NS.2.a - Use dynamic processing for opposite integers
      return (
        <InteractivePracticeRenderer
          lesson={lesson}
          currentExample={currentExample}
          onAnswerSubmitted={(answer) => {
            const correctAnswer = processedContent.correctAnswer;
            const isCorrect = answer === correctAnswer;
            
            if (isCorrect) {
              handleCorrectAnswer(lesson.id);
            } else {
              handleIncorrectAnswer(lesson.id);
            }
          }}
        />
      );



    // 🔍 PHASE 2 DEBUG: Removed hardcoded conditional logic - now flows through universal system

    } else if (explanation.includes('strip')) {
      // Extract percentage from example for strip visualization
      const match = currentExample.match(/(\d+)%/);
      const percentage = match ? parseInt(match[1]) : 20;
      const shadedParts = Math.round(percentage / 20); // Convert to 5-part strip
      
      return (
        <div className="text-center mb-4">
          <p className="text-green-100 mb-2">Look at this strip</p>
          <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
            <div className="flex w-96 h-16 border-2 border-gray-400">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 border-r-2 border-gray-300 ${
                    i < shadedParts ? 'bg-blue-600' : 'bg-white'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-green-100 text-sm mt-2">{shadedParts} out of 5 parts shaded ({percentage}%)</p>
        </div>
      );
    } else if (lesson.title.includes('Write fractions in lowest terms') || lesson.title.includes('simplify')) {
      // 6.NS.1.d - Fraction simplification
      console.log('🔍 PHASE 1 DEBUG: Entering 6.NS.1.d hardcoded simplification path for:', lesson.title);
      console.log('🔍 PHASE 1 DEBUG: This should be using universal system instead of hardcoded visual logic');
      const fractionMatch = currentExample.match(/(\d+)\/(\d+)/);
      const simplifiedMatch = currentExample.match(/simplified to (\d+)\/(\d+)/);
      
      if (fractionMatch && simplifiedMatch) {
        const original = `${fractionMatch[1]}/${fractionMatch[2]}`;
        const simplified = `${simplifiedMatch[1]}/${simplifiedMatch[2]}`;
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Simplify this fraction to lowest terms</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-3xl font-bold text-gray-800">{original}</div>
                  <div className="text-lg text-gray-600">↓</div>
                  <div className="text-2xl text-blue-600 font-semibold">= ?</div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Find the simplified form</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Convert between improper fractions and mixed numbers')) {
      // 6.NS.1.d - Mixed number conversions
      console.log('🔍 PHASE 1 DEBUG: Entering 6.NS.1.d hardcoded mixed number path for:', lesson.title);
      console.log('🔍 PHASE 1 DEBUG: This should be using universal system instead of hardcoded visual logic');
      const improperMatch = currentExample.match(/(\d+)\/(\d+)/);
      const mixedMatch = currentExample.match(/(\d+)\s+(\d+)\/(\d+)/);
      
      if (improperMatch || mixedMatch) {
        const fromValue = improperMatch ? `${improperMatch[1]}/${improperMatch[2]}` : 
                         mixedMatch ? `${mixedMatch[1]} ${mixedMatch[2]}/${mixedMatch[3]}` : '';
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Convert between improper fraction and mixed number</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">{fromValue}</div>
                  <div className="text-lg text-gray-600">⟷</div>
                  <div className="text-2xl text-blue-600 font-semibold">= ?</div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Convert to the other form</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Convert decimals to fractions') || lesson.title.includes('Convert fractions to decimals')) {
      // 6.NS.1.d - Decimal/fraction conversions
      console.log('🔍 PHASE 1 DEBUG: Entering 6.NS.1.d hardcoded decimal-fraction path for:', lesson.title);
      console.log('🔍 PHASE 1 DEBUG: This should be using universal system instead of hardcoded visual logic');
      const decimalMatch = currentExample.match(/(\d+\.\d+)/);
      const fractionMatch = currentExample.match(/(\d+)\/(\d+)/);
      
      if (decimalMatch || fractionMatch) {
        const fromValue = decimalMatch ? decimalMatch[1] : 
                         fractionMatch ? `${fractionMatch[1]}/${fractionMatch[2]}` : '';
        const conversionType = decimalMatch ? 'to a fraction' : 'to a decimal';
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Convert {conversionType}</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">{fromValue}</div>
                  <div className="text-lg text-gray-600">⟷</div>
                  <div className="text-2xl text-blue-600 font-semibold">= ?</div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Enter the equivalent value</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Convert between percents, fractions, and decimals')) {
      // 6.NS.1.d - Triple conversions
      const percentMatch = currentExample.match(/(\d+(?:\.\d+)?)%/);
      const decimalMatch = currentExample.match(/(\d+\.\d+)/);
      const fractionMatch = currentExample.match(/(\d+)\/(\d+)/);
      
      const values = [];
      if (percentMatch) values.push(`${percentMatch[1]}%`);
      if (decimalMatch) values.push(decimalMatch[1]);
      if (fractionMatch) values.push(`${fractionMatch[1]}/${fractionMatch[2]}`);
      
      if (values.length >= 2) {
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Convert between percent, fraction, and decimal</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-3">
                  <div className="flex justify-around items-center">
                    <div className="text-lg font-semibold text-gray-800">{values[0]}</div>
                    <div className="text-lg text-gray-600">=</div>
                    <div className="text-lg font-semibold text-gray-800">{values[1]}</div>
                    <div className="text-lg text-gray-600">=</div>
                    <div className="text-lg text-blue-600 font-semibold">?</div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Find the missing equivalent form</p>
          </div>
        );
      }
    } else if (lesson.title.includes('repeating decimals')) {
      // 6.NS.1.d - Repeating decimals
      const fractionMatch = currentExample.match(/(\d+)\/(\d+)/);
      const decimalMatch = currentExample.match(/(\d+\.\d+\.\.\.)/);
      
      if (fractionMatch && decimalMatch) {
        const fraction = `${fractionMatch[1]}/${fractionMatch[2]}`;
        const repeatingDecimal = decimalMatch[1];
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Convert between fraction and repeating decimal</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">{fraction}</div>
                  <div className="text-lg text-gray-600">⟷</div>
                  <div className="text-2xl text-blue-600 font-semibold">{repeatingDecimal}</div>
                  <div className="text-sm text-gray-600">Notice the repeating pattern</div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Identify the repeating decimal pattern</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Equivalent fractions')) {
      // 6.NS.1.d - Equivalent fractions
      const fractionMatch = currentExample.match(/(\d+)\/(\d+)/);
      const equivalentMatch = currentExample.match(/(\d+)\/(\d+).*=.*(\d+)\/(\d+)/);
      
      if (equivalentMatch) {
        const original = `${equivalentMatch[1]}/${equivalentMatch[2]}`;
        const equivalent = `${equivalentMatch[3]}/${equivalentMatch[4]}`;
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Find equivalent fractions</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">{original}</div>
                  <div className="text-lg text-gray-600">=</div>
                  <div className="text-2xl text-blue-600 font-semibold">{equivalent}</div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">These fractions are equivalent</p>
          </div>
        );
      }
    } else if (lesson.title.includes('mixed numbers')) {
      // 6.NS.1.d - Mixed number decimals
      const mixedMatch = currentExample.match(/(\d+)\s+(\d+)\/(\d+)/);
      const decimalMatch = currentExample.match(/(\d+\.\d+)/);
      
      if (mixedMatch && decimalMatch) {
        const mixed = `${mixedMatch[1]} ${mixedMatch[2]}/${mixedMatch[3]}`;
        const decimal = decimalMatch[1];
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Convert between mixed number and decimal</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">{mixed}</div>
                  <div className="text-lg text-gray-600">⟷</div>
                  <div className="text-2xl text-blue-600 font-semibold">{decimal}</div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Convert between these forms</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Compare percents') || lesson.title.includes('Put a mix of') || lesson.title.includes('order')) {
      // 6.NS.1.e - Use InteractivePracticeRenderer for comparison and ordering activities
      console.log('🔍 PHASE 1 DEBUG: Entering 6.NS.1.e hardcoded path for:', lesson.title);
      return (
        <InteractivePracticeRenderer
          subLesson={lesson}
          subLessonIndex={currentIndex}
          onRequestHelp={(question, context) => {
            // Show popup first, then make AI request
            setAiHelpData({ question, context });
            setShowAiHelpPopup(true);
            
            // Use the existing AI help request logic
            requestAiHelp(lesson.id, processedContent.correctAnswer);
          }}
          onActivityComplete={(index) => {
            const inputKey = `lesson-${lesson.id}`;
            
            // Check if this is the last example in the lesson
            if (currentIndex >= examples.length - 1) {
              // Mark lesson as completed only when all examples are done
              setShowFeedback({...showFeedback, [inputKey]: 'completed'});
            } else {
              // Mark as correct and move to next example
              setShowFeedback({...showFeedback, [inputKey]: 'correct'});
              setCurrentExampleIndex({...currentExampleIndex, [lesson.id]: currentIndex + 1});
            }
          }}
        />
      );


    } else if (lesson.title.includes('Understanding absolute value') || lesson.title.includes('Absolute value')) {
      // 6.NS.2.d - Absolute value
      const absoluteMatch = currentExample.match(/\|(-?\d+)\|/);
      
      if (absoluteMatch) {
        const integer = parseInt(absoluteMatch[1]);
        const absoluteValue = Math.abs(integer);
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Find the absolute value of {integer}</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">|{integer}| = ?</div>
                  <div className="text-lg text-gray-600">Distance from zero:</div>
                  <div className="text-2xl text-blue-600 font-semibold">{absoluteValue} units</div>
                  {/* Number line showing distance */}
                  <div className="mt-4">
                    <div className="flex justify-center items-center space-x-1">
                      {Array.from({ length: 11 }, (_, i) => {
                        const value = i - 5;
                        const isZero = value === 0;
                        const isTarget = value === integer;
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              isZero ? 'bg-green-500' : isTarget ? 'bg-red-500' : 'bg-gray-400'
                            }`}></div>
                            <div className="text-xs mt-1">{value}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="text-green-600">■</span> Zero | 
                      <span className="text-red-600">■</span> {integer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Absolute value is always positive</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Compare integers')) {
      // 6.NS.2.b/c - Integer comparison
      const comparisonMatch = currentExample.match(/(-?\d+)\s*([<>=])\s*(-?\d+)/);
      
      if (comparisonMatch) {
        const num1 = parseInt(comparisonMatch[1]);
        const symbol = comparisonMatch[2];
        const num2 = parseInt(comparisonMatch[3]);
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Compare the integers: {num1} ___ {num2}</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">{num1} ___ {num2}</div>
                  <div className="text-lg text-gray-600">Number line comparison:</div>
                  {/* Number line showing comparison */}
                  <div className="mt-4">
                    <div className="flex justify-center items-center space-x-1">
                      {Array.from({ length: 11 }, (_, i) => {
                        const value = i - 5;
                        const isNum1 = value === num1;
                        const isNum2 = value === num2;
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              isNum1 ? 'bg-blue-500' : isNum2 ? 'bg-red-500' : 'bg-gray-400'
                            }`}></div>
                            <div className="text-xs mt-1">{value}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="text-blue-600">■</span> {num1} | 
                      <span className="text-red-600">■</span> {num2}
                    </div>
                  </div>
                  <div className="text-lg text-gray-600">
                    {num1 < num2 ? `${num1} is left of ${num2}` : 
                     num1 > num2 ? `${num1} is right of ${num2}` : 
                     `${num1} is equal to ${num2}`}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Numbers to the right are greater</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Put integers in order')) {
      // 6.NS.2.b - Ordering integers
      const orderMatch = currentExample.match(/(-?\d+(?:,\s*-?\d+)*)/);
      
      if (orderMatch) {
        const integers = orderMatch[1].split(',').map(n => parseInt(n.trim()));
        const sortedIntegers = [...integers].sort((a, b) => a - b);
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Put integers in order from least to greatest</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-lg text-gray-600">Given:</div>
                  <div className="text-2xl font-bold text-gray-800">{integers.join(', ')}</div>
                  <div className="text-lg text-gray-600">↓</div>
                  <div className="text-2xl text-blue-600 font-semibold">Ordered: {sortedIntegers.join(', ')}</div>
                  {/* Number line showing ordering */}
                  <div className="mt-4">
                    <div className="flex justify-center items-center space-x-1">
                      {Array.from({ length: 11 }, (_, i) => {
                        const value = i - 5;
                        const isInList = integers.includes(value);
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              isInList ? 'bg-blue-500' : 'bg-gray-400'
                            }`}></div>
                            <div className="text-xs mt-1">{value}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Order from left to right on the number line</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Write multiplication expressions using exponents') || lesson.title.includes('exponents')) {
      // 6.NS.2.b - Exponent expressions
      const exponentMatch = currentExample.match(/(\d+)\^(\d+)/);
      const baseMatch = currentExample.match(/(\d+)\s*×\s*(\d+)/g);
      
      if (exponentMatch || baseMatch) {
        const base = exponentMatch ? exponentMatch[1] : '2';
        const exponent = exponentMatch ? exponentMatch[2] : '3';
        const expanded = baseMatch ? baseMatch.join(' × ') : '2 × 2 × 2';
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Write the multiplication expression using exponents</p>
            <div className="interactive-card">
              <div className="interactive-card-white">
                <div className="text-center space-y-4">
                  <div className="text-lg text-gray-600">Repeated multiplication:</div>
                  <div className="text-2xl font-bold text-gray-800">{expanded}</div>
                  <div className="text-lg text-gray-600">↓</div>
                  <div className="text-2xl text-blue-600 font-semibold">Using exponents:</div>
                  <div className="text-2xl text-blue-600 font-semibold">{base}^{exponent}</div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Write as an exponential expression</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Multiply') && lesson.title.includes('mixed number') && lesson.title.includes('whole number')) {
      // 6.NS.3.a - Mixed number multiplication with whole numbers
      const mixedMatch = currentExample.match(/(\d+)\s+(\d+)\/(\d+)/);
      const wholeMatch = currentExample.match(/×\s*(\d+)/);
      
      if (mixedMatch && wholeMatch) {
        const wholePart = mixedMatch[1];
        const numerator = mixedMatch[2];
        const denominator = mixedMatch[3];
        const multiplier = wholeMatch[1];
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Multiply mixed number by whole number</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">{wholePart} {numerator}/{denominator} × {multiplier}</div>
                  <div className="text-lg text-gray-600">Use area model or distribution</div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="border-2 border-gray-400 p-2 rounded">
                      <div className="text-sm text-gray-600">Whole part</div>
                      <div className="text-lg font-semibold">{wholePart} × {multiplier}</div>
                    </div>
                    <div className="border-2 border-gray-400 p-2 rounded">
                      <div className="text-sm text-gray-600">Fraction part</div>
                      <div className="text-lg font-semibold">{numerator}/{denominator} × {multiplier}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Multiply each part separately</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Multiply') && lesson.title.includes('fraction') && lesson.title.includes('model')) {
      // 6.NS.3.b/d - Fraction multiplication with models
      const fractionMatch = currentExample.match(/(\d+)\/(\d+)\s*×\s*(\d+)\/(\d+)/);
      
      if (fractionMatch) {
        const num1 = fractionMatch[1];
        const den1 = fractionMatch[2];
        const num2 = fractionMatch[3];
        const den2 = fractionMatch[4];
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Multiply fractions using area model</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">{num1}/{den1} × {num2}/{den2}</div>
                  <div className="text-lg text-gray-600">Area Model</div>
                  <div className="grid grid-cols-4 gap-1 w-32 h-32 mx-auto border-2 border-gray-400">
                    {Array.from({ length: 16 }, (_, i) => {
                      const row = Math.floor(i / 4);
                      const col = i % 4;
                      const isShaded = row < parseInt(num1) && col < parseInt(num2);
                      return (
                        <div
                          key={i}
                          className={`border border-gray-300 ${
                            isShaded ? 'bg-blue-600' : 'bg-white'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="text-lg font-semibold text-blue-600">= {parseInt(num1) * parseInt(num2)}/{parseInt(den1) * parseInt(den2)}</div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Count the shaded parts</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Divide') && lesson.title.includes('unit fraction') && lesson.title.includes('whole number')) {
      // 6.NS.3.c - Division with unit fractions
      const divisionMatch = currentExample.match(/(\d+)\s*÷\s*(\d+)\/(\d+)/);
      
      if (divisionMatch) {
        const wholeNumber = divisionMatch[1];
        const numerator = divisionMatch[2];
        const denominator = divisionMatch[3];
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Divide whole number by unit fraction</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">{wholeNumber} ÷ {numerator}/{denominator}</div>
                  <div className="text-lg text-gray-600">Think: How many {numerator}/{denominator} fit into {wholeNumber}?</div>
                  <div className="flex justify-center space-x-2">
                    {Array.from({ length: parseInt(wholeNumber) }, (_, i) => (
                      <div key={i} className="w-16 h-16 border-2 border-gray-400 bg-yellow-200 rounded">
                        <div className="text-xs text-center pt-1">1 whole</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-lg font-semibold text-blue-600">= {wholeNumber} × {denominator}/{numerator}</div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Use area model to visualize</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Write powers of ten with exponents') || lesson.title.includes('powers of ten')) {
      // 6.NS.2.b - Powers of ten with exponents
      const powerMatch = currentExample.match(/10\^(\d+)/);
      const valueMatch = currentExample.match(/(\d+(?:,\d+)*)/);
      
      if (powerMatch || valueMatch) {
        const exponent = powerMatch ? powerMatch[1] : '3';
        const value = valueMatch ? valueMatch[1] : '1,000';
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Write powers of ten using exponents</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">{value}</div>
                  <div className="text-lg text-gray-600">⟷</div>
                  <div className="text-2xl text-blue-600 font-semibold">10^{exponent}</div>
                  <div className="text-sm text-gray-500">
                    {exponent} zeros after 1
                  </div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Count the zeros to find the exponent</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Recognize perfect squares') || lesson.title.includes('perfect squares')) {
      // 6.NS.2.c - Perfect squares
      const squareMatch = currentExample.match(/(\d+)\^2/);
      const resultMatch = currentExample.match(/=\s*(\d+)/);
      
      if (squareMatch || resultMatch) {
        const base = squareMatch ? squareMatch[1] : '4';
        const result = resultMatch ? resultMatch[1] : '16';
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Recognize perfect squares</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">{base}^2</div>
                  <div className="text-lg text-gray-600">= {base} × {base}</div>
                  <div className="text-2xl text-blue-600 font-semibold">= {result}</div>
                  <div className="grid grid-cols-4 gap-1 w-20 h-20 mx-auto mt-4">
                    {Array.from({ length: 16 }, (_, i) => (
                      <div
                        key={i}
                        className="bg-blue-600 border border-gray-300"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Perfect square forms a square shape</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Square numbers') || lesson.title.includes('square')) {
      // 6.NS.2.d - Square numbers
      const numberMatch = currentExample.match(/(\d+)/);
      const squareMatch = currentExample.match(/(\d+)\^2/);
      
      if (numberMatch || squareMatch) {
        const number = numberMatch ? numberMatch[1] : '5';
        const square = squareMatch ? squareMatch[1] : '25';
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Find the square of the number</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">{number}^2</div>
                  <div className="text-lg text-gray-600">= {number} × {number}</div>
                  <div className="text-2xl text-blue-600 font-semibold">= {square}</div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Multiply the number by itself</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Multiply mixed numbers') || lesson.title.includes('Multiply fractions and whole numbers') || lesson.title.includes('Estimate products')) {
      // 6.NS.3.b - Use InteractivePracticeRenderer for complex fraction operations
      return (
        <InteractivePracticeRenderer
          subLesson={lesson}
          subLessonIndex={currentIndex}
          onRequestHelp={(question, context) => {
            setAiHelpData({ question, context });
            setShowAiHelpPopup(true);
            requestAiHelp(lesson.id, processedContent.correctAnswer);
          }}
          onActivityComplete={(index) => {
            const inputKey = `lesson-${lesson.id}`;
            setShowFeedback({...showFeedback, [inputKey]: 'completed'});
            if (currentIndex < examples.length - 1) {
              setCurrentExampleIndex({...currentExampleIndex, [lesson.id]: currentIndex + 1});
            }
          }}
        />
      );
    } else if (lesson.title.includes('Scaling') || lesson.title.includes('justify your answer')) {
      // 6.NS.3.d - Use InteractivePracticeRenderer for scaling problems
      return (
        <InteractivePracticeRenderer
          subLesson={lesson}
          subLessonIndex={currentIndex}
          onRequestHelp={(question, context) => {
            setAiHelpData({ question, context });
            setShowAiHelpPopup(true);
            requestAiHelp(lesson.id, processedContent.correctAnswer);
          }}
          onActivityComplete={(index) => {
            const inputKey = `lesson-${lesson.id}`;
            setShowFeedback({...showFeedback, [inputKey]: 'completed'});
            if (currentIndex < examples.length - 1) {
              setCurrentExampleIndex({...currentExampleIndex, [lesson.id]: currentIndex + 1});
            }
          }}
        />
      );
    } else {
      // REMOVED: Old fallback to InteractivePracticeRenderer
      // All lessons should now use the universal system above
      console.log('❌ LESSON PANEL: Lesson fell through to default case:', lesson.title);
      return null;
    }
  };

  return (
    <div 
      className="bg-gray-800 border-b border-gray-700 overflow-y-auto"
      style={{ height: `${height}px` }}
    >
      <div className="p-6">
        {/* Standard Code and Description */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 text-shadow-lg">{selectedStandard}</h1>
          <p className="text-accent-info mb-4 text-xl font-semibold text-shadow">
            {standardDescription || "Standard description"}
          </p>
          <p className="text-gray-400 text-sm mb-4">
            This sub-standard includes {lessons.length} sub-lessons
          </p>
          


          {/* Progress */}
          <div className="flex items-center mb-6">
            <span className="text-gray-300 mr-3 font-bold">Progress:</span>
            <div className="flex space-x-1 pl-[3px] pr-[3px] pt-[3px] pb-[3px]">
              {/* Calculate total examples across all lessons - 3 dots per lesson */}
              {(() => {
                const totalExamples = lessons.length * 3; // 3 dots per lesson
                
                const totalCompleted = lessons.reduce((total, lesson) => {
                  const lessonIndex = currentExampleIndex[lesson.id] || 0;
                  const maxExamples = lesson.examples?.length || 3;
                  const isCompleted = showFeedback[`lesson-${lesson.id}`] === 'completed';
                  return total + (isCompleted ? maxExamples : lessonIndex);
                }, 0);
                
                return [...Array(totalExamples)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < totalCompleted ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                ));
              })()}
            </div>
            <span className="text-gray-400 text-sm ml-3">
              {lessons.reduce((total, lesson) => {
                const lessonIndex = currentExampleIndex[lesson.id] || 0;
                const maxExamples = lesson.examples?.length || 3;
                const isCompleted = showFeedback[`lesson-${lesson.id}`] === 'completed';
                return total + (isCompleted ? maxExamples : lessonIndex);
              }, 0)} / {lessons.length * 3} completed
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-0">
          <div className="flex border-b border-gray-600">
            {lessons.map((lesson, index) => {
              const tabLabel = TabLabelGenerator.getTabLabel(lesson, selectedStandard || '');
              const isActive = selectedTabIndex === index;
              const isCompleted = showFeedback[`lesson-${lesson.id}`] === 'completed';
              
              return (
                <div key={lesson.id} className="relative group">
                  <button
                    onClick={() => handleTabSelect(index)}
                    className={`px-6 py-3 text-sm font-medium transition-all duration-200 relative ${
                      isActive 
                        ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white border-l border-r border-t border-blue-500 rounded-t-2xl -mb-px shadow-lg' 
                        : 'text-gray-300 hover:text-white bg-gray-700/50 border-l border-r border-t border-transparent hover:border-gray-600 rounded-t-2xl'
                    } ${
                      isCompleted && !isActive
                        ? 'bg-green-600/80 text-white border-green-500' 
                        : ''
                    } ${
                      isCompleted && isActive
                        ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white border-l border-r border-t border-blue-500 shadow-lg' 
                        : ''
                    }`}
                  >
                    {/* Completed checkmark icon */}
                    {isCompleted && (
                      <span className="inline-flex items-center justify-center w-4 h-4 bg-green-500 text-white rounded-full mr-2 text-xs">
                        ✓
                      </span>
                    )}
                    {tabLabel}
                  </button>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                    {TabLabelGenerator.generateTooltip(lesson)}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Lesson Content */}
        {currentLesson && (
          <div className="mb-8">
            {/* Lesson Card */}
            <div className="bg-gray-800 border border-gray-600 border-t-0 rounded-b-lg p-6 shadow-xl">
              {/* Enhanced color-coded badge based on lesson type */}
              <div className="mb-4">
                <span className={`text-white px-3 py-1 rounded text-sm font-medium ${
                  currentLesson.title.includes('Convert') ? 'bg-blue-600' :
                  currentLesson.title.includes('percentage') || currentLesson.title.includes('percent') ? 'bg-green-600' :
                  currentLesson.title.includes('fraction') ? 'bg-purple-600' :
                  currentLesson.title.includes('decimal') ? 'bg-orange-600' :
                  currentLesson.title.includes('Write') || currentLesson.title.includes('simplify') ? 'bg-red-600' :
                  currentLesson.title.includes('mixed number') ? 'bg-indigo-600' :
                  currentLesson.title.includes('word problem') ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}>
                  {currentLesson.code}
                </span>
              </div>



              {/* Explanation Card */}
              <div className="mb-6">
                <p className="text-definition mb-3 font-bold text-lg text-shadow-sm">Explanation:</p>
                <div className="bg-gray-700/80 border border-gray-300/20 rounded-lg p-4 shadow-md">
                  <p className="text-gray-200 leading-relaxed">{currentLesson.explanation || currentLesson.description}</p>
                </div>
              </div>

              {/* Interactive Practice Card */}
              <div className="mb-6">
                <p className="text-instruction font-bold text-lg mb-3 text-shadow-sm">Interactive Practice:</p>
                <div className="border border-gray-300/25 p-2 rounded-lg bg-gray-600/80 shadow-lg">
                  <div className="bg-gray-700/90 border border-green-600/50 p-6 rounded-lg relative">

                    <p className="text-white text-2xl font-bold text-center mb-4">
                      {(() => {
                        const config: UniversalPromptConfig = {
                          type: currentLesson.title.includes('Convert between percents and decimals') ? 'decimal-percent-conversion' : 
                                currentLesson.title.includes('percentage is illustrated') ? 'grid-percentage' : 
                                currentLesson.title.includes('Benchmark percents') ? 'strip-percentage' : 
                                currentLesson.title.includes('Convert fractions to percents') ? 'grid-percentage' : 
                                'word-problem',
                          standardCode: selectedStandard || 'default',
                          lessonTitle: currentLesson.title,
                          context: currentLesson
                        };
                        return generateUniversalPrompt(config);
                      })()}
                    </p>
                    
                    {/* Render interactive content for current lesson */}
                    {renderInteractiveContent(currentLesson)}
                    
                    {/* Success Animation */}
                    <SuccessAnimation
                      isVisible={showAnimation[`lesson-${currentLesson.id}`] || false}
                      animationType={animationType[`lesson-${currentLesson.id}`] || 'smiley'}
                      onComplete={() => handleAnimationComplete(currentLesson.id)}
                    />
                    
                    {/* REMOVED: Legacy input box - all lessons now use universal system interactive components */}
                    
                    {/* Show feedback if available - UNIVERSAL SYSTEM */}
                    {showFeedback[`lesson-${currentLesson.id}`] && (
                      <div className={
                        showFeedback[`lesson-${currentLesson.id}`] === 'correct' ? universalFeedbackStyles.correct : 
                        showFeedback[`lesson-${currentLesson.id}`] === 'completed' ? universalFeedbackStyles.completed : 
                        universalFeedbackStyles.incorrect
                      }>
                        <p>
                          {showFeedback[`lesson-${currentLesson.id}`] === 'correct' ? universalFeedbackMessages.correct : 
                           showFeedback[`lesson-${currentLesson.id}`] === 'completed' ? universalFeedbackMessages.completed : 
                           (() => {
                             const formatted = formatUniversalFeedbackMessage(showFeedback[`lesson-${currentLesson.id}`]);
                             return formatted.fullText ? formatted.fullText : (
                               <>
                                 {formatted.beforeText} 
                                 <span className={formatted.attemptClasses}>{formatted.attemptText}</span>
                               </>
                             );
                           })()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* AI Help Popup */}
      <AiHelpPopup
        isOpen={showAiHelpPopup}
        onClose={() => {
          setShowAiHelpPopup(false);
          setAiHelpData(null);
          setAiResponseReceived(false);
        }}
        onHelpRequested={(question, context) => {
          if (onAiResponse) {
            onAiResponse({ question, context });
          }
        }}
        question={aiHelpData?.question || ''}
        context={aiHelpData?.context || ''}
        hasResponse={aiResponseReceived}
      />
    </div>
  );
}
