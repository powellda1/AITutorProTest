import { useState } from 'react';


interface ComparisonComponentProps {
  value1: string;
  value2: string;
  correctAnswer: 'greater' | 'less' | 'equal';
  promptText: string;
  onAnswer: (answer: string) => void;
}

export default function ComparisonComponent({
  value1,
  value2,
  correctAnswer,
  promptText,
  onAnswer
}: ComparisonComponentProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const handleSubmit = () => {
    if (selectedAnswer) {
      onAnswer(selectedAnswer);
    }
  };

  const handleOptionClick = (option: string) => {
    setSelectedAnswer(option);
  };

  return (
    <div className="interactive-card">
      <div className="space-y-4">
        <div className="interactive-card-header">Interactive Activity:</div>
        <div className="interactive-card-description">
          {promptText}
        </div>
        
        <div className="text-white text-lg">
          Which is greater? Click to choose:
        </div>
        
        {/* Comparison visualization */}
        <div className="flex justify-center items-center space-x-6 my-6">
          <div className="bg-blue-500 border-2 border-blue-400 rounded-lg p-4 text-xl font-bold text-white shadow-md">
            {value1}
          </div>
          <div className="text-2xl font-bold text-slate-700">VS</div>
          <div className="bg-green-500 border-2 border-green-400 rounded-lg p-4 text-xl font-bold text-white shadow-md">
            {value2}
          </div>
        </div>
        
        {/* Answer options */}
        <div className="flex flex-col items-center space-y-3 my-6">
          <button 
            onClick={() => handleOptionClick('greater')}
            className={`w-64 px-4 py-3 rounded-lg text-lg font-semibold transition-all duration-200 border-2 ${
              selectedAnswer === 'greater' 
                ? 'bg-blue-500 text-white border-blue-600 shadow-lg' 
                : 'bg-blue-200 hover:bg-blue-300 text-blue-800 border-blue-400 hover:shadow-md'
            }`}
          >
            {value1} is greater
          </button>
          
          <button 
            onClick={() => handleOptionClick('less')}
            className={`w-64 px-4 py-3 rounded-lg text-lg font-semibold transition-all duration-200 border-2 ${
              selectedAnswer === 'less' 
                ? 'bg-green-500 text-white border-green-600 shadow-lg' 
                : 'bg-green-200 hover:bg-green-300 text-green-800 border-green-400 hover:shadow-md'
            }`}
          >
            {value2} is greater
          </button>
          
          <button 
            onClick={() => handleOptionClick('equal')}
            className={`w-64 px-4 py-3 rounded-lg text-lg font-semibold transition-all duration-200 border-2 ${
              selectedAnswer === 'equal' 
                ? 'bg-purple-500 text-white border-purple-600 shadow-lg' 
                : 'bg-purple-200 hover:bg-purple-300 text-purple-800 border-purple-400 hover:shadow-md'
            }`}
          >
            They are equal
          </button>
        </div>
        
        <div className="text-sm text-slate-600 text-center font-medium bg-slate-50/80 p-2 rounded-lg border border-gray-200/50 shadow-sm mb-4">
          Tip: Convert to the same form to compare accurately
        </div>
        
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="px-6 py-3 text-lg bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            Submit Answer
          </button>
        </div>
      </div>
    </div>
  );
}