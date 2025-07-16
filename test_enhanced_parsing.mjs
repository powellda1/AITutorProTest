import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

async function testEnhancedParsing() {
  try {
    console.log('🧪 Testing enhanced Word document parsing...');
    
    // Test Word document parsing
    const form = new FormData();
    form.append('file', fs.createReadStream('attached_assets/6. Grade 6 Mathematics Instructional Guide_1752197133637.docx'));
    
    const response = await fetch('http://localhost:5000/api/parse-word', {
      method: 'POST',
      body: form
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Word document parsed successfully');
    console.log('📊 Metadata:', result.metadata);
    
    // Check if enhanced educational content was extracted
    if (result.curriculum._educationalContent) {
      const edu = result.curriculum._educationalContent;
      console.log('\n📚 Enhanced Educational Content Found:');
      console.log(`  - Official Standards: ${edu.officialStandards?.length || 0}`);
      console.log(`  - Teaching Strategies: ${edu.teachingStrategies?.length || 0}`);
      console.log(`  - Benchmark Activities: ${edu.benchmarkActivities?.length || 0}`);
      console.log(`  - Common Misconceptions: ${edu.commonMisconceptions?.length || 0}`);
      
      // Show a sample of each type
      if (edu.officialStandards?.length > 0) {
        console.log('\n🎯 Sample Official Standard:');
        console.log(`  Code: ${edu.officialStandards[0].code}`);
        console.log(`  Title: ${edu.officialStandards[0].title}`);
        console.log(`  Description: ${edu.officialStandards[0].description?.substring(0, 100)}...`);
      }
      
      if (edu.teachingStrategies?.length > 0) {
        console.log('\n🎓 Sample Teaching Strategy:');
        console.log(`  Type: ${edu.teachingStrategies[0].strategyType}`);
        console.log(`  Title: ${edu.teachingStrategies[0].title}`);
        console.log(`  Materials: ${edu.teachingStrategies[0].materials?.length || 0} items`);
      }
      
      if (edu.benchmarkActivities?.length > 0) {
        console.log('\n🎯 Sample Benchmark Activity:');
        console.log(`  Type: ${edu.benchmarkActivities[0].activityType}`);
        console.log(`  Title: ${edu.benchmarkActivities[0].title}`);
        console.log(`  Instructions: ${edu.benchmarkActivities[0].instructions?.length || 0} steps`);
      }
      
      if (edu.commonMisconceptions?.length > 0) {
        console.log('\n⚠️  Sample Common Misconception:');
        console.log(`  Type: ${edu.commonMisconceptions[0].misconceptionType}`);
        console.log(`  Description: ${edu.commonMisconceptions[0].description?.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ No enhanced educational content found in parsed document');
    }
    
    // Test validation
    console.log('\n🔍 Testing curriculum validation...');
    const validateResponse = await fetch('http://localhost:5000/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ curriculum: result.curriculum })
    });
    
    if (!validateResponse.ok) {
      throw new Error(`Validation failed! status: ${validateResponse.status}`);
    }
    
    const validation = await validateResponse.json();
    console.log('✅ Curriculum validation passed');
    console.log('📋 Validation result:', validation);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEnhancedParsing();