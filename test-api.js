const fetch = require('node-fetch');

// Test the API
async function test() {
  try {
    console.log('Testing GET /api/messages...');
    const res = await fetch('http://localhost:3000/api/messages');
    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
