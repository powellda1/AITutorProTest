import { NumberLineMode, NumberLineOrientation } from '../components/NumberLineComponent';

export interface ProcessedLessonContent {
  interactiveText: string;
  correctAnswer: number;
  componentType: 'number-line';
  mode: NumberLineMode;
  orientation: NumberLineOrientation;
  range: [number, number];
  preMarkedPositions?: number[];
  additionalData?: any;
}

export interface LessonAnalysis {
  type: 'real-world-context' | 'point-identification' | 'plot-integers' | 'opposite-integers' | 'default';
  requiresInteraction: boolean;
  componentType: 'number-line' | 'text-input' | 'default';
}

/**
 * Analyzes lesson explanation and title to determine the appropriate interaction type
 */
export function analyzeLessonType(explanation: string, title: string): LessonAnalysis {
  const explanationLower = explanation.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // Real-world context representation
  if (explanationLower.includes('represent') && explanationLower.includes('real-world') && explanationLower.includes('contexts')) {
    return {
      type: 'real-world-context',
      requiresInteraction: true,
      componentType: 'number-line'
    };
  }
  
  // Point identification on number line
  if (explanationLower.includes('identify') && explanationLower.includes('point') && explanationLower.includes('marked')) {
    return {
      type: 'point-identification',
      requiresInteraction: true,
      componentType: 'number-line'
    };
  }
  
  // Plotting integers on number line
  if (explanationLower.includes('plot') && explanationLower.includes('integers')) {
    return {
      type: 'plot-integers',
      requiresInteraction: true,
      componentType: 'number-line'
    };
  }
  
  // Opposite integers
  if (explanationLower.includes('opposite') && explanationLower.includes('integer')) {
    return {
      type: 'opposite-integers',
      requiresInteraction: true,
      componentType: 'number-line'
    };
  }
  
  return {
    type: 'default',
    requiresInteraction: false,
    componentType: 'default'
  };
}

/**
 * Processes lesson content to create interactive prompts and extract answers
 */
export function processLessonContent(
  originalExample: string, 
  explanation: string, 
  lessonAnalysis: LessonAnalysis
): ProcessedLessonContent | null {
  
  if (!lessonAnalysis.requiresInteraction) {
    return null;
  }
  
  switch (lessonAnalysis.type) {
    case 'real-world-context':
      return processRealWorldContext(originalExample);
      
    case 'point-identification':
      return processPointIdentification(originalExample);
      
    case 'plot-integers':
      return processPlotIntegers(originalExample);
      
    case 'opposite-integers':
      return processOppositeIntegers(originalExample);
      
    default:
      return null;
  }
}

/**
 * Process real-world context examples (e.g., temperature, debt, gain)
 */
function processRealWorldContext(originalExample: string): ProcessedLessonContent {
  const integerMatch = originalExample.match(/(-?\d+)/);
  
  if (!integerMatch) {
    throw new Error(`Could not extract integer from: ${originalExample}`);
  }
  
  let correctAnswer = parseInt(integerMatch[1]);
  
  // Handle context-specific sign interpretation
  if (originalExample.includes('debt')) {
    correctAnswer = -Math.abs(correctAnswer);
  } else if (originalExample.includes('gain')) {
    correctAnswer = Math.abs(correctAnswer);
  }
  
  // Generate interactive prompt
  let interactiveText = '';
  if (originalExample.includes('gain')) {
    interactiveText = `A gain of ${Math.abs(correctAnswer)} points is needed, click the number line below to answer.`;
  } else if (originalExample.includes('debt')) {
    interactiveText = `A debt of $${Math.abs(correctAnswer)} is owed, click the number line below to answer.`;
  } else if (originalExample.includes('temperature')) {
    interactiveText = `A temperature of ${correctAnswer}°C is recorded, click the number line below to answer.`;
  } else {
    interactiveText = `${originalExample.split(',')[0]}, click the number line below to answer.`;
  }
  
  return {
    interactiveText,
    correctAnswer,
    componentType: 'number-line',
    mode: 'clickable',
    orientation: 'horizontal',
    range: [-10, 10]
  };
}

/**
 * Process point identification examples (e.g., "A point at -4 represents...")
 */
function processPointIdentification(originalExample: string): ProcessedLessonContent {
  const integerMatch = originalExample.match(/(-?\d+)/);
  
  if (!integerMatch) {
    throw new Error(`Could not extract integer from: ${originalExample}`);
  }
  
  const correctAnswer = parseInt(integerMatch[1]);
  const interactiveText = `What integer does this point represent?`;
  
  return {
    interactiveText,
    correctAnswer,
    componentType: 'number-line',
    mode: 'marked-with-input',
    orientation: 'horizontal',
    range: [-10, 10],
    preMarkedPositions: [correctAnswer]
  };
}

/**
 * Process plotting integers examples (e.g., "Graph -5 on a horizontal number line")
 */
function processPlotIntegers(originalExample: string): ProcessedLessonContent {
  const integerMatch = originalExample.match(/(-?\d+)/);
  
  if (!integerMatch) {
    throw new Error(`Could not extract integer from: ${originalExample}`);
  }
  
  const correctAnswer = parseInt(integerMatch[1]);
  const isVertical = originalExample.toLowerCase().includes('vertical');
  
  const interactiveText = `Click on the number line to graph ${correctAnswer}.`;
  
  return {
    interactiveText,
    correctAnswer,
    componentType: 'number-line',
    mode: 'plot-point',
    orientation: isVertical ? 'vertical' : 'horizontal',
    range: [-10, 10]
  };
}

/**
 * Process opposite integers examples (e.g., "The opposite of 4 is -4")
 */
function processOppositeIntegers(originalExample: string): ProcessedLessonContent {
  const integerMatch = originalExample.match(/(-?\d+)/);
  
  if (!integerMatch) {
    throw new Error(`Could not extract integer from: ${originalExample}`);
  }
  
  const givenNumber = parseInt(integerMatch[1]);
  const correctAnswer = -givenNumber;
  
  const interactiveText = `What is the opposite of ${givenNumber}?`;
  
  return {
    interactiveText,
    correctAnswer,
    componentType: 'number-line',
    mode: 'show-opposite',
    orientation: 'horizontal',
    range: [Math.min(-Math.abs(givenNumber) - 5, -10), Math.max(Math.abs(givenNumber) + 5, 10)],
    preMarkedPositions: [givenNumber]
  };
}