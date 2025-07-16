import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Star, Sparkles } from 'lucide-react';

export type AnimationType = 'smiley' | 'star' | 'fireworks';

interface SuccessAnimationProps {
  isVisible: boolean;
  animationType: AnimationType;
  onComplete?: () => void;
}

// Global animation configuration - easy to modify in one place
export const ANIMATION_CONFIG = {
  smiley: {
    icon: Smile,
    color: '#FDE047', // yellow-300
    duration: 3000, // 3 seconds in milliseconds
    initialScale: 1.0,
    finalScale: 2.5,
    yOffset: -400,
  },
  star: {
    icon: Star,
    color: '#FBBF24', // amber-400
    duration: 3000, // 3 seconds in milliseconds
    initialScale: 1.0,
    finalScale: 2.8,
    yOffset: -400,
  },
  fireworks: {
    icon: Sparkles,
    color: '#EC4899', // pink-500
    duration: 3000, // 3 seconds in milliseconds
    initialScale: 1.0,
    finalScale: 3.2,
    yOffset: -400,
  },
};

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  isVisible,
  animationType,
  onComplete
}) => {
  const config = ANIMATION_CONFIG[animationType];
  const IconComponent = config.icon;

  // Animation lifecycle control
  
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 3000); // End after exactly 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, animationType, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 pointer-events-none flex items-end justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Main animation icon */}
          <motion.div
            initial={{
              scale: 1,
              y: 0,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              scale: 2.5,
              y: -400,
              opacity: [1, 1, 1, 1, 0], // Stay visible for 80% of duration, then fade
              rotate: animationType === 'fireworks' ? 360 : 0,
            }}
            transition={{
              duration: 3,
              ease: "easeOut",
              opacity: {
                times: [0, 0.8, 0.85, 0.9, 1], // Stay opaque until 80% through
                duration: 3
              }
            }}

            className="drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.5))',
            }}
          >
            <IconComponent
              size={120}
              style={{ 
                color: config.color,
                strokeWidth: 2,
                stroke: '#000000',
              }}
              fill={config.color}
            />
          </motion.div>

          {/* Additional effects for fireworks */}
          {animationType === 'fireworks' && (
            <>
              {/* Sparkle particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{
                    scale: 0,
                    x: 0,
                    y: 0,
                    opacity: 1,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 6) * 100,
                    y: Math.sin((i * Math.PI * 2) / 6) * 100,
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: 0.5,
                    ease: "easeOut",
                  }}
                >
                  <Star
                    size={40}
                    style={{ 
                      color: '#F59E0B',
                      strokeWidth: 2,
                      stroke: '#000000',
                      filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.8))',
                    }}
                    fill={'#F59E0B'}
                  />
                </motion.div>
              ))}
            </>
          )}

          {/* Bounce effect for star */}
          {animationType === 'star' && (
            <motion.div
              className="absolute"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: [0, 1.5, 1, 1.2, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2.5,
                delay: 0.3,
                ease: "easeInOut",
              }}
            >
              <Sparkles
                size={60}
                style={{ 
                  color: '#10B981',
                  strokeWidth: 2,
                  stroke: '#000000',
                  filter: 'drop-shadow(0 0 15px rgba(0, 0, 0, 0.8))',
                }}
                fill={'#10B981'}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessAnimation;