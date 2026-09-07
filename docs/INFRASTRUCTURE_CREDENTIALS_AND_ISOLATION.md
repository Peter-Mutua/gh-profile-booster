# Teratech Enterprise Ecosystem: Master Architectural Blueprint, Isolation & Microservices Directory

## 1. Central Shared Infrastructure Stack

| Service | Container Name | Host Port | Internal Port | Username / User | Password / Secret | Access URL / Connection String |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Ingress Gateway (NGINX)** | `teratech-shared-gateway` | `8088` | `80` | `admin` | N/A | [http://localhost:8088](http://localhost:8088) |
| **PostgreSQL 17 Cluster** | `teratech-shared-postgres` | `54932` | `5432` | `teratech_admin` | `TeratechSecureP@ss2026!` | `postgresql://teratech_admin:TeratechSecureP@ss2026!@localhost:54932/teratech_master_db` |
| **Redis 7 Cluster** | `teratech-shared-redis` | `63891` | `6379` | `default` | `TeratechRedisSecure2026!` | `redis://:TeratechRedisSecure2026!@localhost:63891` |
| **RabbitMQ AMQP Broker** | `teratech-shared-rabbitmq` | `5672` | `5672` | `teratech_admin` | `TeratechRabbitSecure2026!` | `amqp://teratech_admin:TeratechRabbitSecure2026!@localhost:5672` |
| **RabbitMQ Web Console** | `teratech-shared-rabbitmq` | `15672` | `15672` | `teratech_admin` | `TeratechRabbitSecure2026!` | [http://localhost:15672](http://localhost:15672) |
| **MongoDB 7.0 Document DB** | `teratech-shared-mongodb` | `27017` | `27017` | `teratech_admin` | `TeratechMongoSecure2026!` | `mongodb://teratech_admin:TeratechMongoSecure2026!@localhost:27017` |
| **MinIO S3 API** | `teratech-shared-minio` | `9000` | `9000` | `teratech_s3_admin` | `TeratechMinioVault2026!` | [http://localhost:9000](http://localhost:9000) |
| **MinIO S3 Web Console** | `teratech-shared-minio` | `9001` | `9001` | `teratech_s3_admin` | `TeratechMinioVault2026!` | [http://localhost:9001](http://localhost:9001) |
| **Apache Kafka Broker** | `teratech-shared-kafka` | `39092, 38291` | `9092` | N/A | PLAINTEXT | `localhost:39092` (Host) / `teratech-shared-kafka:9092` (Docker) |
| **Ollama AI Engine** | `teratech-shared-ollama` | `11434` | `11434` | N/A | N/A | [http://localhost:11434](http://localhost:11434) |
| **Prometheus Metrics** | `teratech-shared-prometheus` | `9090` | `9090` | N/A | N/A | [http://localhost:9090](http://localhost:9090) |
| **Grafana Dashboards** | `teratech-shared-grafana` | `3005` | `3000` | `admin` | `admin123` | [http://localhost:3005](http://localhost:3005) |

---

## 2. Global Architectural Master Diagram

```mermaid
graph TD
    subgraph Clients["Enterprise Client Access Channels"]
        WEB["Desktop & Mobile Browsers"]
        USSD_CLI["Mobile Feature Phones (USSD :3009)"]
        POS_DEV["POS Touch Terminals (:8080)"]
    end

    subgraph Edge["Global Ingress & SSL Edge"]
        GW["Central Shared Ingress Proxy (:8088)"]
    end

    subgraph AppMesh["Active Multi-Tenant Application Suites"]
        SACCO["Digital Sacco & Chama (:7847 / :3000 / :3001)\n[18 Microservices | 174 Users | 1.7k Txns]"]
        POS["POS System (:5001 / :8080)\n[2 Tenants | 15 Products | 8 Users]"]
        SIMS["School ERP SIMS (:3025 / :3100)\n[23 Microservices | 14 Users | 5 Students]"]
        BOOKORA["Bookora Real Estate (:8086 / :8085 / :3009)\n[24 Microservices | 3 Agencies]"]
        CARS["CarsClub KE (:3105 / :3106 / :3107)\n[1 Dealership | 67 Vehicles]"]
        HRMS["Multi-Tenant HRMS (:4006 / :3006)\n[18 Domains | Shifts & Leaves]"]
        AUDIO["Audiobookify (:4005 / :8200 / :10200)\n[Neural Piper TTS | 3 Reading Clubs]"]
        MATATU["Matatu Sacco (:5002 / :3002)\n[2 Saccos | Fleet & Routes]"]
        SEAT["Seat Reservation (:5003)\n[Event Booking Engine]"]
    end

    subgraph SharedInfra["Teratech Shared Enterprise Infrastructure (100% Consolidated)"]
        PG[("PostgreSQL 17 Cluster (:54932)\n14 Logical Database Sandboxes")]
        MONGO[("MongoDB 7.0 Document DB (:27017)\nbookora_mongodb Document Store")]
        REDIS[("Redis 7 In-Memory DB (:63891)\nDBs 0-10 & Dedicated Key Prefixes")]
        RABBIT["RabbitMQ AMQP Broker (:5672)\nvhosts: /sims, /bookora, /sacco, /payment"]
        KAFKA["Apache Kafka Broker (:39092)\nPartitioned Enterprise Topics"]
        MINIO[("MinIO S3 Object Storage (:9000)\nsacco-vault, sims-vault, bookora-vault")]
        OLLAMA["Ollama AI Sidecar Engine (:11434)\nLocal Neural LLM Inference (Qwen / Nomic)"]
        MON["Prometheus (:9090) & Grafana (:3005)"]
    end

    WEB --> GW
    USSD_CLI --> GW
    POS_DEV --> GW

    GW --> SACCO
    GW --> POS
    GW --> SIMS
    GW --> BOOKORA
    GW --> CARS
    GW --> HRMS
    GW --> AUDIO
    GW --> MATATU
    GW --> SEAT

    SACCO -->|DB: digital_sacco_db / Redis: 0 / S3: sacco-vault| SharedInfra
    POS -->|DB: pos_db / Redis: 1 / S3: pos-vault| SharedInfra
    SIMS -->|DB: school_erp_db / Redis: 2 / vhost: /sims| SharedInfra
    BOOKORA -->|DB: bookora_db / Mongo: bookora_mongodb / vhost: /bookora| SharedInfra
    CARS -->|DB: carsclub_db / Redis: 5| SharedInfra
    HRMS -->|DB: multi_tenant_hrms_db / Redis: 3 / S3: hrms-vault| SharedInfra
    AUDIO -->|DB: audiobookify_db / Ollama AI / S3: audiobookify-vault| SharedInfra
    MATATU -->|DB: matatu_sacco_db / Redis: 6| SharedInfra
    SEAT -->|DB: seat_reservation_db| SharedInfra
```

---

## 3. Subsystem Architectural Deep-Dives

### A. Digital Sacco & Chama Management App (Akiba360)
```mermaid
graph TD
    subgraph SaccoClients["Sacco Client Portals"]
        M1["SuperAdmin Portal (:3001)"]
        M2["Branch / Chama Admin Portal (:3000)"]
    end

    subgraph SaccoGateway["Ingress & Edge"]
        GW["Sacco API Gateway (:7847)"]
        EDGE["Edge NGINX Proxy (:9443)"]
    end

    subgraph SaccoServices["18 Dedicated Core Microservices"]
        AUTH["Auth (:7848)"]
        MEMBERS["Members (:7849)"]
        FIN["Financial Ledger (:7850)"]
        PAY["Payments / STK (:7851)"]
        KYC["KYC Verification (:7852)"]
        TENANTS["Tenants (:7853)"]
        REP["Reports & SASRA (:7854)"]
        TICK["Tickets (:7855)"]
        STOR["Storage Adapter (:7856)"]
        NOTIF["Notifications (:7857)"]
        MON["Monitoring (:7858)"]
        SUPER["Super Admin Core (:7859)"]
        AUDIT["Immutable Audit (:7860)"]
        AI["AI Credit Scoring (:7861)"]
    end

    subgraph SaccoStorage["Shared Enterprise Infrastructure"]
        S_PG[("Postgres: digital_sacco_db (:54932)")]
        S_REDIS[("Redis: DB 0 sacco:* (:63891)")]
        S_MINIO[("MinIO: sacco-vault (:9000)")]
        S_RABBIT["RabbitMQ: vhost /sacco (:5672)"]
        S_OLLAMA["Ollama AI Engine (:11434)"]
    end

    M1 --> EDGE --> GW
    M2 --> EDGE --> GW

    GW --> AUTH
    GW --> MEMBERS
    GW --> FIN
    GW --> PAY
    GW --> KYC
    GW --> TENANTS
    GW --> REP
    GW --> TICK
    GW --> STOR
    GW --> NOTIF
    GW --> MON
    GW --> SUPER
    GW --> AUDIT
    GW --> AI

    FIN & MEMBERS & TENANTS & AUTH --> S_PG
    AUTH & NOTIF --> S_REDIS
    STOR & KYC --> S_MINIO
    PAY & NOTIF --> S_RABBIT
    AI --> S_OLLAMA
```

---

### B. School ERP - SIMS (23 Microservices Mesh)
```mermaid
graph TD
    subgraph SchoolPortals["School Users"]
        U_TEACH["Teacher, Parent & Student UI (:3100)"]
    end

    subgraph SchoolGateways["Routing Gateway"]
        SIMS_GW["SIMS API Gateway (:3025)"]
    end

    subgraph CoreServices["Academic & Administrative Microservices"]
        S_AUTH["Auth (:13001)"]
        S_TENANT["Tenant (:13002)"]
        S_USER["User (:13003)"]
        S_FIN["Finance (:13004)"]
        S_ACAD["Academic (:13006)"]
        S_STUD["Student (:13007)"]
        S_ATT["Attendance (:13008)"]
        S_EXAM["Assessment (:13009)"]
        S_INV["Inventory (:13010)"]
        S_ALUM["Alumni (:13011)"]
        S_CANT["Canteen (:13012)"]
        S_COMM["Communication (:13013)"]
        S_SCHED["Scheduling (:13014)"]
        S_TRANS["Transport GPS (:13015)"]
        S_IOT["Campus IoT (:13016)"]
        S_LMS["LMS E-Learning (:13017)"]
        S_HR["HR & Payroll (:13018)"]
        S_DOC["Documents (:13019)"]
        S_ANLY["Analytics (:13020)"]
        S_AUD["Audit (:13021)"]
    end

    subgraph SIMSShared["Shared Enterprise Backing Services"]
        SIMS_DB[("Postgres: school_erp_db (:54932)")]
        SIMS_REDIS[("Redis: DB 2 sims:* (:63891)")]
        SIMS_MQ["RabbitMQ: vhost /sims (:5672)"]
        SIMS_S3[("MinIO: sims-vault (:9000)")]
    end

    U_TEACH --> SIMS_GW
    SIMS_GW --> CoreServices
    CoreServices --> SIMS_DB
    CoreServices --> SIMS_REDIS
    CoreServices --> SIMS_MQ
    S_DOC --> SIMS_S3
```

---

### C. Bookora Real Estate Platform (Hybrid SQL + NoSQL Architecture)
```mermaid
graph TD
    subgraph BookoraUsers["Bookora Portals"]
        R_UI["Renter & Landlord Portal (:8085)"]
        U_CLI["USSD Property Search (:3009)"]
    end

    subgraph BookoraIngress["Gateway Routing"]
        B_GW["Bookora API Gateway (:8086)"]
    end

    subgraph BookoraServices["24 Specialized Domain Microservices"]
        B_AUTH["Auth & Users"]
        B_BOOK["Bookings & Leases"]
        B_PAY["Payments & Escrow"]
        B_PROP["Listings & Floorplans"]
        B_NOTIF["Notification Reminders"]
        B_IOT["Smart Locks & Meters"]
        B_REV["Reviews & Verification"]
        B_WORK["Move-In Automation"]
    end

    subgraph BookoraStorage["Consolidated Enterprise Storage"]
        B_SQL[("Postgres: bookora_db (:54932)\nUsers, Leases, Payments")]
        B_NOSQL[("MongoDB: bookora_mongodb (:27017)\nProperty Listings, Dynamic Specs")]
        B_CACHE[("Redis: DB 4 bookora:* (:63891)")]
        B_VAULT[("MinIO: bookora-vault (:9000)")]
    end

    R_UI --> B_GW
    U_CLI --> B_GW
    B_GW --> BookoraServices

    B_AUTH & B_BOOK & B_PAY --> B_SQL
    B_PROP --> B_NOSQL
    B_BOOK & B_PROP --> B_CACHE
    B_PROP & B_REV --> B_VAULT
```

---

### D. Audiobookify (Neural Audio Synthesizer & AI Sidecar)
```mermaid
graph TD
    subgraph AudioClient["Web & Mobile Apps"]
        A_UI["Audiobookify Web App (:4005)"]
    end

    subgraph AudioBackend["Backend & Voice Subsystems"]
        A_API["NestJS Backend API (:4005)"]
        A_SIDE["AI Sidecar Engine (:8200)\n[FastAPI / Whisper OCR / Alignment]"]
        A_PIPE["Piper Neural TTS (:10200 / :5000)\n[ONNX Neural Audio Engine]"]
    end

    subgraph AudioInfra["Shared Enterprise Backing"]
        A_DB[("Postgres: audiobookify_db (:54932)")]
        A_S3[("MinIO: audiobookify-vault (:9000)")]
        A_RED[("Redis: DB 7 (:63891)")]
        A_OLL["Ollama AI Engine (:11434)"]
    end

    A_UI --> A_API
    A_API -->|1. Script & OCR Analysis| A_SIDE
    A_API -->|2. Direct High-Speed TTS| A_PIPE
    A_SIDE -->|Voice Formatting| A_PIPE

    A_API --> A_DB
    A_API --> A_S3
    A_API --> A_RED
    A_API --> A_OLL
```

---


### I. ClipNova (Automated AI Video Creation & Social Media Publishing Pipeline)
* **Shared Database**: `clipnova_db` on `teratech-shared-postgres` (`clipnova_user` / `Teratech_clipnova_db_Sec2026!`)
* **Shared Redis DB**: `10` | **Key Prefix**: `clipnova:*`
* **Local Storage**: `/files` and `/uploads`

| Microservice / Component | Container Name | Host Port | Internal Port | Direct Endpoint Link | Role / Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **n8n Workflow Engine** | `clipnova-n8n` | `5678` | `5678` | [http://localhost:5678](http://localhost:5678) | Pipeline orchestrator with Python & FFmpeg |
| **Postiz Social Scheduler**| `clipnova-postiz` | `5500` | `5000` | [http://localhost:5500](http://localhost:5500) | Multi-platform social publisher (TikTok, Reels, Shorts) |
| **Edge TTS Engine** | `clipnova-tts` | `5050` | `5050` | [http://localhost:5050/v1/models](http://localhost:5050/v1/models) | High-speed neural voiceover generator |
| **Temporal Engine** | `clipnova-temporal` | `7233` | `7233` | `http://temporal:7233` | Durable workflow state machine |

```mermaid
graph TD
    subgraph Trigger["1. Automated Scheduling"]
        CRON["Cron Scheduler / Webhook"]
    end

    subgraph Pipeline["2. n8n Content Orchestration Pipeline (:5678)"]
        NICHE["Select Trending Niche (config/niches.json)"]
        PROMPT["LLM Script Generation (Ollama Qwen 2.5)"]
        TTS["Voiceover Generation (Edge TTS :5050)"]
        MEDIA["B-Roll Video & Images (Pexels / AI)"]
        SUBTITLE["Subtitle Alignment (Whisper / Python)"]
        FFMPEG["FFmpeg Assembly (create_video.sh)"]
    end

    subgraph Publishing["3. Social Media Distribution (:5500)"]
        POSTIZ["Postiz Social Hub [TikTok, Shorts, Reels, X]"]
        TEMPORAL["Temporal Workflow Engine (:7233)"]
    end

    subgraph Storage["4. Data & State Storage"]
        PG[("PostgreSQL 17: clipnova_db (:54932)")]
        REDIS[("Redis 7: DB 10 clipnova:* (:63891)")]
    end

    CRON --> NICHE
    NICHE --> PROMPT
    PROMPT --> TTS
    TTS --> MEDIA
    MEDIA --> SUBTITLE
    SUBTITLE --> FFMPEG
    FFMPEG --> POSTIZ
    POSTIZ <--> TEMPORAL
    POSTIZ --> PG
    POSTIZ --> REDIS
```

## 4. Master Credentials & Test Logins

Unified SuperAdmin: **`petermwendwa94@gmail.com`**

| Application / Platform | Role | Email / Username | Default Password | Direct Portal Link |
| :--- | :--- | :--- | :--- | :--- |
| **Digital Sacco & Chama** | Sacco SuperAdmin | `petermwendwa94@gmail.com` | `SuperPassword123!` | [http://localhost:3001](http://localhost:3001) |
| **Digital Sacco & Chama** | Demo Sacco Admin | `admin@demosacco.co.ke` | `Admin@2026!` | [http://localhost:3000](http://localhost:3000) |
| **POS System** | Platform SuperAdmin | `petermwendwa94@gmail.com` | `SuperPassword123!` | [http://localhost:8080](http://localhost:8080) |
| **POS System (Demo Shop)** | Store Admin / Cashier | `admin@demo-shop.com` / `cashier@demo-shop.com` | `password123` | [http://localhost:8080](http://localhost:8080) |
| **School ERP (SIMS)** | System SuperAdmin | `petermwendwa94@gmail.com` | `SuperPassword123!` | [http://localhost:3100](http://localhost:3100) |
| **School ERP (SIMS)** | Sault Academy Admin | `admin@saultacademy.com` | `password123` | [http://localhost:3100](http://localhost:3100) |
| **Bookora Platform** | Platform SuperAdmin | `petermwendwa94@gmail.com` | `SuperPassword123!` | [http://localhost:8085](http://localhost:8085) |
| **Bookora (Sunny Rentals)**| Tenant Owner | `john@sunnyrentals.com` | `Host@2026!` | [http://localhost:8085](http://localhost:8085) |
| **Multi-Tenant HRMS** | Global SuperAdmin | `petermwendwa94@gmail.com` | `SuperPassword123!` | [http://localhost:3006](http://localhost:3006) |
| **Multi-Tenant HRMS** | Manager / HR Officer | `alice.manager@demo.com` / `carol.hr@demo.com` | `Password@123` | [http://localhost:3006](http://localhost:3006) |
| **CarsClub KE** | Platform SuperAdmin | `petermwendwa94@gmail.com` | `SuperPassword123!` | [http://localhost:3106](http://localhost:3106) |
| **CarsClub KE** | Dealership Owner | `owner@apexmotors.ke` | `Admin@123` | [http://localhost:3107](http://localhost:3107) |
| **Matatu Sacco App** | Platform SuperAdmin | `petermwendwa94@gmail.com` | `SuperPassword123!` | [http://localhost:3002](http://localhost:3002) |
| **Matatu (Nairobi Express)**| Sacco Admin | `james.mwangi@nairobiexpress.co.ke` | `Nairobi@123` | [http://localhost:3002](http://localhost:3002) |
| **Audiobookify** | Platform SuperAdmin | `petermwendwa94@gmail.com` | `SuperPassword123!` | [http://localhost:4005](http://localhost:4005) |
| **Seat Reservation** | Platform SuperAdmin | `petermwendwa94@gmail.com` | `SuperPassword123!45` | [http://localhost:5003](http://localhost:5003) |
