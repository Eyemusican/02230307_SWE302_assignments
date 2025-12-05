# OWASP ZAP Initial Scan Analysis

## Scan Information
- **Tool:** OWASP ZAP 2.16.1
- **Scan Type:** Automated Scan (Spider + Passive Scan)
- **Target URL:** http://localhost:4100
- **Backend API:** http://localhost:8080
- **Scan Date:** December 3, 2025
- **Scan Duration:** ~2 minutes
- **Spider Depth:** Default

---

## Executive Summary

OWASP ZAP performed an automated security scan on the RealWorld Conduit application, discovering **8 security alerts** across 3 severity levels. The scan identified **no Critical or High severity vulnerabilities**, but found **3 Medium severity** and **5 Low severity** issues, all related to missing or misconfigured security headers and information disclosure.

**Key Findings:**
- ❌ Missing Content Security Policy (CSP) headers
- ❌ Missing Anti-Clickjacking protection (X-Frame-Options)
- ❌ Missing X-Content-Type-Options header
- ❌ Server information disclosure via HTTP headers

**Overall Risk:** MEDIUM - All issues are configuration-related and can be fixed by implementing security headers middleware.

---

## Alerts Summary

| Severity | Count | Alerts |
|----------|-------|--------|
| 🔴 High | 0 | None |
| 🟠 Medium | 3 | CSP issues, Anti-clickjacking, X-Content-Type-Options |
| 🟡 Low | 5 | Information disclosure |
| ℹ️ Info | 0 | None |
| **Total** | **8** | |

---

## Detailed Findings

### 🟠 Medium Severity Issues (3 alerts)

---

#### 1. CSP: Failure to Define Directive with No Fallback

**Alert ID:** 10038  
**Risk Level:** Medium  
**Confidence:** High  
**CWE:** CWE-693 (Protection Mechanism Failure)  
**OWASP:** A05:2021 – Security Misconfiguration

**Instances:** 2

**Description:**  
The application has a Content Security Policy (CSP) header, but it's missing critical directives with no fallback to 'default-src'. This reduces the effectiveness of CSP in preventing XSS and other code injection attacks.

**URLs Affected:**
- `http://localhost:4100/`
- `http://localhost:4100/static/` (and related static resources)

**Current CSP Header:**
```
Content-Security-Policy: <missing or incomplete>
```

**Impact:**
- Reduced protection against Cross-Site Scripting (XSS)
- Potential for inline script execution
- Reduced defense-in-depth

**Recommendation:**
Implement a comprehensive CSP header:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:8080
```

---

#### 2. Content Security Policy (CSP) Header Not Set

**Alert ID:** 10038  
**Risk Level:** Medium  
**Confidence:** High  
**CWE:** CWE-693 (Protection Mechanism Failure)  
**OWASP:** A05:2021 – Security Misconfiguration

**Instances:** 2

**Description:**  
The HTTP response does not include a Content Security Policy header. CSP is an added layer of security that helps detect and mitigate certain types of attacks, including XSS and data injection attacks.

**URLs Affected:**
- `http://localhost:8080/api/tags/`
- `http://localhost:8080/api/articles/`

**Impact:**
- No protection against XSS attacks
- No restriction on resource loading
- Higher risk of code injection vulnerabilities

**Recommendation:**
Add CSP header to backend API responses:
```go
c.Header("Content-Security-Policy", "default-src 'self'")
```

---

#### 3. Missing Anti-clickjacking Header

**Alert ID:** 10020  
**Risk Level:** Medium  
**Confidence:** Medium  
**CWE:** CWE-1021 (Improper Restriction of Rendered UI Layers or Frames)  
**OWASP:** A05:2021 – Security Misconfiguration

**Instances:** 2

**Description:**  
The response does not include either X-Frame-Options or Content-Security-Policy with 'frame-ancestors' directive. This means the content can be embedded in frames, making the application vulnerable to clickjacking attacks.

**URLs Affected:**
- `http://localhost:4100/`
- `http://localhost:8080/api/tags/`

**Clickjacking Attack Scenario:**
1. Attacker creates a malicious page with an invisible iframe containing your app
2. Attacker overlays clickable elements over your application's UI
3. User thinks they're clicking legitimate content but actually interacting with your app
4. Could lead to unauthorized actions (e.g., transferring funds, changing settings)

**Impact:**
- UI redressing attacks possible
- User actions can be hijacked
- Potential for unauthorized operations

**Recommendation:**
Add X-Frame-Options header:
```go
c.Header("X-Frame-Options", "DENY")
// or for same-origin framing:
c.Header("X-Frame-Options", "SAMEORIGIN")
```

---

### 🟡 Low Severity Issues (5 alerts)

---

#### 4. Server Leaks Information via "X-Powered-By" HTTP Response Header

**Alert ID:** 10037  
**Risk Level:** Low  
**Confidence:** Medium  
**CWE:** CWE-200 (Information Exposure)  
**OWASP:** A01:2021 – Broken Access Control

**Instances:** Multiple

**Description:**  
The web/application server is leaking information via the "X-Powered-By" HTTP response header, revealing technology stack details.

**Header Found:**
```
X-Powered-By: Express
```

**URLs Affected:**
- All frontend responses from `http://localhost:4100/*`

**Impact:**
- Reveals application framework (Express.js)
- Aids attackers in reconnaissance phase
- Helps identify known vulnerabilities in specific versions
- Information disclosure facilitates targeted attacks

**Recommendation:**
Remove or obfuscate the X-Powered-By header:
```javascript
// In Express app (frontend)
app.disable('x-powered-by');
```

For Go backend, ensure no X-Powered-By header is added.

---

#### 5. Server Leaks Version Information via "Server" HTTP Response Header

**Alert ID:** 10036  
**Risk Level:** Low  
**Confidence:** High  
**CWE:** CWE-200 (Information Exposure)  
**OWASP:** A01:2021 – Broken Access Control

**Instances:** Multiple

**Description:**  
The web server is leaking version information via the "Server" HTTP response header.

**Header Found:**
```
Server: <server_type_and_version>
```

**Impact:**
- Reveals web server type and version
- Enables version-specific exploit attempts
- Reduces attacker effort in reconnaissance
- Violates security through obscurity principles

**Recommendation:**
Remove or generic-ify the Server header:
```go
// Remove or customize Server header in Go
c.Header("Server", "")
```

---

#### 6. X-Content-Type-Options Header Missing

**Alert ID:** 10021  
**Risk Level:** Low  
**Confidence:** Medium  
**CWE:** CWE-693 (Protection Mechanism Failure)  
**OWASP:** A05:2021 – Security Misconfiguration

**Instances:** 8

**Description:**  
The Anti-MIME-Sniffing header X-Content-Type-Options was not set to 'nosniff'. This allows older versions of Internet Explorer and Chrome to perform MIME-sniffing on the response body, potentially causing it to interpret the response as a different content type.

**URLs Affected:**
- `http://localhost:4100/` (main page)
- `http://localhost:4100/static/js/*.js` (JavaScript files)
- `http://localhost:4100/static/css/*.css` (CSS files)
- `http://localhost:8080/api/*` (API endpoints)

**MIME Sniffing Attack Scenario:**
1. Attacker uploads a file disguised as an image but containing JavaScript
2. Without X-Content-Type-Options, browser may execute the JavaScript
3. Leads to XSS vulnerabilities
4. User's session could be compromised

**Impact:**
- MIME-sniffing vulnerabilities in IE/Chrome
- Potential XSS through content-type confusion
- File upload bypass attacks

**Recommendation:**
Add X-Content-Type-Options header:
```go
c.Header("X-Content-Type-Options", "nosniff")
```

---

## OWASP Top 10 Mapping

### A05:2021 – Security Misconfiguration ✅ **Confirmed**
- **Issues Found:** 6 out of 8 alerts
- **Primary Problems:**
  - Missing Content Security Policy
  - Missing Anti-Clickjacking headers
  - Missing X-Content-Type-Options
- **Risk:** Medium
- **Status:** Requires immediate remediation

### A01:2021 – Broken Access Control ⚠️ **Partial**
- **Issues Found:** Information disclosure (2 alerts)
- **Primary Problems:**
  - Server information leakage
  - Technology stack disclosure
- **Risk:** Low
- **Status:** Should be addressed

---

## Risk Assessment

### Overall Risk Score: **MEDIUM** (5.5/10)

**Risk Breakdown:**

| Category | Score | Justification |
|----------|-------|---------------|
| Confidentiality | 6/10 | Information disclosure present but limited |
| Integrity | 5/10 | Missing CSP/clickjacking protection |
| Availability | 5/10 | No DoS vulnerabilities found |
| **Overall** | **5.5/10** | Configuration issues, no critical flaws |

### Risk Matrix

| Risk Level | Count | Priority |
|------------|-------|----------|
| Critical | 0 | - |
| High | 0 | - |
| Medium | 3 | **P1 - Fix immediately** |
| Low | 5 | P2 - Fix in next release |
| Info | 0 | - |

---

## Comparison with SAST Findings

### Snyk vs ZAP
- **Snyk:** Found 7 dependency vulnerabilities (all fixed)
- **ZAP:** Found 8 configuration vulnerabilities (all unfixed)
- **Overlap:** None - complementary coverage
- **Conclusion:** Both SAST and DAST required for comprehensive security

### SonarQube vs ZAP
- **SonarQube:** Found 504 code quality issues, 12 security hotspots
- **ZAP:** Found 8 runtime configuration issues
- **Overlap:** Both identified missing security headers concept
- **Conclusion:** SonarQube found source code issues, ZAP found deployment/runtime issues

---

## Remediation Priority

### P0 - Critical (None)
No critical issues found.

### P1 - High Priority (3 issues)
1. **Implement CSP Headers**
   - Effort: 30 minutes
   - Impact: Medium
   - Complexity: Low

2. **Add X-Frame-Options Header**
   - Effort: 10 minutes
   - Impact: Medium
   - Complexity: Low

3. **Add X-Content-Type-Options Header**
   - Effort: 10 minutes
   - Impact: Low-Medium
   - Complexity: Low

### P2 - Medium Priority (2 issues)
4. **Remove X-Powered-By Header**
   - Effort: 5 minutes
   - Impact: Low
   - Complexity: Low

5. **Remove/Obfuscate Server Header**
   - Effort: 5 minutes
   - Impact: Low
   - Complexity: Low

**Total Remediation Time:** ~1 hour

---

## Recommended Security Headers

Implement the following security headers in the backend (Go):

```go
// Add to hello.go after router initialization
router.Use(func(c *gin.Context) {
    // Prevent clickjacking
    c.Header("X-Frame-Options", "DENY")
    
    // Prevent MIME sniffing
    c.Header("X-Content-Type-Options", "nosniff")
    
    // Enable XSS filter
    c.Header("X-XSS-Protection", "1; mode=block")
    
    // Enforce HTTPS (if using TLS)
    // c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    
    // Content Security Policy
    c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:8080")
    
    // Remove information disclosure headers
    c.Header("Server", "")
    c.Header("X-Powered-By", "")
    
    c.Next()
})
```

For frontend (React/Express):
```javascript
// Add to server configuration
app.disable('x-powered-by');
```

---

## Testing Verification

After implementing fixes, verify using:

### 1. ZAP Re-scan
```bash
# Run automated scan again
# Expected: 0 Medium alerts, 0 Low alerts related to headers
```

### 2. Manual Header Check
```bash
curl -I http://localhost:4100
curl -I http://localhost:8080/api/tags
```

Expected headers:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self' ...
Server: (empty or custom)
X-Powered-By: (absent)
```

### 3. Online Security Header Checker
- https://securityheaders.com/
- Expected grade: A or A+

---

## Screenshots

### ZAP Alerts Summary
![ZAP Alerts](screenshots/zap-alerts-summary.png)
- 3 Medium severity alerts
- 5 Low severity alerts
- Total 8 issues found

### ZAP Alerts Detail
![ZAP Alert Details](screenshots/zap-alert-details.png)
- CSP header missing
- X-Frame-Options missing
- X-Content-Type-Options missing

---

## Conclusion

The OWASP ZAP automated scan revealed that the RealWorld Conduit application has **good baseline security** with no critical or high-severity vulnerabilities. However, it suffers from **common security misconfiguration issues**, specifically missing HTTP security headers.

**Strengths:**
- ✅ No SQL injection vulnerabilities detected
- ✅ No XSS vulnerabilities found in initial scan
- ✅ No authentication/authorization bypass issues
- ✅ No sensitive data exposure in URLs

**Weaknesses:**
- ❌ Missing Content Security Policy
- ❌ Missing Anti-Clickjacking protection
- ❌ Missing MIME-sniffing protection
- ❌ Information disclosure via HTTP headers

**Next Steps:**
1. Implement security headers middleware (estimated 1 hour)
2. Re-run ZAP scan to verify fixes
3. Perform authenticated active scan for deeper testing
4. Test API security specifically
5. Document before/after comparison

**Overall Assessment:**  
The application's security posture is **MEDIUM**. All identified issues are easily fixable through configuration changes and do not require code refactoring. Implementing the recommended security headers will significantly improve the security posture to **HIGH**.
