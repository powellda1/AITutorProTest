import fs from 'fs';

// Read the new JSON file
const jsonData = JSON.parse(fs.readFileSync('./attached_assets/Math_1752093441933.json', 'utf8'));

// Extract only the 6.NS section for testing
const nsStrand = jsonData.strands.find(strand => strand.strand_code === '6.NS');

if (!nsStrand) {
  console.log('6.NS strand not found');
  process.exit(1);
}

console.log('Found 6.NS strand:', nsStrand.strand_name);
console.log('Number of standards:', nsStrand.standards.length);

// Show the structure
nsStrand.standards.forEach((standard, index) => {
  console.log(`\n${index + 1}. ${standard.standard}: ${standard.standard_text}`);
  console.log(`   Sub-lessons: ${standard.sub_lessons.length}`);
  
  standard.sub_lessons.forEach((subLesson, subIndex) => {
    console.log(`   ${subIndex + 1}. ${subLesson.title} (${subLesson.code})`);
    console.log(`      Examples: ${subLesson.examples.length}`);
  });
});

// Create a test JSON with just 6.NS for loading
const testData = {
  strands: [nsStrand]
};

fs.writeFileSync('./test_ns_only.json', JSON.stringify(testData, null, 2));
console.log('\nTest JSON created: test_ns_only.json');