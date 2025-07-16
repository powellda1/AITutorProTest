import { readFileSync } from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function loadNewCurriculum() {
  try {
    const data = JSON.parse(readFileSync('./attached_assets/Math_1752213331588.json', 'utf8'));
    
    console.log('Loading new curriculum with enhanced examples...');
    
    // Process each strand
    for (const strand of data.strands) {
      console.log(`Processing strand: ${strand.strand_code}`);
      
      // Get content area ID
      const contentAreaResult = await pool.query(
        'SELECT id FROM content_areas WHERE code = $1',
        [strand.strand_code]
      );
      
      if (contentAreaResult.rows.length === 0) {
        console.log(`Content area ${strand.strand_code} not found, skipping...`);
        continue;
      }
      
      const contentAreaId = contentAreaResult.rows[0].id;
      
      // Process each standard
      for (const standard of strand.standards) {
        console.log(`Processing standard: ${standard.standard}`);
        
        // For each sub_lesson in the standard, create a lesson entry
        for (const subLesson of standard.sub_lessons) {
          const lessonTitle = `${standard.standard} - ${subLesson.title}`;
          
          // Combine all examples from this sub_lesson
          const examples = subLesson.examples || [];
          
          // Insert lesson
          await pool.query(`
            INSERT INTO lessons (
              title, 
              description, 
              content, 
              category, 
              "order", 
              strand_code, 
              strand_name, 
              standard, 
              standard_text, 
              sub_standard, 
              sub_standard_text, 
              examples, 
              grade, 
              subject, 
              state, 
              content_area_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          `, [
            lessonTitle,
            subLesson.explanation,
            JSON.stringify({ 
              examples: examples,
              code: subLesson.code,
              explanation: subLesson.explanation
            }),
            strand.strand_name,
            0,
            strand.strand_code,
            strand.strand_name,
            standard.standard,
            standard.standard_text,
            standard.standard,
            subLesson.explanation,
            JSON.stringify(examples),
            data.grade,
            data.subject,
            data.state,
            contentAreaId
          ]);
          
          console.log(`Added lesson: ${lessonTitle} with ${examples.length} examples`);
        }
      }
    }
    
    console.log('New curriculum loaded successfully!');
    
    // Show summary
    const result = await pool.query(
      'SELECT sub_standard, COUNT(*) as lesson_count FROM lessons WHERE sub_standard LIKE $1 GROUP BY sub_standard ORDER BY sub_standard',
      ['6.NS%']
    );
    
    console.log('\nSummary of loaded lessons:');
    result.rows.forEach(row => {
      console.log(`${row.sub_standard}: ${row.lesson_count} lessons`);
    });
    
  } catch (error) {
    console.error('Error loading curriculum:', error);
  } finally {
    await pool.end();
  }
}

loadNewCurriculum();