import http from 'k6/http';
import { check } from 'k6';

export default function () {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'k6',
            'Accept': '*/*',
        },
    };

    // Test 1: GET tags
    console.log('Testing GET /api/tags/');
    const tagsRes = http.get('http://127.0.0.1:8080/api/tags/', params);
    console.log('Status:', tagsRes.status);
    console.log('Body:', tagsRes.body);
    console.log('Error:', tagsRes.error);
    console.log('Error Code:', tagsRes.error_code);
    console.log('---');

    // Test 2: POST registration
    console.log('Testing POST /api/users/');
    const payload = JSON.stringify({
        user: {
            username: 'testuser456',
            email: 'testuser456@test.com',
            password: 'Test123!'
        }
    });
    const regRes = http.post(
        'http://127.0.0.1:8080/api/users/',
        payload,
        params
    );
    console.log('Status:', regRes.status);
    console.log('Body:', regRes.body.substring(0, 200));
    console.log('Error:', regRes.error);
    console.log('Error Code:', regRes.error_code);
    
    // Check success
    check(tagsRes, { 'tags OK': (r) => r.status === 200 });
    check(regRes, { 'reg OK': (r) => r.status === 200 || r.status === 422 });
}

export const options = {
    iterations: 1,
    vus: 1,
};
