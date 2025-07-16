import { db } from './server/db.js';
import { contentAreas, standards, subLessons, subjects, curriculumFrameworks } from './shared/schema.js';
import fs from 'fs';

async function loadFromJsonFixed() {
  try {
    console.log('🔄 Loading curriculum from JSON with correct schema mapping...');
    
    // Read the JSON file
    const jsonData = JSON.parse(fs.readFileSync('./attached_assets/Math_1752283017261.json', 'utf8'));
    
    // Clear existing data
    await db.delete(subLessons);
    await db.delete(standards);
    await db.delete(contentAreas);
    await db.delete(subjects);
    await db.delete(curriculumFrameworks);
    
    // Create subject and framework
    const [subject] = await db.insert(subjects).values({
      name: 'Mathematics',
      code: 'MATH',
      description: 'Grade 6 Mathematics',
      active: true
    }).returning();
    
    const [framework] = await db.insert(curriculumFrameworks).values({
      name: 'Virginia Department of Education',
      code: 'VA_DOE',
      description: 'Virginia Standards of Learning',
      state: 'Virginia',
      active: true
    }).returning();
    
    // Process each strand from JSON
    for (const strand of jsonData.strands) {
      console.log(`📚 Processing strand: ${strand.strand_code} - ${strand.strand_name}`);
      
      // Create content area (maps to strand in JSON)
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
        console.log(`   📖 Standard: ${standard.standard}`);
        
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
    
    console.log('✅ Curriculum loaded successfully with correct schema mapping!');
    
  } catch (error) {
    console.error('❌ Error loading curriculum:', error);
    throw error;
  }
}

loadFromJsonFixed().catch(console.error);