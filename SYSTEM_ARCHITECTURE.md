# Ghost Suite: Elite Turing-Complete Architecture
**Version:** 4.0.0 (Master Blueprint)  
**Status:** CLASSIFIED / ACTIVE  

This document serves as the complete technical blueprint for the Ghost Suite automation node. It details the end-to-end operation of the system, including proxy rotation, telemetry spoofing, stealth browsers, and deployment protocols.

---

## 1. Core Automation Engines (The Ghost Node)

### A. HTTP LightBoost Engine (Traffic Generator)
A high-speed, headless HTTP request engine designed to aggressively farm GitHub profile views. 
*   **Proxy Deflection Array:** Every 3 hours, the Node automatically connects to the ProxyScrape API, downloads thousands of raw proxies, and executes a ping-test against `api.github.com/zen`. Only elite, working IPs are retained.
*   **Rotation:** Every single LightBoost hit rotates to a new IP address from the verified array, making the traffic appear entirely organic and distributed globally.

### B. Deep-Web Spidering (Puppeteer)
While LightBoost provides volume, the Puppeteer engine provides algorithmic authority.
*   The headless Chromium browser navigates to the target repository and performs mathematical `window.scrollBy` operations to mimic human reading.
*   It physically scrapes the DOM for `.react-directory-truncate a` selectors, clicking deep into your codebase.
*   It engages a **15 to 40-second Read Timer** to simulate a developer studying the code, which drastically reduces repository bounce rates and boosts SEO.

### C. Turing-Complete WakaTime Simulator
The system emulates a human developer working locally on their machine, pushing telemetry to WakaTime to generate activity graphs.
*   **Circadian Rhythms:** Generates a random daily quota (e.g., 8h 12m). Once the quota is hit, the bot goes to "sleep". It also strictly enforces a Deep Sleep protocol between 2:00 AM and 8:00 AM local time to avoid robotic 24/7 signatures.
*   **Environment Spoofing:** Randomly selects active languages (Python, Go, Rust) and IDE footprints (VSCode, IntelliJ) and injects them into the official `wakatime-cli` User-Agent.

### D. The "Green Square" Engine (Git Committer)
An autonomous Git controller designed to keep your GitHub contribution graph active 365 days a year.
*   Clones an `activity-repo` and writes hex-code timestamps into dummy files (e.g., `// [OPS-TICK] SysCall Data: 18b7f82a9x`).
*   Stages, commits, and forcefully pushes these changes to GitHub using organic, pre-defined commit messages every 8 hours.

---

## 2. Offline Resilience (Phase 6)

### A. Persistent Disk Caching
If your proxy network fails or your Wi-Fi drops, WakaTime packets are inherently lost. 
*   The Ghost Node intercepts any `axios` network failures and instantly serializes the telemetry payload (with its exact UNIX timestamp) to a physical disk file: `offline_heartbeats.json`.
*   This protects all generated code-time from Docker container restarts and machine reboots.

### B. Secure Array Shredding
*   The moment an active internet connection is detected, the Node batches the offline packets into blocks of 50 (with a 1-second organic delay) and flushes them to WakaTime.
*   Upon successful transmission, it executes an `fs.unlinkSync()` system call to entirely shred the `offline_heartbeats.json` file off the hard drive.

---

## 3. Command & Control (C2) Dashboard

The local Ghost Node serves a real-time WebSocket dashboard running on **Next.js & Tailwind CSS** at `http://localhost:3030`.
*   **Telemetry HUD:** Live Chart.js line graphs dynamically plotting incoming GitHub views and WakaTime heartbeats.
*   **Session Allocation:** Live-updating progress bars showing exactly what percentage of the day was spent simulating specific languages or operating systems.
*   **System.Log_Matrix:** A streaming terminal outputting internal Node logs directly to the UI.
*   **Offline Tracking:** A red pulsing `[OFFLINE MODE: X QUEUED]` badge that only appears when the network drops, providing real-time visibility into the disk cache.

---

## 4. Notifications & Reporting

At exactly 11:59 PM every night, the Ghost Node compiles the day's total traffic and time allocation.
*   **Discord Webhooks:** Dispatches a highly formatted Rich Embed to a private Discord channel.
*   **Telegram Bots:** Dispatches an identical Markdown payload to your Telegram device.

---

## 5. Deployment Protocols

The suite is designed to be deployed strictly via containerization for maximum stealth and isolation.

### Step 1: Environment Configuration
Create an `.env` file in the root directory:
```env
WAKATIME_API_KEY=your_wakatime_key
TARGET_URL=https://github.com/YourUser
EXTRA_TARGETS=https://github.com/YourUser/Repo1,https://github.com/YourUser/Repo2
GITHUB_TOKEN=your_personal_access_token # Required for Green Square Engine
GITHUB_REPO=YourUser/TargetRepo         # Required for Green Square Engine

# Optional Notification Webhooks
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### Step 2: Docker Compose (Recommended)
This is the standard deployment method for local machines or VPS servers.
```bash
# Build and deploy the Ghost Node in detached mode
docker compose up -d --build --force-recreate

# View real-time physical logs (Optional, as they stream to the Dashboard)
docker logs -f booster-app
```

### Step 3: Kubernetes (Enterprise Cloud)
For high-availability clusters (GCP, AWS EKS).
```bash
# Apply the environment configmap
kubectl apply -f k8s/configmap.yaml

# Deploy the Ghost Node pods and LoadBalancer service
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```
