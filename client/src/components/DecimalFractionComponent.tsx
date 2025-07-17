import { useState } from 'react';
import { generateUniversalPrompt, universalInputStyles, universalButtonStyles, universalFeedbackStyles, formatUniversalFeedbackMessage } from "../utils/universalRenderer";

interface DecimalFractionComponentProps {
  originalDecimal: number;
  targetNumerator: number;
  targetDenominator: number;
  correctAnswer: string;
  onAnswer: (answer: string) => void;
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
  const [feedback, setFeedback] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);

  const handleSubmit = () => {
    if (numeratorInput.trim() === '' || denominatorInput.trim() === '') {
      setFeedback('Please enter both numerator and denominator');
      return;
    }

    const userAnswer = `${numeratorInput}/${denominatorInput}`;
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    if (userAnswer === correctAnswer) {
      setFeedback('Correct!');
      onAnswer(userAnswer);
    } else {
      const feedbackMessage = formatUniversalFeedbackMessage(newAttemptCount, false);
      setFeedback(feedbackMessage);
      
      if (newAttemptCount >= 3) {
        onAnswer(userAnswer); // Trigger AI help
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl shadow-2xl border border-gray-400/20">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-4">Convert Decimal to Fraction</h3>
        <div className="text-6xl font-bold text-blue-300 mb-4">
          {originalDecimal}
        </div>
        <p className="text-xl text-gray-300">
          Convert this decimal to its simplest fraction form
        </p>
      </div>

      <div className="flex items-center justify-center space-x-4 mb-6">
        <input
          type="text"
          value={numeratorInput}
          onChange={(e) => setNumeratorInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Numerator"
          className={universalInputStyles}
        />
        <div className="text-4xl font-bold text-white">/</div>
        <input
          type="text"
          value={denominatorInput}
          onChange={(e) => setDenominatorInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Denominator"
          className={universalInputStyles}
        />
      </div>

      <div className="text-center mb-6">
        <button
          onClick={handleSubmit}
          disabled={!numeratorInput.trim() || !denominatorInput.trim()}
          className={universalButtonStyles}
        >
          Submit Answer
        </button>
      </div>

      {feedback && (
        <div className={universalFeedbackStyles}>
          {feedback}
        </div>
      )}
    </div>
  );
}