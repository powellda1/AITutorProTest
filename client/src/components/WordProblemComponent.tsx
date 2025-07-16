import { useState } from 'react';


interface WordProblemComponentProps {
  questionText: string;
  correctAnswer: string;
  promptText: string;
  onAnswer: (answer: string) => void;
}

export default function WordProblemComponent({
  questionText,
  correctAnswer,
  promptText,
  onAnswer
}: WordProblemComponentProps) {
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
          Solve step by step:
        </div>
        
        {/* Question display */}
        <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 text-lg font-medium text-black shadow-md mb-4">
          {questionText}
        </div>
        
        {/* Problem-solving steps */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4 space-y-3 mb-4">
          <div className="text-sm text-gray-600">
            <strong>Step 1:</strong> Convert values to the same form (decimals or fractions)
          </div>
          <div className="text-sm text-gray-600">
            <strong>Step 2:</strong> Compare the converted values
          </div>
          <div className="text-sm text-gray-600">
            <strong>Step 3:</strong> Choose the correct comparison
          </div>
        </div>
        
        <div className="text-lg text-slate-700 text-center font-semibold mb-4">
          What is the answer? Click to choose:
        </div>
        
        {/* Answer options */}
        <div className="flex flex-col items-center space-y-3 mb-4">
          <button 
            onClick={() => handleOptionClick('greater')}
            className={`w-64 px-4 py-3 rounded-lg text-lg font-semibold transition-all duration-200 border-2 ${
              selectedAnswer === 'greater' 
                ? 'bg-blue-500 text-white border-blue-600 shadow-lg' 
                : 'bg-blue-200 hover:bg-blue-300 text-blue-800 border-blue-400 hover:shadow-md'
            }`}
          >
            First value is greater
          </button>
          
          <button 
            onClick={() => handleOptionClick('less')}
            className={`w-64 px-4 py-3 rounded-lg text-lg font-semibold transition-all duration-200 border-2 ${
              selectedAnswer === 'less' 
                ? 'bg-green-500 text-white border-green-600 shadow-lg' 
                : 'bg-green-200 hover:bg-green-300 text-green-800 border-green-400 hover:shadow-md'
            }`}
          >
            Second value is greater
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
          Tip: Read the problem carefully and identify the values to compare
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