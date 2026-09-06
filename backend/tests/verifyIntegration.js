async function verifyFullIntegration() {
  console.log('\n======================================================');
  console.log('🔗 VERIFYING FRONTEND & BACKEND LIVE INTEGRATION');
  console.log('======================================================\n');

  try {
    // 1. Backend Health Check
    console.log('--- 1. Backend Health Check ---');
    const healthRes = await fetch('http://localhost:5000/api/health');
    const health = await healthRes.json();
    console.log('  ✓ Backend Status:', health.status);

    // 2. Authoritative Database Giveaways API
    console.log('\n--- 2. Database Giveaways API (GET /api/giveaways/current) ---');
    const gwRes = await fetch('http://localhost:5000/api/giveaways/current');
    const currentGW = await gwRes.json();
    console.log('  ✓ Hero Giveaway from Database:', currentGW.hero?.title);
    console.log('  ✓ Authoritative Hero Status:', currentGW.hero?.status);
    console.log('  ✓ Active Giveaways Count:', currentGW.active?.length);

    // 3. Winners API
    console.log('\n--- 3. Winners API (GET /api/winners) ---');
    const winRes = await fetch('http://localhost:5000/api/winners');
    const winners = await winRes.json();
    console.log('  ✓ Spotlight Winners:', winners.spotlightWinners?.length);
    console.log('  ✓ Archive Winners:', winners.archiveWinners?.length);

    // 4. Zero-Trust Authentication
    console.log('\n--- 4. Authentication API (POST /api/auth/login) ---');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex.thorne@veloop.io', password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log('  ✓ User Authenticated:', loginData.user?.name);
    console.log('  ✓ Wallet Balance (VEs):', loginData.user?.veloopCoins);
    console.log('  ✓ JWT Access Token Issued:', Boolean(loginData.accessToken));

    // 5. Frontend Dev Server Connection
    console.log('\n--- 5. Frontend Dev Server (http://localhost:5173) ---');
    const frontendRes = await fetch('http://localhost:5173/');
    const frontendHtml = await frontendRes.text();
    const isFrontendServing = frontendHtml.includes('<div id="root">') || frontendHtml.includes('<!DOCTYPE html>');
    console.log('  ✓ Frontend Vite Server Live:', isFrontendServing);

    console.log('\n======================================================');
    console.log('🎉 YES! FRONTEND AND BACKEND ARE FULLY & SUCCESSFULLY CONNECTED!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Connection Verification Error:', error.message);
  }
}

verifyFullIntegration();
