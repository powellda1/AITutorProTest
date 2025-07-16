import type { Lesson } from "@shared/schema";

interface StandardPanelProps {
  standard: string;
  lessons: Lesson[];
  height: number;
  onLessonSelect: (lesson: Lesson) => void;
}

export default function StandardPanel({ standard, lessons, height, onLessonSelect }: StandardPanelProps) {
  if (!lessons || lessons.length === 0) {
    return (
      <div 
        className="bg-gray-800 border-b border-gray-700 overflow-y-auto flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No Sub-Lessons Found</h2>
          <p className="text-gray-500">This standard has no sub-lessons available</p>
        </div>
      </div>
    );
  }

  const firstLesson = lessons[0];
  
  return (
    <div 
      className="bg-gray-800 border-b border-gray-700 overflow-y-auto"
      style={{ height: `${height}px` }}
    >
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
              {firstLesson.strandCode}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-blue-400 text-sm">{standard}</span>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">{firstLesson.standardText}</h2>
          <p className="text-gray-400">This standard includes {lessons.length} sub-lesson{lessons.length > 1 ? 's' : ''}</p>
        </div>

        <div className="space-y-8">
          {/* Mock sub_lessons structure based on user's description */}
          {(() => {
            const mockSubLessons = [
              {
                title: "What percentage is illustrated?",
                code: "6-U.1",
                explanation: "Students look at shaded models, such as grids or strip diagrams, to find the percentage of the area that is shaded.",
                examples: [
                  "A grid has 80 shaded squares out of 100, so the percent is 80%.",
                  "A strip with 125 shaded parts out of 100 shows 125%.",
                  "A diagram has 0.7 shaded out of 100, so the percent is 0.7%."
                ]
              },
              {
                title: "Benchmark percents with strip models: multiples of 10, 20, 25, 33, and 50",
                code: "6-U.2",
                explanation: "Students use known benchmark percents (like 10%, 25%, 50%) to quickly estimate the shaded part of a strip model.",
                examples: [
                  "A strip with about one-fifth shaded is approximately 20%.",
                  "A strip with about one-third shaded is approximately 33%.",
                  "A strip with half shaded is 50%."
                ]
              }
            ];

            return mockSubLessons.map((subLesson, index) => (
              <div key={index} className="space-y-4">
                {/* Explanation as large white text */}
                <div>
                  <h3 className="text-xl font-medium text-white mb-2">
                    Explanation: {subLesson.explanation}
                  </h3>
                </div>

                {/* Objective */}
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-3">
                    Objective: {subLesson.title}
                  </h4>
                </div>

                {/* Examples Section */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Examples:</h4>
                  <div className="space-y-2">
                    {subLesson.examples.map((example: string, exampleIndex: number) => (
                      <p key={exampleIndex} className="text-gray-300 ml-4">
                        {example}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}