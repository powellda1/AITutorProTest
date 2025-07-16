import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testWordUpload() {
  try {
    // Read the Word document
    const filePath = path.join(__dirname, 'attached_assets', '6. Grade 6 Mathematics Instructional Guide_1752197133637.docx');
    const fileBuffer = fs.readFileSync(filePath);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: 'Grade6MathGuide.docx',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    // Test the Word parsing endpoint
    console.log('Testing Word document upload...');
    const response = await fetch('http://localhost:5000/api/curriculum/parse-word', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Word document parsed successfully!');
      console.log('📊 Curriculum structure detected:');
      console.log(`   - Subject: ${result.metadata?.subjectHint || 'Mathematics'}`);
      console.log(`   - Grade Level: ${result.metadata?.gradeLevel || 'Grade 6'}`);
      console.log(`   - Hierarchy: ${result.metadata?.hierarchyPattern || 'strand -> standard -> subStandard'}`);
      console.log(`   - Content Areas: ${result.metadata?.contentAreas?.length || 0}`);
      console.log(`   - Standards Count: ${result.data ? Object.keys(result.data).length : 0}`);
      
      // Test the validation endpoint
      console.log('\n🔍 Testing curriculum validation...');
      const validationResponse = await fetch('http://localhost:5000/api/curriculum/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curriculumData: result.data })
      });
      
      const validationResult = await validationResponse.json();
      console.log(`   - Valid: ${validationResult.valid ? '✅' : '❌'}`);
      if (validationResult.errors?.length) {
        console.log(`   - Errors: ${validationResult.errors.join(', ')}`);
      }
      
    } else {
      console.log('❌ Word document parsing failed:', result.message);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testWordUpload();