import React, { useState } from 'react';

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
  onValueChange
}: NumberLineComponentProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  
  const [minValue, maxValue] = range;
  const totalNumbers = maxValue - minValue + 1;
  
  // Generate number line values
  const numberLineValues = Array.from({ length: totalNumbers }, (_, i) => i + minValue);
  
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
      <div className="p-1 rounded-2xl inline-block bg-gradient-to-br from-indigo-200/60 via-purple-200/60 to-pink-200/60 shadow-2xl backdrop-blur-sm drop-shadow-xl">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-indigo-100/90 via-purple-100/90 to-pink-100/90 backdrop-blur-sm p-6 rounded-xl border border-indigo-200/60 shadow-lg">
            <div className="text-center space-y-5">
            <div className="text-xl font-bold text-instruction text-shadow-sm">Interactive Activity:</div>
            <div className="text-xl font-bold text-slate-800 glass-card p-4 rounded-xl shadow-lg">
              {promptText}
            </div>
            
            <div className="text-sm text-slate-600 font-semibold">
              {renderModeSpecificContent()}
            </div>
            
            <div className="mt-6">
              <div className="text-lg font-semibold text-slate-700 mb-3 drop-shadow-sm">
                {orientation === 'horizontal' ? 'Number Line:' : 'Vertical Number Line:'}
              </div>
              <div className="bg-gradient-to-r from-slate-100/60 via-white/60 to-slate-100/60 backdrop-blur-sm p-4 rounded-2xl border border-white/70 shadow-inner">
                {renderNumberLine()}
              </div>
              
              <div className="mt-5 text-center">
                {mode === 'marked-with-input' ? (
                  <div className="space-y-4">
                    <div className="text-sm text-slate-600 font-medium bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm p-2 rounded-lg border border-white/50 shadow-sm">
                      <span className="text-emerald-600 drop-shadow-sm">●</span> Zero | <span className="text-teal-500 drop-shadow-sm">●</span> Marked Point
                    </div>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter value"
                      className="px-4 py-2 border-2 border-slate-300/60 rounded-xl text-center w-28 bg-white/80 backdrop-blur-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/60 transition-all duration-200 font-medium shadow-md"
                    />
                    <div>
                      <button
                        onClick={handleSubmit}
                        disabled={!inputValue.trim()}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md ${
                          inputValue.trim()
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:scale-105'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Submit Answer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-slate-600 font-medium bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm p-2 rounded-lg border border-white/50 shadow-sm">
                      <span className="text-emerald-600 drop-shadow-sm">●</span> Zero 
                      {preMarkedPositions.length > 0 && (
                        <span> | <span className="text-teal-500 drop-shadow-sm">●</span> Given number</span>
                      )}
                      {selectedNumber !== null && (
                        <span> | <span className="text-indigo-600 font-bold drop-shadow-sm">Selected: {selectedNumber}</span></span>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={handleSubmit}
                        disabled={selectedNumber === null}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md ${
                          selectedNumber !== null
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:scale-105'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Submit Answer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}