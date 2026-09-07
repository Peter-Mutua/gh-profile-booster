# Master Enterprise Credentials & Access Directory (Web & Mobile)

Below is the complete copiable directory containing all system URLs, web portals, mobile endpoints, seeded user roles, usernames/emails, phone numbers, and passwords across all platforms.

---

## 1. Quick Copy: SuperAdmin Across All Systems

```text
Universal SuperAdmin: petermwendwa94@gmail.com
Default Passwords:    Admin@2026!  (Digital Sacco & Chama, Bookora)
                      password123  (POS System, School ERP SIMS)
                      Admin@123    (Multi-Tenant HRMS, CarsClub KE, Matatu Sacco, ClipNova)
                      Admin123!    (Audiobookify)
                      Admin@12345  (Seat Reservation)

Master Access Level:  UNRESTRICTED PLATFORM SUPER_ADMIN (All APIs, Global Configurations, Tenant Creation & User Provisioning)
Password Reset:       Fully integrated self-service password reset journey with OTP & Token verification via OmniComms.
```

---

## 2. OmniComms Universal Communications Suite (Platform Hub)

* **Admin Web Dashboard**: [http://localhost:7891](http://localhost:7891)
* **REST API Gateway**: [http://localhost:7890/api/v1](http://localhost:7890/api/v1)
* **Interactive Swagger Documentation**: [http://localhost:7890/docs](http://localhost:7890/docs)
* **Master SuperAdmin Key**: `omni_master_sec_2026_super_admin_access_token`

### Full Suite Modules & Controls:
1. **📊 System Command Center**: Real-time message volume, delivery success rate gauge, provider health telemetry.
2. **🏢 Applications & API Keys**: Scoped multi-tenant project registration, cryptographic API key generation, rate limits.
3. **📜 Message & Delivery Receipts Explorer**: Paginated immutable ledger, delivery receipts, full payload inspector.
4. **🎨 Template Studio & Engine**: Visual Handlebars editor, Desktop/Mobile responsive live preview iframe, custom variables.
5. **🔑 Central 2FA & OTP Sessions Vault**: Live token session monitoring, real-time TTL countdown bars, brute-force defense, manual session revocation.
6. **⚡ Queue & DLQ Mission Control**: In-flight ingestion counters, active worker concurrency, bulk DLQ retry & purge.
7. **📻 Provider Gateway Routing**: Multi-provider failover routing (Gmail SMTP, SendGrid, Africa's Talking, Twilio).
8. **🧪 Interactive Developer Sandbox**: Live API test simulator with instant cURL, TypeScript & Python code generation.
9. **🛡️ Security & Compliance Audit Log**: Immutable record of key rotations, provider credential edits, and admin events.

---

## 3. Complete Application Suite Breakdown (Web & Mobile)

### A. Digital Sacco & Chama Management App (Akiba360)
* **SuperAdmin Web Portal**: [http://localhost:3001](http://localhost:3001)
* **Sacco Staff & Admin Web Portal**: [http://localhost:3000](http://localhost:3000)
* **Mobile App (Expo / React Native)**: `cd apps/mobile && npm start` (or `http://localhost:8081`)
* **API Gateway**: [http://localhost:7847](http://localhost:7847)
* **Edge Ingress Proxy**: [http://localhost:9443](http://localhost:9443)

#### Web Administrators & SuperAdmin:
```text
Portal                      Role                 Email / Username             Phone Number   Password
---------------------------------------------------------------------------------------------------------
SuperAdmin Web (:3001)      SUPER_ADMIN          petermwendwa94@gmail.com     +254711000000  SuperPassword123!
Demo Sacco Admin (:3000)    TENANT_ADMIN         admin@demosacco.co.ke        +254700000099  Admin@2026!
Demo Sacco Admin (:3000)    TENANT_ADMIN         serahnyambura70@gmail.com    +254700000000  Admin@2026!
Nairobi Traders (:3000)     TENANT_ADMIN         admin@nairobitraders.com     +254700000001  Admin@2026!
Tech Ventures (:3000)       TENANT_ADMIN         admin@techventures.com       +254700000002  Admin@2026!
Mombasa Port (:3000)        TENANT_ADMIN         admin@mombasaport.com        +254700000003  Admin@2026!
```

#### Mobile App Members (Phone & Email Logins):
```text
Sacco Tenant         Full Name            Phone Login (Local) Email Login                           Password     Savings        Active Loan
-------------------------------------------------------------------------------------------------------------------------------------------------
Demo Sacco Ltd       Alexis Nader         0787423896          Alexis.Nader@demo-sacco.com           Admin@2026!  KSh 33,577.02  None
Demo Sacco Ltd       Armand Kilback       0758327062          Armand_Kilback-Conroy@demo-sacco.com  Admin@2026!  KSh 4,103.39   KSh 19,795.28
Demo Sacco Ltd       Brycen Parker        0748552556          Brycen.Parker@demo-sacco.com          Admin@2026!  KSh 30,231.27  KSh 22,829.28
Demo Sacco Ltd       Cary Wintheiser      0791191680          Cary.Wintheiser42@demo-sacco.com      Admin@2026!  KSh 4,778.41   None
Demo Sacco Ltd       Davion Purdy         0710160391          Davion_Purdy10@demo-sacco.com         Admin@2026!  KSh 31,218.13  KSh 42,170.20
Demo Sacco Ltd       Eulah Mitchell       0728501805          Eulah.Mitchell-Wiza@demo-sacco.com    Admin@2026!  KSh 49,275.60  None
Demo Sacco Ltd       Gretchen Hickle      0760337920          Gretchen_Hickle@demo-sacco.com        Admin@2026!  KSh 41,012.22  None
Demo Sacco Ltd       Jimmie Johnson       0708105686          Jimmie_Johnson2@demo-sacco.com        Admin@2026!  KSh 43,048.27  None
Mombasa Port Sacco   Bernard Hackett      0754501235          Bernard_Hackett@mombasa-port.com      Admin@2026!  KSh 20,634.57  KSh 24,371.16
Mombasa Port Sacco   Hilda Hammes         0717823494          Hilda.Hammes@mombasa-port.com         Admin@2026!  KSh 47,043.54  KSh 49,198.46
Nairobi Traders      Brandyn Tremblay     0714988980          Brandyn.Tremblay53@nairobi-traders.com Admin@2026! KSh 34,910.12  KSh 18,250.00
Tech Ventures Chama  Alisha Waelchi       0792182741          Alisha_Waelchi@tech-ventures.com      Admin@2026!  KSh 42,912.80  None
```
*(See complete directory of all 175 seeded mobile members in `docs/ALL_MOBILE_TEST_USERS.md`)*

---

### B. POS System (Point of Sale & Retail Management)
* **Web POS UI**: [http://localhost:8080](http://localhost:8080)
* **Backend API**: [http://localhost:5001/api/v1](http://localhost:5001/api/v1)
* **Health Check**: [http://localhost:5001/api/v1/health](http://localhost:5001/api/v1/health)

```text
Store Tenant         Role                 Email / Username             Password
-----------------------------------------------------------------------------------------
Platform Global      Platform SuperAdmin  petermwendwa94@gmail.com     SuperPassword123!
Demo Shop Outlet     Demo Shop Owner      owner@demo-shop.com          password123
Demo Shop Outlet     Demo Shop Admin      admin@demo-shop.com          password123
Demo Shop Outlet     Demo Shop Cashier    cashier@demo-shop.com        password123
Demo Shop Outlet     Demo Shop Manager    manager@demo-shop.com        password123
Savanna Mart Outlet  Savanna Mart Owner   owner@savanna-mart.com       password123
Savanna Mart Outlet  Savanna Mart Admin   admin@savanna-mart.com       password123
Savanna Mart Outlet  Savanna Mart Cashier cashier@savanna-mart.com     password123
```

---

### C. School ERP - SIMS (Sault Ste. Marie Academy)
* **Frontend Web Portal**: [http://localhost:3100](http://localhost:3100)
* **SIMS API Gateway**: [http://localhost:3025](http://localhost:3025)

```text
School Tenant        Role                 Email / Username             Password
-----------------------------------------------------------------------------------------
System Global        System SuperAdmin    petermwendwa94@gmail.com     SuperPassword123!
Sault Academy        School Principal     admin@saultacademy.com       password123
Sault Academy        Bursar / Accountant  bursar@saultacademy.com      password123
Sault Academy        Lead Teacher         teacher@saultacademy.com     password123
Sault Academy        Science Teacher      teacher2@saultacademy.com    password123
Sault Academy        Parent Account       parent@saultacademy.com      password123
Sault Academy        Student Account      student1@saultacademy.com    password123
```

---

### D. Bookora Real Estate & Property Platform
* **SuperAdmin Dashboard**: [http://localhost:3000](http://localhost:3000) (Bookora Web)
* **API Service**: [http://localhost:4000](http://localhost:4000)

```text
Role                 Email / Username                          Password
-----------------------------------------------------------------------------------------
Platform SuperAdmin  petermwendwa94@gmail.com                  SuperPassword123!
Agency Landlord      landlord@bookora.com                      Admin@2026!
Property Tenant      tenant@bookora.com                        Admin@2026!
```

---

### E. Multi-Tenant HRMS & Payroll
* **HRMS Web Portal**: [http://localhost:5173](http://localhost:5173)
* **HRMS Backend API**: [http://localhost:8000](http://localhost:8000)

```text
Company Tenant       Role                 Email / Username             Password
-----------------------------------------------------------------------------------------
Platform Global      Platform SuperAdmin  petermwendwa94@gmail.com     SuperPassword123!
Acme Corp            HR Manager           hr@acmecorp.com              Admin@123
Acme Corp            Payroll Admin        payroll@acmecorp.com         Admin@123
Acme Corp            Employee             employee@acmecorp.com        Admin@123
```

---

### F. CarsClub KE (Automotive Marketplace & Dealership Hub)
* **Marketplace Web Portal**: [http://localhost:3000](http://localhost:3000)
* **Dealership Backend API**: [http://localhost:5000](http://localhost:5000)

```text
Role                 Email / Username                          Password
-----------------------------------------------------------------------------------------
Platform SuperAdmin  petermwendwa94@gmail.com                  SuperPassword123!
Verified Dealer      dealer@carsclub.co.ke                     Dealer@123
Private Seller       seller@carsclub.co.ke                     Seller@123
```

---

### G. Matatu Sacco Management App
* **Stage Dispatcher Web Dashboard**: [http://localhost:3002](http://localhost:3002)
* **Fleet Backend API**: [http://localhost:5002](http://localhost:5002)

```text
Sacco Organization   Role                 Email / Username                   Password
-----------------------------------------------------------------------------------------
Platform Global      Platform SuperAdmin  petermwendwa94@gmail.com           SuperPassword123!
Nairobi Express      Sacco Admin          james.mwangi@nairobiexpress.co.ke  Nairobi@123
Mombasa Smart Sacco  Sacco Admin          fatuma.hassan@mombasasmart.co.ke   Mombasa@123
```

---

### H. Audiobookify (AI Audiobooks & Neural Narration)
* **Web Application UI**: [http://localhost:4005](http://localhost:4005)
* **FastAPI AI Sidecar**: [http://localhost:8200](http://localhost:8200)
* **Piper Neural TTS Engine**: [http://localhost:10200](http://localhost:10200)

```text
Subscription Plan    Role                 Email / Username             Password
-----------------------------------------------------------------------------------------
Platform Global      Platform SuperAdmin  petermwendwa94@gmail.com     SuperPassword123!
Demo Reader Club     Demo Listener        demo@audiobookify.com        Test123!
Premium Reader Club  Premium Listener     premium@audiobookify.com     Test123!
```

---

### I. ClipNova (Automated AI Video Creation & Social Media Publishing)
* **n8n Workflow UI**: [http://localhost:5678](http://localhost:5678)
* **Postiz Social Hub**: [http://localhost:5500](http://localhost:5500)
* **Edge TTS Engine**: [http://localhost:5050](http://localhost:5050)
* **Temporal Engine**: `localhost:7233`

```text
Role                 Email / Username                          Password
-----------------------------------------------------------------------------------------
Platform SuperAdmin  petermwendwa94@gmail.com                  SuperPassword123!
```

---

### J. Seat Reservation System
* **Booking Backend API**: [http://localhost:5003](http://localhost:5003)

```text
Role                 Email / Username                          Password
-----------------------------------------------------------------------------------------
Platform SuperAdmin  petermwendwa94@gmail.com                  SuperPassword123!45
Event Organizer      organizer@seatbooking.com                 Organizer@12345
```

---

### K. Payment Gateway & Distributed Tracing
* **Payment API**: [http://localhost:4002](http://localhost:4002)
* **Jaeger APM Tracing UI**: [http://localhost:16686](http://localhost:16686)

---

## 4. Shared Enterprise Infrastructure Credentials

```text
Infrastructure       Host Port  Username / User       Password / Secret
-----------------------------------------------------------------------------------------
PostgreSQL 17        54932      teratech_admin        TeratechSecureP@ss2026!
MongoDB 7.0          27017      teratech_admin        TeratechMongoSecure2026!
Redis 7 Cluster      63891      default               TeratechRedisSecure2026!
RabbitMQ AMQP/UI     5672/15672 teratech_admin        TeratechRabbitSecure2026!
MinIO S3 API/UI      9000/9001  teratech_s3_admin     TeratechMinioVault2026!
Grafana Dashboards   3005       admin                 admin123
Kafka Broker         39092      PLAINTEXT             N/A
Ollama AI Engine     11434      N/A                   N/A
```

---

## 5. SuperAdmin Password Reset Journey Specification

The system implements a zero-trust, 3-step password reset workflow powered by OmniComms:

1. **Step 1: Reset Initiation**
   * **Endpoint**: `POST /api/v1/auth/request-reset` (or `POST /api/v1/auth/forgot-password`)
   * **Payload**: `{"identifier": "petermwendwa94@gmail.com"}`
   * **Action**: Generates a cryptographically random, rate-limited OTP and delivers it via OmniComms email dispatch (`AUTH_OTP` / `PASSWORD_RESET` template).

2. **Step 2: OTP Verification**
   * **Endpoint**: `POST /api/v1/auth/verify-reset-otp`
   * **Payload**: `{"identifier": "petermwendwa94@gmail.com", "code": "123456"}`
   * **Action**: Validates token within 10-minute TTL, increments attempt counter (max 3 attempts), invalidates code, and returns a short-lived `resetToken` (15-minute validity).

3. **Step 3: Secure Password Reset & Global Session Invalidation**
   * **Endpoint**: `POST /api/v1/auth/reset-password`
   * **Payload**: `{"token": "<resetToken>", "newPassword": "<SecurePassword>"}`
   * **Action**: Checks password history (prevents reuse of last 5 passwords), hashes password with bcrypt (12 rounds), resets lockout counters, revokes all active refresh tokens/sessions across all devices, and logs an immutable audit event in the Security Ledger.
