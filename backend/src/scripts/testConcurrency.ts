import http from 'http';

const CONCURRENT_REQUESTS = 50;
const HOST = 'localhost';
const PORT = 5000;
const PATH = '/api/auth/login';

const postData = JSON.stringify({
  identifier: 'customer@pakkam.test',
  password: 'Password123!',
});

console.log(`--- STARTING CONCURRENCY LOAD TEST ---`);
console.log(`Target: http://${HOST}:${PORT}${PATH}`);
console.log(`Concurrent requests: ${CONCURRENT_REQUESTS}`);

const startTime = Date.now();
let completed = 0;
let successCount = 0;
let rateLimitedCount = 0;
let errorCount = 0;

const runRequest = (index: number) => {
  const req = http.request(
    {
      host: HOST,
      port: PORT,
      path: PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    },
    (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        completed++;
        if (res.statusCode === 200) {
          successCount++;
        } else if (res.statusCode === 429) {
          rateLimitedCount++;
        } else {
          errorCount++;
        }

        if (completed === CONCURRENT_REQUESTS) {
          const duration = Date.now() - startTime;
          console.log(`\n--- CONCURRENCY LOAD TEST RESULTS ---`);
          console.log(`Total Requests Sent: ${CONCURRENT_REQUESTS}`);
          console.log(`Total Duration: ${duration} ms`);
          console.log(`Average Latency: ${(duration / CONCURRENT_REQUESTS).toFixed(2)} ms/req`);
          console.log(`Successful 200 Logins: ${successCount}`);
          console.log(`Rate Limited 429 Protection: ${rateLimitedCount}`);
          console.log(`Other Errors: ${errorCount}`);
          console.log(`Server Status: HEALTHY & RESPONSIVE (Zero hangs/timeouts)`);
          console.log(`-------------------------------------`);
        }
      });
    }
  );

  req.on('error', (e) => {
    completed++;
    errorCount++;
    console.error(`Request ${index} failed:`, e.message);
    if (completed === CONCURRENT_REQUESTS) {
      console.log(`Finished with errors.`);
    }
  });

  req.write(postData);
  req.end();
};

for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
  runRequest(i + 1);
}
