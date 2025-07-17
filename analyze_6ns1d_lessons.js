// Parse the JSON data and run 4-step analysis
const lessonsData = `[{"id":3535,"title":"Write fractions in lowest terms","code":"6-G.1","explanation":"Students simplify fractions by dividing the numerator and denominator by their greatest common factor to find equivalent forms.","examples":["6/12 simplified to 1/2.","10/25 simplified to 2/5.","8/24 simplified to 1/3."],"standardId":723,"order":0},{"id":3536,"title":"Convert between improper fractions and mixed numbers","code":"6-G.3","explanation":"Students rewrite improper fractions as mixed numbers by dividing and expressing remainders, and convert mixed numbers back to improper fractions.","examples":["11/4 = 2 3/4.","13/3 = 4 1/3.","8/5 = 1 3/5."],"standardId":723,"order":1},{"id":3537,"title":"Convert decimals to fractions","code":"6","explanation":"Students express a decimal as a fraction with a denominator that is a power of 10, then simplify to lowest terms.","examples":["0.6 = 6/10 = 3/5.","0.25 = 25/100 = 1/4.","0.375 = 375/1000 = 3/8."],"standardId":723,"order":2},{"id":3538,"title":"Convert between fractions and repeating decimals","code":"6-G.6","explanation":"Students convert fractions to their decimal form, recognizing repeating patterns for certain denominators.","examples":["1/3 = 0.333...","4/9 = 0.444...","5/11 = 0.454545..."],"standardId":723,"order":3},{"id":3539,"title":"Convert between percents, fractions, and decimals","code":"6-U.4","explanation":"Students practice converting among fractions, decimals, and percents using equivalent forms and models like number lines or grids.","examples":["2/5 = 0.4 = 40%.","0.8 = 4/5 = 80%.","25% = 1/4 = 0.25."],"standardId":723,"order":4},{"id":3540,"title":"Convert between percents, fractions, and decimals: word problems","code":"6-U.5","explanation":"Students apply conversion skills to solve real-world problems involving percents, fractions, and decimals.","examples":["A shirt is discounted by 30%. If the original price is $20, the discount is 0.3 × 20 = $6.","If 2/5 of a class is 10 students, the class size is 25 students (2/5 = 0.4, 10 ÷ 0.4 = 25).","0.15 of a budget is $30, so the total budget is $200 (30 ÷ 0.15 = 200)."],"standardId":723,"order":5},{"id":3541,"title":"Equivalent fractions review","code":"6","explanation":"Students practice finding equivalent fractions by multiplying or dividing numerator and denominator by the same number.","examples":["2/3 = 4/6.","5/10 = 1/2.","3/9 = 1/3."],"standardId":723,"order":6},{"id":3542,"title":"Convert fractions to decimals","code":"6","explanation":"Students divide the numerator by the denominator to express a fraction as a decimal, recognizing terminating or repeating decimals.","examples":["3/5 = 0.6.","1/8 = 0.125.","2/3 = 0.666..."],"standardId":723,"order":7},{"id":3543,"title":"Convert between decimals and mixed numbers","code":"6","explanation":"Students convert decimals greater than 1 to mixed numbers and vice versa, using place value or division.","examples":["2.5 = 2 1/2.","1.75 = 1 3/4.","3 2/5 = 3.4."],"standardId":723,"order":8}]`;

function runFourStepAnalysis() {
  const lessons = JSON.parse(lessonsData);
  
  console.log("4-Step Analysis for Each Lesson:");
  console.log("================================");
  
  lessons.forEach((lesson, index) => {
    console.log(`\nLesson ${index + 1} (ID ${lesson.id}): "${lesson.title}"`);
    
    // Step 1: Mathematical content analysis
    const mathContent = lesson.examples.map(ex => {
      // Clean up the examples to show just the core mathematical content
      return ex.replace(/\.$/, '').replace(/Students? /, '').replace(/simplified to /, '→ ');
    }).join(', ');
    console.log(`* Step 1 - Mathematical content: ${mathContent}`);
    
    // Step 2: Explanation text analysis for visual cues
    const explanation = lesson.explanation;
    const hasVisualCues = explanation.includes('grid') || 
                         explanation.includes('model') || 
                         explanation.includes('visual') ||
                         explanation.includes('diagram') ||
                         explanation.includes('number line');
    const visualCueText = hasVisualCues ? 
      `Visual cues detected: ${explanation.match(/(grid|model|visual|diagram|number line)/gi)?.join(', ')}` : 
      'No visual cues mentioned';
    console.log(`* Step 2 - Explanation text: "${explanation}" - ${visualCueText}`);
    
    // Step 3: Learning objectives analysis
    const titleLower = lesson.title.toLowerCase();
    let objectiveType = 'mathematical processing';
    
    if (titleLower.includes('convert between')) {
      objectiveType = 'bidirectional conversion skills';
    } else if (titleLower.includes('convert')) {
      objectiveType = 'conversion skills';
    } else if (titleLower.includes('simplify') || titleLower.includes('lowest terms')) {
      objectiveType = 'fraction simplification';
    } else if (titleLower.includes('equivalent')) {
      objectiveType = 'equivalent form recognition';
    } else if (titleLower.includes('word problem')) {
      objectiveType = 'real-world application';
    }
    
    console.log(`* Step 3 - Learning objectives: ${objectiveType}`);
    
    // Step 4: Title analysis and component decision
    const title = lesson.title;
    let componentType = 'text-input'; // default
    let reasoning = 'text-based conversion results';
    
    if (titleLower.includes('convert between') && titleLower.includes('mixed number')) {
      componentType = 'mixed-number-visual';
      reasoning = 'bidirectional conversion with visual fraction representation';
    } else if (titleLower.includes('word problem')) {
      componentType = 'word-problem';
      reasoning = 'real-world problem solving with step-by-step guidance';
    } else if (titleLower.includes('convert') && (titleLower.includes('fraction') || titleLower.includes('decimal'))) {
      componentType = 'fraction-visual-input';
      reasoning = 'fraction conversion with visual representation';
    } else if (titleLower.includes('repeating decimal')) {
      componentType = 'text-input';
      reasoning = 'repeating decimal notation (0.333...)';
    } else if (titleLower.includes('lowest terms') || titleLower.includes('simplify')) {
      componentType = 'fraction-visual-input';
      reasoning = 'fraction simplification with visual representation';
    } else if (titleLower.includes('equivalent')) {
      componentType = 'text-input';
      reasoning = 'multiple equivalent forms';
    } else if (titleLower.includes('percents, fractions, and decimals') && explanation.includes('models like number lines or grids')) {
      componentType = 'conversion-grid';
      reasoning = 'triple conversion with visual models mentioned in explanation';
    }
    
    console.log(`* Step 4 - Title analysis: "${title}" → Component decision: ${componentType} (${reasoning})`);
    
    // Special marker for target lesson
    if (lesson.id === 3536) {
      console.log('⭐ TARGET SUB-LESSON - Previous analysis confirmed');
    }
  });
}

// Run the analysis
runFourStepAnalysis();