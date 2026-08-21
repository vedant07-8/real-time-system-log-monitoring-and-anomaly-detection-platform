import http from 'http';

const PORT = 8000;
let token = '';

async function makeRequest(options, postData = null) {
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

async function run() {
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'Admin@12345' });
  token = loginRes.body.token || loginRes.body.data.token;
  
  const payloads = [
    {
      name: 'ADMIN_DIRECT_LOGIN',
      payload: {
        user: "root",
        source: "sshd",
        message: "Accepted password for root from 10.0.0.5 port 22 ssh2",
        sourceIp: "10.0.0.5",
        level: "INFO"
      }
    },
    {
      name: 'BRUTE_FORCE_ATTACK',
      payload: {
        source: "sshd",
        message: "Failed password for admin from 192.168.1.50 port 22 ssh2",
        sourceIp: "192.168.1.50",
        level: "ERROR"
      },
      count: 5 // send this 5 times
    },
    {
      name: 'SYSTEM_CRASH',
      payload: {
        source: "kernel",
        message: "kernel: [1234.56] myapp[123]: segfault at 0 ip 000 sp 000 error 4",
        level: "CRITICAL"
      }
    },
    {
      name: 'PORT_SCAN',
      payload: {
        source: "firewall",
        message: "Connection blocked to port ", // append port number
        sourceIp: "192.168.1.100",
        level: "WARNING"
      },
      count: 20 // 20 unique ports
    },
    {
      name: 'PRIVILEGE_ESCALATION',
      payload: {
        user: "hacker",
        source: "sudo",
        message: "hacker : TTY=pts/0 ; PWD=/ ; USER=root ; COMMAND=/bin/su -",
        level: "WARNING"
      }
    }
  ];

  for (const test of payloads) {
    console.log(`\nTesting ${test.name}...`);
    let lastRes;
    const iters = test.count || 1;
    for (let i = 0; i < iters; i++) {
      const p = { ...test.payload };
      if (test.name === 'PORT_SCAN') p.message += (1000 + i);
      lastRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/logs',
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, p);
      await new Promise(r => setTimeout(r, 50));
    }
    console.log(`Status: ${lastRes.status}`);
    console.log(`Response:`, JSON.stringify(lastRes.body.data, null, 2));
  }
}

run();
