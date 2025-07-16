import fs from 'fs';

// Load the original curriculum data
const curriculumData = JSON.parse(fs.readFileSync('attached_assets/6th_Grade_Math_1752087586210.json', 'utf8'));

async function restoreCurriculum() {
  try {
    console.log('🔄 Restoring curriculum data...');
    
    // Load the curriculum using the existing API
    const response = await fetch('http://localhost:5000/api/curriculum/load', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(curriculumData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Curriculum restored successfully:', result);
    
    // Verify the data was loaded
    const lessonsResponse = await fetch('http://localhost:5000/api/lessons');
    const lessons = await lessonsResponse.json();
    console.log(`📚 Total lessons loaded: ${lessons.length}`);
    
    // Check sub-lessons for a specific sub-standard
    const subLessonsResponse = await fetch('http://localhost:5000/api/sub-lessons/91');
    const subLessons = await subLessonsResponse.json();
    console.log(`🎯 Sub-lessons for ID 91: ${subLessons.length}`);
    
  } catch (error) {
    console.error('❌ Failed to restore curriculum:', error);
  }
}

restoreCurriculum();