import { useState } from 'react';

interface ConversionWordProblemComponentProps {
  problemText: string;
  correctAnswer: string;
  onAnswer: (answer: string) => void;
}

export default function ConversionWordProblemComponent({
  problemText,
  correctAnswer,
  onAnswer
}: ConversionWordProblemComponentProps) {
  const [userAnswer, setUserAnswer] = useState('');

  const handleSubmit = () => {
    if (userAnswer.trim() === '') {
      return;
    }

    onAnswer(userAnswer);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl shadow-2xl border border-gray-400/20">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-4">Word Problem</h3>
        <div className="text-lg text-gray-300 mb-6 p-4 bg-gray-700/50 rounded-lg">
          {problemText}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4 mb-6">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your answer"
          className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300"
        />
        <button
          onClick={handleSubmit}
          disabled={!userAnswer.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}