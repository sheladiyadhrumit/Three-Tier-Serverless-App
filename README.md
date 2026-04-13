# Three-Tier Serverless Application on AWS

This project implements a Three-Tier Serverless Application using Amazon Web Services (AWS).
The presentation tier delivers a static frontend, while the application tier runs business logic using serverless functions.
The data tier securely stores and retrieves application data using managed databases.
The architecture is highly scalable, cost-efficient, and requires no server management.
It follows best practices for modern cloud-native application design.

[![Deploy](https://github.com/yourusername/your-repo/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/your-repo/actions/workflows/deploy.yml)

---

## Table of Contents

1. [What This Project Does](#1-what-this-project-does)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack](#3-tech-stack)
4. [Prerequisites](#4-prerequisites)
5. [Step-by-Step Setup Guide](#5-step-by-step-setup-guide)
   - [Step 1 – AWS Account & IAM User](#step-1--aws-account--iam-user)
   - [Step 2 – Set Up the Database (RDS)](#step-2--set-up-the-database-rds)
   - [Step 3 – Set Up Networking (VPC)](#step-3--set-up-networking-vpc)
   - [Step 4 – Clone the Repository](#step-4--clone-the-repository)
   - [Step 5 – Configure the Backend](#step-5--configure-the-backend)
   - [Step 6 – Run the Backend Locally](#step-6--run-the-backend-locally)
   - [Step 7 – Configure the Frontend](#step-7--configure-the-frontend)
   - [Step 8 – Run the Frontend Locally](#step-8--run-the-frontend-locally)
   - [Step 9 – Deploy the Backend to AWS](#step-9--deploy-the-backend-to-aws)
   - [Step 10 – Deploy the Frontend to AWS](#step-10--deploy-the-frontend-to-aws)
   - [Step 11 – Set Up GitHub Actions (CI/CD)](#step-11--set-up-github-actions-cicd)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Project Structure Explained](#7-project-structure-explained)
8. [Security Best Practices](#8-security-best-practices)
9. [Cost Estimate](#9-cost-estimate)
10. [Troubleshooting](#10-troubleshooting)
11. [Mentors & References](#11-mentors--references)

---

## 1. What This Project Does

This project is a **full-stack web application** deployed entirely on AWS using a **serverless architecture**. That means:

- There are **no servers to manage** — AWS handles scaling automatically.
- You only **pay for what you use** (Lambda charges per request, not per hour).
- The entire infrastructure deploys automatically via **GitHub Actions** whenever you push code.

The app has three layers (tiers):

| Tier | What it is | AWS Service |
|------|-----------|-------------|
| **Tier 1 – Frontend** | The website the user sees (React) | S3 + CloudFront |
| **Tier 2 – Backend** | The logic / API (Node.js) | Lambda + API Gateway |
| **Tier 3 – Database** | Where data is stored (MySQL) | Amazon RDS |

---

## 2. Architecture Overview

```
Users (Browser)
      │
      ▼
┌─────────────────┐     ┌────────────────────┐
│   CloudFront    │────▶│     Amazon S3      │  ← Tier 1: Frontend (React)
│  (CDN / HTTPS)  │     │  (Static Files)    │    Delivers HTML/CSS/JS fast
└─────────────────┘     └────────────────────┘
      │
      │  (API calls: /users, /orders, etc.)
      ▼
┌─────────────────┐     ┌────────────────────┐
│  API Gateway    │────▶│    AWS Lambda      │  ← Tier 2: Backend (Node.js)
│  (REST API)     │     │  (Express App)     │    Runs only when called
└─────────────────┘     └────────────────────┘
                                  │
                                  │  (SQL queries inside VPC)
                                  ▼
                        ┌────────────────────┐
                        │    Amazon RDS      │  ← Tier 3: Database (MySQL 8.0)
                        │  (Private Subnet)  │    Never exposed to public internet
                        └────────────────────┘

─────────────── DevOps / CI-CD ───────────────
  GitHub Push → GitHub Actions → Auto Deploy Backend & Frontend
```

**How a request flows through the system:**
1. User opens the website → CloudFront serves the React app from S3.
2. React app calls the REST API (e.g., `GET /users`).
3. API Gateway receives the call and triggers the Lambda function.
4. Lambda connects to RDS (MySQL) inside a private VPC and queries data.
5. Data is returned as JSON back to the browser.

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React.js | User interface |
| Hosting | Amazon S3 | Store built React files |
| CDN | Amazon CloudFront | Serve frontend fast, enforce HTTPS |
| Backend | Node.js + Express | Business logic & API |
| Serverless | AWS Lambda | Run backend code without a server |
| API | AWS API Gateway | Expose Lambda as REST endpoints |
| Database | MySQL 8.0 | Store structured data |
| DB Host | Amazon RDS | Managed MySQL database |
| Networking | AWS VPC | Isolate resources securely |
| CI/CD | GitHub Actions | Auto deploy on every `git push` |
| Deploy Tool | Serverless Framework | Deploy Lambda + API Gateway easily |

---

## 4. Prerequisites

Before you begin, make sure you have the following installed and configured on your machine:

### Software
```bash
# Check Node.js version (need v18+)
node --version

# Check npm
npm --version

# Check AWS CLI
aws --version

# Check Git
git --version
```

If anything is missing:
- **Node.js v18+** → https://nodejs.org
- **AWS CLI** → https://aws.amazon.com/cli/ (then run `aws configure`)
- **Serverless Framework** → `npm install -g serverless`
- **Git** → https://git-scm.com

### AWS Account
You need an AWS account. Sign up free at https://aws.amazon.com — the free tier is enough for this project.

---

## 5. Step-by-Step Setup Guide

---

### Step 1 – AWS Account & IAM User

> **Why?** You should never use your root AWS account for deployments. Create a dedicated IAM user with limited permissions.

1. Log in to the [AWS Console](https://console.aws.amazon.com).
2. Go to **IAM → Users → Create User**.
3. Username: `deploy-user` (or any name you prefer).
4. Attach these policies directly:
   - `AmazonS3FullAccess`
   - `AWSLambda_FullAccess`
   - `AmazonAPIGatewayAdministrator`
   - `AmazonRDSFullAccess`
   - `CloudFrontFullAccess`
   - `AmazonVPCFullAccess`
5. After creating, go to **Security credentials → Create access key**.
6. Choose **CLI** as the use case.
7. **Save the Access Key ID and Secret Access Key** — you won't see the secret again.

Now configure the AWS CLI on your machine:
```bash
aws configure
# AWS Access Key ID:     [paste your key]
# AWS Secret Access Key: [paste your secret]
# Default region name:   ap-south-1   (or your region)
# Default output format: json
```

---

### Step 2 – Set Up the Database (RDS)

> **Why?** RDS is the managed MySQL database. Lambda will connect to it inside a private network.

1. Go to **AWS Console → RDS → Create Database**.
2. Choose:
   - Engine: **MySQL 8.0**
   - Template: **Free tier**
   - DB Instance Identifier: `myapp-db`
   - Master username: `admin`
   - Master password: choose a strong password and **save it**
3. Instance configuration: `db.t3.micro`
4. Storage: `20 GB` (default)
5. Connectivity:
   - **Do NOT enable public access** (keep it private)
   - Choose your default VPC
6. Create the database and wait ~5 minutes for it to become **Available**.
7. Copy the **Endpoint URL** from the RDS dashboard — you will need it later.
   - It looks like: `myapp-db.xxxx.ap-south-1.rds.amazonaws.com`

8. Initialize the schema by connecting via a bastion host or AWS Cloud Shell:
```sql
-- Run this in MySQL after connecting:
CREATE DATABASE myapp;
USE myapp;
-- Then paste the contents of database/schema.sql
```

---

### Step 3 – Set Up Networking (VPC)

> **Why?** Lambda needs to be in the same VPC as RDS to talk to it securely.

1. Go to **VPC → Security Groups → Create Security Group**.
2. Create a security group named `lambda-sg`:
   - Inbound rules: **none** (Lambda doesn't receive direct traffic)
   - Outbound rules: Allow **All traffic** (so Lambda can reach RDS)
3. Edit the **RDS security group** (the one auto-created with your DB):
   - Add inbound rule: **MySQL/Aurora (port 3306)** from source = `lambda-sg`

4. Note down:
   - The **Security Group ID** of `lambda-sg` → needed for GitHub Secrets
   - Two **Private Subnet IDs** from your VPC → needed for GitHub Secrets
   
   Find subnets at: **VPC → Subnets** — pick any 2 in different availability zones.

---

### Step 4 – Clone the Repository

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

Your folder structure will look like this:
```
your-repo/
├── .github/workflows/deploy.yml   ← CI/CD pipeline
├── frontend/                      ← React app
├── backend/                       ← Lambda + Express API
├── database/schema.sql            ← SQL to create tables
└── README.md
```

---

### Step 5 – Configure the Backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in your values:
```env
DB_HOST=myapp-db.xxxx.ap-south-1.rds.amazonaws.com   # Your RDS endpoint
DB_USER=admin
DB_PASS=your_strong_password
DB_NAME=myapp
```

Install dependencies:
```bash
npm install
```

---

### Step 6 – Run the Backend Locally

> **Why?** Always test locally before deploying to AWS.

```bash
npx serverless offline
```

You should see:
```
Server ready: http://localhost:3001
```

Test it in a new terminal:
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok"}

curl http://localhost:3001/users
# Expected: [] (empty array if no users yet)
```

If it works locally, you're ready to deploy.

---

### Step 7 – Configure the Frontend

```bash
cd ../frontend
cp .env.example .env
```

Open `.env`:
```env
REACT_APP_API_URL=http://localhost:3001   # For local dev (change after backend deploy)
```

Install dependencies:
```bash
npm install
```

---

### Step 8 – Run the Frontend Locally

```bash
npm start
```

The app opens at `http://localhost:3000`. It calls your local backend at port 3001. Test that users/orders load correctly before deploying.

---

### Step 9 – Deploy the Backend to AWS

```bash
cd backend
npx serverless deploy --stage prod
```

This command:
- Packages your Express app into a Lambda function
- Creates the API Gateway with all your routes
- Connects Lambda to your VPC and subnets
- Takes about 2–3 minutes

At the end you will see output like:
```
endpoints:
  GET  - https://abc123.execute-api.ap-south-1.amazonaws.com/prod/health
  GET  - https://abc123.execute-api.ap-south-1.amazonaws.com/prod/users
  POST - https://abc123.execute-api.ap-south-1.amazonaws.com/prod/users
  ...
```

**Copy the base URL** (e.g., `https://abc123.execute-api.ap-south-1.amazonaws.com/prod`). You'll need it next.

Test the deployed backend:
```bash
curl https://abc123.execute-api.ap-south-1.amazonaws.com/prod/health
# Expected: {"status":"ok"}
```

---

### Step 10 – Deploy the Frontend to AWS

First, create an S3 bucket (one-time setup):
1. Go to **S3 → Create Bucket**
2. Name: `myapp-frontend-yourname` (must be globally unique)
3. Region: same as your backend (e.g., `ap-south-1`)
4. Block all public access: **Yes** (CloudFront will serve it, not S3 directly)

Create a CloudFront distribution pointing to the S3 bucket:
1. Go to **CloudFront → Create Distribution**
2. Origin: your S3 bucket
3. Origin access: **Origin Access Control (OAC)** — let CloudFront-only access S3
4. Default root object: `index.html`
5. After creating, copy the **Distribution ID** and the **CloudFront URL** (e.g., `https://d123.cloudfront.net`)

Now update your frontend `.env` with the real API URL:
```env
REACT_APP_API_URL=https://abc123.execute-api.ap-south-1.amazonaws.com/prod
```

Build and upload:
```bash
cd frontend
npm run build

aws s3 sync build/ s3://myapp-frontend-yourname --delete
```

Invalidate the CloudFront cache so changes appear immediately:
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_CF_DISTRIBUTION_ID \
  --paths "/*"
```

Visit your CloudFront URL — your app is now live!

---

### Step 11 – Set Up GitHub Actions (CI/CD)

> **Why?** So every `git push` automatically deploys the latest code — no manual steps.

Go to your GitHub repo → **Settings → Secrets and Variables → Actions → New repository secret**.

Add each of these secrets:

| Secret Name | Where to find it |
|-------------|-----------------|
| `AWS_ACCESS_KEY_ID` | From Step 1 (IAM user key) |
| `AWS_SECRET_ACCESS_KEY` | From Step 1 (IAM user secret) |
| `DB_HOST` | RDS endpoint URL from Step 2 |
| `DB_USER` | `admin` |
| `DB_PASS` | Password you set in Step 2 |
| `DB_NAME` | `myapp` |
| `REACT_APP_API_URL` | API Gateway base URL from Step 9 |
| `CF_DISTRIBUTION_ID` | CloudFront Distribution ID from Step 10 |
| `LAMBDA_SECURITY_GROUP` | Security group ID of `lambda-sg` from Step 3 |
| `PRIVATE_SUBNET_1` | First private subnet ID from Step 3 |
| `PRIVATE_SUBNET_2` | Second private subnet ID from Step 3 |

Once all secrets are added, test the pipeline:
```bash
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

Go to **GitHub → Actions** tab — you should see a workflow running. It will deploy both the backend and frontend automatically.

---

## 6. API Endpoints Reference

Base URL (local): `http://localhost:3001`  
Base URL (production): `https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod`

| Method | Endpoint | Description | Sample Body |
|--------|----------|-------------|-------------|
| GET | `/health` | Health check | — |
| GET | `/users` | Get all users | — |
| GET | `/users/:id` | Get user by ID | — |
| POST | `/users` | Create a new user | `{"name":"Karna","email":"k@example.com"}` |
| PUT | `/users/:id` | Update a user | `{"name":"Updated Name"}` |
| DELETE | `/users/:id` | Delete a user | — |
| GET | `/orders` | Get all orders | — |
| POST | `/orders` | Create an order | `{"userId":1,"item":"Book"}` |

### Testing with curl
```bash
# Create a user
curl -X POST https://YOUR-API/prod/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Karna","email":"karna@example.com"}'

# Get all users
curl https://YOUR-API/prod/users

# Delete user with ID 1
curl -X DELETE https://YOUR-API/prod/users/1
```

---

## 7. Project Structure Explained

```
your-repo/
│
├── .github/
│   └── workflows/
│       └── deploy.yml          ← CI/CD: runs on every git push to main
│
├── frontend/
│   ├── src/
│   │   ├── App.js              ← Main React component (UI + API calls)
│   │   └── App.css             ← Styles
│   ├── .env.example            ← Copy to .env and fill in values
│   └── package.json            ← Frontend dependencies
│
├── backend/
│   ├── handler.js              ← Lambda entry point (wraps Express with serverless-http)
│   ├── routes/
│   │   ├── users.js            ← CRUD routes for /users
│   │   └── orders.js           ← Routes for /orders
│   ├── serverless.yml          ← Defines Lambda function, API Gateway, VPC config
│   ├── .env.example            ← Copy to .env and fill in DB credentials
│   └── package.json            ← Backend dependencies
│
├── database/
│   └── schema.sql              ← Run this once to create tables in RDS
│
└── README.md
```

**Key files to understand:**
- `serverless.yml` — The heart of the backend deployment. Defines which functions exist, what routes they handle, and which VPC/subnets to use.
- `handler.js` — Takes your Express app and wraps it so Lambda can run it.
- `deploy.yml` — The GitHub Actions workflow. On every push to `main`, it runs `serverless deploy` and `aws s3 sync`.

---

## 8. Security Best Practices

| Practice | How it's implemented |
|----------|---------------------|
| RDS not public | Public accessibility = No; only Lambda inside the same VPC can reach it |
| Least privilege IAM | Lambda gets only the permissions it needs |
| No hardcoded secrets | All credentials are in `.env` files (gitignored) or GitHub Secrets |
| HTTPS everywhere | CloudFront enforces HTTPS; HTTP redirects to HTTPS |
| S3 not public | S3 bucket blocks all public access; only CloudFront (via OAC) can read it |
| Lambda in VPC | Lambda runs in private subnets, not exposed to the internet |

> ⚠️ **Never commit your `.env` file to GitHub.** The `.gitignore` should already exclude it. Double-check with `git status` before pushing.

---

## 9. Cost Estimate

All services below fall within AWS Free Tier for low-traffic/development use:

| Service | Free Tier Limit | Estimated Monthly Cost |
|---------|----------------|----------------------|
| AWS Lambda | 1M requests + 400,000 GB-seconds | $0 |
| API Gateway | 1M HTTP API calls | $0 |
| Amazon S3 | 5 GB storage | ~$0.01 |
| CloudFront | 1 TB data transfer | $0 |
| RDS (t3.micro) | 750 hours/month | $0 |
| **Total** | | **~$0–5/month** |

> After 12 months, Free Tier expires on some services. RDS t3.micro costs ~$15/month after that.

---

## 10. Troubleshooting

### Lambda can't connect to RDS
- Make sure Lambda's security group (`lambda-sg`) is listed as an inbound rule source in the RDS security group on port 3306.
- Confirm Lambda is deployed into the same VPC as RDS.
- Check that `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` are correct in your `.env` or GitHub Secrets.

### CloudFront shows old version of site
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### `serverless deploy` fails
- Run `aws sts get-caller-identity` to confirm your AWS credentials are working.
- Make sure the IAM user has all required permissions (see Step 1).
- Check that `LAMBDA_SECURITY_GROUP`, `PRIVATE_SUBNET_1`, `PRIVATE_SUBNET_2` are set correctly in `serverless.yml` or GitHub Secrets.

### GitHub Actions workflow fails
- Go to **GitHub → Actions → (failed run) → View logs** for exact error messages.
- Most failures are due to a missing or wrong GitHub Secret. Re-check all 11 secrets.

### CORS errors in browser
In `handler.js` or your Express app, make sure CORS is enabled:
```javascript
const cors = require('cors');
app.use(cors({ origin: 'https://YOUR-CLOUDFRONT-URL.cloudfront.net' }));
```

---

## 11. Mentors & References

**Departmental Mentor:** Prof. Vishvadeep Nanavati, Assistant Professor, CE  
**Industrial Mentor:** Mr. Niken Wadkar, General Manager, IAMOPS

### Official Documentation
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [Amazon RDS User Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/)
- [AWS API Gateway Docs](https://docs.aws.amazon.com/apigateway/)
- [Amazon CloudFront Docs](https://docs.aws.amazon.com/cloudfront/)

---

