import { db } from './server/db.js';
import { contentAreas, standards, subLessons, subjects, curriculumFrameworks } from './shared/schema.js';
import fs from 'fs';

async function loadRemainingStrands() {
  try {
    console.log('🔄 Loading remaining strands (6.PS and 6.PFA)...');
    
    // Read the JSON file
    const jsonData = JSON.parse(fs.readFileSync('./attached_assets/Math_1752283017261.json', 'utf8'));
    
    // Get existing subject and framework
    const subject = await db.query.subjects.findFirst({ where: (subjects, { eq }) => eq(subjects.code, 'MATH') });
    const framework = await db.query.curriculumFrameworks.findFirst({ where: (frameworks, { eq }) => eq(frameworks.code, 'VA_DOE') });
    
    if (!subject || !framework) {
      throw new Error('Subject or framework not found');
    }
    
    // Filter for only the missing strands
    const missingStrands = jsonData.strands.filter(strand => 
      strand.strand_code === '6.PS' || strand.strand_code === '6.PFA'
    );
    
    console.log(`Found ${missingStrands.length} missing strands to load`);
    
    // Process each missing strand
    for (const strand of missingStrands) {
      console.log(`📚 Processing strand: ${strand.strand_code} - ${strand.strand_name}`);
      
      // Create content area
      const [contentArea] = await db.insert(contentAreas).values({
        name: strand.strand_name,
        code: strand.strand_code,
        description: strand.strand_name,
        grade: '6',
        subjectId: subject.id,
        frameworkId: framework.id,
        active: true
      }).returning();
      
      // Process each standard within the strand
      for (const standard of strand.standards) {
        console.log(`   📖 Standard: ${standard.standard} (${standard.sub_lessons.length} lessons)`);
        
        // Create standard record
        const [createdStandard] = await db.insert(standards).values({
          code: standard.standard,
          description: standard.standard_text,
          contentAreaId: contentArea.id,
          order: 0
        }).returning();
        
        // Process sub_lessons from JSON
        for (let i = 0; i < standard.sub_lessons.length; i++) {
          const subLesson = standard.sub_lessons[i];
          
          // Create sub-lesson from JSON
          await db.insert(subLessons).values({
            title: subLesson.title,
            code: subLesson.code,
            explanation: subLesson.explanation,
            examples: subLesson.examples || [],
            standardId: createdStandard.id,
            order: i
          });
        }
      }
    }
    
    console.log('✅ Remaining strands loaded successfully!');
    
  } catch (error) {
    console.error('❌ Error loading remaining strands:', error);
    throw error;
  }
}

loadRemainingStrands().catch(console.error);