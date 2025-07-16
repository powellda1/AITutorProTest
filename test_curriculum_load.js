const fs = require('fs');
const path = require('path');

// Load the curriculum JSON file
const curriculumPath = path.join(__dirname, 'attached_assets', '6th_Grade_Math_1752087586210.json');
const curriculumData = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));

// Test loading the curriculum
async function testCurriculumLoad() {
  try {
    const response = await fetch('http://localhost:5000/api/curriculum/load', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(curriculumData)
    });
    
    const result = await response.json();
    console.log('Curriculum load result:', result);
    
    // Test getting lessons
    const lessonsResponse = await fetch('http://localhost:5000/api/lessons');
    const lessons = await lessonsResponse.json();
    console.log('Total lessons loaded:', lessons.length);
    console.log('First few lessons:', lessons.slice(0, 3));
    
  } catch (error) {
    console.error('Error loading curriculum:', error);
  }
}

testCurriculumLoad();