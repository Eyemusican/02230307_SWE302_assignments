import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, getHeaders, THRESHOLDS } from './config.js';
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

// Load test configuration - QUICK VERSION FOR TESTING
export const options = {
    stages: [
        { duration: '30s', target: 20 },   // Ramp up to 20 users over 30 seconds
        { duration: '1m', target: 20 },    // Stay at 20 users for 1 minute
        { duration: '30s', target: 50 },   // Ramp up to 50 users over 30 seconds
        { duration: '1m', target: 50 },    // Stay at 50 users for 1 minute
        { duration: '30s', target: 0 },    // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1000ms
        http_req_failed: ['rate<0.01'],                  // Less than 1% failure rate
    },
};

// Test data
let userToken = null;
let articleSlug = null;

export default function () {
    const vuId = __VU; // Current Virtual User ID
    const iter = __ITER; // Current iteration

    // Scenario 1: User Registration and Login (20% of users)
    if (Math.random() < 0.2) {
        const username = `user_${vuId}_${iter}_${Date.now()}`;
        const email = `${username}@test.com`;
        const password = 'Password123!';

        // Register
        const registerRes = registerUser(username, email, password);
        check(registerRes, {
            'registration successful': (r) => r.status === 200 || r.status === 422,
        });

        if (registerRes.status === 200) {
            const body = JSON.parse(registerRes.body);
            userToken = body.user.token;
        } else {
            // If registration fails (user already exists), login instead
            const token = loginUser(email, password);
            if (token) {
                userToken = token;
            }
        }
    }

    // Scenario 2: Browse Articles (50% of requests)
    if (Math.random() < 0.5) {
        const articlesRes = getArticles(userToken);
        check(articlesRes, {
            'articles list retrieved': (r) => r.status === 200,
            'articles response time OK': (r) => r.timings.duration < 500,
        });

        // Get a random article if articles exist
        if (articlesRes.status === 200) {
            const articles = JSON.parse(articlesRes.body);
            if (articles.articles && articles.articles.length > 0) {
                const randomArticle = articles.articles[Math.floor(Math.random() * articles.articles.length)];
                articleSlug = randomArticle.slug;

                const articleRes = getArticle(articleSlug, userToken);
                check(articleRes, {
                    'single article retrieved': (r) => r.status === 200,
                    'article response time OK': (r) => r.timings.duration < 300,
                });
            }
        }
    }

    // Scenario 3: Get Tags (30% of requests)
    if (Math.random() < 0.3) {
        const tagsRes = getTags();
        check(tagsRes, {
            'tags retrieved': (r) => r.status === 200,
            'tags response time OK': (r) => r.timings.duration < 200,
        });
    }

    // Scenario 4: Create Article (10% of authenticated users)
    if (userToken && Math.random() < 0.1) {
        const title = `Load Test Article ${vuId}_${iter}_${Date.now()}`;
        const description = 'This is a load test article';
        const body = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        const tags = ['testing', 'k6'];

        const createRes = createArticle(userToken, title, description, body, tags);
        check(createRes, {
            'article created': (r) => r.status === 200,
            'article creation time OK': (r) => r.timings.duration < 800,
        });

        if (createRes.status === 200) {
            const article = JSON.parse(createRes.body);
            articleSlug = article.article.slug;
        }
    }

    // Scenario 5: Add Comment (5% of authenticated users with article)
    if (userToken && articleSlug && Math.random() < 0.05) {
        const commentBody = `Comment from VU ${vuId} at iteration ${iter}`;
        const commentRes = createComment(articleSlug, userToken, commentBody);
        check(commentRes, {
            'comment created': (r) => r.status === 200 || r.status === 404,
        });
    }

    // Scenario 6: Favorite Article (10% of authenticated users with article)
    if (userToken && articleSlug && Math.random() < 0.1) {
        const favoriteRes = favoriteArticle(articleSlug, userToken);
        check(favoriteRes, {
            'article favorited': (r) => r.status === 200 || r.status === 404,
        });
    }

    // Think time: simulate user reading/interaction
    sleep(1 + Math.random() * 2); // Random sleep between 1-3 seconds
}

export function handleSummary(data) {
    return {
        'load-test-results.json': JSON.stringify(data, null, 2),
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    };
}

function textSummary(data, options) {
    const indent = options.indent || '';

    let summary = '\n';
    summary += `${indent}Load Test Summary:\n`;
    summary += `${indent}==================\n\n`;
    
    // Request metrics
    summary += `${indent}HTTP Requests:\n`;
    summary += `${indent}  Total: ${data.metrics.http_reqs.values.count}\n`;
    summary += `${indent}  Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s\n\n`;
    
    // Response time metrics
    summary += `${indent}Response Times:\n`;
    summary += `${indent}  Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}  Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
    summary += `${indent}  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
    summary += `${indent}  P95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
    summary += `${indent}  P99: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;
    
    // Failure rate
    summary += `${indent}Failures:\n`;
    summary += `${indent}  Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
    summary += `${indent}  Count: ${data.metrics.http_req_failed.values.passes} / ${data.metrics.http_reqs.values.count}\n\n`;
    
    // VU metrics
    summary += `${indent}Virtual Users:\n`;
    summary += `${indent}  Max: ${data.metrics.vus_max.values.max}\n`;
    summary += `${indent}  Avg: ${data.metrics.vus.values.value.toFixed(2)}\n\n`;
    
    // Checks
    if (data.metrics.checks) {
        summary += `${indent}Checks:\n`;
        summary += `${indent}  Passed: ${data.metrics.checks.values.passes}\n`;
        summary += `${indent}  Failed: ${data.metrics.checks.values.fails}\n`;
        summary += `${indent}  Pass Rate: ${(data.metrics.checks.values.rate * 100).toFixed(2)}%\n\n`;
    }
    
    return summary;
}
