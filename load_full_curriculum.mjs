import fs from 'fs';

async function loadFullCurriculum() {
  try {
    // Read the JSON file
    const data = JSON.parse(fs.readFileSync('attached_assets/Math_1752093441933.json', 'utf8'));
    
    console.log('Loading full curriculum...');
    console.log('Total strands:', data.strands.length);
    
    // Clear existing curriculum first
    const clearResponse = await fetch('http://localhost:5000/api/curriculum/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!clearResponse.ok) {
      throw new Error(`Failed to clear curriculum: ${clearResponse.status}`);
    }
    
    console.log('Curriculum cleared successfully');
    
    // Load the full curriculum
    const loadResponse = await fetch('http://localhost:5000/api/curriculum/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await loadResponse.json();
    console.log('Load result:', result);
    
    // Verify the load worked
    const strandsResponse = await fetch('http://localhost:5000/api/strands');
    const strands = await strandsResponse.json();
    
    console.log('Loaded strands:', strands.length);
    strands.forEach((strand, i) => {
      console.log(`${i+1}. ${strand.code} - ${strand.name}`);
    });
    
  } catch (error) {
    console.error('Error loading curriculum:', error.message);
  }
}

loadFullCurriculum();