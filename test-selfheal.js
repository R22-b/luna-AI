// Quick test: Call luna-core's processMessage directly to test self-healing
const lunaCore = require('./backend/luna-core');

async function test() {
  console.log('\n🧪 TESTING LUNA SELF-HEALING PROJECT BUILD...\n');
  console.log('Sending: "Build a full-stack real-time chat room web app using Node.js, Express, and socket.io"\n');
  
  try {
    const result = await lunaCore.processMessage({
      message: 'Build a full-stack real-time chat room web app using Node.js, Express, and socket.io with a premium dark UI',
      nickname: 'Ravi',
      threadId: 'test-selfheal-' + Date.now()
    });
    
    console.log('\n═══════════════════════════════════════');
    console.log('📬 LUNA RESPONSE:');
    console.log('═══════════════════════════════════════');
    console.log(result.response);
    console.log('\n🔌 Provider:', result.providerUsed);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
  }
  
  process.exit(0);
}

test();
