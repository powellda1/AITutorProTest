import { db } from "./server/db";
import { lessons } from "./shared/schema";
import { eq } from "drizzle-orm";

interface LessonData {
  id: number;
  title: string;
  explanation: string;
  description: string;
  examples: Array<{example: string; answer: string}>;
}

function runFourStepAnalysis(lessonData: LessonData[], index: number, lesson: LessonData) {
  console.log(`\nLesson ${index + 1} (ID ${lesson.id}): "${lesson.title}"`);
  
  // Step 1: Mathematical content analysis
  const mathContent = lesson.examples?.map(ex => `${ex.example} → ${ex.answer}`).join(', ') || 'No examples found';
  console.log(`* Step 1 - Mathematical content: ${mathContent}`);
  
  // Step 2: Explanation text analysis for visual cues
  const explanation = lesson.explanation || 'No explanation provided';
  const hasVisualCues = explanation.includes('grid') || 
                       explanation.includes('model') || 
                       explanation.includes('visual') ||
                       explanation.includes('diagram');
  const visualCueText = hasVisualCues ? 
    'Visual cues detected' : 
    'No visual cues mentioned';
  console.log(`* Step 2 - Explanation text: "${explanation}" - ${visualCueText}`);
  
  // Step 3: Learning objectives analysis  
  const description = lesson.description || lesson.title;
  console.log(`* Step 3 - Learning objectives: ${description}`);
  
  // Step 4: Title analysis for component decision
  const title = lesson.title || 'No title';
  const titleLower = title.toLowerCase();
  let componentType = 'text-input'; // default
  let reasoning = 'text-based processing';
  
  if (titleLower.includes('convert between') && titleLower.includes('mixed number')) {
    componentType = 'mixed-number-visual';
    reasoning = 'bidirectional conversion with visual fraction representation';
  } else if (titleLower.includes('convert') && (titleLower.includes('fraction') || titleLower.includes('decimal'))) {
    componentType = 'fraction-visual-input';
    reasoning = 'fraction conversion with visual representation';
  } else if (titleLower.includes('compare') || titleLower.includes('order')) {
    componentType = 'comparison';
    reasoning = 'comparison-based interaction';
  } else if (titleLower.includes('equivalent')) {
    componentType = 'text-input';
    reasoning = 'multiple equivalent answers';
  } else if (titleLower.includes('repeating')) {
    componentType = 'text-input';
    reasoning = 'repeating decimal notation';
  } else if (titleLower.includes('lowest terms') || titleLower.includes('simplify')) {
    componentType = 'fraction-visual-input';
    reasoning = 'fraction simplification with visual representation';
  }
  
  console.log(`* Step 4 - Title analysis: "${title}" → Component decision: ${componentType} (${reasoning})`);
}

async function fetchAndAnalyzeLessons() {
  try {
    console.log('Fetching 6.NS.1.d lessons from database...');
    const result = await db.select().from(lessons).where(eq(lessons.standard_id, 723));
    
    console.log(`Found ${result.length} lessons for 6.NS.1.d (standard_id: 723)`);
    console.log('\n4-Step Analysis for Each Lesson:');
    console.log('================================');
    
    result.forEach((lesson, index) => {
      runFourStepAnalysis(result, index, lesson);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    process.exit(1);
  }
}

fetchAndAnalyzeLessons();