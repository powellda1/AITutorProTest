import fs from 'fs';
import { eq } from 'drizzle-orm';
import { db } from './server/db.ts';
import { subjects, curriculumFrameworks, contentAreas, standards, subLessons } from './shared/schema.ts';

async function loadCompleteMathCurriculum() {
  try {
    console.log('🔄 Loading complete Math curriculum...');
    
    // Read JSON file
    const jsonData = JSON.parse(fs.readFileSync('./attached_assets/Math_1752213331588.json', 'utf8'));
    
    console.log(`📊 Curriculum Info:`);
    console.log(`   Grade: ${jsonData.grade}`);
    console.log(`   Subject: ${jsonData.subject}`);
    console.log(`   State: ${jsonData.state}`);
    console.log(`   Strands: ${jsonData.strands.length}`);
    
    // Get existing subject and framework
    const subject = await db.select().from(subjects).where(eq(subjects.code, 'MATH')).limit(1);
    const framework = await db.select().from(curriculumFrameworks).where(eq(curriculumFrameworks.code, 'VA_DOE')).limit(1);
    
    if (subject.length === 0 || framework.length === 0) {
      console.log('❌ Subject or framework not found. Please ensure they exist.');
      return;
    }
    
    console.log(`📋 Using subject: ${subject[0].name} (${subject[0].code})`);
    console.log(`📋 Using framework: ${framework[0].name} (${framework[0].code})`);
    
    let totalStandards = 0;
    let totalSubLessons = 0;
    
    // Process all strands efficiently
    for (const strand of jsonData.strands) {
      console.log(`\n📚 Processing strand: ${strand.strand_code} - ${strand.strand_name}`);
      
      // Insert content area
      const [contentArea] = await db.insert(contentAreas).values({
        code: strand.strand_code,
        name: strand.strand_name,
        description: strand.strand_name,
        grade: jsonData.grade,
        subjectId: subject[0].id,
        frameworkId: framework[0].id,
        state: jsonData.state,
      }).returning();
      
      console.log(`   ✅ Created content area: ${contentArea.code}`);
      
      // Process standards
      for (const standardData of strand.standards) {
        // Create standard
        const [standard] = await db.insert(standards).values({
          code: standardData.standard,
          description: standardData.standard_text,
          contentAreaId: contentArea.id,
          order: totalStandards
        }).returning();
        
        totalStandards++;
        
        // Process sub-lessons
        for (const [index, subLessonData] of standardData.sub_lessons.entries()) {
          await db.insert(subLessons).values({
            title: subLessonData.title,
            code: subLessonData.code,
            explanation: subLessonData.explanation,
            examples: subLessonData.examples,
            standardId: standard.id,
            order: index
          });
          
          totalSubLessons++;
        }
        
        console.log(`      📖 Standard: ${standard.code} (${standardData.sub_lessons.length} activities)`);
      }
    }
    
    console.log(`\n🎉 Successfully loaded complete Math curriculum!`);
    console.log(`📊 Summary:`);
    console.log(`   Content Areas: ${jsonData.strands.length}`);
    console.log(`   Standards: ${totalStandards}`);
    console.log(`   Sub-lessons: ${totalSubLessons}`);
    
  } catch (error) {
    console.error('❌ Error loading curriculum:', error);
  }
}

loadCompleteMathCurriculum();