import React from 'react';

/**
 * Universal Renderer System - Centralized UI generation for all interactive components
 * This system ensures consistent styling and behavior across all lesson types
 */

export interface UniversalPromptConfig {
  type: 'grid-percentage' | 'strip-percentage' | 'number-line' | 'comparison' | 'word-problem' | 'exponent' | 'fraction-operation' | 'scaling' | 'perfect-square' | 'ordering' | 'decimal-percent-conversion';
  standardCode?: string;
  lessonTitle?: string;
  context?: any;
}

export interface UniversalUIConfig {
  showMainPrompt: boolean;
  showSubPrompt: boolean;
  showInputLabel: boolean;
  inputPlaceholder: string;
  inputType: 'text' | 'number';
  inputStyle: 'light' | 'dark';
  buttonText: string;
  componentBackground: string;
  textSize: 'small' | 'medium' | 'large';
}

/**
 * Universal Prompt Generator - Creates consistent prompts for all lesson types
 */
export function generateUniversalPrompt(config: UniversalPromptConfig): string {
  const { type, standardCode, lessonTitle, context } = config;
  
  // DEBUG: Log all calls to identify duplicate prompts
  console.log('🔍 generateUniversalPrompt called with:', {
    type, standardCode, lessonTitle
  });
  
  // Debug strip-percentage calls
  if (type === 'strip-percentage') {
    console.log('🔍 STRIP PERCENTAGE CALL - standardCode:', standardCode, 'lessonTitle:', lessonTitle);
  }
  
  // Grid-based percentage activities
  if (type === 'grid-percentage') {
    if (lessonTitle?.includes('What percentage')) {
      return 'What percentage of this grid is shaded?';
    }
    if (lessonTitle?.includes('Convert fractions to percents') || lessonTitle?.includes('grid to represent')) {
      return 'Shade the grid to represent the given fraction as a percentage';
    }
    return 'What percentage is shown in this grid?';
  }
  
  // Strip model activities
  if (type === 'strip-percentage') {
    if (lessonTitle?.includes('What percentage')) {
      return 'What percentage of this strip is shaded?';
    }
    if (lessonTitle?.includes('Benchmark percents')) {
      return 'What percentage is shown in this strip model?';
    }
    return 'What percentage is shown in this strip model?';
  }
  
  // Number line activities
  if (type === 'number-line') {
    if (lessonTitle?.includes('integers') || lessonTitle?.includes('Understanding integers')) {
      return 'Click on the number line to select the correct value';
    }
    if (lessonTitle?.includes('Convert between percents and decimals')) {
      return 'Find the percentage equivalent on the number line';
    }
    return 'Use the number line to find the answer';
  }
  
  // Comparison activities
  if (type === 'comparison') {
    if (lessonTitle?.includes('Compare') || lessonTitle?.includes('comparison')) {
      return 'Compare these values and select the correct relationship';
    }
    return 'Compare the given values';
  }
  
  // Word problem activities
  if (type === 'word-problem') {
    return 'Read the problem and enter your answer';
  }
  
  // Exponent activities
  if (type === 'exponent') {
    if (standardCode?.includes('6.NS.2.b')) {
      return 'Calculate the value of this exponent expression';
    }
    return 'Evaluate the exponent expression';
  }
  
  // Fraction operation activities
  if (type === 'fraction-operation') {
    if (standardCode?.includes('6.NS.3')) {
      return 'Perform the fraction operation and simplify your answer';
    }
    return 'Calculate the fraction operation';
  }
  
  // Scaling activities
  if (type === 'scaling') {
    return 'Determine the scaling factor and calculate the result';
  }
  
  // Perfect square activities
  if (type === 'perfect-square') {
    return 'Find the perfect square value';
  }
  
  // Ordering activities
  if (type === 'ordering') {
    return 'Arrange these values in the correct order';
  }
  
  // Decimal-percent conversion activities
  if (type === 'decimal-percent-conversion') {
    const { type: conversionType, value } = context || {};
    if (conversionType === 'decimal') {
      return `Convert ${value} to a percent`;
    } else if (conversionType === 'percent') {
      return `Convert ${value}% to a decimal`;
    }
    return 'Convert between decimal and percent';
  }
  
  // Text input activities
  if (type === 'text-input') {
    if (lessonTitle?.includes('Write fractions in lowest terms')) {
      return 'Write this fraction in its simplest form';
    }
    return 'Enter your answer';
  }
  
  // Fraction visual input activities - shows visual fraction with text input
  if (type === 'fraction-visual-input') {
    if (lessonTitle?.includes('Write fractions in lowest terms')) {
      return 'Look at the visual fraction and write it in its simplest form';
    }
    return 'Simplify the fraction shown above';
  }
  
  // Default fallback
  return 'Enter your answer';
}

/**
 * Universal UI Configuration Generator - Creates consistent UI settings
 */
export function generateUniversalUIConfig(config: UniversalPromptConfig): UniversalUIConfig {
  const { type, standardCode } = config;
  
  // Base configuration for all components
  const baseConfig: UniversalUIConfig = {
    showMainPrompt: true,
    showSubPrompt: false,
    showInputLabel: false,
    inputPlaceholder: '',
    inputType: 'text',
    inputStyle: 'dark',
    buttonText: 'Submit Answer',
    componentBackground: 'bg-gradient-to-br from-gray-700 to-gray-800',
    textSize: 'large'
  };
  
  // Grid-based activities
  if (type === 'grid-percentage') {
    return {
      ...baseConfig,
      inputType: 'number',
      textSize: 'large'
    };
  }
  
  // Strip model activities
  if (type === 'strip-percentage') {
    return {
      ...baseConfig,
      inputType: 'number',
      textSize: 'large'
    };
  }
  
  // Number line activities
  if (type === 'number-line') {
    return {
      ...baseConfig,
      showInputLabel: false,
      textSize: 'medium'
    };
  }
  
  // Decimal-percent conversion activities
  if (type === 'decimal-percent-conversion') {
    return {
      ...baseConfig,
      inputType: 'number',
      textSize: 'large'
    };
  }
  
  // Text input activities
  if (type === 'text-input') {
    return {
      ...baseConfig,
      inputType: 'text',
      textSize: 'large'
    };
  }
  
  // Fraction visual input activities
  if (type === 'fraction-visual-input') {
    return {
      ...baseConfig,
      inputType: 'text',
      textSize: 'large'
    };
  }
  
  // All other activities use base config
  return baseConfig;
}

/**
 * Universal Input Styling - Consistent input field styles
 */
export const universalInputStyles = {
  light: 'w-32 px-3 py-2 border border-gray-400 rounded text-black bg-white placeholder-gray-500',
  dark: 'w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300'
};

/**
 * Universal Button Styling - Consistent button styles
 */
export const universalButtonStyles = {
  primary: 'px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50',
  secondary: 'px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200'
};

/**
 * Universal Text Styling - Consistent text styles
 */
export const universalTextStyles = {
  mainPrompt: {
    small: 'text-lg text-white font-semibold text-center mb-4',
    medium: 'text-xl text-white font-semibold text-center mb-4',
    large: 'text-2xl text-white font-bold text-center mb-4'
  },
  subPrompt: {
    small: 'text-sm text-gray-300 text-center mb-2',
    medium: 'text-base text-gray-300 text-center mb-2',
    large: 'text-lg text-gray-300 text-center mb-2'
  }
};

/**
 * Universal Feedback Messages - Consistent success/error messages (preserving 6.NS.1.a styling)
 */
export const universalFeedbackMessages = {
  correct: 'Correct! Well done!', // Exact message from 6.NS.1.a
  incorrect: 'Not quite. Try again!', // Exact pattern from 6.NS.1.a
  completed: 'Activity completed!', // Exact message from 6.NS.1.a
  help: 'Getting help from AI assistant...'
};

/**
 * Universal Feedback Styling - Consistent feedback styles (preserving 6.NS.1.a appearance)
 */
export const universalFeedbackStyles = {
  correct: 'bg-green-600 text-white p-3 mb-4 text-center w-full', // Solid green bar, centered text, full width
  incorrect: 'bg-red-600 text-white p-3 mb-4 text-center w-full', // Solid red bar, centered text, full width
  completed: 'bg-green-600 text-white p-4 mb-4 text-center w-full', // Solid green bar like correct
  help: 'bg-yellow-800/20 border border-yellow-600 rounded-lg p-3 mb-4 text-yellow-300'
};

/**
 * Universal Completion Message Styling - Preserving 6.NS.1.a green completion message
 */
export const universalCompletionStyles = {
  container: 'bg-green-800/20 border border-green-600 rounded-lg p-4 mb-4',
  heading: 'text-green-300 font-semibold mb-2',
  text: 'text-green-200 text-sm'
};

/**
 * Universal Feedback Message Formatter - Preserving 6.NS.1.a attempt highlighting
 */
export function formatUniversalFeedbackMessage(message: string): any {
  // Handle attempt counter highlighting like 6.NS.1.a
  if (message.includes('(Attempt')) {
    const parts = message.split('(Attempt');
    const beforeAttempt = parts[0].trim();
    const attemptPart = '(Attempt' + parts[1];
    
    return {
      beforeText: beforeAttempt,
      attemptText: attemptPart,
      attemptClasses: 'bg-yellow-400 text-black px-1 rounded font-medium' // Exact styling from 6.NS.1.a
    };
  }
  return { fullText: message };
}

/**
 * Universal Animation System - Preserving 6.NS.1.a animation sequence
 */
export type UniversalAnimationType = 'smiley' | 'star' | 'fireworks';

export function getUniversalAnimationType(correctCount: number): UniversalAnimationType {
  const animationTypes: UniversalAnimationType[] = ['smiley', 'star', 'fireworks'];
  return animationTypes[correctCount % 3];
}

/**
 * Universal Answer Handling - Preserving 6.NS.1.a behavior
 */
export interface UniversalAnswerHandlerConfig {
  lessonId: number;
  isCorrect: boolean;
  currentAttempts: number;
  correctCount: number;
  onSuccess: (animationType: UniversalAnimationType) => void;
  onError: (attemptMessage: string) => void;
  onAIHelp: (question: string, context: string) => void;
  onAdvanceExample: () => void;
  onResetLesson: () => void;
}

export function handleUniversalAnswer(config: UniversalAnswerHandlerConfig): void {
  const { lessonId, isCorrect, currentAttempts, correctCount, onSuccess, onError, onAIHelp, onAdvanceExample, onResetLesson } = config;
  
  if (isCorrect) {
    // Success - trigger animation and advance
    const animationType = getUniversalAnimationType(correctCount);
    onSuccess(animationType);
    
    // Advance to next example after animation (2 seconds like 6.NS.1.a)
    setTimeout(() => {
      onAdvanceExample();
    }, 2000);
  } else {
    // Incorrect - handle attempts
    const newAttempts = currentAttempts + 1;
    
    if (newAttempts >= 3) {
      // Trigger AI help after 3 attempts
      const question = `How do I solve this problem?`;
      const context = `The student is working on lesson ${lessonId}. They need help after 3 unsuccessful attempts.`;
      onAIHelp(question, context);
      
      // Reset lesson state after AI help (1 second like 6.NS.1.a)
      setTimeout(() => {
        onResetLesson();
      }, 1000);
    } else {
      // Show attempt counter message
      const attemptMessage = `Not quite. Try again! (Attempt ${newAttempts} of 3)`;
      onError(attemptMessage);
    }
  }
}

/**
 * Universal Card Header Generator - Creates consistent card headers
 */
export function generateUniversalCardHeader(config: UniversalPromptConfig): {
  title: string;
  description: string;
  descriptionClasses: string;
} {
  const uiConfig = generateUniversalUIConfig(config);
  const prompt = generateUniversalPrompt(config);
  
  // Clean up lesson title to remove duplicate content
  let cleanTitle = config.lessonTitle || 'Interactive Practice';
  
  // For 6.NS.1.a lessons, use a cleaner title instead of the database title
  if (config.standardCode?.includes('6.NS.1.a')) {
    cleanTitle = 'Grid Model Practice';
  }
  
  // For 6.NS.1.b lessons, use a cleaner title
  if (config.standardCode?.includes('6.NS.1.b')) {
    cleanTitle = 'Decimal-Percent Conversion';
  }
  
  return {
    title: cleanTitle,
    description: prompt,
    descriptionClasses: universalTextStyles.mainPrompt[uiConfig.textSize]
  };
}

/**
 * Universal Component Renderer - Handles all interactive component rendering
 */
export interface UniversalComponentProps {
  config: UniversalPromptConfig;
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  feedback?: any;
  additionalContent?: React.ReactNode;
}

export function generateUniversalComponentJSX(props: UniversalComponentProps): any {
  const { config, userAnswer, onAnswerChange, onSubmit, disabled, feedback, additionalContent } = props;
  const uiConfig = generateUniversalUIConfig(config);
  const header = generateUniversalCardHeader(config);
  
  return {
    header,
    uiConfig,
    inputProps: {
      type: uiConfig.inputType,
      value: userAnswer,
      onChange: (e: any) => onAnswerChange(e.target.value),
      className: universalInputStyles[uiConfig.inputStyle],
      disabled: disabled || feedback?.correct,
      placeholder: uiConfig.inputPlaceholder
    },
    buttonProps: {
      onClick: onSubmit,
      disabled: !userAnswer || disabled || feedback?.correct,
      className: universalButtonStyles.primary,
      children: uiConfig.buttonText
    },
    containerProps: {
      className: uiConfig.componentBackground
    }
  };
}