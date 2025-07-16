const fs = require('fs');

// Load the test data
const testData = JSON.parse(fs.readFileSync('./test_ns_only.json', 'utf8'));

console.log('Test data loaded successfully');
console.log('Number of strands:', testData.strands.length);

// Display first strand details
const firstStrand = testData.strands[0];
console.log('\nFirst strand:', firstStrand.strand_code, '-', firstStrand.strand_name);
console.log('Standards in first strand:', firstStrand.standards.length);

// Display first standard details
const firstStandard = firstStrand.standards[0];
console.log('\nFirst standard:', firstStandard.standard, '-', firstStandard.standard_text);
console.log('Sub-lessons in first standard:', firstStandard.sub_lessons.length);

// Display first sub-lesson details
const firstSubLesson = firstStandard.sub_lessons[0];
console.log('\nFirst sub-lesson:');
console.log('Title:', firstSubLesson.title);
console.log('Code:', firstSubLesson.code);
console.log('Explanation:', firstSubLesson.explanation);
console.log('Examples:', firstSubLesson.examples.length);

// Send POST request to load the data
fetch('http://localhost:5000/api/curriculum/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('\nUpload response:', data);
})
.catch(error => {
  console.error('Error uploading:', error);
});