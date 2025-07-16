import React, { useState } from 'react';
import { generateUniversalCardHeader, generateUniversalComponentJSX, UniversalPromptConfig, universalInputStyles, universalButtonStyles } from '../utils/universalRenderer';


export type NumberLineMode = 'clickable' | 'marked-with-input' | 'plot-point' | 'show-opposite';
export type NumberLineOrientation = 'horizontal' | 'vertical';

interface NumberLineComponentProps {
  mode: NumberLineMode;
  orientation?: NumberLineOrientation;
  range: [number, number];
  preMarkedPositions?: number[];
  correctAnswer: number;
  promptText: string;
  onAnswer: (answer: number) => void;
  selectedValue?: number;
  onValueChange?: (value: number) => void;
  standardCode?: string; // For universal system integration
  lessonTitle?: string; // For universal system integration
}

export default function NumberLineComponent({
  mode,
  orientation = 'horizontal',
  range,
  preMarkedPositions = [],
  correctAnswer,
  promptText,
  onAnswer,
  selectedValue,
  onValueChange,
  standardCode,
  lessonTitle
}: NumberLineComponentProps) {
  console.log('🔍 NumberLineComponent: Component is rendering with props:', {
    mode, orientation, range, preMarkedPositions, correctAnswer, promptText, selectedValue
  });
  
  const [inputValue, setInputValue] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  
  const [minValue, maxValue] = range;
  const totalNumbers = maxValue - minValue + 1;
  
  // Generate number line values
  const numberLineValues = Array.from({ length: totalNumbers }, (_, i) => i + minValue);
  
  // Universal configuration for this component
  const universalConfig: UniversalPromptConfig = {
    type: 'number-line',
    standardCode: standardCode || '6.NS.1.b', 
    lessonTitle: lessonTitle || 'Number Line Practice',
    context: { mode, range, preMarkedPositions }
  };

  const headerConfig = generateUniversalCardHeader(universalConfig);
  
  const handleNumberClick = (value: number) => {
    if (mode === 'clickable' || mode === 'show-opposite' || mode === 'plot-point') {
      setSelectedNumber(value);
      onValueChange?.(value);
    }
  };
  
  const handleSubmit = () => {
    if (mode === 'marked-with-input') {
      const numValue = parseInt(inputValue);
      if (!isNaN(numValue)) {
        onAnswer(numValue);
      }
    } else if (selectedNumber !== null) {
      onAnswer(selectedNumber);
    }
  };
  
  const renderNumberLine = () => {
    const containerClass = orientation === 'horizontal' 
      ? 'flex justify-center items-center space-x-1'
      : 'flex flex-col items-center space-y-1';
      
    return (
      <div className={containerClass}>
        {numberLineValues.map((value) => {
          const isZero = value === 0;
          const isPreMarked = preMarkedPositions.includes(value);
          const isSelected = selectedNumber === value || selectedValue === value;
          const isClickable = mode !== 'marked-with-input';
          
          return (
            <div key={value} className={`flex ${orientation === 'horizontal' ? 'flex-col' : 'flex-row-reverse'} items-center`}>
              <button
                className={`w-7 h-7 rounded-full border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                  isZero ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 border-emerald-600 shadow-emerald-200' :
                  isPreMarked ? 'bg-gradient-to-r from-teal-400 to-teal-500 border-teal-600 shadow-teal-200' :
                  isSelected ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-700 shadow-indigo-200 scale-110' :
                  'bg-white border-gray-400'
                } ${isClickable ? 'hover:bg-slate-100 hover:border-slate-400 cursor-pointer hover:scale-105' : 'cursor-default'}`}
                onClick={() => isClickable && handleNumberClick(value)}
                disabled={!isClickable}
              >
              </button>
              <div className={`text-sm ${orientation === 'horizontal' ? 'mt-1' : 'mr-1'} font-medium transition-colors duration-200 ${
                isZero ? 'text-emerald-600 font-bold' :
                isPreMarked ? 'text-teal-600 font-bold' :
                isSelected ? 'text-indigo-600 font-bold' :
                'text-slate-600'
              }`}>
                {value}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  

  
  const renderModeSpecificContent = () => {
    switch (mode) {
      case 'marked-with-input':
        return <div className="text-sm text-gray-600">Enter the integer that corresponds to the marked point.</div>;
      case 'show-opposite':
        return <div className="text-sm text-gray-600">Click the number that is the opposite of the marked number.</div>;
      case 'plot-point':
        return <div className="text-sm text-gray-600">Click on the number line to plot the given integer.</div>;
      default:
        return <div className="text-sm text-gray-600">Click the number that represents this situation.</div>;
    }
  };
  
  return (
    <div className="text-center mb-4">
      {/* Universal header */}
      <div className="bg-gray-600 p-4 rounded-lg border-2 border-gray-400 mb-4">
        <div className="text-lg text-white mb-4 font-semibold">
          {promptText || headerConfig.promptText}
        </div>
        
        <div className="text-white text-lg mb-4">
          {renderModeSpecificContent()}
        </div>
        
        {/* Number line visualization */}
        <div className="bg-gray-300 p-4 rounded-lg border-2 border-gray-500">
          {renderNumberLine()}
        </div>
      </div>
      
      {/* Universal input and submit section */}
      {mode === 'marked-with-input' ? (
        <div className="flex items-center justify-center space-x-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Submit
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <button
            onClick={handleSubmit}
            disabled={selectedNumber === null}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}