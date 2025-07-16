import { useState, useMemo } from "react";
import type { Lesson } from "@shared/schema";
import { InteractivePracticeRenderer } from "./interactive-lesson";
import SuccessAnimation, { type AnimationType } from "./SuccessAnimation";
import NumberLineComponent from "./NumberLineComponent";
import { analyzeLessonType, processLessonContent } from "../utils/lessonProcessor";

interface LessonPanelProps {
  lessons: Lesson[];
  selectedStandard: string | null;
  standardDescription: string | null;
  height: number;
  onAiResponse?: (response: any) => void;
  sessionId?: string;
}

export default function LessonPanel({ lessons, selectedStandard, standardDescription, height, onAiResponse, sessionId }: LessonPanelProps) {
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

  const handleSubmit = (lessonId: number, correctAnswer: string) => {
    const inputKey = `lesson-${lessonId}`;
    const userAnswer = inputValues[inputKey] || '';
    
    // Simple answer checking - normalize both answers
    const normalizedUser = userAnswer.toLowerCase().replace(/[^0-9.]/g, '');
    const normalizedCorrect = correctAnswer.toLowerCase().replace(/[^0-9.]/g, '');
    
    if (normalizedUser === normalizedCorrect) {
      setShowFeedback({...showFeedback, [inputKey]: 'correct'});
      
      // Reset attempt count for this lesson
      setAttemptCounts({...attemptCounts, [inputKey]: 0});
      
      // Update correct answer count and trigger animation
      const currentCount = correctAnswerCount[inputKey] || 0;
      const newCount = currentCount + 1;
      setCorrectAnswerCount({...correctAnswerCount, [inputKey]: newCount});
      
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
      setAnimationType({...animationType, [inputKey]: newAnimationType});
      setShowAnimation({...showAnimation, [inputKey]: true});
      
      // Move to next example after 1 second
      setTimeout(() => {
        const currentIndex = currentExampleIndex[lessonId] || 0;
        const lesson = lessons.find(l => l.id === lessonId);
        const maxExamples = lesson?.examples?.length || 3;
        
        if (currentIndex < maxExamples - 1) {
          setCurrentExampleIndex({...currentExampleIndex, [lessonId]: currentIndex + 1});
          setInputValues({...inputValues, [inputKey]: ''});
          setShowFeedback({...showFeedback, [inputKey]: ''});
        } else {
          setShowFeedback({...showFeedback, [inputKey]: 'completed'});
        }
      }, 1000);
    } else {
      // Increment attempt count
      const currentAttempts = attemptCounts[inputKey] || 0;
      const newAttempts = currentAttempts + 1;
      setAttemptCounts({...attemptCounts, [inputKey]: newAttempts});
      
      if (newAttempts >= 3) {
        // Request AI help after 3 failed attempts
        requestAiHelp(lessonId, correctAnswer);
        setShowFeedback({...showFeedback, [inputKey]: 'ai-help-requested'});
        setAiHelpRequested({...aiHelpRequested, [inputKey]: true});
      } else {
        setShowFeedback({...showFeedback, [inputKey]: `incorrect-${newAttempts}`});
      }
    }
  };

  const checkAnswer = (correctAnswer: number, selectedValue: number, lessonId: number) => {
    const inputKey = `lesson-${lessonId}`;
    
    if (selectedValue === correctAnswer) {
      setShowFeedback({...showFeedback, [inputKey]: 'correct'});
      
      // Reset attempt count for this lesson
      setAttemptCounts({...attemptCounts, [inputKey]: 0});
      
      // Update correct answer count and trigger animation
      const currentCount = correctAnswerCount[inputKey] || 0;
      const newCount = currentCount + 1;
      setCorrectAnswerCount({...correctAnswerCount, [inputKey]: newCount});
      
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
      setAnimationType({...animationType, [inputKey]: newAnimationType});
      setShowAnimation({...showAnimation, [inputKey]: true});
      
      // Move to next example after 1 second
      setTimeout(() => {
        const currentIndex = currentExampleIndex[lessonId] || 0;
        const lesson = lessons.find(l => l.id === lessonId);
        const maxExamples = lesson?.examples?.length || 3;
        
        if (currentIndex < maxExamples - 1) {
          setCurrentExampleIndex({...currentExampleIndex, [lessonId]: currentIndex + 1});
          setInputValues({...inputValues, [inputKey]: ''});
          setShowFeedback({...showFeedback, [inputKey]: ''});
        } else {
          setShowFeedback({...showFeedback, [inputKey]: 'completed'});
        }
      }, 1000);
    } else {
      // Increment attempt count
      const currentAttempts = attemptCounts[inputKey] || 0;
      const newAttempts = currentAttempts + 1;
      setAttemptCounts({...attemptCounts, [inputKey]: newAttempts});
      
      if (newAttempts >= 3) {
        // Request AI help after 3 failed attempts
        requestAiHelp(lessonId, correctAnswer.toString());
        setShowFeedback({...showFeedback, [inputKey]: 'ai-help-requested'});
        setAiHelpRequested({...aiHelpRequested, [inputKey]: true});
      } else {
        setShowFeedback({...showFeedback, [inputKey]: `incorrect-${newAttempts}`});
      }
    }
  };

  const handleAnimationComplete = (lessonId: number) => {
    const inputKey = `lesson-${lessonId}`;
    setShowAnimation({...showAnimation, [inputKey]: false});
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

  const getCorrectAnswer = (lesson: Lesson, exampleIndex: number): string => {
    if (!lesson.examples || exampleIndex >= lesson.examples.length) return '80';
    
    const example = lesson.examples[exampleIndex];
    
    // Different extraction logic based on lesson type
    if (lesson.title.includes('Convert between percents and decimals')) {
      // 6.NS.1.b - Could be asking for either decimal or percent
      const decimalMatch = example.match(/(\d+\.\d+)/);
      const percentMatch = example.match(/(\d+(?:\.\d+)?)%/);
      
      if (decimalMatch && percentMatch) {
        return decimalMatch[1]; // Return decimal for input
      } else if (decimalMatch) {
        return decimalMatch[1];
      } else if (percentMatch) {
        return percentMatch[1];
      }
    } else if (lesson.title.includes('Convert fractions to percents')) {
      // 6.NS.1.c - Extract percentage from fraction conversion
      const percentMatch = example.match(/(\d+(?:\.\d+)?)%/);
      return percentMatch ? percentMatch[1] : '40';
    } else if (lesson.title.includes('Write fractions in lowest terms') || lesson.title.includes('simplify')) {
      // 6.NS.1.d - Extract simplified fraction
      const simplifiedMatch = example.match(/simplified to (\d+)\/(\d+)/);
      return simplifiedMatch ? `${simplifiedMatch[1]}/${simplifiedMatch[2]}` : '1/2';
    } else if (lesson.title.includes('Convert between improper fractions and mixed numbers')) {
      // 6.NS.1.d - Extract mixed number or improper fraction
      const mixedMatch = example.match(/(\d+)\s+(\d+)\/(\d+)/);
      const improperMatch = example.match(/(\d+)\/(\d+)/);
      
      if (mixedMatch) {
        return `${mixedMatch[1]} ${mixedMatch[2]}/${mixedMatch[3]}`;
      } else if (improperMatch) {
        return `${improperMatch[1]}/${improperMatch[2]}`;
      }
      return '2 3/4';
    } else if (lesson.title.includes('Convert decimals to fractions')) {
      // 6.NS.1.d - Extract fraction from decimal conversion
      const afterEquals = example.split('=')[1];
      const fractionMatch = afterEquals?.match(/(\d+)\/(\d+)/);
      return fractionMatch ? `${fractionMatch[1]}/${fractionMatch[2]}` : '3/5';
    } else if (lesson.title.includes('Convert fractions to decimals')) {
      // 6.NS.1.d - Extract decimal from fraction conversion
      const decimalMatch = example.match(/(\d+\.\d+)/);
      return decimalMatch ? decimalMatch[1] : '0.6';
    } else if (lesson.title.includes('Convert between percents, fractions, and decimals')) {
      // 6.NS.1.d - Triple conversions - find missing value
      const percentMatch = example.match(/(\d+(?:\.\d+)?)%/);
      const decimalMatch = example.match(/(\d+\.\d+)/);
      const fractionMatch = example.match(/(\d+)\/(\d+)/);
      
      // Return the third value that's not explicitly shown
      if (percentMatch && decimalMatch && !fractionMatch) {
        // Need to find fraction
        const afterEquals = example.split('=');
        const lastPart = afterEquals[afterEquals.length - 1];
        const fractionInLast = lastPart.match(/(\d+)\/(\d+)/);
        return fractionInLast ? `${fractionInLast[1]}/${fractionInLast[2]}` : '2/5';
      } else if (percentMatch && fractionMatch && !decimalMatch) {
        // Need to find decimal
        const decimalInExample = example.match(/(\d+\.\d+)/);
        return decimalInExample ? decimalInExample[1] : '0.4';
      } else if (decimalMatch && fractionMatch && !percentMatch) {
        // Need to find percent
        const percentInExample = example.match(/(\d+(?:\.\d+)?)%/);
        return percentInExample ? percentInExample[1] : '40';
      }
      return '40';
    } else if (lesson.title.includes('repeating decimals')) {
      // 6.NS.1.d - Extract repeating decimal pattern
      const decimalMatch = example.match(/(\d+\.\d+\.\.\.)/);
      return decimalMatch ? decimalMatch[1] : '0.333...';
    } else if (lesson.title.includes('Equivalent fractions')) {
      // 6.NS.1.d - Extract equivalent fraction
      const equivalentMatch = example.match(/(\d+)\/(\d+).*=.*(\d+)\/(\d+)/);
      if (equivalentMatch) {
        return `${equivalentMatch[3]}/${equivalentMatch[4]}`;
      }
      return '4/6';
    } else if (lesson.title.includes('mixed numbers') && lesson.title.includes('decimal')) {
      // 6.NS.1.d - Extract decimal from mixed number conversion
      const decimalMatch = example.match(/(\d+\.\d+)/);
      return decimalMatch ? decimalMatch[1] : '2.5';
    } else if (lesson.title.includes('Understanding integers') || lesson.title.includes('Integers on number lines')) {
      // 6.NS.2.a - Extract integer from context
      const integerMatch = example.match(/(-?\d+)/);
      return integerMatch ? integerMatch[1] : '-3';
    } else if (lesson.title.includes('Graph integers on horizontal and vertical number lines')) {
      // 6.NS.2.a - Extract integer to graph
      const integerMatch = example.match(/(-?\d+)/);
      return integerMatch ? integerMatch[1] : '-5';
    } else if (lesson.title.includes('Understanding opposite integers')) {
      // 6.NS.2.a - Extract opposite integer
      const integerMatch = example.match(/(-?\d+)/);
      return integerMatch ? (-parseInt(integerMatch[1])).toString() : '4';
    } else if (lesson.title.includes('Understanding absolute value') || lesson.title.includes('Absolute value')) {
      // 6.NS.2.d - Extract absolute value
      const absoluteMatch = example.match(/\|(-?\d+)\|\s*=\s*(\d+)/);
      return absoluteMatch ? absoluteMatch[2] : '6';
    } else if (lesson.title.includes('Compare integers')) {
      // 6.NS.2.b/c - Extract comparison symbol
      const comparisonMatch = example.match(/(-?\d+)\s*([<>=])\s*(-?\d+)/);
      return comparisonMatch ? comparisonMatch[2] : '>';
    } else if (lesson.title.includes('Put integers in order')) {
      // 6.NS.2.b - Extract ordered integers
      const orderedMatch = example.match(/ordered:\s*([^.]+)/);
      return orderedMatch ? orderedMatch[1].trim() : '-4, -2, 0, 1';
    } else if (lesson.title.includes('Write multiplication expressions using exponents') || lesson.title.includes('exponents')) {
      // 6.NS.2.b - Extract exponent expression
      const exponentMatch = example.match(/(\d+)\^(\d+)/);
      return exponentMatch ? `${exponentMatch[1]}^${exponentMatch[2]}` : '2^3';
    } else if (lesson.title.includes('Multiply') && lesson.title.includes('mixed number') && lesson.title.includes('whole number')) {
      // 6.NS.3.a - Extract result from mixed number multiplication
      const resultMatch = example.match(/=\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d+)/);
      return resultMatch ? resultMatch[1].trim() : '6';
    } else if (lesson.title.includes('Multiply') && lesson.title.includes('fraction') && lesson.title.includes('model')) {
      // 6.NS.3.b/d - Extract fraction multiplication result
      const fractionMatch = example.match(/(\d+)\/(\d+)\s*×\s*(\d+)\/(\d+)/);
      if (fractionMatch) {
        const result = `${parseInt(fractionMatch[1]) * parseInt(fractionMatch[3])}/${parseInt(fractionMatch[2]) * parseInt(fractionMatch[4])}`;
        return result;
      }
      return '2/15';
    } else if (lesson.title.includes('Divide') && lesson.title.includes('unit fraction') && lesson.title.includes('whole number')) {
      // 6.NS.3.c - Extract division result
      const divisionMatch = example.match(/(\d+)\s*÷\s*(\d+)\/(\d+)/);
      if (divisionMatch) {
        const result = parseInt(divisionMatch[1]) * parseInt(divisionMatch[3]) / parseInt(divisionMatch[2]);
        return result.toString();
      }
      return '12';
    } else if (lesson.title.includes('Write powers of ten with exponents') || lesson.title.includes('powers of ten')) {
      // 6.NS.2.b - Extract power of ten exponent expression
      const powerMatch = example.match(/10\^(\d+)/);
      return powerMatch ? `10^${powerMatch[1]}` : '10^3';
    } else if (lesson.title.includes('Recognize perfect squares') || lesson.title.includes('perfect squares')) {
      // 6.NS.2.c - Extract perfect square result
      const resultMatch = example.match(/=\s*(\d+)/);
      return resultMatch ? resultMatch[1] : '16';
    } else if (lesson.title.includes('Square numbers') || lesson.title.includes('square')) {
      // 6.NS.2.d - Extract square result
      const squareMatch = example.match(/(\d+)\^2\s*=\s*(\d+)/);
      return squareMatch ? squareMatch[2] : '25';
    } else if (lesson.title.includes('Multiply mixed numbers') || lesson.title.includes('Multiply fractions and whole numbers') || lesson.title.includes('Estimate products')) {
      // 6.NS.3.b - Extract multiplication result
      const resultMatch = example.match(/=\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)/);
      return resultMatch ? resultMatch[1].trim() : '2 1/2';
    } else if (lesson.title.includes('Scaling') || lesson.title.includes('justify your answer')) {
      // 6.NS.3.d - Extract scaling result or justification
      const resultMatch = example.match(/=\s*(\d+(?:\.\d+)?)/);
      const comparisonMatch = example.match(/(greater|less|equal)/i);
      return resultMatch ? resultMatch[1] : (comparisonMatch ? comparisonMatch[1].toLowerCase() : 'greater');
    } else {
      // 6.NS.1.a - Extract percentage from shaded grid/strip
      const percentMatch = example.match(/(\d+(?:\.\d+)?)%/);
      return percentMatch ? percentMatch[1] : '80';
    }
    
    return '80';
  };

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
        // 6.NS.1.b - Decimal/Percent conversion
        const decimalMatch = currentExample.match(/(\d+\.\d+)/);
        const percentMatch = currentExample.match(/(\d+(?:\.\d+)?)%/);
        const decimal = decimalMatch ? decimalMatch[1] : '0.35';
        const percent = percentMatch ? percentMatch[1] : '35';
        
        prompt = `A 6th grade student is working on converting between decimals and percents. They need to convert between ${decimal} and ${percent}%. They have attempted this 3 times unsuccessfully. Make it clear and educational for a 6th grade student. Please provide a brief summary, the question, and a step-by-step explanation.`;
      } else if (lesson?.title.includes('Convert fractions to percents')) {
        // 6.NS.1.c - Fraction to percent conversion
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

  const renderInteractiveContent = (lesson: Lesson) => {
    const explanation = lesson.explanation || '';
    const currentIndex = currentExampleIndex[lesson.id] || 0;
    const examples = lesson.examples || [];
    
    if (currentIndex >= examples.length) return null;
    
    const currentExample = examples[currentIndex];
    
    // Removed debug logging for performance
    
    // Dynamic lesson analysis with caching
    const cacheKey = `${lesson.id}-${lesson.title}`;
    let lessonAnalysis = lessonAnalysisCache[cacheKey];
    
    if (!lessonAnalysis) {
      lessonAnalysis = analyzeLessonType(explanation, lesson.title);
      setLessonAnalysisCache({...lessonAnalysisCache, [cacheKey]: lessonAnalysis});
    }
    // Cached lesson analysis complete
    
    // Process content if interactive
    if (lessonAnalysis.requiresInteraction && lessonAnalysis.componentType === 'number-line') {
      try {
        const processedContent = processLessonContent(currentExample, explanation, lessonAnalysis);
        
        if (processedContent) {
          const inputKey = `lesson-${lesson.id}`;
          
          return (
            <div className="text-center mb-4">
              <p className="text-green-100 mb-2">Example: {processedContent.interactiveText}</p>
              <NumberLineComponent
                mode={processedContent.mode}
                orientation={processedContent.orientation}
                range={processedContent.range}
                preMarkedPositions={processedContent.preMarkedPositions}
                correctAnswer={processedContent.correctAnswer}
                promptText={processedContent.interactiveText}
                selectedValue={selectedNumberValue[inputKey]}
                onValueChange={(value) => {
                  setSelectedNumberValue({...selectedNumberValue, [inputKey]: value});
                }}
                onAnswer={(answer) => {
                  checkAnswer(processedContent.correctAnswer, answer, lesson.id);
                }}
              />
            </div>
          );
        }
      } catch (error) {
        console.error('Error processing lesson content:', error);
        // Fall back to default display
      }
    } else if (lesson.title.includes('Put a mix of decimals and fractions in order') || 
               lesson.title.includes('Put a mix of decimals, fractions, and mixed numbers in order')) {
      // 6.NS.1.e - Ordering activities
      const orderingMatch = currentExample.match(/ordered:\s*(.+)/);
      
      if (orderingMatch) {
        const correctOrder = orderingMatch[1].trim();
        
        // Extract the numbers to order from the beginning of the example
        const numbersToOrder = currentExample.split('ordered:')[0].trim();
        const numbersList = numbersToOrder.split(',').map(n => n.trim());
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Example: {currentExample}</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-lg text-gray-600">Order these numbers from least to greatest:</div>
                  <div className="text-xl font-bold text-gray-800 bg-yellow-100 p-2 rounded">
                    {numbersToOrder}
                  </div>
                  <div className="text-lg text-gray-600">Drag to reorder or type the correct order:</div>
                  
                  {/* Interactive ordering visualization */}
                  <div className="mt-6">
                    <div className="flex justify-center flex-wrap gap-2 mb-4">
                      {numbersList.map((num, index) => (
                        <div key={index} className="bg-blue-100 border-2 border-blue-300 rounded-lg p-2 text-lg font-semibold">
                          {num}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Numbers to order: {numbersToOrder}
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      Think about: Convert to decimals or use number line visualization
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    } else if (lesson.title.includes('Compare percents to each other and to fractions') || 
               lesson.title.includes('Compare percents to fractions and decimals')) {
      // 6.NS.1.e - Comparison activities
      const comparisonMatch = currentExample.match(/(.+)\s*vs\s*(.+):\s*(.+)/);
      
      if (comparisonMatch) {
        const value1 = comparisonMatch[1].trim();
        const value2 = comparisonMatch[2].trim();
        const explanation = comparisonMatch[3].trim();
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Example: {currentExample}</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-lg text-gray-600">Compare these values:</div>
                  
                  {/* Comparison visualization */}
                  <div className="flex justify-center items-center space-x-4 mt-6">
                    <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-xl font-bold">
                      {value1}
                    </div>
                    <div className="text-2xl font-bold text-gray-600">VS</div>
                    <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 text-xl font-bold">
                      {value2}
                    </div>
                  </div>
                  
                  <div className="text-lg text-gray-600 mt-4">
                    Which is greater? Click to choose:
                  </div>
                  
                  <div className="flex justify-center space-x-4 mt-4">
                    <button className="bg-blue-200 hover:bg-blue-300 border-2 border-blue-400 rounded-lg p-2 text-lg font-semibold">
                      {value1} is greater
                    </button>
                    <button className="bg-green-200 hover:bg-green-300 border-2 border-green-400 rounded-lg p-2 text-lg font-semibold">
                      {value2} is greater
                    </button>
                    <button className="bg-gray-200 hover:bg-gray-300 border-2 border-gray-400 rounded-lg p-2 text-lg font-semibold">
                      They are equal
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-2">
                    Hint: Convert to the same form to compare
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    } else if (lesson.title.includes('Compare percents and fractions: word problems')) {
      // 6.NS.1.e - Word problem comparisons
      const questionMatch = currentExample.match(/^([^?]+\?)/);
      
      if (questionMatch) {
        const question = questionMatch[1].trim();
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Example: {currentExample}</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-lg text-gray-600">Word Problem:</div>
                  <div className="text-lg font-bold text-gray-800 bg-yellow-100 p-2 rounded">
                    {question}
                  </div>
                  
                  {/* Word problem visualization */}
                  <div className="mt-6">
                    <div className="text-lg text-gray-600 mb-4">
                      Solve step by step:
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg text-left">
                      <div className="text-sm text-gray-600 mb-2">Step 1: Calculate each value</div>
                      <div className="text-sm text-gray-600 mb-2">Step 2: Compare the results</div>
                      <div className="text-sm text-gray-600">Step 3: Determine which is greater</div>
                    </div>
                    
                    <div className="text-lg text-gray-600 mt-4">
                      What's your answer?
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    } else if (lesson.title.includes('Integers on number lines')) {
      // 6.NS.2.a - Identify integers on number lines
      const integerMatch = currentExample.match(/(-?\d+)/);
      
      if (integerMatch) {
        const integer = parseInt(integerMatch[1]);
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Example: {currentExample}</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-lg text-gray-600">Identify the integer on the number line:</div>
                  
                  {/* Number line visualization */}
                  <div className="mt-6">
                    <div className="text-lg text-gray-600 mb-2">Number Line:</div>
                    <div className="flex justify-center items-center space-x-2">
                      {Array.from({ length: 11 }, (_, i) => {
                        const value = i - 5;
                        const isTarget = value === integer;
                        const isZero = value === 0;
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              isTarget ? 'bg-red-500 border-red-700' : 
                              isZero ? 'bg-green-500 border-green-700' : 
                              'bg-gray-300 border-gray-400'
                            }`}></div>
                            <div className={`text-xs mt-1 ${isTarget ? 'font-bold text-red-600' : ''}`}>
                              {value}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="text-xl text-blue-600 font-semibold">
                    This point represents: {integer}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    } else if (lesson.title.includes('Graph integers on horizontal and vertical number lines')) {
      // 6.NS.2.a - Graph integers on number lines
      const integerMatch = currentExample.match(/(-?\d+)/);
      const isVertical = currentExample.includes('vertical');
      
      if (integerMatch) {
        const integer = parseInt(integerMatch[1]);
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Example: {currentExample}</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-lg text-gray-600">Graph {integer} on a {isVertical ? 'vertical' : 'horizontal'} number line:</div>
                  
                  {/* Number line visualization */}
                  <div className="mt-6">
                    {isVertical ? (
                      // Vertical number line
                      (<div className="flex justify-center">
                        <div className="flex flex-col items-center space-y-2">
                          {Array.from({ length: 11 }, (_, i) => {
                            const value = 5 - i; // Top to bottom: 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5
                            const isTarget = value === integer;
                            const isZero = value === 0;
                            return (
                              <div key={i} className="flex items-center space-x-2">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  isTarget ? 'bg-red-500 border-red-700' : 
                                  isZero ? 'bg-green-500 border-green-700' : 
                                  'bg-gray-300 border-gray-400'
                                }`}></div>
                                <div className={`text-xs ${isTarget ? 'font-bold text-red-600' : ''}`}>
                                  {value}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>)
                    ) : (
                      // Horizontal number line
                      (<div className="flex justify-center items-center space-x-2">
                        {Array.from({ length: 11 }, (_, i) => {
                          const value = i - 5;
                          const isTarget = value === integer;
                          const isZero = value === 0;
                          return (
                            <div key={i} className="flex flex-col items-center">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                isTarget ? 'bg-red-500 border-red-700' : 
                                isZero ? 'bg-green-500 border-green-700' : 
                                'bg-gray-300 border-gray-400'
                              }`}></div>
                              <div className={`text-xs mt-1 ${isTarget ? 'font-bold text-red-600' : ''}`}>
                                {value}
                              </div>
                            </div>
                          );
                        })}
                      </div>)
                    )}
                  </div>
                  
                  <div className="text-xl text-blue-600 font-semibold">
                    {integer} is plotted {isVertical ? (integer > 0 ? 'above' : 'below') : (integer > 0 ? 'to the right of' : 'to the left of')} zero
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    } else if (lesson.title.includes('Understanding opposite integers')) {
      // 6.NS.2.a - Understanding opposite integers
      const integerMatch = currentExample.match(/(-?\d+)/);
      const oppositeMatch = currentExample.match(/opposite of (-?\d+) is (-?\d+)/);
      
      if (oppositeMatch) {
        const original = parseInt(oppositeMatch[1]);
        const opposite = parseInt(oppositeMatch[2]);
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Example: {currentExample}</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-lg text-gray-600">Understanding Opposite Integers:</div>
                  
                  {/* Number line visualization */}
                  <div className="mt-6">
                    <div className="text-lg text-gray-600 mb-2">Number Line:</div>
                    <div className="flex justify-center items-center space-x-2">
                      {Array.from({ length: 11 }, (_, i) => {
                        const value = i - 5;
                        const isOriginal = value === original;
                        const isOpposite = value === opposite;
                        const isZero = value === 0;
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              isOriginal ? 'bg-blue-500 border-blue-700' : 
                              isOpposite ? 'bg-purple-500 border-purple-700' : 
                              isZero ? 'bg-green-500 border-green-700' : 
                              'bg-gray-300 border-gray-400'
                            }`}></div>
                            <div className={`text-xs mt-1 ${
                              isOriginal ? 'font-bold text-blue-600' : 
                              isOpposite ? 'font-bold text-purple-600' : ''
                            }`}>
                              {value}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-lg text-blue-600 font-semibold">
                      Original: {original}
                    </div>
                    <div className="text-lg text-purple-600 font-semibold">
                      Opposite: {opposite}
                    </div>
                    <div className="text-sm text-gray-600">
                      Both are the same distance from zero, but on opposite sides
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    } else if (explanation.includes('grid') && lesson.title.includes('What percentage is illustrated')) {
      // 6.NS.1.a - Grid percentage identification
      const match = currentExample.match(/(\d+)\s+shaded/);
      const shadedCount = match ? parseInt(match[1]) : 80;
      
      return (
        <div className="text-center mb-4">
          <p className="text-green-100 mb-2">Look at this grid</p>
          <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
            <div className="grid grid-cols-10 gap-0 w-64 h-64 border-2 border-gray-400">
              {Array.from({ length: 100 }, (_, i) => (
                <div
                  key={i}
                  className={`border-r border-b border-gray-300 ${
                    i < shadedCount ? 'bg-blue-600' : 'bg-white'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-green-100 text-sm mt-2">{shadedCount} out of 100 parts shaded</p>
        </div>
      );
    } else if (explanation.includes('grid') && lesson.title.includes('Convert fractions to percents')) {
      // 6.NS.1.c - Fraction to percent conversion with grid
      const fractionMatch = currentExample.match(/(\d+)\/(\d+)/);
      const percentMatch = currentExample.match(/(\d+(?:\.\d+)?)%/);
      
      if (fractionMatch && percentMatch) {
        const numerator = parseInt(fractionMatch[1]);
        const denominator = parseInt(fractionMatch[2]);
        const percentage = parseFloat(percentMatch[1]);
        const shadedCount = Math.round(percentage);
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Convert {numerator}/{denominator} to a percent using the grid</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="grid grid-cols-10 gap-0 w-64 h-64 border-2 border-gray-400">
                {Array.from({ length: 100 }, (_, i) => (
                  <div
                    key={i}
                    className={`border-r border-b border-gray-300 ${
                      i < shadedCount ? 'bg-blue-600' : 'bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">{numerator}/{denominator} = {shadedCount} out of 100 parts shaded</p>
          </div>
        );
      }
    } else if (explanation.includes('number line') || lesson.title.includes('Convert between percents and decimals')) {
      // 6.NS.1.b - Number line visualization for percent/decimal conversion
      const percentMatch = currentExample.match(/(\d+(?:\.\d+)?)%/);
      const decimalMatch = currentExample.match(/(\d+\.\d+)/);
      
      if (percentMatch && decimalMatch) {
        const percentage = parseFloat(percentMatch[1]);
        const decimal = parseFloat(decimalMatch[1]);
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Convert between percent and decimal</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="relative w-96 h-16 border-2 border-gray-400 rounded bg-white">
                {/* Number line */}
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="flex justify-between items-center h-full px-2">
                    <span className="text-xs text-gray-600">0</span>
                    <span className="text-xs text-gray-600">0.25</span>
                    <span className="text-xs text-gray-600">0.5</span>
                    <span className="text-xs text-gray-600">0.75</span>
                    <span className="text-xs text-gray-600">1.0</span>
                  </div>
                  {/* Decimal position marker */}
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full"
                    style={{ left: `${decimal * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-gray-800 text-sm">Decimal: {decimal}</p>
                <p className="text-gray-800 text-sm">Percent: {percentage}%</p>
              </div>
            </div>
          </div>
        );
      }
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
      // 6.NS.1.d - Fraction simplification visualization
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
      return (
        <InteractivePracticeRenderer
          subLesson={lesson}
          subLessonIndex={currentIndex}
          onRequestHelp={(question, context) => {
            // Show popup first, then make AI request
            setAiHelpData({ question, context });
            setShowAiHelpPopup(true);
            
            // Use the existing AI help request logic
            requestAiHelp(lesson.id, extractCorrectAnswer(lesson, currentExample));
          }}
          onActivityComplete={(index) => {
            // Mark lesson as completed
            const inputKey = `lesson-${lesson.id}`;
            setShowFeedback({...showFeedback, [inputKey]: 'completed'});
            
            // Move to next example if available
            if (currentIndex < examples.length - 1) {
              setCurrentExampleIndex({...currentExampleIndex, [lesson.id]: currentIndex + 1});
            }
          }}
        />
      );


    } else if (lesson.title.includes('Graph integers on horizontal and vertical number lines')) {
      // 6.NS.2.a - Graphing integers on number lines
      const integerMatch = currentExample.match(/(-?\d+)/);
      const directionMatch = currentExample.match(/(horizontal|vertical)/i);
      
      if (integerMatch) {
        const integer = integerMatch[1];
        const isVertical = directionMatch && directionMatch[1].toLowerCase() === 'vertical';
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Graph {integer} on a {isVertical ? 'vertical' : 'horizontal'} number line</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">Graph: {integer}</div>
                  {isVertical ? (
                    // Vertical number line
                    (<div className="flex justify-center">
                      <div className="flex flex-col items-center space-y-2">
                        {Array.from({ length: 7 }, (_, i) => {
                          const value = 3 - i;
                          const isTarget = value === parseInt(integer);
                          return (
                            <div key={i} className="flex items-center space-x-2">
                              <div className="text-xs w-6 text-right">{value}</div>
                              <div className={`w-4 h-4 rounded-full ${isTarget ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                              <div className="w-8 h-0.5 bg-gray-400"></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>)
                  ) : (
                    // Horizontal number line
                    (<div className="flex justify-center items-center space-x-2">
                      {Array.from({ length: 7 }, (_, i) => {
                        const value = i - 3;
                        const isTarget = value === parseInt(integer);
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full ${isTarget ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                            <div className="text-xs mt-1">{value}</div>
                          </div>
                        );
                      })}
                    </div>)
                  )}
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Mark the integer on the number line</p>
          </div>
        );
      }
    } else if (lesson.title.includes('Understanding opposite integers')) {
      // 6.NS.2.a - Opposite integers
      const integerMatch = currentExample.match(/(-?\d+)/);
      
      if (integerMatch) {
        const integer = parseInt(integerMatch[1]);
        const opposite = -integer;
        
        return (
          <div className="text-center mb-4">
            <p className="text-green-100 mb-2">Find the opposite of {integer}</p>
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-gray-800">Opposite of {integer}</div>
                  <div className="text-lg text-gray-600">↓</div>
                  <div className="text-2xl text-blue-600 font-semibold">{opposite}</div>
                  {/* Number line showing opposites */}
                  <div className="mt-4">
                    <div className="flex justify-center items-center space-x-1">
                      {Array.from({ length: 11 }, (_, i) => {
                        const value = i - 5;
                        const isOriginal = value === integer;
                        const isOpposite = value === opposite;
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              isOriginal ? 'bg-blue-500' : isOpposite ? 'bg-red-500' : 'bg-gray-400'
                            }`}></div>
                            <div className="text-xs mt-1">{value}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="text-blue-600">■</span> Original: {integer} | 
                      <span className="text-red-600">■</span> Opposite: {opposite}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Opposites are equidistant from zero</p>
          </div>
        );
      }
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
            <div className="p-6 rounded-lg inline-block bg-gradient-to-br from-gray-600 to-gray-800">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg border-2 border-gray-400">
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
            requestAiHelp(lesson.id, getCorrectAnswer(lesson, currentIndex));
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
            requestAiHelp(lesson.id, getCorrectAnswer(lesson, currentIndex));
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
      // Fallback for lessons without specific interactive components
      
      return (
        <div className="text-center mb-4">
          <button className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 hover:bg-gray-200">
            Start Interactive Activity
          </button>
        </div>
      );
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
              {/* Calculate total examples across all lessons */}
              {(() => {
                const totalExamples = lessons.reduce((total, lesson) => {
                  return total + (lesson.examples?.length || 3);
                }, 0);
                
                const totalCompleted = lessons.reduce((total, lesson) => {
                  const lessonIndex = currentExampleIndex[lesson.id] || 0;
                  const maxExamples = lesson.examples?.length || 3;
                  const isCompleted = showFeedback[`lesson-${lesson.id}`] === 'completed';
                  return total + (isCompleted ? maxExamples : lessonIndex + (lessonIndex > 0 ? 1 : 0));
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
                return total + (isCompleted ? maxExamples : lessonIndex + (lessonIndex > 0 ? 1 : 0));
              }, 0)} / {lessons.reduce((total, lesson) => total + (lesson.examples?.length || 3), 0)} completed
            </span>
          </div>
        </div>

        {/* Render each lesson as cards */}
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className="mb-8">
            {/* Lesson Card */}
            <div className="bg-gray-800/90 border border-gray-400/30 rounded-xl p-6 shadow-lg">
              {/* Enhanced color-coded badge based on lesson type */}
              <div className="mb-4">
                <span className={`text-white px-3 py-1 rounded text-sm font-medium ${
                  lesson.title.includes('Convert') ? 'bg-blue-600' :
                  lesson.title.includes('percentage') || lesson.title.includes('percent') ? 'bg-green-600' :
                  lesson.title.includes('fraction') ? 'bg-purple-600' :
                  lesson.title.includes('decimal') ? 'bg-orange-600' :
                  lesson.title.includes('Write') || lesson.title.includes('simplify') ? 'bg-red-600' :
                  lesson.title.includes('mixed number') ? 'bg-indigo-600' :
                  lesson.title.includes('word problem') ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}>
                  {lesson.code}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-white mb-6 text-shadow">{lesson.title}</h2>

              {/* Explanation Card */}
              <div className="mb-6">
                <p className="text-definition mb-3 font-bold text-lg text-shadow-sm">Explanation:</p>
                <div className="bg-gray-700/80 border border-gray-300/20 rounded-lg p-4 shadow-md">
                  <p className="text-gray-200 leading-relaxed">{lesson.explanation || lesson.description}</p>
                </div>
              </div>

              {/* Interactive Practice Card */}
              <div className="mb-6">
                <p className="text-instruction font-bold text-lg mb-3 text-shadow-sm">Interactive Practice:</p>
                <div className="border border-gray-300/25 p-2 rounded-lg bg-gray-600/80 shadow-lg">
                  <div className="bg-gray-700/90 border border-green-600/50 p-6 rounded-lg relative">
                <h4 className="text-white text-xl font-bold mb-2 text-shadow">{lesson.title}</h4>
                <p className="text-green-100 mb-4">
                  {lesson.explanation?.includes('grid') && lesson.title.includes('What percentage is illustrated') ? 'What percentage of this grid is shaded?' : 
                   lesson.explanation?.includes('grid') && lesson.title.includes('Convert fractions to percents') ? 'What percent does this fraction equal?' :
                   lesson.explanation?.includes('strip') ? 'What percentage of this strip is shaded?' : 
                   lesson.title.includes('Convert between percents and decimals') ? 'What is the equivalent value?' :
                   'Complete the interactive activity'}
                </p>
                
                {renderInteractiveContent(lesson)}
                
                {/* Success Animation */}
                <SuccessAnimation
                  isVisible={showAnimation[`lesson-${lesson.id}`] || false}
                  animationType={animationType[`lesson-${lesson.id}`] || 'smiley'}
                  onComplete={() => handleAnimationComplete(lesson.id)}
                />
                
                {/* Only show input box for lessons that don't have interactive components */}
                {!lesson.title.includes('Understanding integers') && !lesson.title.includes('Integers on number lines') && !lesson.title.includes('Graph integers') && !lesson.title.includes('opposite integers') && (
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="text"
                        placeholder={getInputPlaceholder(lesson)}
                        className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300"
                        value={inputValues[`lesson-${lesson.id}`] || ''}
                        onChange={(e) => setInputValues({...inputValues, [`lesson-${lesson.id}`]: e.target.value})}
                      />
                      <button 
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => handleSubmit(lesson.id, getCorrectAnswer(lesson, currentExampleIndex[lesson.id] || 0))}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
                  
                {/* Feedback */}
                {showFeedback[`lesson-${lesson.id}`] === 'correct' && (
                  <p className="text-green-300 text-sm mt-2">✓ Correct! Moving to next example...</p>
                )}
                {showFeedback[`lesson-${lesson.id}`]?.startsWith('incorrect-') && (
                  <div className="text-center mt-2">
                    <p className="bg-red-500 border border-red-300 text-black px-4 py-2 rounded inline-block text-[17px] font-medium ml-[0px] mr-[0px] pl-[18px] pr-[18px] pt-[9px] pb-[9px] mt-[8px] mb-[8px]">
                      Not quite. Look carefully at the shaded area. Try again! <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs ml-1">(Attempt {attemptCounts[`lesson-${lesson.id}`] || 1} of 3)</span>
                    </p>
                  </div>
                )}
                {showFeedback[`lesson-${lesson.id}`] === 'ai-help-requested' && (
                  <div className="text-center mt-2">
                    <p className="bg-red-500 border border-red-300 text-black px-4 py-2 rounded inline-block text-[17px] font-medium pt-[9px] pb-[9px] mt-[7px] mb-[7px]">
                      I've asked the AI tutor for help with this problem. Check the AI Math Tutor panel for a detailed explanation.
                    </p>
                  </div>
                )}
                {showFeedback[`lesson-${lesson.id}`] === 'completed' && (
                  <p className="text-yellow-300 mt-2 text-[19px]">🎉 All examples completed!</p>
                )}
                
                <div className="text-center">
                  <p className="text-green-200 text-sm">
                    Example {(currentExampleIndex[lesson.id] || 0) + 1} of {lesson.examples?.length || 3}
                  </p>
                </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* AI Help Popup */}
      {showAiHelpPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-lg border border-blue-500/50 shadow-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-200 font-medium">AI is thinking...</span>
              </div>
              <div className="flex items-center justify-center space-x-1 mb-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
              </div>
              <p className="text-blue-200 mb-4">
                The AI Math Tutor is analyzing your problem and preparing a detailed explanation...
              </p>
              {aiHelpData && (
                <div className="text-left bg-gray-800/50 p-3 rounded border border-gray-600">
                  <p className="font-medium text-blue-200">Problem:</p>
                  <p className="text-gray-300">{aiHelpData.question}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
