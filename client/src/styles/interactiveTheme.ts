import React from 'react';

export const interactiveTheme = {
  // Card and container styles (Universal Theme Consistency Rule)
  card: {
    container: 'bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-green-500 rounded-lg p-6 text-white min-h-[200px]',
    header: 'text-xl font-bold mb-4 text-center text-green-100',
    description: 'text-white text-xl font-semibold text-center bg-gray-800 p-4 rounded-lg border border-gray-600 mb-4',
  },

  // Feedback message styles
  feedback: {
    correct: 'bg-green-600/80 border-green-500',
    incorrect: 'bg-red-600/80 border-red-500',
    completed: 'bg-blue-600/80 border-blue-500',
    attemptHighlight: 'bg-yellow-400 text-black px-1 rounded font-medium',
    container: 'mt-4 p-3 rounded-lg border',
    text: 'text-white text-center font-bold',
  },

  // Grid system styles
  grid: {
    container: 'grid gap-1 p-4 bg-gray-200 rounded-lg mx-auto',
    cell: 'aspect-square border border-gray-300 cursor-pointer transition-colors duration-200',
    cellEmpty: 'bg-white hover:bg-gray-100',
    cellShaded: 'bg-blue-600 hover:bg-blue-700',
    cellSelected: 'bg-blue-500 hover:bg-blue-600',
  },

  // Input and button styles (Universal Theme Consistency Rule)
  input: {
    field: 'px-4 py-3 border-2 border-gray-400 rounded-lg text-black bg-white placeholder-gray-500 text-center text-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200',
    label: 'text-white text-lg font-semibold text-center mb-2',
  },

  button: {
    primary: 'px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50',
    secondary: 'px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200',
  },

  // Typography styles
  text: {
    large: 'text-8xl font-bold text-center text-white mb-4',
    medium: 'text-4xl font-bold text-center text-white mb-2',
    small: 'text-xl text-center text-green-100',
    example: 'text-green-100 mb-2 text-center',
  },

  // Animation styles
  animation: {
    container: 'transition-all duration-300 ease-in-out',
    hover: 'transform hover:scale-105',
    success: 'animate-pulse duration-500',
  },
};

// Utility function to format feedback messages with yellow highlighting
export const formatFeedbackMessage = (message: string): React.ReactNode => {
  return message.split(/(\(Attempt \d+ of \d+\))/).map((part: string, index: number) => 
    part.match(/\(Attempt \d+ of \d+\)/) ? 
      React.createElement('span', { key: index, className: interactiveTheme.feedback.attemptHighlight }, part) : 
      part
  );
};

// Utility function to get feedback container classes
export const getFeedbackClasses = (type: 'correct' | 'incorrect' | 'completed') => {
  const baseClasses = `${interactiveTheme.feedback.container} ${interactiveTheme.feedback.text}`;
  
  switch (type) {
    case 'correct':
      return `${baseClasses} ${interactiveTheme.feedback.correct}`;
    case 'incorrect':
      return `${baseClasses} ${interactiveTheme.feedback.incorrect}`;
    case 'completed':
      return `${baseClasses} ${interactiveTheme.feedback.completed}`;
    default:
      return `${baseClasses} ${interactiveTheme.feedback.incorrect}`;
  }
};

// Apply theme styles to components
export const applyTheme = (component: string, variant?: string) => {
  const theme = interactiveTheme as any;
  return variant ? theme[component]?.[variant] : theme[component];
};