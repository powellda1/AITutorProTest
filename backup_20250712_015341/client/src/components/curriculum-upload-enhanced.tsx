import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, AlertCircle, Book, FileJson, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CurriculumUploadEnhancedProps {
  onUploadComplete?: () => void;
}

interface ValidationResult {
  validation: {
    valid: boolean;
    errors: string[];
  };
  metadata: {
    subjectHint?: string;
    frameworkHint?: string;
    gradeLevel?: string;
    hierarchyPattern?: string;
    contentAreas?: string[];
  };
  suggestions: {
    subjectCode: string;
    frameworkCode: string;
  };
}

export default function CurriculumUploadEnhanced({ onUploadComplete }: CurriculumUploadEnhancedProps) {
  const [uploadStep, setUploadStep] = useState<'select' | 'validate' | 'configure' | 'loading'>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedContent, setParsedContent] = useState<any>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [frameworkCode, setFrameworkCode] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customFramework, setCustomFramework] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const parseFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadProgress(20);
      
      if (file.type === 'application/json') {
        // Parse JSON directly
        const text = await file.text();
        const content = JSON.parse(text);
        setUploadProgress(60);
        return content;
      } else if (file.type === 'application/pdf') {
        // Send PDF to server for parsing
        const response = await fetch('/api/curriculum/parse-pdf', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setUploadProgress(60);
        return result;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.type === 'application/msword') {
        // Send Word doc to server for parsing
        const response = await fetch('/api/curriculum/parse-word', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setUploadProgress(60);
        return result;
      } else {
        throw new Error('Unsupported file type. Please upload JSON, PDF, or Word documents.');
      }
    },
    onSuccess: (content) => {
      setParsedContent(content);
      setUploadProgress(80);
      validateContent(content);
    },
    onError: (error: Error) => {
      console.error('Parse error:', error);
      toast({
        title: "File Parse Error",
        description: error.message,
        variant: "destructive",
      });
      setUploadStep('select');
      setUploadProgress(0);
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (curriculumData: any) => {
      const response = await fetch('/api/curriculum/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ curriculumData }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result as ValidationResult;
    },
    onSuccess: (result) => {
      setValidation(result);
      setSubjectCode(result.suggestions.subjectCode);
      setFrameworkCode(result.suggestions.frameworkCode);
      setUploadProgress(100);
      
      if (result.validation.valid) {
        setUploadStep('configure');
        toast({
          title: "Curriculum Validated",
          description: `Structure: ${result.metadata.hierarchyPattern || 'Unknown'}`,
        });
      } else {
        toast({
          title: "Validation Issues",
          description: result.validation.errors.join(', '),
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      console.error('Validation error:', error);
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loadMutation = useMutation({
    mutationFn: async ({ curriculumData, subjectCode, frameworkCode }: {
      curriculumData: any;
      subjectCode: string;
      frameworkCode: string;
    }) => {
      const response = await fetch('/api/curriculum/load-generic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ curriculumData, subjectCode, frameworkCode }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: (result) => {
      toast({
        title: "Curriculum Loaded Successfully",
        description: `Loaded ${result.strandsCount} content areas with ${result.lessonsCount} total lessons`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lessons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/strands'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      onUploadComplete?.();
      
      // Reset form
      setUploadStep('select');
      setSelectedFile(null);
      setParsedContent(null);
      setValidation(null);
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      console.error('Load error:', error);
      toast({
        title: "Load Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateContent = useCallback((content: any) => {
    validateMutation.mutate(content);
  }, [validateMutation]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStep('validate');
      setUploadProgress(10);
      parseFileMutation.mutate(file);
    }
  };

  const handleLoadCurriculum = () => {
    if (!parsedContent) return;
    
    const finalSubjectCode = customSubject || subjectCode;
    const finalFrameworkCode = customFramework || frameworkCode;
    
    setUploadStep('loading');
    loadMutation.mutate({
      curriculumData: parsedContent,
      subjectCode: finalSubjectCode,
      frameworkCode: finalFrameworkCode,
    });
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.json')) return <FileJson className="h-4 w-4" />;
    if (fileName.endsWith('.pdf')) return <FileText className="h-4 w-4" />;
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return <File className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getStepColor = (step: string) => {
    if (uploadStep === 'loading') return 'bg-blue-500';
    if (uploadStep === 'configure' && step === 'validate') return 'bg-green-500';
    if (uploadStep === step) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Curriculum
          </CardTitle>
          <CardDescription>
            Upload your curriculum in JSON, PDF, or Word document format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStepColor('select')}`} />
              <span className="text-sm">Select File</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStepColor('validate')}`} />
              <span className="text-sm">Validate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStepColor('configure')}`} />
              <span className="text-sm">Configure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStepColor('loading')}`} />
              <span className="text-sm">Load</span>
            </div>
          </div>

          {uploadProgress > 0 && (
            <Progress value={uploadProgress} className="w-full" />
          )}

          {/* Step 1: File Selection */}
          {uploadStep === 'select' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <Label htmlFor="curriculum-file" className="cursor-pointer">
                  <span className="text-lg font-medium">Choose curriculum file</span>
                  <p className="text-sm text-gray-500 mt-1">
                    Supports JSON, PDF, and Word documents
                  </p>
                </Label>
                <Input
                  id="curriculum-file"
                  type="file"
                  accept=".json,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="text-center p-4">
                  <FileJson className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-medium">JSON Files</h3>
                  <p className="text-sm text-gray-500">Direct curriculum data</p>
                </Card>
                <Card className="text-center p-4">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-red-500" />
                  <h3 className="font-medium">PDF Files</h3>
                  <p className="text-sm text-gray-500">Curriculum guides & standards</p>
                </Card>
                <Card className="text-center p-4">
                  <File className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium">Word Documents</h3>
                  <p className="text-sm text-gray-500">Lesson plans & curricula</p>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Validation Results */}
          {uploadStep === 'validate' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFile?.name || '')}
                <span className="font-medium">{selectedFile?.name}</span>
                <Badge variant="secondary">{selectedFile?.type}</Badge>
              </div>
              
              {parseFileMutation.isPending || validateMutation.isPending ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p>Processing curriculum file...</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Step 3: Configuration */}
          {uploadStep === 'configure' && validation && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Curriculum validated successfully</span>
              </div>

              {/* Validation Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Detected Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{validation.metadata.hierarchyPattern}</p>
                    {validation.metadata.contentAreas && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Content Areas:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {validation.metadata.contentAreas.slice(0, 5).map((area, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                          {validation.metadata.contentAreas.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{validation.metadata.contentAreas.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Detected Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {validation.metadata.subjectHint && (
                      <p className="text-sm">Subject: {validation.metadata.subjectHint}</p>
                    )}
                    {validation.metadata.frameworkHint && (
                      <p className="text-sm">Framework: {validation.metadata.frameworkHint}</p>
                    )}
                    {validation.metadata.gradeLevel && (
                      <p className="text-sm">Grade Level: {validation.metadata.gradeLevel}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Configuration Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject-code">Subject Code</Label>
                    <Select value={subjectCode} onValueChange={setSubjectCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MATH">Mathematics</SelectItem>
                        <SelectItem value="SCIENCE">Science</SelectItem>
                        <SelectItem value="ELA">English Language Arts</SelectItem>
                        <SelectItem value="SOCIAL_STUDIES">Social Studies</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="framework-code">Framework Code</Label>
                    <Select value={frameworkCode} onValueChange={setFrameworkCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIRGINIA_DOE">Virginia Department of Education</SelectItem>
                        <SelectItem value="COMMON_CORE">Common Core State Standards</SelectItem>
                        <SelectItem value="NGSS">Next Generation Science Standards</SelectItem>
                        <SelectItem value="CUSTOM">Custom Framework</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {subjectCode === 'CUSTOM' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-subject">Custom Subject Name</Label>
                    <Input
                      id="custom-subject"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Enter custom subject name"
                    />
                  </div>
                )}

                {frameworkCode === 'CUSTOM' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-framework">Custom Framework Name</Label>
                    <Input
                      id="custom-framework"
                      value={customFramework}
                      onChange={(e) => setCustomFramework(e.target.value)}
                      placeholder="Enter custom framework name"
                    />
                  </div>
                )}
              </div>

              {/* Validation Errors */}
              {!validation.validation.valid && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Validation Issues:</strong>
                    <ul className="mt-2 list-disc list-inside">
                      {validation.validation.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button onClick={handleLoadCurriculum} disabled={loadMutation.isPending}>
                  {loadMutation.isPending ? 'Loading...' : 'Load Curriculum'}
                </Button>
                <Button variant="outline" onClick={() => setUploadStep('select')}>
                  Start Over
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Loading */}
          {uploadStep === 'loading' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading curriculum into database...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}