// Simple test to verify enhanced parsing features
import fs from 'fs';
import path from 'path';

// Load the sample text content (simulating what would be extracted from a Word document)
const sampleText = `
6.NS.1 - Number and Number Sense
Understand and represent different forms of numbers including fractions, decimals, and percents.

Understanding the Standard:
This standard focuses on number sense and representation of rational numbers. Students develop conceptual understanding of the relationship between fractions, decimals, and percents.

Skills in Practice:
• Convert between fractions, decimals, and percents
• Compare and order rational numbers
• Represent numbers using multiple forms

Teaching Strategy: Mathematical Connections
Students should make connections between visual representations and numerical forms. Use concrete models like grids and number lines to support understanding.

Materials:
• Grid paper
• Number lines
• Fraction bars
• Calculators

Activity: Human Number Line
Students position themselves on a human number line to represent different rational numbers. This hands-on activity reinforces understanding of relative magnitude.

Instructions:
1. Create a number line on the floor
2. Students receive cards with fractions, decimals, or percents
3. They position themselves correctly on the line
4. Discuss the relationships between different forms

Common Misconception: Decimal Misconception
Students often think 0.5 is greater than 0.75 because 5 is greater than 7. They focus on individual digits rather than place value.

Incorrect Answer: 0.5 > 0.75
Correct Answer: 0.5 < 0.75
Explanation: Students need to understand that 0.5 = 5/10 and 0.75 = 75/100, so 0.75 is actually larger.
`;

// Test the parsing functions directly
console.log('🧪 Testing enhanced parsing functions...');

// This would normally be imported from the server routes
function extractStrategyType(text) {
  if (text.toLowerCase().includes('connection')) return 'Mathematical Connections';
  if (text.toLowerCase().includes('reasoning')) return 'Mathematical Reasoning';
  if (text.toLowerCase().includes('modeling')) return 'Mathematical Modeling';
  if (text.toLowerCase().includes('problem')) return 'Problem Solving';
  return 'General Strategy';
}

function extractActivityType(text) {
  if (text.toLowerCase().includes('number line')) return 'Human Number Line';
  if (text.toLowerCase().includes('card')) return 'Card Game';
  if (text.toLowerCase().includes('hands-on')) return 'Hands-On Activity';
  if (text.toLowerCase().includes('benchmark')) return 'Benchmark Activity';
  return 'Learning Activity';
}

function extractMisconceptionType(text) {
  if (text.toLowerCase().includes('decimal')) return 'Decimal Misconception';
  if (text.toLowerCase().includes('fraction')) return 'Fraction Misconception';
  if (text.toLowerCase().includes('percent')) return 'Percent Misconception';
  return 'General Misconception';
}

// Test the pattern matching
console.log('📋 Testing pattern recognition...');

const lines = sampleText.split('\n').filter(line => line.trim().length > 0);
let foundStandard = false;
let foundStrategy = false;
let foundActivity = false;
let foundMisconception = false;

for (const line of lines) {
  const trimmed = line.trim();
  
  // Test standard detection
  const standardMatch = trimmed.match(/^(\d+\.\w+\.\d+(?:\.\w+)?)|^(Standard\s+\d+\.\d+)/i);
  if (standardMatch) {
    foundStandard = true;
    console.log(`✅ Found standard: ${standardMatch[0]}`);
  }
  
  // Test strategy detection
  if (trimmed.match(/^(teaching|strategy|approach|method)/i) || 
      trimmed.match(/mathematical\s+(connections|reasoning|modeling)/i)) {
    foundStrategy = true;
    console.log(`✅ Found teaching strategy: ${extractStrategyType(trimmed)}`);
  }
  
  // Test activity detection
  if (trimmed.match(/^(activity|exercise|benchmark|assessment)/i) || 
      trimmed.match(/(human\s+number\s+line|card\s+game|hands-on)/i)) {
    foundActivity = true;
    console.log(`✅ Found activity: ${extractActivityType(trimmed)}`);
  }
  
  // Test misconception detection
  if (trimmed.match(/^(misconception|common\s+error|mistake|incorrect)/i) || 
      trimmed.match(/students\s+(often|may|might).*think/i)) {
    foundMisconception = true;
    console.log(`✅ Found misconception: ${extractMisconceptionType(trimmed)}`);
  }
}

console.log('\n📊 Pattern Detection Results:');
console.log(`  Standards: ${foundStandard ? '✅' : '❌'}`);
console.log(`  Teaching Strategies: ${foundStrategy ? '✅' : '❌'}`);
console.log(`  Activities: ${foundActivity ? '✅' : '❌'}`);
console.log(`  Misconceptions: ${foundMisconception ? '✅' : '❌'}`);

// Test content extraction
console.log('\n🔍 Testing content extraction...');

// Test material extraction
const materialLines = sampleText.split('\n').filter(line => 
  line.includes('•') && (line.includes('paper') || line.includes('card') || line.includes('calculator'))
);
console.log(`✅ Found ${materialLines.length} material items:`, materialLines);

// Test instruction extraction
const instructionLines = sampleText.split('\n').filter(line => 
  line.match(/^\d+\./) || (line.includes('Students') && line.includes('should'))
);
console.log(`✅ Found ${instructionLines.length} instruction items:`, instructionLines);

console.log('\n🎉 Enhanced parsing test completed successfully!');