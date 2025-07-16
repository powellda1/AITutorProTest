import fs from 'fs';
import { eq } from 'drizzle-orm';
import { db } from './server/db.ts';
import { subjects, curriculumFrameworks, contentAreas, standards, subLessons } from './shared/schema.ts';

async function loadOptimizedMathCurriculum() {
  try {
    console.log('🔄 Loading optimized Math curriculum...');
    
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
    
    // Prepare batch inserts for efficiency
    const contentAreaInserts = [];
    const standardInserts = [];
    const subLessonInserts = [];
    
    let standardOrder = 0;
    
    // Process all strands
    for (const strand of jsonData.strands) {
      console.log(`\n📚 Processing strand: ${strand.strand_code} - ${strand.strand_name}`);
      
      // Add content area to batch
      contentAreaInserts.push({
        code: strand.strand_code,
        name: strand.strand_name,
        description: strand.strand_name,
        grade: jsonData.grade,
        subjectId: subject[0].id,
        frameworkId: framework[0].id,
        state: jsonData.state,
      });
    }
    
    // Insert all content areas first
    const insertedContentAreas = await db.insert(contentAreas).values(contentAreaInserts).returning();
    console.log(`✅ Inserted ${insertedContentAreas.length} content areas`);
    
    // Create mapping of strand codes to content area IDs
    const contentAreaMap = {};
    insertedContentAreas.forEach(ca => {
      contentAreaMap[ca.code] = ca.id;
    });
    
    // Now process standards and sub-lessons
    for (const strand of jsonData.strands) {
      const contentAreaId = contentAreaMap[strand.strand_code];
      
      for (const standardData of strand.standards) {
        // Add standard to batch
        standardInserts.push({
          code: standardData.standard,
          description: standardData.standard_text,
          contentAreaId: contentAreaId,
          order: standardOrder++
        });
      }
    }
    
    // Insert all standards
    const insertedStandards = await db.insert(standards).values(standardInserts).returning();
    console.log(`✅ Inserted ${insertedStandards.length} standards`);
    
    // Create mapping of standard codes to standard IDs
    const standardMap = {};
    insertedStandards.forEach(std => {
      standardMap[std.code] = std.id;
    });
    
    // Now process sub-lessons
    for (const strand of jsonData.strands) {
      for (const standardData of strand.standards) {
        const standardId = standardMap[standardData.standard];
        
        for (const [index, subLessonData] of standardData.sub_lessons.entries()) {
          subLessonInserts.push({
            title: subLessonData.title,
            code: subLessonData.code,
            explanation: subLessonData.explanation,
            examples: subLessonData.examples,
            standardId: standardId,
            order: index
          });
        }
      }
    }
    
    // Insert all sub-lessons
    const insertedSubLessons = await db.insert(subLessons).values(subLessonInserts).returning();
    console.log(`✅ Inserted ${insertedSubLessons.length} sub-lessons`);
    
    console.log(`\n🎉 Successfully loaded complete Math curriculum!`);
    console.log(`📊 Summary:`);
    console.log(`   Content Areas: ${insertedContentAreas.length}`);
    console.log(`   Standards: ${insertedStandards.length}`);
    console.log(`   Sub-lessons: ${insertedSubLessons.length}`);
    
  } catch (error) {
    console.error('❌ Error loading curriculum:', error);
  }
}

loadOptimizedMathCurriculum();