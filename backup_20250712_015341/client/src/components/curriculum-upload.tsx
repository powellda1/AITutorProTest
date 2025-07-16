import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CurriculumUploadProps {
  onUploadComplete?: () => void;
}

export default function CurriculumUpload({ onUploadComplete }: CurriculumUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('curriculum', file);
      
      const response = await fetch('/api/curriculum/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload curriculum');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Curriculum loaded: ${data.categoriesCount} categories, ${data.lessonsCount} lessons`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lessons"] });
      setSelectedFile(null);
      onUploadComplete?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a JSON file",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a JSON file",
        variant: "destructive",
      });
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-white mb-2">Upload Curriculum</h3>
        <p className="text-sm text-gray-400">Upload a JSON file containing your full curriculum</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-600 hover:border-gray-500"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="w-12 h-12 text-gray-400" />
          </div>
          
          <div>
            <p className="text-gray-300 mb-2">Drag and drop your JSON file here</p>
            <p className="text-sm text-gray-500">or</p>
          </div>

          <div>
            <Input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="curriculum-upload"
            />
            <label htmlFor="curriculum-upload">
              <Button variant="outline" className="cursor-pointer">
                Select File
              </Button>
            </label>
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-400" />
            <div className="flex-1">
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      )}

      {uploadMutation.isError && (
        <div className="bg-red-500/10 border border-red-500 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">
              {uploadMutation.error?.message || "Upload failed"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}