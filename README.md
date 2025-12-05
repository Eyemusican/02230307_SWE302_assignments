# SWE302 Software Testing & Security Assignments



##  Repository Overview

This repository contains comprehensive implementations of three major assignments focusing on software testing, security analysis, and performance testing for the **RealWorld Conduit** application - a full-stack Medium.com clone.

**Tech Stack:**
- **Backend:** Go/Gin framework with SQLite database
- **Frontend:** React 16.3.0 with Redux state management
- **Testing Tools:** Jest, Enzyme, Go testing, k6, Cypress, Snyk, SonarQube, OWASP ZAP

---

##  Assignment 1: Comprehensive Testing Implementation
  
**Report:** [`ASSIGNMENT_1_COMPREHENSIVE_REPORT.md`](Assignment_01/ASSIGNMENT_1_COMPREHENSIVE_REPORT.md)

### Achievements

#### Backend Testing (Go/Gin)
- **51 total test cases** (requirement: 35+) - **146% achievement**
- **25 unit tests** for Articles package (models, validators, serializers)
- **8 enhanced tests** for Common package
- **18 integration tests** covering full API endpoints
- **74.4% coverage** in Common package (exceeds 70% requirement)
- **100% coverage** in Users package

#### Frontend Testing (React/Redux)
- **157 total test cases** (requirement: 20+) - **785% achievement**
- **59 component tests** across 5 components (ArticleList, ArticlePreview, Login, Header, Editor)
- **82 reducer tests** across 3 reducers (auth, articleList, editor)
- **16 integration tests** for Redux flows
- **100% pass rate** (157/157 tests passing)

#### Key Deliverables
- Unit tests: `articles/unit_test.go`, `common/unit_test.go`
- Integration tests: `integration_test.go`
- Component tests: `ArticleList.test.js`, `ArticlePreview.test.js`, `Login.test.js`, `Header.test.js`, `Editor.test.js`
- Reducer tests: `auth.test.js`, `articleList.test.js`, `editor.test.js`
- Integration: `integration.test.js`
- Coverage reports: `coverage.html`, `coverage-report.md`

---

## Assignment 2: Security Testing (SAST & DAST)
 
**Report:** [`ASSIGNMENT_2_COMPLETE_REPORT.md`](Assignment_02/ASSIGNMENT_2_COMPLETE_REPORT.md)

### Security Assessment Summary

#### Tools Used
- **Snyk** - Dependency vulnerability scanning
- **SonarQube Cloud** - Static code analysis
- **OWASP ZAP** - Dynamic application security testing

#### Vulnerabilities Found & Fixed

**Snyk (7 vulnerabilities fixed - 100%)**
- Fixed CVE-2023-48295: Heap-based Buffer Overflow in go-sqlite3
- Fixed CVE-2020-26160: Authentication Bypass in jwt-go (migrated to golang-jwt/jwt v5)
- Fixed 5 ReDoS vulnerabilities in marked package (upgraded 0.3.6 → 14.1.3)

**SonarQube (504 issues analyzed, 3 critical fixed)**
- Fixed hard-coded credentials (moved to environment variables)
- Fixed resource leak in transaction handling
- Improved code quality metrics
- Security Score: **6.2 → 8.0** (29% improvement)

**OWASP ZAP (9 security alerts)**
- Implemented 6 security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Fixed CSP configuration issues
- Resolved information disclosure vulnerabilities
- Documented API security issues and remediation

#### Key Deliverables
- **Snyk Reports:** `snyk-backend-analysis.md`, `snyk-frontend-analysis.md`, `snyk-fixes-applied.md`
- **SonarQube Reports:** `sonarqube-analysis.md`, `security-hotspots-review.md`, `sonarqube-improvements.md`
- **ZAP Reports:** `zap-active-scan-analysis.md`, `zap-api-security-analysis.md`, `final-security-assessment.md`
- **32 screenshots** documenting findings and fixes
- Updated `go.mod` and `package.json` with secure dependencies

---

## Assignment 3: Performance Testing & E2E Testing
 
**Report:** [`ASSIGNMENT_3_REPORT.md`](Assignment_03/ASSIGNMENT_3_REPORT.md)

### Performance Testing (k6)

#### Tests Conducted
- **Load Test** - Baseline performance (10-50 VUs, 16 min)
- **Stress Test** - Breaking point analysis (50 VUs, 5 min)
- **Spike Test** - Sudden traffic surge (100 VUs, 2 min)
- **Soak Test** - Long-duration stability (50 VUs, 10 min)

#### Performance Optimization
- **92.3% improvement** - P95 latency reduced from **15.91ms → 1.23ms**
- Database indexes implemented on `articles.author_id`, `articles.created_at`, `comments.article_id`
- All tests passing with 100% check success rate
- System handles 100 concurrent users during spikes

### End-to-End Testing (Cypress)

#### Test Coverage
- **71 total E2E tests** across 5 test files
- **Authentication** (9 tests) - Registration, login, logout, protected routes
- **Articles** (16 tests) - CRUD operations, favorites, tags
- **Comments** (13 tests) - Add, delete, display, validation
- **Profile** (19 tests) - User profile, follow, settings, feed navigation
- **Workflows** (10 tests) - Complete user journeys, multi-user interactions
- **100% pass rate** (71/71 tests passing)

#### Key Deliverables
- k6 test scripts: `load-test.js`, `stress-test.js`, `spike-test.js`, `soak-test.js`
- Cypress tests: `authentication.cy.js`, `articles.cy.js`, `comments.cy.js`, `profile.cy.js`, `workflows.cy.js`
- Performance optimization: Database indexes in `hello.go`
- 12 screenshots documenting test results and optimizations

---

## Repository Structure

```
swe302_assignments/
├── README.md (this file)
├── ASSIGNMENT_1_COMPREHENSIVE_REPORT.md
├── ASSIGNMENT_2_COMPLETE_REPORT.md
├── ASSIGNMENT_3_REPORT.md
├── assets/                           # Assignment 3 Cypress screenshots
├── png/                              # Assignment 3 k6 screenshots
├── screenshots/                      # Assignment 2 security screenshots
├── golang-gin-realworld-example-app/ # Backend application
│   ├── articles/
│   │   └── unit_test.go             # 25 unit tests
│   ├── common/
│   │   └── unit_test.go             # 13 unit tests
│   ├── users/
│   │   └── unit_test.go             # Users tests (100% coverage)
│   ├── integration_test.go           # 18 integration tests
│   ├── hello.go                      # Main server (with security headers & indexes)
│   ├── coverage.html                 # Coverage report
│   ├── snyk-backend-analysis.md
│   ├── testing-analysis.md
│   └── k6-tests/                     # Performance test scripts
│       ├── load-test.js
│       ├── stress-test.js
│       ├── spike-test.js
│       └── soak-test.js
├── react-redux-realworld-example-app/ # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArticleList.test.js   # 9 tests
│   │   │   ├── ArticlePreview.test.js # 16 tests
│   │   │   ├── Login.test.js         # 17 tests
│   │   │   ├── Header.test.js        # 17 tests
│   │   │   └── Editor.test.js        # 29 tests
│   │   ├── reducers/
│   │   │   ├── auth.test.js          # 15 tests
│   │   │   ├── articleList.test.js   # 48 tests
│   │   │   └── editor.test.js        # 19 tests
│   │   └── integration.test.js       # 16 tests
│   ├── cypress/
│   │   └── e2e/
│   │       ├── authentication.cy.js  # 9 tests
│   │       ├── articles.cy.js        # 16 tests
│   │       ├── comments.cy.js        # 13 tests
│   │       ├── profile.cy.js         # 19 tests
│   │       └── workflows.cy.js       # 10 tests
│   ├── snyk-frontend-analysis.md
│   └── package.json                  # Updated dependencies
└── Supporting_documents_for_assignment_02/                            # Assignment 2 detailed reports
    ├── snyk-fixes-applied.md
    ├── snyk-remediation-plan.md
    ├── sonarqube-analysis.md
    ├── sonarqube-improvements.md
    ├── security-hotspots-review.md
    ├── zap-active-scan-analysis.md
    ├── zap-api-security-analysis.md
    ├── zap-fixes-applied.md
    └── final-security-assessment.md
```

---

## Overall Achievements

### Test Statistics
- **Total Tests Written:** 280+ tests
- **Backend Tests:** 51 (Go)
- **Frontend Unit/Integration:** 157 (JavaScript)
- **E2E Tests:** 71 (Cypress)
- **Pass Rate:** 99%+ across all assignments

### Security Improvements
- **Vulnerabilities Fixed:** 10 critical/high severity issues
- **Security Score:** Improved from 6.2 → 8.0
- **Dependencies Upgraded:** 7 vulnerable packages updated
- **Security Headers:** 6 headers implemented

### Performance Gains
- **P95 Latency:** 92.3% improvement (15.91ms → 1.23ms)
- **Database Optimization:** Indexes on critical columns
- **Load Capacity:** Handles 100+ concurrent users
- **Zero Error Rate:** Maintained under load testing

---

## Running the Tests

### Backend Tests (Go)
```bash
cd golang-gin-realworld-example-app

# Run all tests
go test ./...

# Run with coverage
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Run integration tests
go test -v integration_test.go

# Run unit tests for specific package
go test -v ./articles
go test -v ./common
```

### Frontend Tests (React)
```bash
cd react-redux-realworld-example-app

# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- ArticleList.test.js
```

### Performance Tests (k6)
```bash
cd golang-gin-realworld-example-app/k6-tests

# Run load test
k6 run load-test.js

# Run stress test
k6 run stress-test.js

# Run spike test
k6 run spike-test.js

# Run soak test
k6 run soak-test.js
```

### E2E Tests (Cypress)
```bash
cd react-redux-realworld-example-app

# Open Cypress GUI
npx cypress open

# Run all tests in CLI
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/authentication.cy.js"
```

### Security Scans
```bash
# Snyk scan
snyk test

# SonarQube (via GitHub integration)
# Push to main branch triggers automatic scan

# OWASP ZAP
# Start applications first:
# Terminal 1: cd golang-gin-realworld-example-app && go run hello.go
# Terminal 2: cd react-redux-realworld-example-app && npm start
# Then open ZAP and run automated scan on http://localhost:4100
```



## Key Learnings

### Testing Best Practices
- Unit tests should be isolated and fast
- Integration tests verify component interactions
- E2E tests simulate real user workflows
- Test coverage is important but 100% isn't always necessary
- Test independence prevents flaky tests

### Security Insights
- Dependency vulnerabilities are common and serious
- SAST catches issues before deployment
- DAST finds runtime vulnerabilities
- Security headers are critical for web applications
- Regular security scanning is essential

### Performance Optimization
- Database indexes provide massive improvements
- Load testing reveals bottlenecks
- Performance degradation patterns are predictable
- System recovery after load is important
- Baseline metrics enable measurement

---

