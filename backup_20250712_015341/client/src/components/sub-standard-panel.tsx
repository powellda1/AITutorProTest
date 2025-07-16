import { useQuery } from "@tanstack/react-query";
import type { SubStandard, SubLesson } from "@shared/schema";
import InteractiveLesson from "./interactive-lesson";
import { apiRequest } from "@/lib/queryClient";

interface SubStandardPanelProps {
  subStandard: SubStandard;
  height: number;
  sessionId: string;
  onAiResponse?: (response: any) => void;
}

export default function SubStandardPanel({ subStandard, height, sessionId, onAiResponse }: SubStandardPanelProps) {
  // Create single lesson object from the lessons table data
  const lesson = {
    id: subStandard.id,
    title: subStandard.description, // Use the full description as title
    code: subStandard.subStandard, // Use the lesson code (e.g., 6.NS.1.a)
    explanation: subStandard.description,
    examples: subStandard.examples || [], // Use the examples array from lessons table
    subStandardId: subStandard.id,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const subLessons = [lesson]; // Single lesson instead of multiple mock lessons

  const handleRequestHelp = async (question: string, context: string) => {
    try {
      // Create a comprehensive help request message
      const helpMessage = `Please provide a brief summary, the question, and a step-by-step explanation for this math problem:

Question: ${question}

Context: ${context}

Make it clear and educational for a 6th grade student.`;

      // Send the help request to the chatbot
      const response = await apiRequest("POST", "/api/chat", {
        message: helpMessage,
        sender: "user",
        sessionId: sessionId
      });
      
      const data = await response.json();
      
      // Trigger AI response panel update
      if (onAiResponse) {
        onAiResponse({
          response: data.aiMessage.message,
          explanation: data.explanation,
          examples: data.examples,
          question: data.userMessage.message,
        });
      }
    } catch (error) {
      console.error("Failed to request help:", error);
    }
  };

  return (
    <div 
      className="bg-gray-800 border-b border-gray-700 overflow-y-auto"
      style={{ height: `${height}px` }}
    >
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
              {subStandard.code}
            </span>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">{subStandard.description}</h2>
          <p className="text-gray-400">
            This sub-standard includes {subLessons.length} sub-lesson{subLessons.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Interactive Lesson for all 6.NS.1 standards - map lesson IDs to interactive features */}
        {(subStandard.id >= 1 && subStandard.id <= 41) && subLessons.length > 0 && (
          <div className="mb-6">
            <InteractiveLesson
              subLessons={subLessons}
              subStandardTitle=""
              onRequestHelp={handleRequestHelp}
            />
          </div>
        )}

        <div className="space-y-8">
          {/* If no sub-lessons, show the sub-standard examples */}
          {subLessons.length === 0 && subStandard.examples && subStandard.examples.length > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-white mb-2">
                  {subStandard.description}
                </h3>
              </div>

              <div>
                <h4 className="text-lg font-medium text-white mb-3">Examples:</h4>
                <div className="space-y-2">
                  {subStandard.examples.map((example: string, exampleIndex: number) => (
                    <p key={exampleIndex} className="text-gray-300 ml-4">
                      • {example}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}