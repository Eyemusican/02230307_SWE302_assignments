# Snyk Remediation Plan

**Project:** RealWorld Application (Full Stack)  
**Date:** December 2, 2025  
**Total Vulnerabilities:** 7 (2 High, 5 Medium)

---

## Executive Summary

This document outlines a prioritized remediation plan for security vulnerabilities identified by Snyk in both backend (Go) and frontend (React) applications.

**Vulnerability Distribution:**
- **Backend:** 2 High severity
- **Frontend:** 5 Medium severity
- **Total Vulnerable Packages:** 2 (jwt-go, go-sqlite3, marked)

---

## Priority Matrix

| Priority | Severity | Count | Fix Timeframe |
|----------|----------|-------|---------------|
| **P0 - Critical** | High | 2 | Immediate (24 hours) |
| **P1 - High** | Medium | 5 | Within 1 week |
| **P2 - Medium** | Low | 0 | Next sprint |
| **P3 - Low** | Info | 0 | Backlog |

---

## P0 - CRITICAL ISSUES (Must Fix Immediately)

### 1. JWT Authentication Bypass (Backend)

**Package:** `github.com/dgrijalva/jwt-go@3.2.0`  
**Severity:** HIGH (CVSS: 7.5+)  
**CVE:** CVE-2020-26160  
**Affected Files:**
- `common/utils.go` - Token generation
- `users/middlewares.go` - Authentication middleware

#### Issue Description
The jwt-go library incorrectly validates JWT audience claims, allowing attackers to bypass authentication and impersonate users.

#### Remediation Steps

**Option 1: Migrate to golang-jwt/jwt (RECOMMENDED)**

1. **Update go.mod:**
   ```bash
   cd golang-gin-realworld-example-app
   go get -u github.com/golang-jwt/jwt/v5
   go mod tidy
   ```

2. **Update imports in code:**
   ```go
   // OLD:
   import "github.com/dgrijalva/jwt-go"
   
   // NEW:
   import "github.com/golang-jwt/jwt/v5"
   ```

3. **Update token generation (common/utils.go):**
   ```go
   // OLD:
   token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
       "id": userId,
       "exp": time.Now().Add(time.Hour * 24).Unix(),
   })
   
   // NEW:
   token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
       "id": userId,
       "exp": jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
   })
   ```

4. **Update token parsing (users/middlewares.go):**
   ```go
   // OLD:
   token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
       return []byte(common.NBSecretPassword), nil
   })
   
   // NEW:
   token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
       if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
           return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
       }
       return []byte(common.NBSecretPassword), nil
   }, jwt.WithValidMethods([]string{"HS256"}))
   ```

**Option 2: Minimum Upgrade (Not Recommended)**
```bash
go get github.com/dgrijalva/jwt-go@v4.0.0-preview1
```
*Note: This package is deprecated; Option 1 is strongly preferred*

#### Testing Checklist
- [ ] User registration returns valid JWT
- [ ] User login authenticates correctly
- [ ] Protected routes require valid token
- [ ] Invalid tokens are rejected
- [ ] Expired tokens are rejected
- [ ] Token manipulation attempts fail
- [ ] Integration tests pass

#### Estimated Time: 3-4 hours
#### Breaking Changes: YES (API changes in jwt library)

---

### 2. Heap-based Buffer Overflow in SQLite (Backend)

**Package:** `github.com/mattn/go-sqlite3@1.14.15`  
**Severity:** HIGH (CVSS: 7.0+)  
**Snyk ID:** SNYK-GOLANG-GITHUBCOMMATTNGOSQLITE3-6139875  
**Introduced By:** `github.com/jinzhu/gorm/dialects/sqlite@1.9.16`

#### Issue Description
Buffer overflow vulnerability in SQLite driver that could lead to code execution or DoS.

#### Remediation Steps

1. **Update go-sqlite3:**
   ```bash
   cd golang-gin-realworld-example-app
   go get -u github.com/mattn/go-sqlite3@v1.14.18
   go mod tidy
   ```

2. **Verify version in go.mod:**
   ```go
   // go.mod should show:
   github.com/mattn/go-sqlite3 v1.14.18 // indirect
   ```

3. **Test database operations:**
   - Create user
   - Create article
   - Add comment
   - Perform joins
   - Test transactions

#### Testing Checklist
- [ ] Database connection succeeds
- [ ] CRUD operations work
- [ ] Migrations run successfully
- [ ] Integration tests pass
- [ ] No CGO compilation errors

#### Estimated Time: 1 hour
#### Breaking Changes: NO (patch version)

---

## P1 - HIGH PRIORITY ISSUES

### 3. Regular Expression Denial of Service in marked (Frontend)

**Package:** `marked@0.3.19`  
**Severity:** MEDIUM (x5 vulnerabilities)  
**Snyk IDs:** 
- SNYK-JS-MARKED-2342073
- SNYK-JS-MARKED-2342082
- SNYK-JS-MARKED-584281
- SNYK-JS-MARKED-174116
- SNYK-JS-MARKED-451540

#### Issue Description
Five ReDoS vulnerabilities in markdown parsing that can cause CPU exhaustion and application freeze.

#### Remediation Steps

1. **Upgrade marked package:**
   ```bash
   cd react-redux-realworld-example-app
   npm install marked@4.0.10
   npm audit fix
   ```

2. **Check package.json:**
   ```json
   {
     "dependencies": {
       "marked": "^4.0.10"
     }
   }
   ```

3. **Review marked usage in code:**
   - Search for `import marked` or `require('marked')`
   - Check for custom configuration
   - Verify rendering logic

4. **Add XSS protection (RECOMMENDED):**
   ```bash
   npm install dompurify
   ```
   
   ```javascript
   import DOMPurify from 'dompurify';
   import marked from 'marked';
   
   // Sanitize before rendering
   const safeHTML = DOMPurify.sanitize(marked(userContent));
   ```

#### Testing Checklist
- [ ] Article markdown renders correctly
- [ ] Comment markdown displays properly
- [ ] Code blocks format correctly
- [ ] Links work as expected
- [ ] Images display
- [ ] Lists (ordered/unordered) render
- [ ] Headers/bold/italic work
- [ ] No XSS vulnerabilities introduced

#### Estimated Time: 1-2 hours
#### Breaking Changes: POSSIBLE (major version jump 0.x → 4.x)

---

## Dependency Update Strategy

### Backend (Go) Updates

#### Immediate Updates
```bash
# JWT library migration
go get -u github.com/golang-jwt/jwt/v5

# SQLite driver update
go get -u github.com/mattn/go-sqlite3@v1.14.18

# Clean up
go mod tidy
```

#### Future Considerations
- **GORM v1 → v2 Migration** (Breaking changes, plan separately)
- **Gin Framework** - Check for latest stable
- **Other dependencies** - Run `go list -u -m all`

### Frontend (React) Updates

#### Immediate Updates
```bash
# Fix marked vulnerability
npm install marked@4.0.10

# Add XSS protection
npm install dompurify

# Audit and auto-fix
npm audit fix
```

#### Future Considerations
- **React 16 → 18** (Major upgrade, requires testing)
- **React Router 4 → 6** (Breaking changes)
- **Redux 5 → 8** (API changes)
- **React-Scripts** - Consider ejecting or upgrading

---

## Testing Plan After Updates

### Backend Testing

1. **Unit Tests:**
   ```bash
   cd golang-gin-realworld-example-app
   $env:CGO_ENABLED="1"
   go test ./... -v
   ```

2. **Integration Tests:**
   ```bash
   go test -v integration_test.go
   ```

3. **Manual Testing:**
   - Register new user
   - Login with credentials
   - Create article
   - Add comment
   - Favorite/unfavorite

### Frontend Testing

1. **Run Test Suite:**
   ```bash
   cd react-redux-realworld-example-app
   npm test -- --watchAll=false
   ```

2. **Build Test:**
   ```bash
   npm run build
   ```

3. **Manual Testing:**
   - View articles with markdown
   - Create article with complex markdown
   - Add comments with formatting
   - Test special characters
   - Test XSS attempts

---

## Risk Assessment

### Before Remediation

| Component | Vulnerabilities | Risk Level |
|-----------|----------------|------------|
| Backend | 2 High | **CRITICAL** |
| Frontend | 5 Medium | **MEDIUM** |
| Overall | 7 Total | **HIGH** |

### After Remediation

| Component | Vulnerabilities | Risk Level |
|-----------|----------------|------------|
| Backend | 0 High | **LOW** |
| Frontend | 0 Medium | **LOW** |
| Overall | 0 Total | **MINIMAL** |

---

## Potential Breaking Changes

### Backend

**JWT Library Migration (golang-jwt/jwt v5)**
- ✅ Token generation API changed
- ✅ Claims structure updated
- ✅ Parsing options different
- ⚠️ Requires code updates in 2-3 files

**SQLite Update**
- ✅ No breaking changes expected
- ✅ Binary compatible

### Frontend

**marked v0.x → v4.x**
- ⚠️ Configuration options changed
- ⚠️ Some methods deprecated
- ⚠️ Security defaults stricter
- ⚠️ May affect custom renderers

---

## Implementation Timeline

### Day 1 (Immediate - 4 hours)
- [ ] 09:00-10:00: Backup current code
- [ ] 10:00-12:00: Fix JWT vulnerability (Backend)
- [ ] 12:00-13:00: Fix SQLite vulnerability (Backend)
- [ ] 13:00-14:00: Run backend tests

### Day 2 (Next Day - 2 hours)
- [ ] 09:00-10:00: Fix marked vulnerabilities (Frontend)
- [ ] 10:00-11:00: Add DOMPurify XSS protection
- [ ] 11:00-12:00: Run frontend tests

### Day 3 (Verification)
- [ ] Re-run Snyk scans
- [ ] Document fixes applied
- [ ] Update dependencies documentation

---

## Rollback Plan

### If Issues Arise

1. **Git revert to previous commit:**
   ```bash
   git log --oneline
   git revert <commit-hash>
   ```

2. **Restore dependencies:**
   ```bash
   # Backend
   git checkout go.mod go.sum
   go mod download
   
   # Frontend
   git checkout package.json package-lock.json
   npm install
   ```

3. **Deploy previous version** if in production

---

## Post-Remediation Actions

### Verification

1. **Re-run Snyk scans:**
   ```bash
   # Backend
   cd golang-gin-realworld-example-app
   npx snyk test
   
   # Frontend
   cd react-redux-realworld-example-app
   npx snyk test
   ```

2. **Document results in:** `snyk-fixes-applied.md`

3. **Take screenshots:**
   - Snyk dashboard showing 0 vulnerabilities
   - Test results passing
   - Application running

### Continuous Monitoring

1. **Add to CI/CD pipeline:**
   ```yaml
   # Example GitHub Actions
   - name: Security scan
     run: npx snyk test
   ```

2. **Schedule weekly scans:**
   - Set up Snyk monitoring
   - Enable email alerts
   - Review dashboard regularly

3. **Update dependencies monthly:**
   - Check for outdated packages
   - Review changelogs
   - Test updates in staging

---

## Success Criteria

- ✅ All HIGH severity vulnerabilities fixed
- ✅ All MEDIUM severity vulnerabilities fixed  
- ✅ All tests passing
- ✅ Application functional
- ✅ No new vulnerabilities introduced
- ✅ Snyk scan shows 0 critical/high issues
- ✅ Documentation complete

---

## Contact & Support

**If Issues During Implementation:**
- Review package documentation
- Check GitHub issues/discussions
- Consult team lead before production deployment

**Resources:**
- [golang-jwt/jwt Documentation](https://github.com/golang-jwt/jwt)
- [marked v4 Migration Guide](https://marked.js.org/using_pro#migration)
- [DOMPurify Usage](https://github.com/cure53/DOMPurify)

---

**Next Document:** `snyk-fixes-applied.md` (created after implementing fixes)
