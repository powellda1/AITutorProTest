import { useState } from 'react';
import { AnimationType } from '../components/SuccessAnimation';

// Centralized feedback logic hook with animation support
export const useFeedbackLogic = (onRequestHelp?: (question: string, context: string) => void, correctAnswerCount?: number) => {
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState<AnimationType>('smiley');

  const handleWrongAnswer = (helpQuestion: string, helpContext: string, customMessage?: string) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= 3 && onRequestHelp) {
      onRequestHelp(helpQuestion, helpContext);
      setFeedback({
        correct: false,
        message: `I've asked the AI tutor for help with this problem. Check the chat panel for a detailed explanation.`
      });
    } else {
      setFeedback({
        correct: false,
        message: customMessage || `Not quite. Try again! (Attempt ${newAttempts} of 3)`
      });
    }
  };

  const handleCorrectAnswer = (message: string) => {
    console.log('🎯 handleCorrectAnswer called with message:', message);
    setFeedback({
      correct: true,
      message
    });
    
    // Trigger animation based on correct answer count
    const count = correctAnswerCount || 1;
    // Animation trigger complete
    if (count === 1) {
      setAnimationType('smiley');
      // Animation type set: smiley
    } else if (count === 2) {
      setAnimationType('star');
      // Animation type set: star
    } else {
      setAnimationType('fireworks');
      // Animation type set: fireworks
    }
    setShowAnimation(true);
    // Animation state set
  };

  const handleAnimationComplete = () => {
    // Animation complete callback
    setShowAnimation(false);
  };

  const resetFeedback = () => {
    setFeedback(null);
    setAttempts(0);
    setShowAnimation(false);
  };

  return {
    feedback,
    attempts,
    handleWrongAnswer,
    handleCorrectAnswer,
    resetFeedback,
    showAnimation,
    animationType,
    handleAnimationComplete
  };
};