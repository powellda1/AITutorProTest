import { useState } from 'react';
import { generateUniversalPrompt, universalInputStyles, universalButtonStyles, universalFeedbackStyles, formatUniversalFeedbackMessage } from "../utils/universalRenderer";

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
  const [feedback, setFeedback] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);

  const handleSubmit = () => {
    if (userAnswer.trim() === '') {
      setFeedback('Please enter your answer');
      return;
    }

    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    // Check if the answer is correct (handle both string and number comparisons)
    const isCorrect = userAnswer.trim() === correctAnswer.toString() || 
                     parseFloat(userAnswer.trim()) === parseFloat(correctAnswer.toString());

    if (isCorrect) {
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
          className={universalInputStyles}
        />
        <button
          onClick={handleSubmit}
          disabled={!userAnswer.trim()}
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