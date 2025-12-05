// k6 Configuration
export const BASE_URL = 'http://127.0.0.1:8080';

// Test thresholds
export const THRESHOLDS = {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
};

// Common headers
export function getHeaders(token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }
    return headers;
}
