# Enterprise Security & Hardening Policy: gh-profile-booster Platform

## 1. Executive Security Overview
* **System Classification**: Enterprise Microservice Subsystem
* **Primary Compliance Frameworks**: Enterprise Security Standards & ISO 27001
* **Security Posture**: Zero-Trust Architecture, Strict Information Disclosure Prevention & End-to-End Encryption in Transit.
* **Unified Master SuperAdmin**: `petermwendwa94@gmail.com`
* **Default SuperAdmin Credentials Policy**: Synchronized via encrypted bcrypt hash (`$2a$10$...`) across database seeds and runtime auth stores.

---

## 2. Threat Model & Mitigation Matrix

| Potential Threat Vector | Impact Severity | Defense-in-Depth Mitigation Strategy |
| :--- | :---: | :--- |
| **Server & Version Fingerprinting** | Low / Reconnaissance | `server_tokens off;` in NGINX, `X-Powered-By` headers stripped across NestJS, Express, FastAPI, and Next.js (`poweredByHeader: false`). |
| **Information Disclosure via Errors** | High | Sanitized Global Exception Filters (`AllExceptionsFilter`) masking stack traces, SQL syntax, and internal file paths in production. |
| **Eavesdropping / MITM in Transit** | Critical | Enforced TLS 1.3 / TLS 1.2 with HSTS (`max-age=63072000; includeSubDomains; preload`) and PostgreSQL `sslmode=require`. |
| **Cross-Site Scripting (XSS)** | High | `Content-Security-Policy`, `X-XSS-Protection: 1; mode=block`, and automatic framework HTML sanitization. |
| **Clickjacking / UI Redressing** | Medium | `X-Frame-Options: DENY` on all responses. |
| **MIME-Type Sniffing Attacks** | Medium | `X-Content-Type-Options: nosniff` injected at both reverse proxy and application level. |
| **Brute Force & DoS / Slowloris** | High | Redis sliding-window rate limiting (`10 req/s` on `/auth/*`, `100 req/s` global) + 15s client body/header timeouts. |
| **Multi-Tenant Data Cross-Talk** | Critical | Strict logical PostgreSQL database isolation (gh_profile_booster_db (PostgreSQL 17 Port 54932)) + isolated Redis keyspaces (Redis 7 (Port 63891)). |
| **Domain-Specific Threat Vectors**: *Unauthorized API access, token compromise, data tampering, information disclosure* | Critical | Scoped role-based access control (RBAC), multi-factor OTP verification via OmniComms, and audited transactional logging. |

---

## 3. Transit Encryption & Cipher Suite Standards

### **A. External Ingress (Public -> Gateway)**
All client traffic terminating at the edge reverse proxy enforces modern TLS ciphers:
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
```

### **B. Internal Service-to-Service & Backing Services**
* **Relational Database**: Connected via `gh_profile_booster_db (PostgreSQL 17 Port 54932)` using authenticated credentials and SSL connection flags.
* **In-Memory Cache**: Namespaced under `Redis 7 (Port 63891)` using authenticated Redis connections (`requirepass`).
* **Message Broker**: AMQP / Kafka topics segregated per tenant application boundary.

---

## 4. Mandatory HTTP Security Headers

Every response emanating from this system includes the following immutable headers:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
X-XSS-Protection: 1; mode=block
```

---

## 5. Authentication, JWT & Session Management

1. **Token Asymmetry**: Access tokens are signed using `RS256` or secure HMAC secrets with standard expiry (15 minutes).
2. **Refresh Token Rotation**: Refresh tokens are single-use with cryptographic rotation stored in Redis blocklists.
3. **Password Hashing**: Passwords stored using bcrypt with minimum cost factor 10.
4. **Password Reset Journey**: Zero-trust 3-step password recovery flow (`/auth/request-reset` -> `/auth/verify-reset-otp` -> `/auth/reset-password`).

---

## 6. Vulnerability Reporting & Incident Response

If you discover a security vulnerability within this project:
1. **Do not disclose publicly** or create public issues on GitHub.
2. Email the Security & Operations Team immediately at: **`petermwendwa94@gmail.com`**.
3. Include detailed steps to reproduce, sample payloads, and affected component endpoints.
4. Security patches are prioritized and deployed within 24–48 hours under coordinated disclosure.
