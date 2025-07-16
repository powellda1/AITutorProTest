import fs from 'fs';
import { eq } from 'drizzle-orm';
import { db } from './server/db.ts';
import { subjects, curriculumFrameworks, contentAreas, standards, subLessons } from './shared/schema.ts';

/**
 * Load Math curriculum using Option A structure:
 * content_areas → standards → sub_lessons
 * 
 * Maps:
 * - JSON strands → content_areas table
 * - JSON standards → standards table  
 * - JSON sub_lessons → sub_lessons table
 */

async function loadMathCurriculum() {
  try {
    console.log('🔄 Loading Math curriculum (Option A structure)...');
    
    // Read JSON file
    const jsonData = JSON.parse(fs.readFileSync('./attached_assets/Math_1752213331588.json', 'utf8'));
    
    console.log(`📊 Curriculum Info:`);
    console.log(`   Grade: ${jsonData.grade}`);
    console.log(`   Subject: ${jsonData.subject}`);
    console.log(`   State: ${jsonData.state}`);
    console.log(`   Strands: ${jsonData.strands.length}`);
    
    // Data already cleared via SQL tool
    console.log('🧹 Database cleared, loading new curriculum data...');
    
    // First, get or create subject and framework records
    let subject = await db.select().from(subjects).where(eq(subjects.code, 'MATH')).limit(1);
    if (subject.length === 0) {
      [subject] = await db.insert(subjects).values({
        name: jsonData.subject,
        code: 'MATH',
        description: 'Mathematics curriculum'
      }).returning();
    } else {
      subject = subject[0];
    }
    
    let framework = await db.select().from(curriculumFrameworks).where(eq(curriculumFrameworks.code, 'VA_DOE')).limit(1);
    if (framework.length === 0) {
      [framework] = await db.insert(curriculumFrameworks).values({
        name: `${jsonData.state} DOE`,
        code: 'VA_DOE',
        description: `${jsonData.state} Department of Education`,
        state: jsonData.state
      }).returning();
    } else {
      framework = framework[0];
    }
    
    console.log(`📋 Created subject: ${subject.name} (${subject.code})`);
    console.log(`📋 Created framework: ${framework.name} (${framework.code})`);
    
    let totalStandards = 0;
    let totalSubLessons = 0;
    
    // Process each strand as a content area
    for (const strand of jsonData.strands) {
      console.log(`\n📚 Processing strand: ${strand.strand_code} - ${strand.strand_name}`);
      
      // Insert content area with all required fields
      const [contentArea] = await db.insert(contentAreas).values({
        code: strand.strand_code,
        name: strand.strand_name,
        description: strand.strand_name,
        grade: jsonData.grade,
        subjectId: subject.id,
        frameworkId: framework.id,
        order: jsonData.strands.indexOf(strand)
      }).returning();
      
      console.log(`   ✅ Created content area: ${contentArea.code}`);
      
      // Process each standard
      for (const standard of strand.standards) {
        // Insert standard (6.NS.1.a, 6.NS.1.b, etc.)
        const [standardRecord] = await db.insert(standards).values({
          code: standard.standard,
          description: standard.standard_text,
          contentAreaId: contentArea.id,
          order: strand.standards.indexOf(standard)
        }).returning();
        
        totalStandards++;
        console.log(`      📖 Standard: ${standardRecord.code} (${standard.sub_lessons.length} activities)`);
        
        // Process each sub-lesson
        for (const subLesson of standard.sub_lessons) {
          await db.insert(subLessons).values({
            title: subLesson.title,
            code: subLesson.code,
            explanation: subLesson.explanation,
            examples: subLesson.examples,
            standardId: standardRecord.id,
            order: standard.sub_lessons.indexOf(subLesson)
          });
          
          totalSubLessons++;
        }
      }
    }
    
    console.log(`\n🎉 Successfully loaded Math curriculum!`);
    console.log(`   📊 Content Areas: ${jsonData.strands.length}`);
    console.log(`   📚 Standards: ${totalStandards}`);
    console.log(`   📝 Sub-lessons: ${totalSubLessons}`);
    
    console.log(`\n🏗️ Database structure:`);
    console.log(`   content_areas → standards → sub_lessons`);
    console.log(`   (Option A: No sub_standards table used)`);
    
  } catch (error) {
    console.error('❌ Error loading curriculum:', error);
    process.exit(1);
  }
}

// Run the loader
loadMathCurriculum().then(() => {
  console.log('✅ Curriculum loading complete!');
  process.exit(0);
});