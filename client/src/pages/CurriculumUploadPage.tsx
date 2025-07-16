import CurriculumUploadEnhanced from '@/components/curriculum-upload-enhanced';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Link } from 'wouter';

export default function CurriculumUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Main App
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Curriculum Management</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Upload and manage curriculum content from JSON, PDF, or Word documents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Upload Component */}
          <div className="lg:col-span-2">
            <CurriculumUploadEnhanced onUploadComplete={() => {
              console.log('Upload completed');
            }} />
          </div>

          {/* Information Panel */}
          <div className="space-y-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Supported Formats</CardTitle>
                <CardDescription className="dark:text-gray-400">File types we can process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm text-gray-700 dark:text-gray-300"><strong>JSON:</strong> Direct curriculum data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-gray-700 dark:text-gray-300"><strong>PDF:</strong> Curriculum guides & standards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <span className="text-sm text-gray-700 dark:text-gray-300"><strong>Word:</strong> Lesson plans & curricula</span>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Curriculum Structures</CardTitle>
                <CardDescription className="dark:text-gray-400">Flexible parsing for different formats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Strands:</strong> Math-style with standards and sub-lessons
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Domains:</strong> Common Core with clusters and standards
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Units:</strong> Unit-based with topics and activities
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Flexible:</strong> Any structure - auto-adapts
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Automatic Detection</CardTitle>
                <CardDescription className="dark:text-gray-400">Smart parsing features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  • Subject identification from content
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  • Framework detection (Common Core, VA DOE, etc.)
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  • Grade level extraction
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  • Hierarchy pattern recognition
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  • Content area organization
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}