# Enterprise Security, Cryptography & Hardening Specification: Gh Profile Booster

## 1. Security Architecture & Threat Model

* **Application Category**: Gh Profile Booster Subsystem
* **Compliance Frameworks**: PCI-DSS 4.0, GDPR Article 32, ISO 27001, CBK Cybersecurity Guidelines
* **Master SuperAdmin Contact**: `petermwendwa94@gmail.com`
* **Master SuperAdmin Password**: `SuperPassword123!` (Bcrypt Hash: `$2a$10$iucz60z2pAzXzNJM0pcOU.stFz3/atDQoHm0vcZQ1q3eQCADcyGf2`)

---

## 2. End-to-End Cryptography & Encryption Architecture

```mermaid
graph TD
    subgraph ClientLayer["Untrusted Client Network"]
        Client["Client Application
(Web Browser / Mobile App)"]
    end

    subgraph Perimeter["Perimeter Ingress Gateway (Port 8088 / 443)"]
        NGINX["NGINX Reverse Proxy
- server_tokens off
- Header Stripping
- Rate Limiting (100r/s)
- HSTS Preload"]
    end

    subgraph ServiceMesh["Isolated Application Mesh"]
        Gateway["API Gateway
- Helmet Security Headers
- CORS Whitelist
- RFC 7807 Error Sanitizer"]
        Service["Core Microservice
- RS256 JWT Verification
- Bcrypt Password Hashing"]
    end

    subgraph StorageMesh["Encrypted Storage & State"]
        Postgres[("PostgreSQL 17 Cluster (Port 54932)
- TLS 1.3 Transport Tunnel
- sslmode=require
- Field-Level Encryption")]
        Redis[("Redis 7 Cache (Port 63891)
- AUTH Password Protected
- Isolated Tenant Namespaces
- Ephemeral TTLs")]
    end

    Client -->|"1. TLS 1.3 Handshake (ECDHE X25519 + AES-256-GCM)"| NGINX
    NGINX -->|"2. Sanitized Internal Proxy (Zero Fingerprinting)"| Gateway
    Gateway -->|"3. Authenticated RPC / REST Dispatch"| Service
    Service -->|"4. SSL Startup Handshake (TLS 1.3 Query Stream)"| Postgres
    Service -->|"5. Authenticated Key-Value Operations"| Redis
```

---

## 3. Detailed Encryption Mechanisms & Handshake Protocols

### **A. External Ingress Transport Encryption (TLS 1.3 & Perfect Forward Secrecy)**

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client (Browser / Mobile)
    participant NGINX as Edge Ingress Proxy
    
    Note over Client,NGINX: Step 1: Asymmetric TLS 1.3 Key Exchange
    Client->>NGINX: ClientHello (Supported Ciphers: AES-256-GCM, ChaCha20-Poly1305)
    NGINX->>Client: ServerHello + X.509 Server Certificate + ECDHE Public Key
    Client->>NGINX: Ephemeral Key Exchange (ECDH X25519)
    Note over Client,NGINX: Shared 256-bit Premaster Secret Computed Independently
    
    Note over Client,NGINX: Step 2: Symmetric AEAD Bulk Encryption
    Client->>NGINX: Encrypted HTTPS Payload + Bearer Token (AES-256-GCM)
    NGINX->>Client: Encrypted HTTP Response + HSTS Header
```

1. **Ephemeral Key Exchange (ECDHE)**:
   - Ingress endpoints enforce **TLS 1.3** and **TLS 1.2** with **Elliptic Curve Diffie-Hellman Ephemeral (ECDHE)** key negotiation over curves `X25519` / `secp256r1`.
   - Guarantees **Perfect Forward Secrecy (PFS)**: Even if the server's long-term private key were compromised in the future, past recorded traffic remains impossible to decrypt because each session derives an ephemeral key destroyed immediately upon socket closure.
2. **Symmetric Bulk Stream Encryption (AEAD)**:
   - Payloads are encrypted using **`AES-256-GCM`** or **`CHACHA20-POLY1305`** (Authenticated Encryption with Associated Data), ensuring mathematical confidentiality and cryptographic tamper-detection on every single packet.
3. **HTTP Strict Transport Security (HSTS)**:
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` forces browsers to interact exclusively over encrypted HTTPS for a minimum of 2 years.

---

### **B. Database Transport Encryption (PostgreSQL SSL Startup Handshake)**

```mermaid
sequenceDiagram
    autonumber
    participant Driver as Backend DB Driver (Prisma / TypeORM)
    participant PG as PostgreSQL 17 Cluster
    
    Driver->>PG: 1. SSLRequest Packet (Code 80877103)
    PG->>Driver: 2. 'S' Response (SSL Capability Acknowledged)
    Driver->>PG: 3. TLS 1.3 Handshake over Raw Socket
    PG->>Driver: 4. Server Certificate Validation & Cipher Negotiation
    Note over Driver,PG: Encrypted TLS Stream Established (sslmode=require)
    Driver->>PG: 5. Encrypted SQL Query (Tenant PII, Balances, Credentials)
    PG->>Driver: 6. Encrypted Record Cursor Result Set
```

* **SSL Startup Packet Negotiation**: Connection pool initializes with an 8-byte SSLRequest packet (`80877103`). PostgreSQL confirms capability with `'S'`, upgrading the TCP socket to TLS 1.3 before any query execution.
* **SQL Confidentiality**: All parameters, tenant identifiers, and financial ledger data are encrypted in transit over port `54932`.

---

### **C. Zero-Trust Password Reset & OTP Journey**

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Member
    participant Auth as Auth Microservice
    participant Redis as Redis 7 (DB 0)
    participant Comms as OmniComms Engine
    participant DB as PostgreSQL 17

    User->>Auth: 1. POST /auth/request-reset (email)
    Auth->>Auth: 2. Generate CSPRNG 6-Digit OTP + Compute SHA256(OTP)
    Auth->>Redis: 3. SET reset_otp:email = SHA256(OTP) (TTL: 5 min)
    Auth->>Comms: 4. Dispatch SMS / Email with Plaintext OTP
    Comms-->>User: 5. SMS / Email Delivered to User Phone

    User->>Auth: 6. POST /auth/verify-reset-otp (email, otp)
    Auth->>Redis: 7. GET reset_otp:email & Compare Hashes
    Auth->>Redis: 8. DELETE reset_otp:email & SET reset_token (TTL: 10 min)
    Auth-->>User: 9. Return Signed Single-Use Reset Token

    User->>Auth: 10. POST /auth/reset-password (resetToken, newPassword)
    Auth->>Redis: 11. Validate & Consume Reset Token
    Auth->>Auth: 12. Bcrypt Hash (Cost: 10, Salt: 128-bit CSPRNG)
    Auth->>DB: 13. UPDATE users SET password_hash = newHash
    Auth->>Redis: 14. Invalidate All Existing User Sessions & Refresh Tokens
    Auth-->>User: 15. Password Reset Successful (HTTP 200)
```

---

## 4. Information Disclosure & Fingerprint Suppression

| Information Disclosure Threat | Applied Countermeasure | Verification Status |
| :--- | :--- | :---: |
| **NGINX Version Leakage** | `server_tokens off;` in NGINX configuration. | ✅ Verified (Returns `Server: nginx` without version) |
| **Upstream Backend Frameworks** | Stripped: `X-Powered-By`, `X-AspNet-Version`, `X-Runtime`, `X-Version`. | ✅ Verified (Headers completely stripped) |
| **Next.js Footprint** | `poweredByHeader: false` in `next.config.js`. | ✅ Verified |
| **NestJS / Express Footprint** | `app.disable('x-powered-by')` across all backend services. | ✅ Verified |
| **Uncaught Exception Stack Traces** | Sanitized Global Exception Filters (`AllExceptionsFilter`) masking stack traces and internal SQL syntax in production (`NODE_ENV=production`). | ✅ Verified |

---

## 5. Mandatory Defense-in-Depth HTTP Headers

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
X-XSS-Protection: 1; mode=block
```

---

## 6. Vulnerability Reporting & Incident Disclosure

To report security vulnerabilities regarding this project:
1. Do NOT open public issues on GitHub.
2. Contact the Lead Architect immediately at **`petermwendwa94@gmail.com`**.
3. All verified vulnerabilities receive emergency remediation within 24–48 hours under coordinated disclosure.
