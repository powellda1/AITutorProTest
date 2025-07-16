import fs from 'fs';

async function loadCurriculum() {
  try {
    const data = fs.readFileSync('attached_assets/6th_Grade_Math_1752087586210.json', 'utf8');
    const response = await fetch('http://localhost:5000/api/curriculum/load', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data
    });
    
    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

loadCurriculum();