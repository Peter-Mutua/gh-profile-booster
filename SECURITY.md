# Enterprise Security, Cryptography & Hardening Specification: Gh Profile Booster

## 1. Security Architecture & Threat Model

* **Application Category**: Gh Profile Booster Subsystem
* **Compliance Standards**: PCI-DSS 4.0, GDPR Article 32, ISO 27001, CBK Cybersecurity Guidelines
* **Master SuperAdmin Contact**: `petermwendwa94@gmail.com`
* **Master SuperAdmin Password**: `SuperPassword123!` (Bcrypt Hash: `$2a$10$iucz60z2pAzXzNJM0pcOU.stFz3/atDQoHm0vcZQ1q3eQCADcyGf2`)

---

## 2. Technical Details: How Encryption is Implemented

### **A. External Ingress & Transport Encryption (TLS 1.3 / Perfect Forward Secrecy)**
1. **Handshake & Key Exchange**:
   - Ingress endpoints enforce **TLS 1.3** and **TLS 1.2** with **Elliptic Curve Diffie-Hellman Ephemeral (ECDHE)** key negotiation over curve `X25519` / `secp256r1`.
   - Client and server compute an ephemeral session key that is destroyed immediately upon connection termination, guaranteeing **Perfect Forward Secrecy (PFS)**.
2. **Symmetric Bulk Ciphering (AEAD)**:
   - Payload data is encrypted using `AES-256-GCM` or `CHACHA20-POLY1305` (Authenticated Encryption with Associated Data), ensuring both mathematical confidentiality and cryptographic tamper-detection on every single HTTP frame.
3. **HTTP Strict Transport Security (HSTS)**:
   - Every response includes `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` forcing modern browsers to use encrypted HTTPS exclusively for at least 2 years.

---

### **B. Database Transit Encryption (PostgreSQL SSL/TLS)**
1. **SSL Negotiation**:
   - Backend services connect to the shared PostgreSQL 17 cluster (Port `54932`) with `sslmode=require`.
   - Prior to issuing SQL transactions, the driver performs an SSL startup negotiation and establishes a TLS 1.3 encrypted tunnel over TCP socket.
2. **Query & Data Stream Confidentiality**:
   - All SQL statements, parameters, tenant IDs, customer PII, and financial records are encrypted across the container bridge and decrypted solely inside PostgreSQL memory.

---

### **C. Cache & Token Storage Security (Redis 7 TLS & Key Isolation)**
1. **Authentication & Logical Segregation**:
   - Connected to Redis 7 (Port `63891`) using password-authenticated commands.
   - Keys are logically partitioned and prefixed per subsystem to prevent cross-tenant data leakage.
2. **Cryptographic Token Lifecycles**:
   - Session tokens, refresh tokens, and rate-limiting sliding windows are stored with strict Time-To-Live (TTL) expiration.

---

### **D. Identity, Token & Password Cryptography**
1. **Password Key Derivation (Bcrypt Cost 10)**:
   - User passwords undergo adaptive key stretching via the Bcrypt algorithm ($2^10$ iterations) with a cryptographically randomized 128-bit salt per user.
2. **Asymmetric Token Signing (RS256 / 2048-bit RSA)**:
   - Authentication tokens are signed using private keys and validated using public keys across microservices.
3. **Zero-Trust 3-Step Password Recovery Journey**:
   - **Step 1**: `POST /auth/request-reset` ➔ Generates cryptographically secure 6-digit OTP, stored in Redis as SHA-256 hash (TTL 5 mins).
   - **Step 2**: `POST /auth/verify-reset-otp` ➔ Validates `hash(OTP) === stored_hash` and issues single-use `resetToken` (TTL 10 mins).
   - **Step 3**: `POST /auth/reset-password` ➔ Validates `resetToken`, applies new Bcrypt password hash, and revokes all prior refresh tokens.

---

## 3. Information Disclosure & Fingerprint Suppression

* **Server Version Suppression**: `server_tokens off;` enabled in NGINX.
* **Header Stripping**: Upstream proxy strips `X-Powered-By`, `X-AspNet-Version`, `X-Runtime`, `X-Version`, and `Server`.
* **Frontend Disguise**: Next.js configured with `poweredByHeader: false`.
* **Backend Disguise**: NestJS / Express configured with `app.disable('x-powered-by')`.
* **Sanitized Exception Handling**: Production error filters catch all unhandled exceptions and return sanitized RFC 7807 responses without leaking stack traces or internal SQL syntax.

---

## 4. Mandatory Security Headers

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
X-XSS-Protection: 1; mode=block
```

---

## 5. Security Vulnerability Reporting

To report security vulnerabilities or compliance issues regarding `gh-profile-booster`:
1. Do NOT open public issues on GitHub.
2. Contact the Lead Architect immediately at **`petermwendwa94@gmail.com`**.
3. All verified vulnerabilities receive emergency remediation within 24–48 hours.
