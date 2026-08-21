import http from 'http';
import https from 'https';
import WebSocket from 'ws';

// Ensure JWT_SECRET is available for the test environment if not already loaded
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test_secret_key_123';
if (!process.env.MONGO_URI) process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/log_monitor_test';

const PORT = 8000;
let token = '';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Backend Test Suite ---');
  let exitCode = 0;

  try {
    // 1. Test Auth / Login
    console.log('Testing Authentication...');
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'Admin@12345' });

    if (loginRes.status !== 200 || !loginRes.body.token && !loginRes.body.data?.token) {
      console.error('❌ Auth failed', loginRes.body);
      exitCode = 1;
    } else {
      token = loginRes.body.token || loginRes.body.data.token;
      console.log('✅ Auth successful');
    }

    if (token) {
      // 2. Test Secure Log Ingestion
      console.log('Testing Secure Log Ingestion...');
      const logRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/logs',
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, {
        source: 'Test',
        level: 'CRITICAL',
        message: 'This is an automated test log'
      });

      if (logRes.status !== 201) {
        console.error('❌ Log ingestion failed', logRes.body);
        exitCode = 1;
      } else {
        console.log('✅ Log ingestion successful');
      }

      // 3. Test Monitor Status (Latency NaN fix)
      console.log('Testing Monitor Status (Latency Check)...');
      // Give the log a second to process
      await new Promise(r => setTimeout(r, 1000));
      const statusRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/monitor/status',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statusRes.status !== 200 || Number.isNaN(statusRes.body.data?.averageLatencyMs) || statusRes.body.data?.averageLatencyMs === null) {
        console.error('❌ Status/Latency check failed', statusRes.body);
        exitCode = 1;
      } else {
        console.log(`✅ Status check successful. Latency is ${statusRes.body.data.averageLatencyMs}ms (Not NaN)`);
      }

      // 4. Test WebSocket Auth - Should connect with token
      console.log('Testing WebSocket Auth (Valid)...');
      const wsValid = new WebSocket(`ws://localhost:${PORT}/ws/logs?token=${token}`);
      await new Promise((resolve, reject) => {
        wsValid.on('open', () => {
          console.log('✅ WebSocket securely connected');
          wsValid.close();
          resolve();
        });
        wsValid.on('error', (err) => {
          console.error('❌ WebSocket valid connection failed', err);
          exitCode = 1;
          resolve();
        });
      });

      // 5. Test WebSocket Auth - Should reject without token
      console.log('Testing WebSocket Auth (Invalid)...');
      const wsInvalid = new WebSocket(`ws://localhost:${PORT}/ws/logs`);
      await new Promise((resolve) => {
        let closed = false;
        wsInvalid.on('error', (err) => {
          console.log('✅ WebSocket successfully rejected unauthenticated client (401 Unauthorized)');
          closed = true;
          resolve();
        });
        wsInvalid.on('close', (code) => {
          if (!closed) {
             console.error('❌ WebSocket closed instead of erroring with 401', code);
             exitCode = 1;
             resolve();
          }
        });
        wsInvalid.on('open', () => {
          console.error('❌ WebSocket accepted unauthenticated client!');
          wsInvalid.close();
          exitCode = 1;
          resolve();
        });
      });
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend server is not running on port 8000. Start it first!');
    } else {
      console.error('❌ Test execution error:', error);
    }
    exitCode = 1;
  }

  if (exitCode === 0) {
    console.log('🎉 All tests passed successfully!');
  } else {
    console.log('⚠️ Some tests failed.');
  }
  process.exit(exitCode);
}

runTests();
