import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const booksLatency = new Trend('books_latency');
const membersLatency = new Trend('members_latency');
const borrowLatency = new Trend('borrow_latency');

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '20s', target: 20 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Scenario 1: Fetch book catalog and available stock
  const booksRes = http.get(`${BASE_URL}/api/books`);
  booksLatency.add(booksRes.timings.duration);
  const booksCheck = check(booksRes, {
    'GET /api/books status is 200': (r) => r.status === 200,
    'GET /api/books has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body) && body.length > 0;
      } catch {
        return false;
      }
    },
  });
  errorRate.add(!booksCheck);

  sleep(0.5);

  // Scenario 2: Fetch members list and active borrow counts
  const membersRes = http.get(`${BASE_URL}/api/members`);
  membersLatency.add(membersRes.timings.duration);
  const membersCheck = check(membersRes, {
    'GET /api/members status is 200': (r) => r.status === 200,
    'GET /api/members has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body) && body.length > 0;
      } catch {
        return false;
      }
    },
  });
  errorRate.add(!membersCheck);

  sleep(0.5);

  // Scenario 3: Simulate borrow and return flow
  const payload = JSON.stringify({
    memberCode: 'M001',
    bookCode: 'JK-45',
  });
  const headers = { 'Content-Type': 'application/json' };

  const borrowRes = http.post(`${BASE_URL}/api/borrow`, payload, { headers });
  borrowLatency.add(borrowRes.timings.duration);

  // Status can be 201 (success), 400 (limit reached), 403 (penalized), or 409 (already borrowed)
  const borrowValidStatus = [201, 400, 403, 409].includes(borrowRes.status);
  check(borrowRes, {
    'POST /api/borrow returns handled status': () => borrowValidStatus,
  });

  if (borrowRes.status === 201) {
    sleep(0.2);
    // Return the borrowed book
    const returnRes = http.post(`${BASE_URL}/api/borrow/return`, payload, { headers });
    check(returnRes, {
      'POST /api/borrow/return returns 200': (r) => r.status === 200,
    });
  }

  sleep(1);
}
