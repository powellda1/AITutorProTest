import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Circle, Search, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CurriculumUpload from "./curriculum-upload";
import type { Lesson, Strand, Standard, SubStandard } from "@shared/schema";

interface CurriculumTreeProps {
  onLessonSelect: (lesson: Lesson) => void;
  onSubStandardSelect: (subStandard: SubStandard) => void;
  selectedLessonId?: number;
  selectedSubStandard?: string;
}

export default function CurriculumTree({ onLessonSelect, onSubStandardSelect, selectedLessonId, selectedSubStandard }: CurriculumTreeProps) {
  const [expandedStrands, setExpandedStrands] = useState<number[]>([17]); // Start with first strand expanded
  const [expandedStandards, setExpandedStandards] = useState<number[]>([47]); // Start with first standard expanded
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data: strands = [] } = useQuery<Strand[]>({
    queryKey: ["/api/strands"],
  });

  const { data: allStandards = [] } = useQuery<Standard[]>({
    queryKey: ["/api/standards", "all"],
    queryFn: async () => {
      const results = await Promise.all(
        strands.map(strand => 
          fetch(`/api/standards/${strand.id}`).then(res => res.json())
        )
      );
      return results.flat();
    },
    enabled: strands.length > 0,
  });

  const { data: allSubStandards = [] } = useQuery<SubStandard[]>({
    queryKey: ["/api/sub-standards", "all"],
    queryFn: async () => {
      const results = await Promise.all(
        allStandards.map(standard => 
          fetch(`/api/sub-standards/${standard.id}`).then(res => res.json())
        )
      );
      return results.flat();
    },
    enabled: allStandards.length > 0,
  });

  const toggleStrand = (strandId: number) => {
    setExpandedStrands(prev => 
      prev.includes(strandId) 
        ? prev.filter(id => id !== strandId)
        : [...prev, strandId]
    );
  };

  const toggleStandard = (standardId: number) => {
    setExpandedStandards(prev => 
      prev.includes(standardId) 
        ? prev.filter(id => id !== standardId)
        : [...prev, standardId]
    );
  };

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
        
        <div className="space-y-2">
          {strands.map((strand) => (
            <div key={strand.id} className="space-y-1">
              <div 
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 cursor-pointer"
                onClick={() => toggleStrand(strand.id)}
              >
                {expandedStrands.includes(strand.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-white font-medium">{strand.name}</span>
              </div>
              
              {expandedStrands.includes(strand.id) && (
                <div className="ml-6 space-y-1">
                  {allStandards.filter(standard => standard.strandId === strand.id).map((standard) => (
                    <div key={standard.id} className="space-y-1">
                      <div 
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 cursor-pointer"
                        onClick={() => toggleStandard(standard.id)}
                      >
                        {expandedStandards.includes(standard.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-gray-300">{standard.description}</span>
                      </div>
                      
                      {expandedStandards.includes(standard.id) && (
                        <div className="ml-6 space-y-1">
                          {allSubStandards.filter(subStandard => subStandard.standardId === standard.id).map((subStandard) => (
                            <div
                              key={subStandard.id}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                                selectedSubStandard === subStandard.code
                                  ? 'bg-blue-600 text-white'
                                  : 'hover:bg-gray-700 text-gray-300'
                              }`}
                              onClick={() => onSubStandardSelect(subStandard)}
                            >
                              <Circle className="w-2 h-2 fill-current" />
                              <span className="text-sm">{subStandard.code}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}