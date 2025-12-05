import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, getHeaders } from './config.js';
import { registerUser, loginUser, getArticles, getTags } from './helpers.js';

// Quick test - 1 minute
export const options = {
    stages: [
        { duration: '20s', target: 10 },
        { duration: '20s', target: 10 },
        { duration: '20s', target: 0 },
    ],
};

export default function () {
    const vuId = __VU;
    const iter = __ITER;

    // Test registration
    if (Math.random() < 0.3) {
        const username = `testuser_${vuId}_${iter}_${Date.now()}`;
        const email = `${username}@test.com`;
        const password = 'Test123!';

        const regRes = registerUser(username, email, password);
        check(regRes, {
            'registration status OK': (r) => r.status === 200 || r.status === 422,
        });
    }

    // Test get articles
    const articlesRes = getArticles();
    check(articlesRes, {
        'articles retrieved': (r) => r.status === 200,
    });

    // Test get tags
    const tagsRes = getTags();
    check(tagsRes, {
        'tags retrieved': (r) => r.status === 200,
    });

    sleep(1);
}
