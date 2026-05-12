// debug-ai.js - Simple script to test AI analysis

// Test data
const testData = {
  question: "What is the capital of France?",
  options: ["London", "Berlin", "Paris", "Madrid"],
  selectedAnswer: 2, // Paris
  correctAnswer: 2   // Paris
};

// Test the AI analysis
async function testAI() {
  try {
    console.log('🧪 Testing AI Analysis...');
    console.log('📝 Input:', testData);
    
    const response = await fetch('http://localhost:3000/api/ai/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('📊 Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ AI Analysis successful!');
      console.log('📋 Summary:', result.analysis.summary);
      console.log('💡 Explanation:', result.analysis.whySelectedAnswerIsRightOrWrong);
      console.log('🎯 Concept:', result.analysis.keyConceptExplanation);
      console.log('📚 Study Tip:', result.analysis.studyTip);
      console.log('🔢 Confidence:', result.analysis.confidenceLevel);
    } else {
      console.log('❌ AI Analysis failed:', result.error);
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
  }
}

// Check AI service status
async function checkStatus() {
  try {
    console.log('🔍 Checking AI service status...');
    
    const response = await fetch('http://localhost:3000/api/ai/test');
    const result = await response.json();
    
    console.log('📊 Status:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('🚨 Status check failed:', error);
  }
}

// Run tests
if (require.main === module) {
  console.log('🤖 AI Debug Script');
  console.log('================');
  
  checkStatus().then(() => {
    testAI();
  });
}

module.exports = { testAI, checkStatus };
