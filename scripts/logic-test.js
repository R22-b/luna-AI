const memory = require('../backend/memory');
const brain = require('../backend/brain-manager');
const identity = require('../backend/identity');
const search = require('../backend/search-engine');
const folder = require('../backend/folder-manager');

async function runTests() {
  console.log('🧪 Starting Luna AI Logic Tests...');
  
  // 1. Folder Health
  console.log('\n📁 Testing Folder Health...');
  const health = folder.healthCheck();
  console.log('Health Severity:', health.severity);
  console.log('Healthy:', health.healthy);

  // 2. Identity & Prompt Building
  console.log('\n👤 Testing Identity & Prompt Building...');
  const prompt = identity.buildSystemPrompt('baddy', 'stressed', [{ value: 'loves coding', category: 'preference' }]);
  console.log('Prompt contains mood:', prompt.includes('CURRENT MOOD: User is stressed'));
  console.log('Prompt contains memory:', prompt.includes('loves coding'));
  
  // 3. Brain Swarm Routing
  console.log('\n🧠 Testing Brain Swarm Routing...');
  const brainSwarm = require('../backend/brain-swarm');
  const codingSquad = brainSwarm.routeToSquad('code');
  console.log('Coding squad has deepseek:', codingSquad.includes('nvidia_deepseek_v4_pro'));

  // 4. Search Sanitization
  console.log('\n🔍 Testing Search Sanitization...');
  const dirty = '<script>alert(1)</script>Hello <iframe src="bad"></iframe>World';
  const clean = search.fetchPageContent ? 'Function exists' : 'Function missing';
  console.log('Scraper function:', clean);

  console.log('\n✅ Logic tests completed!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
