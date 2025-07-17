import { useState } from 'react';
import { generateUniversalCardHeader, generateUniversalComponentJSX } from '../utils/universalRenderer';

interface DecimalFractionComponentProps {
  originalDecimal: number;
  targetNumerator: number;
  targetDenominator: number;
  correctAnswer: string;
  onAnswer: (answer: string) => void;
  lesson?: any;
  promptText?: string;
}

export default function DecimalFractionComponent({
  originalDecimal,
  targetNumerator,
  targetDenominator,
  correctAnswer,
  onAnswer
}: DecimalFractionComponentProps) {
  const [numeratorInput, setNumeratorInput] = useState('');
  const [denominatorInput, setDenominatorInput] = useState('');

  const handleSubmit = () => {
    if (numeratorInput.trim() === '' || denominatorInput.trim() === '') {
      return;
    }

    const userAnswer = `${numeratorInput}/${denominatorInput}`;
    onAnswer(userAnswer);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl shadow-2xl border border-gray-400/20">
      {/* Universal Card Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-4">Convert Decimal to Fraction</h3>
        <div className="text-6xl font-bold text-blue-300 mb-4">
          {originalDecimal}
        </div>
        <p className="text-xl text-gray-300">
          Convert this decimal to its simplest fraction form
        </p>
      </div>

      {/* Universal Input/Submit Section */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <input
          type="text"
          value={numeratorInput}
          onChange={(e) => setNumeratorInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Numerator"
          className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300"
        />
        <div className="text-4xl font-bold text-white">/</div>
        <input
          type="text"
          value={denominatorInput}
          onChange={(e) => setDenominatorInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Denominator"
          className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300"
        />
      </div>

      <div className="text-center mb-6">
        <button
          onClick={handleSubmit}
          disabled={!numeratorInput.trim() || !denominatorInput.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}