# Akiba360 - Deployment Guide

## Prerequisites
- Docker & Docker Compose v2+
- Node.js v20+ (for local dev)
- PostgreSQL 16+ (if running without Docker)
- Git
- Kubernetes Cluster & Kubectl (for K8s deployment)

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/Digital-Sacco-Chama-Management-App.git
cd Digital-Sacco-Chama-Management-App
```

2. Copy the environment template:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   *(Ensure `DATABASE_URL` is set to your PostgreSQL instance)*

---

## Quick Access (Local)

Once services are running, access them via:

| Service | Accessibility | URL | Host Port |
| :--- | :--- | :--- | :--- |
| **Admin Portal** | Tenant Managers | [http://localhost:3000](http://localhost:3000) | `3000` |
| **Super Admin Portal** | Platform Admins | [http://localhost:3001](http://localhost:3001) | `3001` |
| **OmniComms Dashboard** | Communications Suite | [http://localhost:7891](http://localhost:7891) | `7891` |
| **OmniComms Gateway** | Comms API / Ingestion | [http://localhost:7890/api/v1](http://localhost:7890/api/v1) | `7890` |
| **OmniComms Swagger Docs**| Interactive API Docs | [http://localhost:7890/docs](http://localhost:7890/docs) | `7890` |
| **Core API Gateway** | Backend Microservices API | [http://localhost:7847](http://localhost:7847) | `7847` |
| **Edge Nginx Proxy** | SSL / Ingress | [http://localhost:9443](http://localhost:9443) | `9443` |
| **Core API Docs (Swagger)**| Sacco Microservices Docs| [http://localhost:7847/api](http://localhost:7847/api) | `7847` |

### Default Master Credentials:
* **Universal SuperAdmin**: `petermwendwa94@gmail.com` / `SuperPassword123!` (Full unrestricted platform access)
* **Master Comms Secret**: `omni_master_sec_2026_super_admin_access_token`

---

## Docker Deployment (Recommended)

### 1. Deploy Whole Application (Start Fresh)
Use this command to build, start, push schema, and seed the database in one go:

```bash
# 1. Start all services in detached mode
docker compose up -d --build

# 2. Wait for Postgres to be ready (approx 10-30s)
# 3. Deploy Schema & Seed Data (Running from 'backend' service context or locally if configured)
# Ideally, run this inside the 'auth' or 'backend' container which has access to DB network:

docker compose exec auth bash -c "npm install && npx prisma db push && npx prisma db seed"
```

> **Note**: If running locally without Docker containers for API, run:
> `npm install && npx prisma db push && npx prisma db seed` 
> from the `backend` directory.

### 2. Redeploying Services

If you make changes to the source code, you need to rebuild and restart the Docker containers to apply them.

#### Option A: Redeploy All Services (Recommended)
This command tears down the existing containers and builds them fresh from the newly updated code.
```bash
docker compose down
docker compose up -d --build
```

#### Option B: Redeploy a Specific Service
If you know exactly which microservice was changed (e.g., `financial`), you can rebuild just that one without causing downtime for the others.
```bash
docker compose up -d --build financial
```

### 3. Service Management

#### Deploy/Update Single Application
To update just one service (e.g., `auth`), run:
```bash
docker compose up -d --no-deps --build auth
```

#### Stop Services
```bash
# Stop a specific service
docker compose stop auth

# Stop all services
docker compose stop
```

#### Delete Services (Remove Containers & Volumes)
```bash
# Remove specific service and its volumes
docker compose rm -s -v auth

# Remove ALL services and volumes (CAUTION: Deletes Database Data if volume is removed)
docker compose down -v
```

#### View Logs
```bash
# Follow logs for a specific service
docker compose logs -f auth

# Follow logs for all services
docker compose logs -f
```

---

## Domain Configuration

The application uses **NGINX** as a reverse proxy.

### Option A: Path-Based (Default)
Currently configured in `nginx/nginx.conf`:
- `example.com/` → Tenant Admin Dashboard
- `example.com/superadmin/` → Super Admin Dashboard
- `example.com/api/` → API Gateway

### Option B: Subdomain-Based
To use subdomains, update `nginx/nginx.conf` to use separate `server` blocks:

```nginx
# Tenant Admin (admin.example.com)
server {
    listen 80;
    server_name admin.example.com;
    location / {
        proxy_pass http://admin;
        proxy_set_header Host $host;
    }
}

# Super Admin (super.example.com)
server {
    listen 80;
    server_name super.example.com;
    location / {
        proxy_pass http://superadmin;
        proxy_set_header Host $host;
    }
}

# API (api.example.com)
server {
    listen 80;
    server_name api.example.com;
    location / {
        proxy_pass http://gateway;
        proxy_set_header Host $host;
    }
}
```

---

## Database Seeding

The `npx prisma db seed` command populates the database with **4 SACCOs**, realistic members, savings accounts, loans, and transactions. The following default users are created:

### 1. Super Admin
- **Role**: Platform Administrator (SUPER_ADMIN)
- **Email**: `petermwendwa94@gmail.com`
- **Name**: Peter Mwendwa
- **Password**: `password123`
- **Access**: Super Admin Dashboard
- **Tenant**: Demo Sacco Ltd

### 2. Tenant Admin
- **Role**: Sacco Manager (TENANT_ADMIN)
- **Email**: `serahnyambura70@gmail.com`
- **Name**: Serah Nyambura
- **Password**: `password123`
- **Access**: Tenant Admin Dashboard
- **Tenant**: Demo Sacco Ltd

### 3. Test Member (Multi-SACCO)
- **Role**: Member (MEMBER)
- **Email**: `pmmutua13@gmail.com`
- **Phone**: `+254712345678`
- **Name**: Peter Mutua
- **Password**: `password123`
- **Access**: Mobile App
- **Tenants**: Belongs to **all 4 SACCOs** (Demo Sacco Ltd, Nairobi Traders Sacco, Tech Ventures Chama, Mombasa Port Sacco)
- **Transaction History**: Deposits, withdrawals, loan disbursements, loan repayments, and share purchases

### 4. Additional Members
- Each SACCO has **15+ faker-generated** members with savings accounts, share accounts, loans, and transaction histories.
- **Password**: `password123` (for all seeded users)

### Seeded SACCOs

| SACCO Name | Slug | Admin Email |
|:---|:---|:---|
| Demo Sacco Ltd | `demo-sacco` | `serahnyambura70@gmail.com` |
| Nairobi Traders Sacco | `nairobi-traders` | `admin@nairobitraders.com` |
| Tech Ventures Chama | `tech-ventures` | `admin@techventures.com` |
| Mombasa Port Sacco | `mombasa-port` | `admin@mombasaport.com` |

---

## Kubernetes Deployment

To deploy all services (Admin, Tenant, SuperAdmin, Backend) to Kubernetes:

### 1. Prerequisites
- Docker images pushed to a registry (e.g., Docker Hub, ECR).
- `kubectl` configured for your cluster.

### 2. Deployment Manifests
Create a `k8s-deployment.yml` file. Example structure for one service (`auth`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      labels:
        app: auth
    spec:
      containers:
      - name: auth
        image: your-registry/akiba360-auth:latest
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_URL
        ports:
        - containerPort: 7848
---
apiVersion: v1
kind: Service
metadata:
  name: auth
spec:
  selector:
    app: auth
  ports:
    - protocol: TCP
      port: 7848
      targetPort: 7848
```

Repeat this block for all services (`gateway`, `tenants`, `superadmin`, etc.), updating image names and ports.

### 3. Deploy
```bash
# 1. Create Secrets
kubectl create secret generic app-secrets --from-literal=DATABASE_URL=postgresql://...

# 2. Apply Manifests
kubectl apply -f k8s-deployment.yml

# 3. Check Status
kubectl get pods
kubectl get services
```

### 4. Redeploying Services

When you update the source code and push a new image tag to your registry, you must instruct Kubernetes to pull the new image and do a rolling restart.

```bash
# Option A: If you just pushed a new 'latest' image without changing the YAML:
kubectl rollout restart deployment auth-deployment

# Option B: If you updated the image tag in k8s-deployment.yml:
kubectl apply -f k8s-deployment.yml
```

### 5. Ingress (Domain Routing)
Use an Ingress Controller (e.g., NGINX Ingress) to route traffic:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: akiba360-ingress
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gateway
            port:
              number: 7847
  - host: admin.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin
            port:
              number: 80
```
