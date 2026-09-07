# OmniComms Enterprise Communications Suite: Technical Architecture & Operational Guide

## 1. Overview
**OmniComms** is a high-throughput, multi-tenant unified communications engine designed for enterprise notification routing, transaction receipts, security alerts, and centralized 2FA OTP verification across web, mobile, and background services.

---

## 2. Platform Endpoints & Access

| Interface | URL | Access Level | Description |
| :--- | :--- | :--- | :--- |
| **Admin Web Dashboard** | [http://localhost:7891](http://localhost:7891) | SuperAdmin / Operations | 9-Module Mission Control & Template Studio |
| **REST API Gateway** | [http://localhost:7890/api/v1](http://localhost:7890/api/v1) | Application Clients | Multi-tenant message ingestion, OTP & templates |
| **Swagger Documentation** | [http://localhost:7890/docs](http://localhost:7890/docs) | Developer / Integration | Interactive OpenAPI explorer |
| **Master Admin Token** | `omni_master_sec_2026_super_admin_access_token` | SuperAdmin | Master authorization header (`x-api-key`) |

---

## 3. Core Modules Breakdown

### 1. 📊 System Command Center (`OverviewPage.tsx`)
* **Real-time Throughput**: Live counter of total messages processed across Email, SMS, and Push channels.
* **Delivery Rate Gauge**: Visual percentage gauge of successful vs failed dispatches.
* **Provider Health Telemetry**: Live ping status for SMTP servers, Africa's Talking, and Twilio.

### 2. 🏢 Multi-Tenant Applications & API Keys (`AppsPage.tsx`)
* **Project Registration**: Register individual projects (e.g. `Akiba360 Sacco`, `Bookora`, `POS System`, `School ERP SIMS`).
* **Cryptographic Keys**: Generates unique `omni_live_*` API keys and secrets per application.
* **Strict Tenant Isolation**: Prevents cross-app log inspection or tenant data leakage. Requests are strictly scoped to the calling `appId`.

### 3. 📜 Message & Delivery Receipts Explorer (`LogsPage.tsx`)
* **Paginated Dispatch Ledger**: Filter by channel, status (`SENT`, `DELIVERED`, `FAILED`, `QUEUED`), date range, or destination.
* **Transient Payload Pruning**: To protect sensitive PII and financial payload data, once a message is successfully delivered, full payload bodies are pruned (`fullPayload: null`), leaving immutable audit receipts.

### 4. 🎨 Template Studio & Visual Engine (`TemplatesPage.tsx`)
* **Visual Handlebars Editor**: Create and customize HTML email and SMS templates with live syntax checking.
* **Live Dual-Viewport Preview**: Responsive preview iframe with Desktop and Mobile toggle switches.
* **Mock Variable Injection**: Test templates against customizable JSON payloads (`{{firstName}}`, `{{otp}}`, `{{amount}}`, `{{currency}}`).
* **Prebuilt System Templates**: One-click seeding for standard templates:
  - `AUTH_LOGIN_OTP` (2FA Verification Code)
  - `WELCOME_MEMBER` (Member Onboarding with Portal Access Link)
  - `TRANSACTION_RECEIPT` (Instant Financial Notification with structured breakdown)
  - `PASSWORD_RESET` (Security Reset Request)

### 5. 🔑 Central 2FA & OTP Sessions Vault (`OtpVaultPage.tsx`)
* **Live Token Monitoring**: Displays all active, verified, and expired OTP sessions across every application.
* **TTL Countdown Bars**: Real-time progress bars showing remaining seconds before expiration.
* **Brute-Force Shield**: Visual tracking of verification attempts (e.g. `1/3`), with instantaneous lockouts and **one-click manual session revocation**.
* **Quick Dispatch Modal**: Instantly trigger test OTP dispatches across email or SMS.

### 6. ⚡ Queue & DLQ Mission Control (`QueuesPage.tsx`)
* **In-Flight Ingestion Telemetry**: Live indicators for Queued, Processing, In-Flight, and Delivered messages.
* **Worker Fleet Concurrency**: Displays concurrency slots, active threads, and channel targets for background workers (`worker-email-smtp-1`, `worker-sms-at-1`, `worker-otp-priority-1`).
* **Dead Letter Queue (DLQ) Explorer**: Detailed diagnostics for failed deliveries, with **Bulk Re-queue & Retry** and **DLQ Purge** controls.

### 7. 📻 Provider Gateway Routing (`ProvidersPage.tsx`)
* **SMTP Gateway**: Configure primary and secondary SMTP servers (Gmail, SendGrid, Amazon SES, Postmark).
* **SMS Gateway**: Configure Africa's Talking (Username + API Key + Shortcode) and Twilio (Account SID + Auth Token + Sender ID).
* **Automated Failover**: Automatic fallback to secondary provider on transient network failures.

### 8. 🧪 Interactive Developer Sandbox (`SandboxPage.tsx`)
* **Live API Simulator**: Send test emails, SMS, and OTP verifications directly from the dashboard.
* **Code Snippet Generator**: Generates copy-pasteable snippets in **cURL**, **TypeScript SDK**, and **Python SDK**.

### 9. 🛡️ Security & Compliance Audit Log (`AuditPage.tsx`)
* **Immutable Event Ledger**: Records all API key creations, revocations, provider credential changes, and administrative actions with timestamp, actor, and payload metadata.

---

## 4. Client SDK Usage

### TypeScript / Node.js
```typescript
import { OmniCommsClient } from './omni-comms.client';

const client = new OmniCommsClient({
    baseUrl: process.env.OMNI_COMMS_URL || 'http://localhost:7890/api/v1',
    apiKey: process.env.OMNI_COMMS_API_KEY || 'omni_live_your_app_key',
});

// Send Branded Transaction Receipt
await client.sendEmail({
    to: 'member@example.com',
    subject: 'Deposit Confirmation',
    templateCode: 'TRANSACTION_RECEIPT',
    variables: {
        firstName: 'John',
        amount: '5,000.00',
        currency: 'KSh',
        accountNumber: 'SAV-001248',
        reference: 'MPESA-TXN-94821',
        date: new Date().toLocaleDateString()
    }
});

// Request 2FA OTP Code
const otp = await client.sendOtp({
    identifier: 'member@example.com',
    channel: 'EMAIL',
    purpose: 'AUTH_LOGIN'
});

// Verify 2FA OTP Code
const isVerified = await client.verifyOtp({
    identifier: 'member@example.com',
    code: '948210',
    purpose: 'AUTH_LOGIN'
});
```

### Python
```python
from omni_comms_client import OmniCommsClient

client = OmniCommsClient(
    base_url="http://localhost:7890/api/v1",
    api_key="omni_live_your_app_key"
)

# Dispatch SMS Notification
client.send_sms(
    phone="+254711000000",
    message="Your loan application for KSh 50,000 has been approved."
)
```

---

## 5. SuperAdmin Password Reset Journey Integration

OmniComms powers the zero-trust 3-step password reset flow across the ecosystem:
1. **Initiate (`POST /api/v1/auth/request-reset`)**: Triggers an OTP dispatch with a 10-minute expiration window.
2. **Verify (`POST /api/v1/auth/verify-reset-otp`)**: Validates code against the Central 2FA Vault and generates a signed `resetToken`.
3. **Complete (`POST /api/v1/auth/reset-password`)**: Updates password hash, clears lockout counters, and terminates all active sessions globally.
