// Test script to run 4-step analysis for all 6.NS.1.d lessons
const { analyzeLessonType } = require('./client/src/utils/lessonProcessor.ts');

// Sample 6.NS.1.d lesson data (from database)
const lessons = [
  {
    id: 3535,
    title: "Write fractions in lowest terms",
    explanation: "Students will simplify fractions by dividing the numerator and denominator by their greatest common factor (GCF).",
    examples: [
      { example: "6/12", answer: "1/2" },
      { example: "10/25", answer: "2/5" },
      { example: "8/24", answer: "1/3" }
    ]
  },
  {
    id: 3536,
    title: "Convert between improper fractions and mixed numbers",
    explanation: "Students will convert improper fractions to mixed numbers by dividing and expressing remainders, and convert mixed numbers to improper fractions.",
    examples: [
      { example: "11/4", answer: "2 3/4" },
      { example: "4 1/3", answer: "13/3" },
      { example: "8/5", answer: "1 3/5" }
    ]
  },
  {
    id: 3537,
    title: "Convert decimals to fractions",
    explanation: "Students will express a decimal as a fraction with a denominator that is a power of 10, then simplify to lowest terms.",
    examples: [
      { example: "0.6", answer: "3/5" },
      { example: "0.25", answer: "1/4" },
      { example: "0.8", answer: "4/5" }
    ]
  },
  {
    id: 3538,
    title: "Convert fractions to decimals",
    explanation: "Students will convert fractions to decimals by dividing the numerator by the denominator.",
    examples: [
      { example: "3/4", answer: "0.75" },
      { example: "1/8", answer: "0.125" },
      { example: "7/10", answer: "0.7" }
    ]
  },
  {
    id: 3539,
    title: "Repeating decimals",
    explanation: "Students will identify and work with repeating decimals, understanding their fraction representations.",
    examples: [
      { example: "1/3", answer: "0.333..." },
      { example: "2/9", answer: "0.222..." },
      { example: "5/6", answer: "0.8333..." }
    ]
  },
  {
    id: 3540,
    title: "Converting between fractions, decimals, and percents",
    explanation: "Students will convert between all three representations: fractions, decimals, and percents.",
    examples: [
      { example: "1/2", answer: "0.5 = 50%" },
      { example: "0.75", answer: "3/4 = 75%" },
      { example: "40%", answer: "0.4 = 2/5" }
    ]
  },
  {
    id: 3541,
    title: "Equivalent fractions",
    explanation: "Students will find equivalent fractions by multiplying or dividing both numerator and denominator by the same non-zero number.",
    examples: [
      { example: "2/3", answer: "4/6, 6/9, 8/12" },
      { example: "3/5", answer: "6/10, 9/15, 12/20" },
      { example: "1/4", answer: "2/8, 3/12, 4/16" }
    ]
  },
  {
    id: 3542,
    title: "Compare fractions with different denominators",
    explanation: "Students will compare fractions by finding common denominators or converting to decimals.",
    examples: [
      { example: "2/3 vs 3/4", answer: "3/4 > 2/3" },
      { example: "5/8 vs 1/2", answer: "5/8 > 1/2" },
      { example: "3/5 vs 7/10", answer: "7/10 > 3/5" }
    ]
  },
  {
    id: 3543,
    title: "Order fractions, decimals, and percents",
    explanation: "Students will order mixed representations from least to greatest or greatest to least.",
    examples: [
      { example: "0.3, 1/4, 40%", answer: "1/4, 0.3, 40%" },
      { example: "75%, 0.6, 5/8", answer: "0.6, 5/8, 75%" },
      { example: "2/5, 50%, 0.45", answer: "2/5, 0.45, 50%" }
    ]
  }
];

function runFourStepAnalysis() {
  console.log("4-Step Analysis for Each Lesson:");
  console.log("================================");
  
  lessons.forEach((lesson, index) => {
    console.log(`\nLesson ${index + 1} (ID ${lesson.id}): "${lesson.title}"`);
    
    // Step 1: Mathematical content analysis
    const mathContent = lesson.examples.map(ex => `${ex.example} → ${ex.answer}`).join(', ');
    console.log(`* Step 1 - Mathematical content: ${mathContent}`);
    
    // Step 2: Explanation text analysis for visual cues
    const hasVisualCues = lesson.explanation.includes('grid') || 
                         lesson.explanation.includes('model') || 
                         lesson.explanation.includes('visual') ||
                         lesson.explanation.includes('diagram');
    const visualCueText = hasVisualCues ? 
      `Visual cues detected: ${lesson.explanation}` : 
      `No visual cues mentioned in explanation`;
    console.log(`* Step 2 - Explanation text: "${lesson.explanation}" - ${visualCueText}`);
    
    // Step 3: Learning objectives analysis
    const objectiveKeywords = [];
    if (lesson.title.includes('convert')) objectiveKeywords.push('conversion');
    if (lesson.title.includes('compare')) objectiveKeywords.push('comparison');
    if (lesson.title.includes('order')) objectiveKeywords.push('ordering');
    if (lesson.title.includes('simplify') || lesson.title.includes('lowest terms')) objectiveKeywords.push('simplification');
    if (lesson.title.includes('equivalent')) objectiveKeywords.push('equivalence');
    
    const objectiveDescription = objectiveKeywords.length > 0 ? 
      objectiveKeywords.join(', ') : 
      'mathematical processing';
    console.log(`* Step 3 - Learning objectives: ${objectiveDescription}`);
    
    // Step 4: Title analysis and component decision
    const titleLower = lesson.title.toLowerCase();
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
    }
    
    console.log(`* Step 4 - Title analysis: "${lesson.title}" → Component decision: ${componentType} (${reasoning})`);
    
    // Show current system analysis for comparison
    const currentAnalysis = analyzeLessonType(lesson.explanation, lesson.title, '6.NS.1.d');
    console.log(`* Current system output: ${currentAnalysis.componentType} (${currentAnalysis.type})`);
  });
}

// Run the analysis
runFourStepAnalysis();