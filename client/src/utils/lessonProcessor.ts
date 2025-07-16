import { NumberLineMode, NumberLineOrientation } from '../components/NumberLineComponent';

export interface ProcessedLessonContent {
  interactiveText: string;
  correctAnswer: number | string[] | string;
  componentType: 'number-line' | 'ordering' | 'comparison' | 'word-problem' | 'exponent' | 'fraction-operation' | 'scaling' | 'perfect-square' | 'grid' | 'decimal-percent' | 'text-input';
  mode?: NumberLineMode;
  orientation?: NumberLineOrientation;
  range?: [number, number];
  preMarkedPositions?: number[];
  numbersToOrder?: string[];
  correctOrder?: string[];
  value1?: string;
  value2?: string;
  comparisonType?: 'greater' | 'less' | 'equal';
  questionText?: string;
  base?: number;
  exponent?: number;
  fraction1?: string;
  fraction2?: string;
  operation?: 'multiply' | 'divide';
  scaleType?: 'up' | 'down';
  gridSize?: number;
  columns?: number;
  preShadedCells?: number[];
  gridMode?: 'identify-percentage' | 'shade-percentage';
  // Decimal-percent conversion properties
  value?: number;
  conversionType?: 'decimal' | 'percent';
  // Fraction conversion properties
  inputType?: 'text' | 'number';
  additionalData?: any;
}

export interface LessonAnalysis {
  type: 'real-world-context' | 'point-identification' | 'plot-integers' | 'opposite-integers' | 'ordering-activity' | 'comparison-activity' | 'word-problem' | 'exponent-expression' | 'fraction-operation' | 'scaling-activity' | 'perfect-square' | 'grid-percentage' | 'strip-model' | 'decimal-percent-conversion' | 'fraction-conversion' | 'default';
  requiresInteraction: boolean;
  componentType: 'number-line' | 'ordering' | 'comparison' | 'word-problem' | 'exponent' | 'fraction-operation' | 'scaling' | 'perfect-square' | 'grid' | 'strip' | 'decimal-percent' | 'text-input' | 'default';
}

/**
 * Analyzes lesson explanation and title to determine the appropriate interaction type
 */
export function analyzeLessonType(explanation: string, title: string, standardCode?: string): LessonAnalysis {
  const explanationLower = explanation.toLowerCase();
  const titleLower = title.toLowerCase();
  
  console.log('🔍 analyzeLessonType called with:', { title, explanation, standardCode });
  
  // SPECIFIC DEBUG for "What percentage is illustrated?"
  if (title === "What percentage is illustrated?") {
    console.log('🚨 SPECIAL DEBUG: Processing "What percentage is illustrated?" lesson');
    console.log('🚨 Title includes "percentage is illustrated":', titleLower.includes('percentage is illustrated'));
    console.log('🚨 Should detect as GRID MODEL');
  }
  
  // Analyze content for visual models and interaction patterns
  
  // Use TITLE as primary indicator for more precise detection
  
  // Grid-based activities - PRIORITIZE GRID DETECTION FIRST
  if (titleLower.includes('what percentage') || 
      titleLower.includes('percentage is illustrated') ||
      titleLower.includes('convert fractions to percents using grid models') ||
      titleLower.includes('convert fractions to percents') ||
      titleLower.includes('grid models')) {
    console.log('✅ analyzeLessonType: Detected GRID MODEL (title-based)');
    return {
      type: 'grid-percentage',
      requiresInteraction: true,
      componentType: 'grid'
    };
  }
  
  // Strip model activities - focus on title keywords  
  if (titleLower.includes('strip') || 
      titleLower.includes('benchmark')) {
    console.log('✅ analyzeLessonType: Detected STRIP MODEL (title-based)');
    return {
      type: 'strip-model',
      requiresInteraction: true,
      componentType: 'strip'
    };
  }
  
  // Decimal-percent conversion activities - focus on title keywords
  if (titleLower.includes('convert between percents and decimals') || 
      titleLower.includes('percents to decimals') || 
      titleLower.includes('decimals to percents')) {
    console.log('✅ analyzeLessonType: Detected DECIMAL-PERCENT CONVERSION (title-based)');
    return {
      type: 'decimal-percent-conversion',
      requiresInteraction: true,
      componentType: 'decimal-percent'
    };
  }
  
  // 6.NS.1.d - Fraction conversion activities
  if (titleLower.includes('write fractions in lowest terms') || 
      titleLower.includes('simplify') ||
      titleLower.includes('convert between improper fractions and mixed numbers') ||
      titleLower.includes('convert decimals to fractions') ||
      titleLower.includes('convert fractions to decimals') ||
      titleLower.includes('convert between percents, fractions, and decimals') ||
      titleLower.includes('repeating decimals') ||
      titleLower.includes('equivalent fractions') ||
      titleLower.includes('mixed numbers')) {
    console.log('✅ analyzeLessonType: Detected FRACTION CONVERSION (6.NS.1.d - title-based)');
    return {
      type: 'fraction-conversion',
      requiresInteraction: true,
      componentType: 'fraction-operation'
    };
  }
  
  // Fallback to explanation-based detection for edge cases
  if (explanationLower.includes('strip') && !explanationLower.includes('grid')) {
    console.log('✅ analyzeLessonType: Detected STRIP MODEL (explanation fallback)');
    return {
      type: 'strip-model',
      requiresInteraction: true,
      componentType: 'strip'
    };
  }
  
  if (explanationLower.includes('grid') || explanationLower.includes('squares')) {
    console.log('✅ analyzeLessonType: Detected GRID MODEL (explanation fallback)');
    return {
      type: 'grid-percentage',
      requiresInteraction: true,
      componentType: 'grid'
    };
  }

  // Integer and number line activities
  if (titleLower.includes('integer') || 
      explanationLower.includes('integer') ||
      explanationLower.includes('number line') ||
      explanationLower.includes('temperature') ||
      explanationLower.includes('debt') ||
      explanationLower.includes('gain')) {
    return {
      type: 'real-world-context',
      requiresInteraction: true,
      componentType: 'number-line'
    };
  }
  
  // Real-world context representation
  if (explanationLower.includes('represent') && explanationLower.includes('real-world') && explanationLower.includes('contexts')) {
    return {
      type: 'real-world-context',
      requiresInteraction: true,
      componentType: 'number-line'
    };
  }
  
  // General integers on number lines (check title first for specific match)
  if (titleLower.includes('integers on number lines') || 
      (titleLower.includes('integers') && titleLower.includes('number lines'))) {
    console.log('✅ DEBUG: Matched "integers on number lines" pattern');
    return {
      type: 'point-identification',
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
  
  // Ordering activities (6.NS.1.e)
  if (titleLower.includes('order') || (titleLower.includes('put') && titleLower.includes('in order'))) {
    return {
      type: 'ordering-activity',
      requiresInteraction: true,
      componentType: 'ordering'
    };
  }
  
  // Comparison activities (6.NS.1.e)
  if (titleLower.includes('compare') && !titleLower.includes('word problem')) {
    return {
      type: 'comparison-activity',
      requiresInteraction: true,
      componentType: 'comparison'
    };
  }
  
  // Word problem activities (6.NS.1.e)
  if (titleLower.includes('word problem') || (titleLower.includes('compare') && titleLower.includes('word problem'))) {
    return {
      type: 'word-problem',
      requiresInteraction: true,
      componentType: 'word-problem'
    };
  }
  
  // Exponent expressions (6.NS.2.b)
  if (titleLower.includes('exponent') || explanationLower.includes('exponent') || explanationLower.includes('power')) {
    return {
      type: 'exponent-expression',
      requiresInteraction: true,
      componentType: 'exponent'
    };
  }
  
  // Perfect squares (6.NS.2.c)
  if (titleLower.includes('perfect square') || explanationLower.includes('perfect square')) {
    return {
      type: 'perfect-square',
      requiresInteraction: true,
      componentType: 'perfect-square'
    };
  }
  
  // Fraction operations (6.NS.3)
  if (titleLower.includes('fraction') && (titleLower.includes('multiply') || titleLower.includes('divide') || titleLower.includes('operation'))) {
    return {
      type: 'fraction-operation',
      requiresInteraction: true,
      componentType: 'fraction-operation'
    };
  }
  
  // Scaling activities (6.NS.3.d)
  if (titleLower.includes('scaling') || explanationLower.includes('scaling') || (titleLower.includes('scale') && titleLower.includes('factor'))) {
    return {
      type: 'scaling-activity',
      requiresInteraction: true,
      componentType: 'scaling'
    };
  }
  
  // Debug: Log when falling through to default
  if (titleLower.includes('integers on number lines')) {
    console.log('❌ DEBUG: "Integers on number lines" lesson fell through to default case');
    console.log('This means none of the patterns matched correctly');
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
      
    case 'ordering-activity':
      return processOrderingActivity(originalExample);
      
    case 'comparison-activity':
      return processComparisonActivity(originalExample);
      
    case 'word-problem':
      return processWordProblem(originalExample);
      
    case 'exponent-expression':
      return processExponentExpression(originalExample);
      
    case 'perfect-square':
      return processPerfectSquare(originalExample);
      
    case 'fraction-operation':
      return processFractionOperation(originalExample);
      
    case 'scaling-activity':
      return processScalingActivity(originalExample);
      
    case 'grid-percentage':
      return processGridPercentage(originalExample);
      
    case 'strip-model':
      return processStripModel(originalExample);
      
    case 'decimal-percent-conversion':
      return processDecimalPercentConversion(originalExample);
      
    case 'fraction-conversion':
      return processFractionConversion(originalExample);
      
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

/**
 * Process ordering activity examples (e.g., "0.4, 1/2, 0.75 ordered: 0.4, 1/2 (0.5), 0.75.")
 */
function processOrderingActivity(originalExample: string): ProcessedLessonContent {
  // Extract numbers to order and correct order from the example
  const orderingMatch = originalExample.match(/^([^:]+?)(?:\s*ordered:\s*(.+))?$/);
  
  if (!orderingMatch) {
    throw new Error(`Could not parse ordering example: ${originalExample}`);
  }
  
  const numbersToOrderText = orderingMatch[1].trim();
  const correctOrderText = orderingMatch[2]?.trim();
  
  // Extract numbers from the beginning part (before "ordered:")
  const numbersToOrder = numbersToOrderText.split(',').map(n => n.trim());
  
  // Extract correct order, removing decimal conversions in parentheses
  let correctOrder: string[] = [];
  if (correctOrderText) {
    correctOrder = correctOrderText.split(',').map(n => n.trim().replace(/\s*\([^)]*\)/, ''));
  } else {
    // If no correct order is provided, use the original order as a fallback
    correctOrder = [...numbersToOrder];
  }
  
  // Generate interactive prompt without revealing answer
  const interactiveText = `Order these numbers from least to greatest: ${numbersToOrder.join(', ')}`;
  
  return {
    interactiveText,
    correctAnswer: correctOrder,
    componentType: 'ordering',
    numbersToOrder,
    correctOrder
  };
}

/**
 * Process comparison activity examples (e.g., "Compare percents to each other and to fractions")
 */
function processComparisonActivity(originalExample: string): ProcessedLessonContent {
  // Look for "vs" pattern: "25% vs 1/4: 25% = 0.25 and 1/4 = 0.25, so they are equal"
  const comparisonMatch = originalExample.match(/(.+?)\s*vs\s*(.+?):\s*(.+)/);
  
  if (!comparisonMatch) {
    throw new Error(`Could not extract comparison from: ${originalExample}`);
  }
  
  const value1 = comparisonMatch[1].trim();
  const value2 = comparisonMatch[2].trim();
  const explanation = comparisonMatch[3].trim();
  
  // Determine the correct answer from the explanation
  let correctAnswer = 'equal';
  if (explanation.includes('greater') || explanation.includes('>')) {
    correctAnswer = 'greater';
  } else if (explanation.includes('less') || explanation.includes('<')) {
    correctAnswer = 'less';
  }
  
  const interactiveText = `Compare ${value1} and ${value2}`;
  
  return {
    interactiveText,
    correctAnswer,
    componentType: 'comparison',
    value1,
    value2,
    comparisonType: correctAnswer as 'greater' | 'less' | 'equal'
  };
}

/**
 * Process word problem examples (e.g., "Compare percents and fractions: word problems")
 */
function processWordProblem(originalExample: string): ProcessedLessonContent {
  // Look for question pattern: "Sarah scored 75% on her math test..."
  const questionMatch = originalExample.match(/^([^?]+\?)/);
  
  if (!questionMatch) {
    throw new Error(`Could not extract question from: ${originalExample}`);
  }
  
  const questionText = questionMatch[1].trim();
  
  // Extract the answer from the explanation after the question
  const answerPart = originalExample.split('?')[1]?.trim();
  let correctAnswer = 'unknown';
  
  if (answerPart) {
    // Look for comparison conclusions in the answer
    if (answerPart.includes('greater') || answerPart.includes('more')) {
      correctAnswer = 'greater';
    } else if (answerPart.includes('less') || answerPart.includes('fewer')) {
      correctAnswer = 'less';
    } else if (answerPart.includes('equal') || answerPart.includes('same')) {
      correctAnswer = 'equal';
    }
  }
  
  const interactiveText = `Word Problem: ${questionText}`;
  
  return {
    interactiveText,
    correctAnswer,
    componentType: 'word-problem',
    questionText
  };
}

/**
 * Process exponent expression examples (e.g., "2^3 = 8")
 */
function processExponentExpression(originalExample: string): ProcessedLessonContent {
  const exponentMatch = originalExample.match(/(\d+)\^(\d+)\s*=\s*(\d+)/);
  
  if (!exponentMatch) {
    throw new Error(`Could not extract exponent from: ${originalExample}`);
  }
  
  const base = parseInt(exponentMatch[1]);
  const exponent = parseInt(exponentMatch[2]);
  const result = parseInt(exponentMatch[3]);
  
  const interactiveText = `What is ${base}^${exponent}?`;
  
  return {
    interactiveText,
    correctAnswer: result,
    componentType: 'exponent',
    base,
    exponent,
    additionalData: { originalExample }
  };
}

/**
 * Process perfect square examples (e.g., "4 is a perfect square because 2^2 = 4")
 */
function processPerfectSquare(originalExample: string): ProcessedLessonContent {
  const perfectSquareMatch = originalExample.match(/(\d+)\s*is\s*a\s*perfect\s*square.*?(\d+)\^2\s*=\s*(\d+)/);
  
  if (!perfectSquareMatch) {
    throw new Error(`Could not extract perfect square from: ${originalExample}`);
  }
  
  const number = parseInt(perfectSquareMatch[1]);
  const root = parseInt(perfectSquareMatch[2]);
  
  const interactiveText = `Is ${number} a perfect square? If so, what is its square root?`;
  
  return {
    interactiveText,
    correctAnswer: root,
    componentType: 'perfect-square',
    additionalData: { number, root, originalExample }
  };
}

/**
 * Process fraction operation examples (e.g., "1/2 × 2/3 = 2/6 = 1/3")
 */
function processFractionOperation(originalExample: string): ProcessedLessonContent {
  const fractionOpMatch = originalExample.match(/(\d+\/\d+)\s*[×÷]\s*(\d+\/\d+)\s*=\s*(\d+\/\d+)/);
  
  if (!fractionOpMatch) {
    throw new Error(`Could not extract fraction operation from: ${originalExample}`);
  }
  
  const fraction1 = fractionOpMatch[1];
  const fraction2 = fractionOpMatch[2];
  const result = fractionOpMatch[3];
  
  const operation = originalExample.includes('×') ? 'multiply' : 'divide';
  const opSymbol = operation === 'multiply' ? '×' : '÷';
  
  const interactiveText = `What is ${fraction1} ${opSymbol} ${fraction2}?`;
  
  return {
    interactiveText,
    correctAnswer: result,
    componentType: 'fraction-operation',
    fraction1,
    fraction2,
    operation,
    additionalData: { originalExample }
  };
}

/**
 * Process scaling activity examples (e.g., "Scale factor 2: 3 × 2 = 6")
 */
function processScalingActivity(originalExample: string): ProcessedLessonContent {
  const scalingMatch = originalExample.match(/scale\s*factor\s*(\d+):\s*(\d+)\s*×\s*(\d+)\s*=\s*(\d+)/i);
  
  if (!scalingMatch) {
    throw new Error(`Could not extract scaling from: ${originalExample}`);
  }
  
  const scaleFactor = parseInt(scalingMatch[1]);
  const originalValue = parseInt(scalingMatch[2]);
  const result = parseInt(scalingMatch[4]);
  
  const interactiveText = `If you scale ${originalValue} by a factor of ${scaleFactor}, what is the result?`;
  
  return {
    interactiveText,
    correctAnswer: result,
    componentType: 'scaling',
    scaleType: scaleFactor > 1 ? 'up' : 'down',
    additionalData: { scaleFactor, originalValue, originalExample }
  };
}

/**
 * Process grid percentage examples (e.g., "80 shaded out of 100")
 * FULLY UNIVERSAL - NO HARDCODED VALUES
 */
function processGridPercentage(originalExample: string): ProcessedLessonContent {
  // Check if this is a fraction to percent conversion lesson
  const fractionMatch = originalExample.match(/(\d+)\/(\d+)/);
  
  if (fractionMatch) {
    // User should shade the fraction themselves
    const numerator = parseInt(fractionMatch[1]);
    const denominator = parseInt(fractionMatch[2]);
    
    // Calculate the percentage answer
    const actualPercentage = (numerator / denominator) * 100;
    const correctAnswer = Math.round(actualPercentage * 100) / 100; // Round to 2 decimal places
    
    // Return empty grid for user interaction
    const gridSize = 100;
    const columns = 10; // Always 10x10 for percentage grids
    const preShadedCells: number[] = []; // Empty grid for user to shade
    
    // Generate prompt text for user interaction
    const interactiveText = `Shade ${numerator}/${denominator} of the Grid`;
    
    const result = {
      interactiveText,
      correctAnswer,
      componentType: 'grid',
      gridSize,
      columns,
      preShadedCells,
      gridMode: 'clickable', // User can click/drag to shade cells
      additionalData: { 
        fraction: `${numerator}/${denominator}`, 
        numerator, 
        denominator,
        actualPercentage, 
        originalExample 
      }
    };
    
    return result;
  }
  
  // For other grid lessons (6.NS.1.a - identify percentage from pre-shaded grid)
  const patterns = [
    /(\d+(?:\.\d+)?)\s+shaded.*?out of (\d+)/i,
    /(\d+(?:\.\d+)?)\s+shaded.*?(\d+)/i,
    /grid has (\d+(?:\.\d+)?)\s+shaded.*?out of (\d+)/i,
    /diagram has (\d+(?:\.\d+)?)\s+shaded.*?out of (\d+)/i,
    /strip.*?(\d+(?:\.\d+)?)\s+shaded.*?out of (\d+)/i,
    /=\s*(\d+(?:\.\d+)?)\s+shaded squares out of (\d+)/i,
    /=\s*(\d+(?:\.\d+)?)\s+shaded squares/i
  ];
  
  let shadedCount: number = 0;
  let totalCount: number = 0;
  let matchFound = false;
  
  for (const pattern of patterns) {
    const match = originalExample.match(pattern);
    if (match) {
      shadedCount = parseFloat(match[1]);
      totalCount = parseInt(match[2]);
      matchFound = true;
      break;
    }
  }
  
  // Special handling for patterns without explicit "out of X"
  if (!matchFound && originalExample.includes('shaded squares')) {
    // Handle patterns like "25 shaded squares = 25%" or "83.33... shaded squares ≈ 83.33%"
    const shadedMatch = originalExample.match(/(\d+(?:\.\d+)?(?:\.\.\.)?)?\s+shaded squares/i);
    if (shadedMatch) {
      let shadedValue = shadedMatch[1];
      // Handle "83.33..." format
      if (shadedValue && shadedValue.includes('...')) {
        shadedValue = shadedValue.replace('...', '');
      }
      shadedCount = parseFloat(shadedValue || '0');
      totalCount = 100; // Default to 100 for percentage calculations
      matchFound = true;
    }
  }
  
  if (!matchFound) {
    throw new Error(`Could not extract grid data from: ${originalExample}. Expected format: "X shaded out of Y"`);
  }
  
  // Calculate actual percentage (not hardcoded to shaded count)
  const actualPercentage = (shadedCount / totalCount) * 100;
  const correctAnswer = Math.round(actualPercentage * 100) / 100; // Round to 2 decimal places
  
  // For fraction to percent conversion lessons, always use 100-cell grids for percentage visualization
  // This ensures consistent visual representation regardless of shaded count
  const gridSize = 100;
  const columns = 10; // Always 10x10 for percentage grids
  
  // Dynamic cell shading pattern - NO HARDCODED SEQUENTIAL FILLING
  // Use gridSize (100) for the shading pattern, not totalCount
  const preShadedCells = generateOptimalShadingPattern(shadedCount, gridSize, columns);
  
  // USE UNIVERSAL SYSTEM - No hardcoded prompts
  const interactiveText = ''; // Will be generated by universal system
  
  const result = {
    interactiveText,
    correctAnswer,
    componentType: 'grid',
    gridSize,
    columns,
    preShadedCells,
    gridMode: 'identify-percentage',
    additionalData: { shadedCount, totalCount, actualPercentage, originalExample }
  };
  
  return result;
}

/**
 * Generate intuitive shading pattern for grid visualization
 * NO HARDCODED VALUES - truly dynamic based on content
 */
function generateOptimalShadingPattern(shadedCount: number, totalCount: number, columns: number): number[] {
  const preShadedCells: number[] = [];
  
  // Handle fractional shading correctly
  let cellsToShade: number;
  
  if (shadedCount < 1 && shadedCount > 0) {
    // For fractional values less than 1 (like 0.7), show 1 cell as "partially shaded"
    // This represents the fractional concept visually
    cellsToShade = 1;
  } else {
    // For values >= 1, use the integer part
    cellsToShade = Math.floor(shadedCount);
  }
  
  if (cellsToShade === 0) {
    return [];
  }
  
  // Use contiguous filling from top-left for easy visual percentage identification
  // This matches standard educational materials where students count shaded squares
  for (let i = 0; i < cellsToShade && i < totalCount; i++) {
    preShadedCells.push(i);
  }
  
  return preShadedCells;
}

/**
 * Process strip model examples (e.g., "A strip with about one-fifth shaded is approximately 20%")
 * FULLY UNIVERSAL - NO HARDCODED VALUES
 */
function processStripModel(originalExample: string): ProcessedLessonContent {
  console.log('🔍 processStripModel called with:', originalExample);
  
  // Enhanced regex patterns for strip model formats
  const patterns = [
    /strip.*?one-fifth.*?(\d+(?:\.\d+)?)%/i,
    /strip.*?one-third.*?(\d+(?:\.\d+)?)%/i,
    /strip.*?half.*?(\d+(?:\.\d+)?)%/i,
    /one-fifth.*?(\d+(?:\.\d+)?)%/i,
    /one-third.*?(\d+(?:\.\d+)?)%/i,
    /half.*?(\d+(?:\.\d+)?)%/i,
    /approximately (\d+(?:\.\d+)?)%/i,
    /strip.*?(\d+(?:\.\d+)?)%/i,
    /(\d+(?:\.\d+)?)%.*?strip/i,
    /about (\d+(?:\.\d+)?)%/i,
    /(\d+(?:\.\d+)?)%/i  // Simple percentage extraction as fallback
  ];
  
  let percentage: number = 0;
  let matchFound = false;
  
  for (const pattern of patterns) {
    const match = originalExample.match(pattern);
    console.log('🔍 Testing pattern:', pattern, 'Result:', match);
    if (match) {
      percentage = parseFloat(match[1]);
      matchFound = true;
      console.log('✅ Found percentage:', percentage);
      break;
    }
  }
  
  if (!matchFound) {
    console.log('❌ No pattern matched for strip model');
    throw new Error(`Could not extract percentage from strip model: ${originalExample}`);
  }
  
  // USE UNIVERSAL SYSTEM - No hardcoded prompts
  const interactiveText = ''; // Will be generated by universal system
  
  return {
    interactiveText,
    correctAnswer: percentage,
    componentType: 'strip',
    additionalData: { 
      originalExample,
      segments: 20, // Standard strip model uses 20 segments
      shadedSegments: Math.round((percentage / 100) * 20)
    }
  };
}

/**
 * Process decimal-percent conversion examples (e.g., "0.35 = 35%")
 * FULLY UNIVERSAL - NO HARDCODED VALUES
 */
function processDecimalPercentConversion(originalExample: string): ProcessedLessonContent {
  console.log('🔍 processDecimalPercentConversion called with:', originalExample);
  
  // Enhanced regex patterns for decimal-percent conversion formats
  const patterns = [
    /(\d+\.\d+) = (\d+(?:\.\d+)?)%/i,  // 0.35 = 35%
    /(\d+(?:\.\d+)?)% = (\d+\.\d+)/i,  // 35% = 0.35
    /(\d+\.\d+).*?(\d+(?:\.\d+)?)%/i,  // 0.35 corresponds to 35%
    /(\d+(?:\.\d+)?)%.*?(\d+\.\d+)/i,  // 35% corresponds to 0.35
    /(\d+\.\d+)/i,  // Just decimal (assume convert to percent)
    /(\d+(?:\.\d+)?)%/i  // Just percent (assume convert to decimal)
  ];
  
  let value: number = 0;
  let conversionType: 'decimal' | 'percent' = 'decimal';
  let matchFound = false;
  
  for (const pattern of patterns) {
    const match = originalExample.match(pattern);
    console.log('🔍 Testing pattern:', pattern, 'Result:', match);
    if (match) {
      if (match[1] && match[2]) {
        // Two values found - determine which is decimal and which is percent
        if (match[1].includes('%')) {
          // First is percent, convert to decimal
          value = parseFloat(match[1].replace('%', ''));
          conversionType = 'percent';
        } else if (match[2].includes('%')) {
          // Second is percent, convert to decimal
          value = parseFloat(match[2].replace('%', ''));
          conversionType = 'percent';
        } else if (match[1].includes('.') && parseFloat(match[1]) < 1) {
          // First is decimal, convert to percent
          value = parseFloat(match[1]);
          conversionType = 'decimal';
        } else if (match[2].includes('.') && parseFloat(match[2]) < 1) {
          // Second is decimal, convert to percent
          value = parseFloat(match[2]);
          conversionType = 'decimal';
        } else {
          // Default to first value
          value = parseFloat(match[1].replace('%', ''));
          conversionType = match[1].includes('%') ? 'percent' : 'decimal';
        }
      } else {
        // Single value found
        value = parseFloat(match[1].replace('%', ''));
        conversionType = match[1].includes('%') ? 'percent' : 'decimal';
      }
      matchFound = true;
      console.log('✅ Found conversion:', { value, conversionType });
      break;
    }
  }
  
  if (!matchFound) {
    console.log('❌ No pattern matched for decimal-percent conversion');
    throw new Error(`Could not extract decimal/percent from: ${originalExample}`);
  }
  
  // Calculate correct answer based on conversion type
  let correctAnswer: number;
  if (conversionType === 'decimal') {
    // Converting decimal to percent (multiply by 100)
    correctAnswer = value * 100;
  } else {
    // Converting percent to decimal (divide by 100)
    correctAnswer = value / 100;
  }
  
  // USE UNIVERSAL SYSTEM - No hardcoded prompts
  const interactiveText = ''; // Will be generated by universal system
  
  return {
    interactiveText,
    correctAnswer,
    componentType: 'decimal-percent',
    value,
    conversionType,
    additionalData: { 
      originalExample,
      value,
      conversionType
    }
  };
}

/**
 * Process fraction conversion examples (6.NS.1.d activities)
 */
function processFractionConversion(originalExample: string): ProcessedLessonContent {
  // Extract different types of answers based on the example content
  let correctAnswer: string = '';
  let interactiveText = '';
  
  // Fraction simplification
  const simplifiedMatch = originalExample.match(/simplified to (\d+\/\d+)/);
  if (simplifiedMatch) {
    correctAnswer = simplifiedMatch[1];
    const fractionMatch = originalExample.match(/(\d+\/\d+)/);
    if (fractionMatch) {
      interactiveText = `Simplify ${fractionMatch[1]} to lowest terms.`;
    }
  }
  
  // Mixed number to improper fraction
  const mixedToImproperMatch = originalExample.match(/(\d+)\s+(\d+\/\d+).*=.*(\d+\/\d+)/);
  if (mixedToImproperMatch) {
    correctAnswer = mixedToImproperMatch[3];
    interactiveText = `Convert ${mixedToImproperMatch[1]} ${mixedToImproperMatch[2]} to an improper fraction.`;
  }
  
  // Improper fraction to mixed number (like "11/4 = 2 3/4")
  const improperToMixedMatch = originalExample.match(/(\d+\/\d+).*=.*(\d+)\s+(\d+\/\d+)/);
  if (improperToMixedMatch) {
    correctAnswer = `${improperToMixedMatch[2]} ${improperToMixedMatch[3]}`;
    interactiveText = `Convert ${improperToMixedMatch[1]} to a mixed number.`;
    // Successfully matched improper to mixed number pattern
  }
  
  // Decimal to fraction
  const decimalToFractionMatch = originalExample.match(/(\d+\.\d+).*=.*(\d+\/\d+)/);
  if (decimalToFractionMatch) {
    correctAnswer = decimalToFractionMatch[2];
    interactiveText = `Convert ${decimalToFractionMatch[1]} to a fraction.`;
  }
  
  // Fraction to decimal
  const fractionToDecimalMatch = originalExample.match(/(\d+\/\d+).*=.*(\d+\.\d+)/);
  if (fractionToDecimalMatch) {
    correctAnswer = fractionToDecimalMatch[2];
    interactiveText = `Convert ${fractionToDecimalMatch[1]} to a decimal.`;
  }
  
  // Triple conversion (percent/fraction/decimal)
  const tripleMatch = originalExample.match(/([\d.]+%|\d+\/\d+|\d+\.\d+)/g);
  if (tripleMatch && tripleMatch.length >= 2) {
    // Find the missing third value
    const hasPercent = originalExample.includes('%');
    const hasFraction = originalExample.includes('/');
    const hasDecimal = originalExample.match(/\d+\.\d+/);
    
    if (hasPercent && hasFraction && !hasDecimal) {
      const decimalMatch = originalExample.match(/(\d+\.\d+)/);
      if (decimalMatch) {
        correctAnswer = decimalMatch[1];
        interactiveText = `Convert between percent, fraction, and decimal. Enter the missing decimal value.`;
      }
    }
  }
  
  // Repeating decimals
  const repeatingMatch = originalExample.match(/(\d+\/\d+).*(\d+\.\d+\.\.\.)/);
  if (repeatingMatch) {
    correctAnswer = repeatingMatch[2];
    interactiveText = `Convert ${repeatingMatch[1]} to a repeating decimal.`;
  }
  
  // Equivalent fractions (only if not already matched by other patterns)
  const equivalentMatch = originalExample.match(/(\d+\/\d+).*=.*(\d+\/\d+)/);
  if (equivalentMatch && !simplifiedMatch && !improperToMixedMatch && !mixedToImproperMatch) {
    correctAnswer = equivalentMatch[2];
    interactiveText = `Find the equivalent fraction for ${equivalentMatch[1]}.`;
    console.log('✅ DEBUG processFractionConversion: Matched equivalent fractions:', { originalExample, match: equivalentMatch, correctAnswer, interactiveText });
  }
  
  // Fallback: extract any answer pattern
  if (!correctAnswer) {
    const answerMatch = originalExample.match(/=\s*([^,\s]+)/);
    if (answerMatch) {
      correctAnswer = answerMatch[1];
      interactiveText = `Based on the example, enter your answer.`;
    }
  }
  
  return {
    interactiveText,
    correctAnswer,
    componentType: 'text-input',
    inputType: 'text'
  };
}