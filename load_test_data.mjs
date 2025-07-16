import fs from 'fs';

// Load full curriculum data
const testData = JSON.parse(fs.readFileSync('./attached_assets/Math_1752093441933.json', 'utf8'));

// Clear existing curriculum first
const clearResponse = await fetch('http://localhost:5000/api/curriculum/clear', {
  method: 'POST',
});

// Load the curriculum data directly to the database
const loadResponse = await fetch('http://localhost:5000/api/curriculum/load', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
});

const result = await loadResponse.json();
console.log('Load result:', result);

// Verify the data was loaded
const lessonsResponse = await fetch('http://localhost:5000/api/lessons');
const lessons = await lessonsResponse.json();
console.log('Lessons loaded:', lessons.length);

// Check sub-lessons for first standard
const strandsResponse = await fetch('http://localhost:5000/api/strands');
const strands = await strandsResponse.json();
console.log('Strands:', strands);

if (strands.length > 0) {
  const standardsResponse = await fetch(`http://localhost:5000/api/standards/${strands[0].id}`);
  const standards = await standardsResponse.json();
  console.log('Standards:', standards);
  
  if (standards.length > 0) {
    const subStandardsResponse = await fetch(`http://localhost:5000/api/sub-standards/${standards[0].id}`);
    const subStandards = await subStandardsResponse.json();
    console.log('Sub-standards:', subStandards);
    
    if (subStandards.length > 0) {
      const subLessonsResponse = await fetch(`http://localhost:5000/api/sub-lessons/${subStandards[0].id}`);
      const subLessons = await subLessonsResponse.json();
      console.log('Sub-lessons:', subLessons);
    }
  }
}