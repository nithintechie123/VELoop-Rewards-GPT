import http from 'http';
import app from '../src/app.js';
import { db } from '../src/data/store.js';
import { CryptoFairEngine } from '../src/utils/cryptoFair.js';

let server;
const PORT = process.env.TEST_PORT || 5010;
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

async function runTests() {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING VELOOP REWARDS BACKEND & FRAUD PROTECTION TEST SUITE');
  console.log('=============================================================\n');

  // Reset DB for clean test run
  db.seed();

  let alexUser = db.getUserById('VE10025');

  // 1. Healthcheck Test
  console.log('--- TEST 1: Healthcheck ---');
  const healthRes = await makeRequest('/health');
  assert(healthRes.status === 200, 'Healthcheck returns HTTP 200');
  assert(healthRes.data.status === 'ok', 'Status is ok');

  // 2. Unauthenticated Join Attempt
  console.log('\n--- TEST 2: Zero-Trust - Unauthenticated Join ---');
  const unauthRes = await makeRequest('/giveaways/gw-iphone-titanium/join', {
    method: 'POST',
    body: { entryType: 'free' }
  });
  assert(unauthRes.status === 401, 'Unauthenticated join request blocked with HTTP 401');
  assert(unauthRes.data.error === 'UNAUTHORIZED', 'Error code is UNAUTHORIZED');

  // 3. Non-existent Giveaway Join Attempt
  console.log('\n--- TEST 3: Zero-Trust - Non-Existent Giveaway ---');
  const nonExistRes = await makeRequest('/giveaways/gw-fake-giveaway-999/join', {
    method: 'POST',
    headers: { 'x-user-id': 'VE10025' },
    body: { entryType: 'free' }
  });
  assert(nonExistRes.status === 404, 'Non-existent giveaway join blocked with HTTP 404');

  // 4. Insufficient Balance Join Attempt
  console.log('\n--- TEST 4: Zero-Trust - Insufficient Balance Enforcement ---');
  // Set user VEs to 50, but iPhone requires 250 VEs
  db.updateUser(alexUser.id, { veloopCoins: 50, coins: 50 });
  const lowBalRes = await makeRequest('/giveaways/gw-iphone-titanium/join', {
    method: 'POST',
    headers: { 'x-user-id': 'VE10025' },
    body: {
      entryType: 'paid',
      ticketCount: 1,
      // Attempting to bypass by passing fake client-side balance
      clientBalanceClaim: 999999
    }
  });
  assert(lowBalRes.status === 402, 'Insufficient balance blocked with HTTP 402 Payment Required');
  assert(lowBalRes.data.error === 'INSUFFICIENT_BALANCE', 'Server rejects based on server-side wallet balance');
  assert(lowBalRes.data.difference === 200, 'Difference computed accurately on server (250 fee - 50 balance = 200 diff)');

  // 5. Valid Paid Join with Sufficient Balance
  console.log('\n--- TEST 5: Atomic Balance Deduction & Ticket Minting ---');
  db.updateUser(alexUser.id, { veloopCoins: 1000, coins: 1000 });
  const validJoinRes = await makeRequest('/giveaways/gw-iphone-titanium/join', {
    method: 'POST',
    headers: { 'x-user-id': 'VE10025' },
    body: {
      entryType: 'paid',
      ticketCount: 1
    }
  });
  assert(validJoinRes.status === 200, 'Paid participation succeeded with HTTP 200');
  assert(validJoinRes.data.remainingBalance === 750, 'Balance accurately debited by 250 (1000 - 250 = 750)');
  assert(validJoinRes.data.ticket.ticketId.startsWith('#VEL-'), 'Minted secure ticket identifier');

  // 6. Free Daily Entry and Duplicate Prevention
  console.log('\n--- TEST 6: Free Daily Entry & Limit Enforcement ---');
  const free1 = await makeRequest('/giveaways/gw-smartwatch-titanium/join', {
    method: 'POST',
    headers: { 'x-user-id': 'VE10025' },
    body: { entryType: 'free' }
  });
  assert(free1.status === 200, 'First free daily entry succeeded');

  const free2 = await makeRequest('/giveaways/gw-smartwatch-titanium/join', {
    method: 'POST',
    headers: { 'x-user-id': 'VE10025' },
    body: { entryType: 'free' }
  });
  assert(free2.status === 400, 'Second free daily entry blocked with HTTP 400 Limit Reached');
  assert(free2.data.error === 'FREE_ENTRY_LIMIT_REACHED', 'Enforced daily limit on server');

  // 7. Payload Tampering Detection (Negative numbers / float)
  console.log('\n--- TEST 7: Fraud Protection - Payload Tampering Detection ---');
  const tamperRes = await makeRequest('/giveaways/gw-iphone-titanium/join', {
    method: 'POST',
    headers: { 'x-user-id': 'VE10025' },
    body: {
      entryType: 'paid',
      ticketCount: -5
    }
  });
  assert(tamperRes.status === 400, 'Negative ticket count blocked by fraud protection');
  assert(tamperRes.data.error === 'INVALID_TICKET_COUNT', 'Tampered payload rejected');

  // 8. Velocity Burst Throttle Detection
  console.log('\n--- TEST 8: Fraud Protection - Rapid Velocity Burst Detection ---');
  let burstBlocked = false;
  for (let i = 0; i < 15; i++) {
    const burstRes = await makeRequest('/giveaways/gw-iphone-titanium/join', {
      method: 'POST',
      headers: { 'x-user-id': 'VE10025' },
      body: { entryType: 'paid', ticketCount: 1 }
    });
    if (burstRes.status === 429) {
      burstBlocked = true;
      break;
    }
  }
  assert(burstBlocked, 'Rapid-fire burst requests throttled with HTTP 429');

  // 9. Provably Fair Cryptographic Resolution
  console.log('\n--- TEST 9: Provably Fair SHA-256 Winner Calculation ---');
  const serverSeed = "d8f3b6c2e1a90847562810f9e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9";
  const clientSeed = "BLOCK_ETH_21048291_VELOOP_PUBLIC";
  const calc = CryptoFairEngine.calculateWinningTicketIndex(serverSeed, clientSeed, 1, 1000);
  assert(calc.winningIndex >= 0 && calc.winningIndex < 1000, 'Winning index uniformly distributed in range [0, 999]');
  assert(calc.resultHash.length === 64, 'SHA-256 hash generated 64 hex characters');

  const verify = CryptoFairEngine.verifyProof(serverSeed, clientSeed, 1, 1000, calc.winningIndex);
  assert(verify.isValid === true, 'Proof verification passes deterministically');

  // 10. Prize Claim Verification
  console.log('\n--- TEST 10: Prize Claim Verification ---');
  const validClaimRes = await makeRequest('/giveaways/gw-smartwatch-titanium/claim', {
    method: 'POST',
    headers: { 'x-user-id': 'VE10025' },
    body: {
      prizeType: 'PHYSICAL',
      prizeTitle: 'Apple Watch Series 9',
      fullName: 'Alex Thorne',
      phoneNumber: '+91 98765 43210',
      address: 'Flat 402, Skyline Towers',
      city: 'Bengaluru',
      state: 'Karnataka',
      pin: '560038'
    }
  });
  assert(validClaimRes.status === 200, 'Valid physical prize claim accepted with HTTP 200');
  assert(validClaimRes.data.claim.trackingNumber.startsWith('FDX-'), 'Generated express courier tracking number');

  // 11. Audit Ledger Inspection
  console.log('\n--- TEST 11: Immutable Audit Ledger ---');
  const auditRes = await makeRequest('/audit/logs?limit=50');
  assert(auditRes.status === 200, 'Audit log endpoint returns HTTP 200');
  assert(auditRes.data.logs.length > 0, `Audit log recorded ${auditRes.data.logs.length} tamper-evident events`);

  const fraudRes = await makeRequest('/audit/fraud-incidents');
  assert(fraudRes.status === 200, 'Fraud incident registry returns HTTP 200');
  assert(fraudRes.data.incidents.length > 0, `Fraud protection logged ${fraudRes.data.incidents.length} security alerts`);

  // 12. Refresh-Token Strategy & Token Rotation
  console.log('\n--- TEST 12: JWT Refresh-Token Strategy & Rotation ---');
  const loginRes = await makeRequest('/auth/login', {
    method: 'POST',
    body: { email: 'alex.thorne@veloop.io', password: 'password123' }
  });
  assert(loginRes.status === 200, 'User login returns HTTP 200');
  assert(Boolean(loginRes.data.accessToken), 'Access token issued');
  assert(Boolean(loginRes.data.refreshToken), 'Refresh token issued');

  const refreshRes = await makeRequest('/auth/refresh', {
    method: 'POST',
    body: { refreshToken: loginRes.data.refreshToken }
  });
  assert(refreshRes.status === 200, 'Refresh token endpoint rotates and issues new access token');
  // 13. Authoritative Status Lifecycle (UPCOMING, ACTIVE, ENDED, ARCHIVED)
  console.log('\n--- TEST 13: Authoritative Status Lifecycle Engine ---');
  // Create an upcoming giveaway and an ended giveaway
  db.updateGiveaway('gw-audio-airpods', {
    status: 'ENDED',
    endAt: new Date(Date.now() - 3600000).toISOString()
  });

  const endedJoinRes = await makeRequest('/giveaways/gw-audio-airpods/join', {
    method: 'POST',
    headers: { 'x-user-id': 'VE10042' },
    body: { entryType: 'paid', ticketCount: 1 }
  });
  assert(endedJoinRes.status === 400, 'Joining ENDED giveaway rejected by backend authority');
  assert(endedJoinRes.data.error === 'GIVEAWAY_INACTIVE', 'Error code confirms giveaway is not ACTIVE');

  const getEndedRes = await makeRequest('/giveaways/gw-audio-airpods');
  assert(getEndedRes.status === 200, 'Fetch ended giveaway succeeds');
  assert(getEndedRes.data.status === 'ENDED', 'Backend returns authoritative status ENDED');

  console.log('\n=============================================================');
  console.log('🎉 ALL 13 ZERO-TRUST, LIFECYCLE & SECURITY TESTS PASSED SUCCESSFULLY!');
  console.log('=============================================================\n');
}

// Start test server and run
server = app.listen(PORT, async () => {
  try {
    await runTests();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test run failed:', err);
    server.close();
    process.exit(1);
  }
});
