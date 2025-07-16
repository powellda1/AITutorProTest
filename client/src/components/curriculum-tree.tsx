import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Circle, Search, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ContentArea, Standard, SubStandard, SubLesson, Lesson } from "@shared/schema";

interface CurriculumTreeProps {
  onLessonSelect: (lesson: Lesson) => void;
  onStandardSelect: (standard: string, lessons: Lesson[]) => void;
  selectedLessonId?: number;
  selectedStandard?: string;
}

export default function CurriculumTree({ onLessonSelect, onStandardSelect, selectedLessonId, selectedStandard }: CurriculumTreeProps) {
  const [expandedContentAreas, setExpandedContentAreas] = useState<string[]>(['6.NS']);
  const [searchTerm, setSearchTerm] = useState("");
  // Fetch content areas
  const { data: contentAreas = [] } = useQuery<ContentArea[]>({
    queryKey: ["/api/strands"],
  });

  // Fetch standards for expanded content areas
  const [selectedContentAreaId, setSelectedContentAreaId] = useState<number | null>(null);
  const { data: standards = [] } = useQuery<Standard[]>({
    queryKey: [`/api/standards/${selectedContentAreaId}`],
    enabled: !!selectedContentAreaId,
  });

  const toggleContentArea = (contentAreaCode: string) => {
    setExpandedContentAreas(prev => 
      prev.includes(contentAreaCode) 
        ? prev.filter(code => code !== contentAreaCode)
        : [...prev, contentAreaCode]
    );
    
    // Set the selected content area for standards fetching
    const contentArea = contentAreas.find(ca => ca.code === contentAreaCode);
    if (contentArea) {
      setSelectedContentAreaId(contentArea.id);
    }
  };

  // Handle standard selection - fetch lessons for that standard
  const handleStandardSelect = async (standard: Standard) => {
    console.log('CurriculumTree: Standard clicked:', standard);
    
    // Fetch lessons for this standard
    try {
      const response = await fetch(`/api/lessons/standard/${standard.id}`);
      const lessons = await response.json();
      console.log('CurriculumTree: Lessons for standard:', lessons);
      
      // Pass the standard and its lessons to parent
      onStandardSelect(standard.code, lessons);
    } catch (error) {
      console.error('Error fetching lessons for standard:', error);
    }
  };

  // Set default content area when content areas load
  useEffect(() => {
    if (contentAreas.length > 0 && !selectedContentAreaId) {
      const nsContentArea = contentAreas.find(ca => ca.code === '6.NS');
      if (nsContentArea) {
        setSelectedContentAreaId(nsContentArea.id);
      }
    }
  }, [contentAreas, selectedContentAreaId]);

  // Auto-select 6.NS content area when available
  useEffect(() => {
    if (contentAreas.length > 0 && !selectedContentAreaId) {
      const nsContentArea = contentAreas.find(ca => ca.code === '6.NS');
      if (nsContentArea) {
        setSelectedContentAreaId(nsContentArea.id);
      }
    }
  }, [contentAreas, selectedContentAreaId]);

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold text-white">Math Tutoring</h1>
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-1">AI Assisted Learning</p>
      </div>

      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            type="text"
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 text-white border-gray-600 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">Curriculum</h2>
        </div>
        
        {searchTerm ? (
          // Show search results (disabled for now as we need to implement search)
          <div className="text-gray-400 text-sm">
            Search functionality coming soon...
          </div>
        ) : (
          // Show curriculum structure
          contentAreas
            .sort((a, b) => {
              const contentAreaOrder = ['6.NS', '6.CE', '6.MG', '6.PS', '6.PFA'];
              return contentAreaOrder.indexOf(a.code) - contentAreaOrder.indexOf(b.code);
            })
            .map((contentArea) => {
              const isContentAreaExpanded = expandedContentAreas.includes(contentArea.code);
              
              return (
                <div key={contentArea.code} className="curriculum-section mb-2">
                  <div
                    className="curriculum-item flex items-center p-2 rounded cursor-pointer hover:bg-blue-800 hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-200"
                    onClick={() => toggleContentArea(contentArea.code)}
                  >
                    {isContentAreaExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 mr-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
                    )}
                    <span className="text-white font-medium">{contentArea.code} - {contentArea.name}</span>
                  </div>
                  
                  {isContentAreaExpanded && (
                    <div className="ml-6 mt-2 space-y-1">
                      {standards
                        .map((standard) => (
                          <div
                            key={standard.id}
                            className={`curriculum-item flex items-center p-2 rounded cursor-pointer text-sm transition-all duration-200 ${
                              selectedStandard === standard.code
                                ? "bg-gradient-to-r from-green-500/60 to-emerald-500/60 text-white"
                                : "hover:bg-blue-800 hover:text-white hover:scale-105 hover:shadow-lg"
                            }`}
                            onClick={() => handleStandardSelect(standard)}
                          >
                            <Circle className="w-2 h-2 text-gray-400 mr-2" />
                            <span className={selectedStandard === standard.code ? "text-white" : "text-gray-300"}>
                              {standard.code} - {standard.description}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
