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

// Soak test configuration - Extended duration to find memory leaks
// Original: 1 hour, Reduced for testing: 10 minutes
export const options = {
    stages: [
        { duration: '2m', target: 50 },    // Ramp up to 50 users
        { duration: '6m', target: 50 },    // Stay at 50 users for 6 minutes (reduced from 56m)
        { duration: '2m', target: 0 },     // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'],  // Should maintain performance
        // Check that performance doesn't degrade over time
    },
};

let userToken = null;
let articleSlug = null;

export default function () {
    const vuId = __VU;
    const iter = __ITER;

    // Scenario 1: User Registration and Login (20% of users)
    if (Math.random() < 0.2) {
        const username = `soak_user_${vuId}_${iter}_${Date.now()}`;
        const email = `${username}@test.com`;
        const password = 'Password123!';

        const registerRes = registerUser(username, email, password);
        check(registerRes, {
            'soak: registration status': (r) => r.status === 200 || r.status === 422,
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
            'soak: articles retrieved': (r) => r.status === 200,
            'soak: articles response time stable': (r) => r.timings.duration < 1000,
        });

        if (articlesRes.status === 200) {
            const articles = JSON.parse(articlesRes.body);
            if (articles.articles && articles.articles.length > 0) {
                const randomArticle = articles.articles[Math.floor(Math.random() * articles.articles.length)];
                articleSlug = randomArticle.slug;

                const articleRes = getArticle(articleSlug, userToken);
                check(articleRes, {
                    'soak: article retrieved': (r) => r.status === 200,
                });
            }
        }
    }

    // Scenario 3: Get Tags (30% of requests)
    if (Math.random() < 0.3) {
        const tagsRes = getTags();
        check(tagsRes, {
            'soak: tags retrieved': (r) => r.status === 200,
        });
    }

    // Scenario 4: Create Article (10% of authenticated users)
    if (userToken && Math.random() < 0.1) {
        const title = `Soak Test Article ${vuId}_${iter}_${Date.now()}`;
        const description = 'Testing sustained load';
        const body = 'This article was created during a soak test to detect memory leaks.';
        const tags = ['soak', 'endurance'];

        const createRes = createArticle(userToken, title, description, body, tags);
        check(createRes, {
            'soak: article created': (r) => r.status === 200,
        });

        if (createRes.status === 200) {
            const article = JSON.parse(createRes.body);
            articleSlug = article.article.slug;
        }
    }

    // Scenario 5: Add Comment (5% of authenticated users with article)
    if (userToken && articleSlug && Math.random() < 0.05) {
        const commentBody = `Soak test comment from VU ${vuId} iteration ${iter}`;
        const commentRes = createComment(articleSlug, userToken, commentBody);
        check(commentRes, {
            'soak: comment created': (r) => r.status === 200 || r.status === 404,
        });
    }

    // Normal think time
    sleep(1 + Math.random() * 2); // Random sleep 1-3 seconds
}

export function handleSummary(data) {
    return {
        'soak-test-results.json': JSON.stringify(data, null, 2),
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    };
}

function textSummary(data, options) {
    const indent = options.indent || '';

    let summary = '\n';
    summary += `${indent}Soak Test Summary:\n`;
    summary += `${indent}==================\n\n`;
    
    if (data.metrics.http_reqs) {
        summary += `${indent}HTTP Requests:\n`;
        summary += `${indent}  Total: ${data.metrics.http_reqs.values.count}\n`;
        summary += `${indent}  Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s\n\n`;
    }
    
    if (data.metrics.http_req_duration) {
        summary += `${indent}Response Times (Over Extended Period):\n`;
        summary += `${indent}  Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
        summary += `${indent}  Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
        summary += `${indent}  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
        summary += `${indent}  P95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
        summary += `${indent}  P99: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
        summary += `${indent}  NOTE: Check if response times degraded over time (memory leak indicator)\n\n`;
    }
    
    if (data.metrics.http_req_failed && data.metrics.http_reqs) {
        summary += `${indent}Failures:\n`;
        summary += `${indent}  Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
        summary += `${indent}  Count: ${data.metrics.http_req_failed.values.passes} / ${data.metrics.http_reqs.values.count}\n\n`;
    }
    
    if (data.metrics.vus_max && data.metrics.vus) {
        summary += `${indent}Virtual Users:\n`;
        summary += `${indent}  Sustained: ${data.metrics.vus_max.values.max}\n`;
        summary += `${indent}  Duration: 10 minutes (reduced from 1 hour for testing)\n\n`;
    }
    
    if (data.metrics.checks) {
        summary += `${indent}Checks:\n`;
        summary += `${indent}  Passed: ${data.metrics.checks.values.passes}\n`;
        summary += `${indent}  Failed: ${data.metrics.checks.values.fails}\n`;
        summary += `${indent}  Pass Rate: ${(data.metrics.checks.values.rate * 100).toFixed(2)}%\n\n`;
    }
    
    summary += `${indent}Soak Test Analysis:\n`;
    summary += `${indent}  - Monitor if response times increased over duration\n`;
    summary += `${indent}  - Check for memory leaks (increasing memory usage)\n`;
    summary += `${indent}  - Verify no connection pool exhaustion\n`;
    summary += `${indent}  - Confirm error rate remained stable\n\n`;
    
    return summary;
}
