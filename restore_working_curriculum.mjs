import { readFileSync } from 'fs';
import { db } from './server/db.ts';
import { 
  subjects, 
  curriculumFrameworks, 
  contentAreas, 
  standards, 
  subStandards,
  subLessons,
  lessons
} from './shared/schema.ts';

async function restoreWorkingCurriculum() {
  console.log('🔄 Restoring working math curriculum...');
  
  // Read the working curriculum JSON
  const curriculumData = JSON.parse(readFileSync('./attached_assets/Math_1752093441933.json', 'utf8'));
  
  // Clear existing data
  await db.delete(subLessons);
  await db.delete(subStandards);
  await db.delete(standards);
  await db.delete(contentAreas);
  
  // Create default subject and framework
  const [mathSubject] = await db.insert(subjects).values({
    name: 'Mathematics',
    code: 'MATH',
    description: 'Grade 6 Mathematics curriculum',
    active: true
  }).returning();
  
  const [framework] = await db.insert(curriculumFrameworks).values({
    name: 'Virginia Department of Education',
    code: 'VA_DOE',
    description: 'Virginia DOE Standards',
    state: 'Virginia',
    active: true
  }).returning();
  
  // Process strands
  for (const strand of curriculumData.strands) {
    console.log(`📚 Processing strand: ${strand.strand_code}`);
    
    // Create content area
    const [contentArea] = await db.insert(contentAreas).values({
      name: strand.strand_name,
      code: strand.strand_code,
      description: strand.strand_name,
      grade: '6',
      subjectId: mathSubject.id,
      frameworkId: framework.id,
      active: true
    }).returning();
    
    // Process standards
    for (const standard of strand.standards) {
      // Create standard
      const [createdStandard] = await db.insert(standards).values({
        code: standard.standard,
        description: standard.standard_text,
        contentAreaId: contentArea.id,
        order: 0
      }).returning();
      
      // Process sub-lessons
      for (let i = 0; i < standard.sub_lessons.length; i++) {
        const subLesson = standard.sub_lessons[i];
        
        // Create sub-standard
        const [createdSubStandard] = await db.insert(subStandards).values({
          code: subLesson.code,
          description: subLesson.title,
          examples: subLesson.examples || [],
          standardId: createdStandard.id,
          order: i
        }).returning();
        
        // Create sub-lesson
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
  
  console.log('✅ Working curriculum restored successfully!');
  
  // Verify the data
  const contentAreasCount = await db.select().from(contentAreas);
  const standardsCount = await db.select().from(standards);
  const subLessonsCount = await db.select().from(subLessons);
  
  console.log(`📊 Summary:`);
  console.log(`   Content Areas: ${contentAreasCount.length}`);
  console.log(`   Standards: ${standardsCount.length}`);
  console.log(`   Sub-lessons: ${subLessonsCount.length}`);
  
  process.exit(0);
}

restoreWorkingCurriculum().catch(console.error);