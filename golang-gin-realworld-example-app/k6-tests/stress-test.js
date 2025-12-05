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

// Stress test configuration - Find the breaking point
export const options = {
    stages: [
        { duration: '2m', target: 50 },    // Ramp up to 50 users
        { duration: '2m', target: 100 },   // Ramp up to 100 users
        { duration: '2m', target: 150 },   // Ramp up to 150 users
        { duration: '2m', target: 200 },   // Ramp up to 200 users
        { duration: '2m', target: 250 },   // Ramp up to 250 users (push to limits)
        { duration: '2m', target: 0 },     // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],  // More lenient threshold
        http_req_failed: ['rate<0.2'],      // Allow up to 20% failures under stress
    },
};

let userToken = null;
let articleSlug = null;

export default function () {
    const vuId = __VU;
    const iter = __ITER;

    // Scenario 1: User Registration and Login (20% of users)
    if (Math.random() < 0.2) {
        const username = `stress_user_${vuId}_${iter}_${Date.now()}`;
        const email = `${username}@test.com`;
        const password = 'Password123!';

        const registerRes = registerUser(username, email, password);
        check(registerRes, {
            'stress: registration successful': (r) => r.status === 200 || r.status === 422,
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
            'stress: articles list retrieved': (r) => r.status === 200,
            'stress: articles response time acceptable': (r) => r.timings.duration < 2000,
        });

        if (articlesRes.status === 200) {
            const articles = JSON.parse(articlesRes.body);
            if (articles.articles && articles.articles.length > 0) {
                const randomArticle = articles.articles[Math.floor(Math.random() * articles.articles.length)];
                articleSlug = randomArticle.slug;

                const articleRes = getArticle(articleSlug, userToken);
                check(articleRes, {
                    'stress: single article retrieved': (r) => r.status === 200,
                });
            }
        }
    }

    // Scenario 3: Get Tags (30% of requests)
    if (Math.random() < 0.3) {
        const tagsRes = getTags();
        check(tagsRes, {
            'stress: tags retrieved': (r) => r.status === 200,
        });
    }

    // Scenario 4: Create Article (10% of authenticated users)
    if (userToken && Math.random() < 0.1) {
        const title = `Stress Test Article ${vuId}_${iter}_${Date.now()}`;
        const description = 'Testing system under stress';
        const body = 'This article was created during a stress test to find breaking points.';
        const tags = ['stress', 'performance'];

        const createRes = createArticle(userToken, title, description, body, tags);
        check(createRes, {
            'stress: article created': (r) => r.status === 200,
        });

        if (createRes.status === 200) {
            const article = JSON.parse(createRes.body);
            articleSlug = article.article.slug;
        }
    }

    // Scenario 5: Add Comment (5% of authenticated users with article)
    if (userToken && articleSlug && Math.random() < 0.05) {
        const commentBody = `Stress test comment from VU ${vuId}`;
        const commentRes = createComment(articleSlug, userToken, commentBody);
        check(commentRes, {
            'stress: comment created': (r) => r.status === 200 || r.status === 404,
        });
    }

    // Shorter think time during stress test
    sleep(0.5 + Math.random()); // Random sleep between 0.5-1.5 seconds
}

export function handleSummary(data) {
    return {
        'stress-test-results.json': JSON.stringify(data, null, 2),
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    };
}

function textSummary(data, options) {
    const indent = options.indent || '';

    let summary = '\n';
    summary += `${indent}Stress Test Summary:\n`;
    summary += `${indent}====================\n\n`;
    
    // Request metrics
    if (data.metrics.http_reqs) {
        summary += `${indent}HTTP Requests:\n`;
        summary += `${indent}  Total: ${data.metrics.http_reqs.values.count}\n`;
        summary += `${indent}  Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s\n\n`;
    }
    
    // Response time metrics
    if (data.metrics.http_req_duration) {
        summary += `${indent}Response Times:\n`;
        summary += `${indent}  Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
        summary += `${indent}  Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
        summary += `${indent}  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
        summary += `${indent}  P95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
        summary += `${indent}  P99: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;
    }
    
    // Failure rate
    if (data.metrics.http_req_failed && data.metrics.http_reqs) {
        summary += `${indent}Failures:\n`;
        summary += `${indent}  Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
        summary += `${indent}  Count: ${data.metrics.http_req_failed.values.passes} / ${data.metrics.http_reqs.values.count}\n\n`;
    }
    
    // VU metrics
    if (data.metrics.vus_max && data.metrics.vus) {
        summary += `${indent}Virtual Users:\n`;
        summary += `${indent}  Max: ${data.metrics.vus_max.values.max}\n`;
        summary += `${indent}  Breaking Point Analysis: Check when error rate increased significantly\n\n`;
    }
    
    // Checks
    if (data.metrics.checks) {
        summary += `${indent}Checks:\n`;
        summary += `${indent}  Passed: ${data.metrics.checks.values.passes}\n`;
        summary += `${indent}  Failed: ${data.metrics.checks.values.fails}\n`;
        summary += `${indent}  Pass Rate: ${(data.metrics.checks.values.rate * 100).toFixed(2)}%\n\n`;
    }
    
    return summary;
}
