import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Circle, Search, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CurriculumUpload from "./curriculum-upload";
import type { Lesson } from "@shared/schema";

interface CurriculumTreeProps {
  onLessonSelect: (lesson: Lesson) => void;
  onStandardSelect: (standard: string, lessons: Lesson[]) => void;
  selectedLessonId?: number;
  selectedStandard?: string;
}

export default function CurriculumTree({ onLessonSelect, onStandardSelect, selectedLessonId, selectedStandard }: CurriculumTreeProps) {
  const [expandedStrands, setExpandedStrands] = useState<string[]>(['6.NS']);
  const [expandedStandards, setExpandedStandards] = useState<string[]>(['6.NS.1']);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data: lessons = [] } = useQuery<Lesson[]>({
    queryKey: ["/api/lessons"],
  });

  // Group lessons by strand and standard
  const groupedLessons = lessons.reduce((acc: any, lesson: Lesson) => {
    if (!lesson.strandCode || !lesson.standard) return acc;
    
    if (!acc[lesson.strandCode]) {
      acc[lesson.strandCode] = {
        name: lesson.strandName,
        standards: {}
      };
    }
    
    if (!acc[lesson.strandCode].standards[lesson.standard]) {
      acc[lesson.strandCode].standards[lesson.standard] = {
        text: lesson.standardText,
        subStandards: []
      };
    }
    
    acc[lesson.strandCode].standards[lesson.standard].subStandards.push(lesson);
    return acc;
  }, {});

  const toggleStrand = (strandCode: string) => {
    setExpandedStrands(prev => 
      prev.includes(strandCode) 
        ? prev.filter(code => code !== strandCode)
        : [...prev, strandCode]
    );
  };

  const toggleStandard = (standardCode: string) => {
    setExpandedStandards(prev => 
      prev.includes(standardCode) 
        ? prev.filter(code => code !== standardCode)
        : [...prev, standardCode]
    );
  };

  const filteredLessons = searchTerm ? lessons.filter((lesson: Lesson) => 
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) : lessons;

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-semibold text-white">Math Tutoring</h1>
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
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-gray-400 hover:text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Upload Curriculum</DialogTitle>
              </DialogHeader>
              <CurriculumUpload onUploadComplete={() => setUploadDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        
        {searchTerm ? (
          // Show search results
          filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`curriculum-item flex items-center p-2 rounded cursor-pointer text-sm transition-colors ${
                selectedLessonId === lesson.id
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => onLessonSelect(lesson)}
            >
              <Circle className="w-2 h-2 text-gray-400 mr-2" />
              <span className={selectedLessonId === lesson.id ? "text-white" : "text-gray-400 hover:text-white"}>
                {lesson.subStandard}: {lesson.description}
              </span>
            </div>
          ))
        ) : (
          // Show grouped curriculum structure
          Object.entries(groupedLessons).map(([strandCode, strand]: [string, any]) => {
            const isStrandExpanded = expandedStrands.includes(strandCode);
            
            return (
              <div key={strandCode} className="curriculum-section mb-2">
                <div
                  className="curriculum-item flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => toggleStrand(strandCode)}
                >
                  {isStrandExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 mr-2" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <span className="text-white font-medium">{strandCode} - {strand.name}</span>
                </div>
                
                {isStrandExpanded && (
                  <div className="ml-6 mt-2 space-y-1">
                    {Object.entries(strand.standards).map(([standardCode, standard]: [string, any]) => {
                      const isStandardExpanded = expandedStandards.includes(standardCode);
                      
                      return (
                        <div key={standardCode} className="mb-2">
                          <div
                            className={`curriculum-item flex items-center p-2 rounded cursor-pointer transition-colors ${
                              selectedStandard === standardCode
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-700"
                            }`}
                            onClick={() => {
                              toggleStandard(standardCode);
                              onStandardSelect(standardCode, standard.subStandards);
                            }}
                          >
                            {isStandardExpanded ? (
                              <ChevronDown className="w-3 h-3 text-gray-400 mr-2" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-gray-400 mr-2" />
                            )}
                            <span className={`text-sm ${selectedStandard === standardCode ? "text-white" : "text-gray-300"}`}>
                              {standard.text}
                            </span>
                          </div>
                          
                          {isStandardExpanded && (
                            <div className="ml-6 mt-1 space-y-1">
                              {standard.subStandards.map((lesson: Lesson) => (
                                <div
                                  key={lesson.id}
                                  className={`curriculum-item flex items-center p-2 rounded cursor-pointer text-sm transition-colors ${
                                    selectedLessonId === lesson.id
                                      ? "bg-blue-600 text-white"
                                      : "hover:bg-gray-700"
                                  }`}
                                  onClick={() => onLessonSelect(lesson)}
                                >
                                  <Circle className="w-2 h-2 text-gray-400 mr-2" />
                                  <span className={selectedLessonId === lesson.id ? "text-white" : "text-gray-400 hover:text-white"}>
                                    {lesson.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
