import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, getHeaders } from './config.js';
import { 
    registerUser, 
    loginUser, 
    createArticle, 
    getArticles, 
    getArticle,
    getTags,
    createComment,
    favoriteArticle
} from './helpers.js';

// Spike test configuration - Sudden traffic surge
export const options = {
    stages: [
        { duration: '30s', target: 10 },   // Start with normal load
        { duration: '10s', target: 200 },  // SPIKE! Jump to 200 users in 10 seconds
        { duration: '1m', target: 200 },   // Stay at spike level
        { duration: '30s', target: 10 },   // Recover back to normal
        { duration: '1m', target: 10 },    // Stay at normal to observe recovery
        { duration: '10s', target: 0 },    // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<3000'],  // Lenient during spike
        // Allow higher failure rate during spike
    },
};

let userToken = null;
let articleSlug = null;

export default function () {
    const vuId = __VU;
    const iter = __ITER;

    // Scenario 1: User Registration and Login (20% of users)
    if (Math.random() < 0.2) {
        const username = `spike_user_${vuId}_${iter}_${Date.now()}`;
        const email = `${username}@test.com`;
        const password = 'Password123!';

        const registerRes = registerUser(username, email, password);
        check(registerRes, {
            'spike: registration status': (r) => r.status === 200 || r.status === 422,
        });

        if (registerRes.status === 200) {
            const body = JSON.parse(registerRes.body);
            userToken = body.user.token;
        }
    }

    // Scenario 2: Browse Articles (50% of requests)
    if (Math.random() < 0.5) {
        const articlesRes = getArticles(userToken);
        check(articlesRes, {
            'spike: articles retrieved': (r) => r.status === 200,
            'spike: articles response under 3s': (r) => r.timings.duration < 3000,
        });

        if (articlesRes.status === 200) {
            const articles = JSON.parse(articlesRes.body);
            if (articles.articles && articles.articles.length > 0) {
                const randomArticle = articles.articles[Math.floor(Math.random() * articles.articles.length)];
                articleSlug = randomArticle.slug;

                const articleRes = getArticle(articleSlug, userToken);
                check(articleRes, {
                    'spike: article retrieved': (r) => r.status === 200,
                });
            }
        }
    }

    // Scenario 3: Get Tags (30% of requests)
    if (Math.random() < 0.3) {
        const tagsRes = getTags();
        check(tagsRes, {
            'spike: tags retrieved': (r) => r.status === 200,
        });
    }

    // Scenario 4: Create Article (10% of authenticated users)
    if (userToken && Math.random() < 0.1) {
        const title = `Spike Test Article ${vuId}_${iter}_${Date.now()}`;
        const description = 'Testing spike behavior';
        const body = 'This article was created during a traffic spike test.';
        const tags = ['spike', 'performance'];

        const createRes = createArticle(userToken, title, description, body, tags);
        check(createRes, {
            'spike: article created': (r) => r.status === 200,
        });

        if (createRes.status === 200) {
            const article = JSON.parse(createRes.body);
            articleSlug = article.article.slug;
        }
    }

    // Minimal think time during spike
    sleep(0.3 + Math.random() * 0.5); // Random sleep 0.3-0.8 seconds
}

export function handleSummary(data) {
    return {
        'spike-test-results.json': JSON.stringify(data, null, 2),
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    };
}

function textSummary(data, options) {
    const indent = options.indent || '';

    let summary = '\n';
    summary += `${indent}Spike Test Summary:\n`;
    summary += `${indent}===================\n\n`;
    
    if (data.metrics.http_reqs) {
        summary += `${indent}HTTP Requests:\n`;
        summary += `${indent}  Total: ${data.metrics.http_reqs.values.count}\n`;
        summary += `${indent}  Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s\n\n`;
    }
    
    if (data.metrics.http_req_duration) {
        summary += `${indent}Response Times (During Spike):\n`;
        summary += `${indent}  Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
        summary += `${indent}  Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
        summary += `${indent}  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
        summary += `${indent}  P95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
        summary += `${indent}  P99: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;
    }
    
    if (data.metrics.http_req_failed && data.metrics.http_reqs) {
        summary += `${indent}Failures:\n`;
        summary += `${indent}  Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
        summary += `${indent}  Count: ${data.metrics.http_req_failed.values.passes} / ${data.metrics.http_reqs.values.count}\n\n`;
    }
    
    if (data.metrics.vus_max && data.metrics.vus) {
        summary += `${indent}Virtual Users:\n`;
        summary += `${indent}  Max: ${data.metrics.vus_max.values.max}\n`;
        summary += `${indent}  Recovery: Check if system recovered after spike\n\n`;
    }
    
    if (data.metrics.checks) {
        summary += `${indent}Checks:\n`;
        summary += `${indent}  Passed: ${data.metrics.checks.values.passes}\n`;
        summary += `${indent}  Failed: ${data.metrics.checks.values.fails}\n`;
        summary += `${indent}  Pass Rate: ${(data.metrics.checks.values.rate * 100).toFixed(2)}%\n\n`;
    }
    
    return summary;
}
