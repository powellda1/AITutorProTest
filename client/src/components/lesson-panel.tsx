import { useState, useMemo, useEffect } from "react";
import type { Lesson } from "@shared/schema";
import { InteractivePracticeRenderer } from "./interactive-lesson";
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
import { DecimalPercentConversion } from "./interactive-lesson";
import DecimalFractionComponent from "./DecimalFractionComponent";
import FractionSimplificationComponent from "./FractionSimplificationComponent";
import MixedNumberConversionComponent from "./MixedNumberConversionComponent";
import ConversionWordProblemComponent from "./ConversionWordProblemComponent";
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
    
    // Check if this lesson is complete and mark it as completed
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson && lesson.examples) {
      const currentIndex = currentExampleIndex[lessonId] || 0;
      const maxExamples = lesson.examples.length;
      
      if (currentIndex >= maxExamples - 1 && showFeedback[inputKey] === 'completed') {
        setCompletedLessons(prev => ({
          ...prev,
          [lessonId]: true
        }));
      }
    }
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
        
        // Hide AI help popup when response comes back
        setShowAiHelpPopup(false);
        setAiHelpData(null);
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
      lessonAnalysis = analyzeLessonType(explanation, lesson.title, selectedStandard);
      if (lesson.id === 3549) {
        console.log('🔍 LESSON PANEL: lessonAnalysis result:', lessonAnalysis);
      }
      setLessonAnalysisCache({...lessonAnalysisCache, [cacheKey]: lessonAnalysis});
    }
    // Cached lesson analysis complete
    
    // UNIVERSAL SYSTEM - Process lessons directly without InteractivePracticeRenderer
    console.log('🔍 COMPREHENSIVE DEBUG - LESSON DETAILS:');
    console.log('  - Lesson ID:', lesson.id);
    console.log('  - Lesson Title:', lesson.title);
    console.log('  - Lesson Explanation:', lesson.explanation);
    console.log('  - Current Example:', currentExample);
    console.log('  - Lesson Analysis:', lessonAnalysis);
    console.log('  - requiresInteraction =', lessonAnalysis.requiresInteraction);
    console.log('  - componentType =', lessonAnalysis.componentType);
    console.log('🔍 DEBUG STEP 1: Will enter universal system?', lessonAnalysis.requiresInteraction);
    
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
          
          {processedContent.componentType === 'decimal-fraction' && (
            <DecimalFractionComponent
              key={`decimal-fraction-${lesson.id}-${safeIndex}`}
              originalDecimal={processedContent.additionalData?.decimal as number}
              targetNumerator={processedContent.additionalData?.numerator as number}
              targetDenominator={processedContent.additionalData?.denominator as number}
              correctAnswer={processedContent.correctAnswer as string}
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
            />
          )}
          
          {processedContent.componentType === 'conversion-word-problem' && (
            <ConversionWordProblemComponent
              key={`conversion-word-problem-${lesson.id}-${safeIndex}`}
              problemText={processedContent.additionalData?.originalExample as string}
              correctAnswer={processedContent.correctAnswer as string}
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

          {/* Progress indicator */}
          <div className="text-center mt-4">
            <span className="text-sm text-orange-400">
              {currentIndex + 1}/{examples.length}
            </span>
          </div>
          
          <div className="flex justify-center mt-2">
            {examples.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full mx-1 ${
                  index < currentIndex
                    ? 'bg-green-500'
                    : index === currentIndex
                    ? 'bg-orange-500'
                    : 'bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Success animation */}
          {showAnimation[`lesson-${lesson.id}`] && (
            <div className="flex justify-center mt-4">
              <SuccessAnimation 
                type={animationType[`lesson-${lesson.id}`]} 
                onComplete={() => {
                  setShowAnimation(prev => {
                    const newState = { ...prev };
                    delete newState[`lesson-${lesson.id}`];
                    return newState;
                  });
                }}
              />
            </div>
          )}

          {showFeedback[`lesson-${lesson.id}`] && showFeedback[`lesson-${lesson.id}`] !== 'completed' && (
            <div className={`mt-4 p-3 rounded-lg ${
              showFeedback[`lesson-${lesson.id}`] === 'correct' 
                ? 'bg-green-800/20 border border-green-600 text-green-300' 
                : 'bg-red-800/20 border border-red-600 text-red-300'
            }`}>
              {showFeedback[`lesson-${lesson.id}`]}
            </div>
          )}

          {/* Completion message */}
          {showFeedback[`lesson-${lesson.id}`] === 'completed' && (
            <div className="mt-4 p-3 rounded-lg bg-blue-800/20 border border-blue-600 text-blue-300">
              🎉 Lesson Completed! Great job!
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// Calculate progress data
const progressData = useMemo(() => {
  if (!selectedStandard || !lessons) return null;
  
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(lesson => 
    showFeedback[`lesson-${lesson.id}`] === 'completed'
  ).length;
  
  return {
    completed: completedLessons,
    total: totalLessons
  };
}, [selectedStandard, lessons, showFeedback]);

// Main component return
return (
  <div className="w-full bg-gray-800 text-white p-4 rounded-lg">
    {/* Progress bar */}
    {progressData && (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-400">{progressData.completed}/{progressData.total} completed</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progressData.completed / progressData.total) * 100}%` }}
          />
        </div>
      </div>
    )}

    {/* Tab system */}
    <div className="mb-4">
      <div className="flex border-b border-gray-600 overflow-x-auto">
        {lessons.map((lesson) => {
          const isCompleted = showFeedback[`lesson-${lesson.id}`] === 'completed';
          const isSelected = selectedLesson?.id === lesson.id;
          const tabLabel = TabLabelGenerator.generateTabLabel(lesson.title);
          
          return (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0 rounded-t-2xl ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white border-b-2 border-blue-600 shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
              title={lesson.title}
            >
              {tabLabel}
              {isCompleted && (
                <span className="ml-2 text-green-400">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>

    {/* Lesson content */}
    {selectedLesson && (
      <>
        {renderUniversalLesson(selectedLesson)}
        {/* Legacy routing for non-converted lessons */}
        {selectedLesson.standardCode === '6.NS.1.e' && (
          <InteractivePracticeRenderer
            key={`legacy-${selectedLesson.id}`}
            lesson={selectedLesson}
            onAnswer={(answer) => {
              const inputKey = `lesson-${selectedLesson.id}`;
              const currentAttempts = attemptCounts[inputKey] || 0;
              const correctCount = correctAnswerCount[inputKey] || 0;
              
              handleUniversalAnswer({
                lessonId: selectedLesson.id,
                isCorrect: answer.toString() === '1', // placeholder
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
                  requestAiHelp(selectedLesson.id, '1');
                },
                onAdvanceExample: () => {
                  // Legacy advance example handling
                },
                onResetLesson: () => {
                  setResetTrigger(prev => prev + 1);
                }
              });
            }}
            resetTrigger={resetTrigger}
            standardCode={selectedStandard}
            lessonTitle={selectedLesson.title}
          />
        )}
        {/* Add more legacy routing cases here */}
      </>
    )}

    {/* AI Help Popup */}
    {showAiHelpPopup && (
      <AiHelpPopup
        isVisible={showAiHelpPopup}
        onClose={() => setShowAiHelpPopup(false)}
        aiHelpData={aiHelpData}
      />
    )}
  </div>
);
};
              lesson={lesson}
              promptText={processedContent.interactiveText}
              correctAnswer={processedContent.correctAnswer as string}
