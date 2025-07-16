import { useState, useEffect } from "react";
import CurriculumTree from "@/components/curriculum-tree";
import LessonPanel from "@/components/lesson-panel";
import SubStandardPanel from "@/components/sub-standard-panel";
import AiResponsePanel from "@/components/ai-response-panel";
import ChatPanel from "@/components/chat-panel";
import DraggableDivider from "@/components/draggable-divider";
import type { Lesson, SubStandard } from "@shared/schema";

export default function Home() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedSubStandard, setSelectedSubStandard] = useState<SubStandard | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);
  const [selectedLessons, setSelectedLessons] = useState<Lesson[]>([]);
  const [standardDescription, setStandardDescription] = useState<string | null>(null);
  const [topPanelHeight, setTopPanelHeight] = useState(window.innerHeight - 120); // Minimize AI panel by default
  const [containerHeight, setContainerHeight] = useState(window.innerHeight);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [sessionId] = useState(() => `session-${Date.now()}`);

  useEffect(() => {
    const updateHeight = () => {
      const newHeight = window.innerHeight;
      setContainerHeight(newHeight);
      // Keep AI panel minimized by default, but allow for minimum lesson content height
      setTopPanelHeight(Math.max(200, newHeight - 120));
    };
    
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const handleResize = (newTopHeight: number) => {
    setTopPanelHeight(newTopHeight);
  };

  const expandAiPanel = () => {
    // Expand AI panel to original size (60% of window height)
    const expandedHeight = Math.max(200, containerHeight * 0.6);
    setTopPanelHeight(expandedHeight);
  };

  const minimizeAiPanel = () => {
    // Minimize AI panel to show only header
    setTopPanelHeight(Math.max(200, containerHeight - 120));
  };

  const handleAiResponse = (response: any) => {
    setAiResponse(response);
    // Expand AI panel when response is received
    expandAiPanel();
  };

  const handleClearResponse = () => {
    setAiResponse(null);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    console.log('Home: Lesson selected:', lesson);
    console.log('Home: Lesson title:', lesson.title);
    console.log('Home: Lesson examples:', lesson.content?.examples);
    console.log('Home: Lesson description:', lesson.description);
    setSelectedLesson(lesson);
    
    // Convert lesson to sub-standard format for SubStandardPanel
    const mockSubStandard = {
      id: lesson.id,
      code: lesson.subStandard || lesson.title.split(' - ')[0] || `L${lesson.id}`,
      description: lesson.description || lesson.title,
      examples: lesson.content?.examples || [],
      standardId: lesson.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setSelectedSubStandard(mockSubStandard);
  };

  const handleStandardSelect = async (standard: string, lessons: Lesson[]) => {
    console.log('Home: handleStandardSelect called with:', standard);
    console.log('Home: Lessons received:', lessons);
    console.log('Home: Current selectedLesson:', selectedLesson);
    setSelectedStandard(standard);
    setSelectedLessons(lessons);
    
    // Set the standard description based on the standard code
    const descriptions: { [key: string]: string } = {
      '6.NS.1.a': 'Estimate and determine the percent represented by a given model, including percents greater than 100% and less than 1%.',
      '6.NS.1.b': 'Represent and determine equivalencies among fractions, mixed numbers, decimals, and percents.',
      '6.NS.1.c': 'Compare and order positive rational numbers.',
      '6.NS.1.d': 'Identify and describe the location of points on a number line and in the coordinate plane.',
      '6.NS.1.e': 'Solve real-world problems involving positive rational numbers.'
    };
    
    setStandardDescription(descriptions[standard] || 'Standard description not available');
    
    // Set the first lesson as selected when a standard is clicked
    if (lessons.length > 0) {
      console.log('Home: Setting selectedLesson to:', lessons[0]);
      setSelectedLesson(lessons[0]);
    } else {
      console.log('Home: No lessons found, clearing selectedLesson');
      setSelectedLesson(null);
    }
    
    // Complete mapping for all strands (updated IDs after full curriculum reload)
    const standardToSubStandardIdMap: { [key: string]: number } = {
      // 6.NS standards
      '6.NS.1.a': 91, '6.NS.1.b': 92, '6.NS.1.c': 93, '6.NS.1.d': 94, '6.NS.1.e': 95,
      '6.NS.2.a': 96, '6.NS.2.b': 97, '6.NS.2.c': 98, '6.NS.2.d': 99,
      '6.NS.3.a': 100, '6.NS.3.b': 101, '6.NS.3.c': 102, '6.NS.3.d': 103,
      // 6.CE standards
      '6.CE.1.a': 104, '6.CE.1.b': 105, '6.CE.1.c': 106, '6.CE.1.d': 107, '6.CE.1.e': 108,
      '6.CE.2.a': 109, '6.CE.2.b': 110, '6.CE.2.c': 111, '6.CE.2.d': 112,
      // 6.MG standards
      '6.MG.1.a': 113, '6.MG.1.b': 114, '6.MG.1.c': 115, '6.MG.1.d': 116, '6.MG.1.e': 117,
      '6.MG.2.a': 118, '6.MG.2.b': 119,
      '6.MG.3.a': 120, '6.MG.3.b': 121, '6.MG.3.c': 122, '6.MG.3.d': 123, '6.MG.3.e': 124, '6.MG.3.f': 125,
      // 6.PS standards
      '6.PS.1.a': 126, '6.PS.1.b': 127, '6.PS.2.a': 128, '6.PS.2.b': 129, '6.PS.2.c': 130,
      '6.PS.3.a': 131, '6.PS.3.b': 132, '6.PS.3.c': 133,
      // 6.PFA standards
      '6.PFA.1.a': 134, '6.PFA.1.b': 135, '6.PFA.2.a': 136, '6.PFA.2.b': 137, '6.PFA.2.c': 138, '6.PFA.2.d': 139, '6.PFA.2.e': 140
    };
    
    // For all standards, use the direct mapping
    if (standardToSubStandardIdMap[standard]) {
      const subStandard = {
        id: standardToSubStandardIdMap[standard],
        code: standard,
        description: lessons[0]?.standardText || 'No description available',
        standardId: 0,
        examples: []
      };
      setSelectedSubStandard(subStandard);
      return;
    }
    
    // For other strands, find the sub-standard ID dynamically
    try {
      const strandsResponse = await fetch('/api/strands');
      const strands = await strandsResponse.json();
      
      for (const strand of strands) {
        const standardsResponse = await fetch(`/api/standards/${strand.id}`);
        const standards = await standardsResponse.json();
        
        const matchingStandard = standards.find((s: any) => s.code === standard);
        if (matchingStandard) {
          const subStandardsResponse = await fetch(`/api/sub-standards/${matchingStandard.id}`);
          const subStandards = await subStandardsResponse.json();
          
          if (subStandards.length > 0) {
            setSelectedSubStandard(subStandards[0]);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching sub-standard:', error);
    }
  };

  const bottomPanelHeight = containerHeight - topPanelHeight - 4; // 4px for divider

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">
      {/* Navigation Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white text-shadow-lg">Math Tutoring AI</h1>
        <div className="flex gap-2">
          <a 
            href="/curriculum-upload" 
            className="px-4 py-2 bg-accent-primary hover:bg-accent-secondary rounded-lg text-sm font-medium transition-all duration-200 text-white text-shadow-sm hover:scale-105 hover:shadow-lg"
          >
            Upload Curriculum
          </a>
        </div>
      </div>
      
      <div className="flex h-full">
        <CurriculumTree
          onLessonSelect={handleLessonSelect}
          onStandardSelect={handleStandardSelect}
          selectedLessonId={selectedLesson?.id}
          selectedStandard={selectedStandard}
        />
        
        <div className="flex-1 flex flex-col" id="middle-panel">
          {selectedLessons.length > 0 ? (
            <LessonPanel 
              lessons={selectedLessons} 
              selectedStandard={selectedStandard}
              standardDescription={standardDescription}
              height={topPanelHeight}
              onAiResponse={handleAiResponse}
              sessionId={sessionId}
              selectedLesson={selectedLesson}
              onLessonSelect={handleLessonSelect}
            />
          ) : selectedSubStandard ? (
            <SubStandardPanel 
              subStandard={selectedSubStandard} 
              height={topPanelHeight}
              sessionId={sessionId}
              onAiResponse={handleAiResponse}
            />
          ) : (
            <div 
              className="bg-gray-800 border-b border-gray-700 overflow-y-auto flex items-center justify-center"
              style={{ height: `${topPanelHeight}px` }}
            >
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-400 mb-2">Select a Standard</h2>
                <p className="text-gray-500">Choose a standard from the curriculum to view lessons</p>
              </div>
            </div>
          )}
          
          <DraggableDivider
            onResize={handleResize}
            containerHeight={containerHeight}
            minTopHeight={200}
            minBottomHeight={100}
          />
          
          <AiResponsePanel
            height={bottomPanelHeight}
            response={aiResponse}
            onClear={handleClearResponse}
            sessionId={sessionId}
            onAiResponse={handleAiResponse}
            onExpand={expandAiPanel}
            onMinimize={minimizeAiPanel}
          />
        </div>
      </div>
    </div>
  );
}
