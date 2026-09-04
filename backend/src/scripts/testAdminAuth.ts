import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import http from 'http';

dotenv.config();

import authRoutes from '../routes/authRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import deliveryApplicationRoutes from '../routes/deliveryApplicationRoutes.js';
import deliveryBoyRoutes from '../routes/deliveryBoyRoutes.js';
import deliveryZoneRoutes from '../routes/deliveryZoneRoutes.js';
import sellerRoutes from '../routes/sellerRoutes.js';
import supportRoutes from '../routes/supportRoutes.js';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/delivery-applications', deliveryApplicationRoutes);
app.use('/api/delivery', deliveryBoyRoutes);
app.use('/api/delivery-zones', deliveryZoneRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/support', supportRoutes);

const PORT = 5099;
const server = app.listen(PORT, async () => {
  console.log(`[TEST SERVER] Running on port ${PORT}`);
  try {
    await runTests();
  } catch (err) {
    console.error('[TEST SUITE ERROR]', err);
  } finally {
    server.close();
    process.exit(0);
  }
});

const makeRequest = (method: string, path: string, headers: Record<string, string> = {}, body?: any): Promise<{ status: number; data: any }> => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            resolve({ status: res.statusCode || 500, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode || 500, data: raw });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(postData);
    req.end();
  });
};

async function runTests() {
  const adminEmail = process.env.ADMIN_EMAIL || 'pakkamofficial@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'pakkam@2026';
  const jwtSecret = process.env.JWT_SECRET || 'pakkam_super_secret_jwt_key_2026_hyperlocal';

  console.log('--- STARTING ADMIN AUTHENTICATION VERIFICATION MATRIX ---');

  // Test 1: Correct credentials
  const t1 = await makeRequest('POST', '/api/admin/login', {}, { email: adminEmail, password: adminPassword });
  console.log(`Test 1 — Correct credentials: Status ${t1.status}, success=${t1.data?.success}, tokenReceived=${Boolean(t1.data?.token)}`);
  const adminToken = t1.data?.token;

  // Test 2: Wrong password
  const t2 = await makeRequest('POST', '/api/admin/login', {}, { email: adminEmail, password: 'WrongPassword123!' });
  console.log(`Test 2 — Wrong password: Status ${t2.status}, message=${t2.data?.message}`);

  // Test 3: Wrong email
  const t3 = await makeRequest('POST', '/api/admin/login', {}, { email: 'wrong@admin.com', password: adminPassword });
  console.log(`Test 3 — Wrong email: Status ${t3.status}, message=${t3.data?.message}`);

  // Test 4: Both wrong
  const t4 = await makeRequest('POST', '/api/admin/login', {}, { email: 'wrong@admin.com', password: 'WrongPassword123!' });
  console.log(`Test 4 — Both wrong: Status ${t4.status}, message=${t4.data?.message}`);

  // Test 5: Empty fields
  const t5 = await makeRequest('POST', '/api/admin/login', {}, { email: '', password: '' });
  console.log(`Test 5 — Empty fields: Status ${t5.status}, message=${t5.data?.message}`);

  // Test 6: Normal user tries Admin API
  const customerToken = jwt.sign({ id: '507f1f77bcf86cd799439011', role: 'CUSTOMER', email: 'customer@pakkam.test' }, jwtSecret, { expiresIn: '1h' });
  const t6 = await makeRequest('GET', '/api/admin/stats', { Authorization: `Bearer ${customerToken}` });
  console.log(`Test 6 — Normal user tries Admin API: Status ${t6.status}, message=${t6.data?.message}`);

  // Test 7: No JWT
  const t7 = await makeRequest('GET', '/api/admin/stats');
  console.log(`Test 7 — No JWT: Status ${t7.status}, message=${t7.data?.message}`);

  // Test 8: Fake admin role (User with role=admin but wrong email)
  const fakeAdminToken = jwt.sign({ id: '507f1f77bcf86cd799439011', role: 'admin', email: 'hacker@attacker.com' }, jwtSecret, { expiresIn: '1h' });
  const t8 = await makeRequest('GET', '/api/admin/stats', { Authorization: `Bearer ${fakeAdminToken}` });
  console.log(`Test 8 — Fake admin role: Status ${t8.status}, message=${t8.data?.message}`);

  // Test 9: Logout / Access after clear token
  const t9 = await makeRequest('GET', '/api/admin/me');
  console.log(`Test 9 — Logout (No Token): Status ${t9.status}, message=${t9.data?.message}`);

  // Test 10: Refresh / Session verification via /admin/me
  const t10 = await makeRequest('GET', '/api/admin/me', { Authorization: `Bearer ${adminToken}` });
  console.log(`Test 10 — Refresh / Session verification: Status ${t10.status}, userEmailMatch=${t10.data?.user?.email === adminEmail}`);

  // Test 11: Direct API access on all protected endpoints without token
  const endpoints = [
    '/api/admin/stats',
    '/api/admin/users',
    '/api/admin/settings',
    '/api/admin/notifications',
    '/api/delivery-applications',
    '/api/delivery/admin',
    '/api/delivery-zones/admin',
    '/api/seller/admin/all',
    '/api/support/admin/all',
  ];
  let test11AllPassed = true;
  for (const ep of endpoints) {
    const res = await makeRequest('GET', ep);
    if (res.status !== 401 && res.status !== 403) {
      test11AllPassed = false;
      console.log(`Test 11 FAILED on ${ep}: Status ${res.status}`);
    }
  }
  console.log(`Test 11 — Direct API access (all protected endpoints reject without token): All 401/403: ${test11AllPassed}`);

  console.log('--- ALL TEST SUITE EXECUTIONS COMPLETED ---');
}
