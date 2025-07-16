import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AiHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onHelpRequested: (question: string, context: string) => void;
  question: string;
  context: string;
  hasResponse?: boolean; // New prop to indicate when response is ready
}

export default function AiHelpPopup({ 
  isOpen, 
  onClose, 
  onHelpRequested, 
  question, 
  context,
  hasResponse = false
}: AiHelpPopupProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && question && context && !isProcessing) {
      setIsProcessing(true);
      
      // Trigger the help request
      onHelpRequested(question, context);
    }
  }, [isOpen, question, context, onHelpRequested, isProcessing]);

  // Close popup when response is ready
  useEffect(() => {
    if (hasResponse && isProcessing) {
      setIsProcessing(false);
      // Small delay to show the response is ready before closing
      setTimeout(() => {
        onClose();
      }, 500);
    }
  }, [hasResponse, isProcessing, onClose]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-600 [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-white text-center">Getting AI Help</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-6">
          {/* AI Processing Animation */}
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-gray-300 ml-2">AI Tutor is thinking...</span>
          </div>
          
          {/* Question being processed */}
          <div className="text-center text-sm text-gray-400 max-w-sm">
            <p className="italic">"{question}"</p>
          </div>
          
          <div className="text-center text-xs text-gray-500">
            Check the AI Math Tutor panel for the detailed explanation
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}