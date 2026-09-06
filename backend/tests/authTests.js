import app from '../src/app.js';
import { db } from '../src/data/store.js';
import http from 'http';

const PORT = 5020;
const BASE_URL = `http://localhost:${PORT}/api`;

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const parsed = new URL(url);

    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runAuthTests() {
  console.log('\n=============================================================');
  console.log('🔐 RUNNING REAL USER AUTHENTICATION & AUTHORIZATION TESTS');
  console.log('=============================================================\n');

  db.seed();

  // Test 1: Real User Registration
  console.log('--- TEST 1: User Registration with Bcrypt Hashing ---');
  const testEmail = `user_${Date.now()}@veloop.io`;
  const registerRes = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Emma Watson',
      email: testEmail,
      password: 'SecurePassword123!'
    }
  });
  assert(registerRes.status === 201, 'Registration returns HTTP 201 Created');
  assert(Boolean(registerRes.data.accessToken), 'JWT access token issued');
  assert(Boolean(registerRes.data.refreshToken), 'JWT refresh token issued');
  assert(registerRes.data.user.veloopCoins === 500, 'Granted 500 VEs welcome bonus');
  assert(registerRes.data.user.passwordHash === undefined, 'passwordHash securely excluded from JSON response');

  // Test 2: Prevent Duplicate Email Registration
  console.log('\n--- TEST 2: Duplicate Email Prevention ---');
  const dupRes = await makeRequest('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Emma Duplicate',
      email: testEmail,
      password: 'AnotherPassword123'
    }
  });
  assert(dupRes.status === 409, 'Duplicate registration blocked with HTTP 409 Conflict');
  assert(dupRes.data.error === 'USER_EXISTS', 'Error code is USER_EXISTS');

  // Test 3: Login with Wrong Password
  console.log('\n--- TEST 3: Login with Incorrect Password ---');
  const badLoginRes = await makeRequest('/auth/login', {
    method: 'POST',
    body: { email: testEmail, password: 'WrongPassword!' }
  });
  assert(badLoginRes.status === 401, 'Bad credentials rejected with HTTP 401');
  assert(badLoginRes.data.error === 'INVALID_CREDENTIALS', 'Error code is INVALID_CREDENTIALS');

  // Test 4: Successful Login with Bcrypt Password
  console.log('\n--- TEST 4: Successful Login with Bcrypt Password ---');
  const goodLoginRes = await makeRequest('/auth/login', {
    method: 'POST',
    body: { email: testEmail, password: 'SecurePassword123!' }
  });
  assert(goodLoginRes.status === 200, 'Valid login returns HTTP 200 OK');
  assert(Boolean(goodLoginRes.data.accessToken), 'New JWT access token issued');
  const accessToken = goodLoginRes.data.accessToken;

  // Test 5: Authenticated Profile (/api/auth/me) with Bearer Token
  console.log('\n--- TEST 5: Authenticated Profile with JWT Bearer Token ---');
  const meRes = await makeRequest('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  assert(meRes.status === 200, 'Profile returned for valid JWT token');
  assert(meRes.data.email === testEmail, 'Profile email matches authenticated user');

  // Test 6: Access Protected Route Without Token
  console.log('\n--- TEST 6: Protected Route Authorization Gate ---');
  const unauthMe = await makeRequest('/auth/me');
  assert(unauthMe.status === 401, 'Accessing /auth/me without token blocked with HTTP 401');

  // Test 7: Profile Update (Shipping Details)
  console.log('\n--- TEST 7: Authenticated Profile Update ---');
  const updateRes = await makeRequest('/auth/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {
      fullName: 'Emma Watson Thorne',
      shippingAddress: {
        fullName: 'Emma Watson',
        city: 'London',
        pincode: 'SW1A 1AA'
      }
    }
  });
  assert(updateRes.status === 200, 'Profile update returns HTTP 200');
  assert(updateRes.data.user.name === 'Emma Watson Thorne', 'Name updated');

  // Test 8: Password Change with Verification
  console.log('\n--- TEST 8: Password Change Verification ---');
  const changePassRes = await makeRequest('/auth/password', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {
      currentPassword: 'SecurePassword123!',
      newPassword: 'BrandNewSecurePassword456!'
    }
  });
  assert(changePassRes.status === 200, 'Password changed successfully');

  // Verify login with new password
  const newPassLogin = await makeRequest('/auth/login', {
    method: 'POST',
    body: { email: testEmail, password: 'BrandNewSecurePassword456!' }
  });
  assert(newPassLogin.status === 200, 'Login with newly changed password succeeded');

  console.log('\n=============================================================');
  console.log('🎉 ALL REAL USER AUTHENTICATION & AUTHORIZATION TESTS PASSED!');
  console.log('=============================================================\n');
}

const server = app.listen(PORT, async () => {
  try {
    await runAuthTests();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Auth test failed:', err);
    server.close();
    process.exit(1);
  }
});
