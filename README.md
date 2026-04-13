# Three-Tier Serverless Application Architecture on AWS

> **Internship Project** | IAM(OPS) India Pvt. Ltd. | ADIT / CVM University  
> **Student:** Karna Patel | **Enrolment:** 12202040601077 | **Code:** 202000801

[![Deploy](https://github.com/yourusername/your-repo/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/your-repo/actions/workflows/deploy.yml)

---

## Architecture Overview

```
Users
  │
  ▼
┌─────────────────┐     ┌────────────────┐
│   CloudFront    │────▶│   Amazon S3    │  ← Tier 1: Frontend (React)
│  (CDN/HTTPS)    │     │ (Static Files) │
└─────────────────┘     └────────────────┘
  │
  ▼
┌─────────────────┐     ┌────────────────┐
│  API Gateway    │────▶│ AWS Lambda     │  ← Tier 2: Backend (Node.js)
│  (REST API)     │     │ (Express App)  │
└─────────────────┘     └────────────────┘
                                │
                                ▼
                        ┌────────────────┐
                        │  Amazon RDS    │  ← Tier 3: Database (MySQL)
                        │  (MySQL 8.0)  │
                        └────────────────┘

DevOps Layer:
GitHub → GitHub Actions → Deploy Backend & Frontend automatically
```

## Tech Stack

| Layer | Technology | AWS Service |
|-------|-----------|-------------|
| Frontend | React.js | S3 + CloudFront |
| Backend | Node.js + Express | Lambda + API Gateway |
| Database | MySQL 8.0 | Amazon RDS |
| CI/CD | GitHub Actions | - |
| Security | IAM + VPC | IAM + VPC + Security Groups |
| Framework | Serverless Framework | - |

---

## Prerequisites

- Node.js v18+
- AWS CLI configured (`aws configure`)
- Serverless Framework (`npm install -g serverless`)
- Git

---

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env    # Fill in your RDS details
npm install
npx serverless offline  # Test locally on port 3001
```

### 3. Setup Frontend
```bash
cd frontend
cp .env.example .env    # Fill in your API Gateway URL
npm install
npm start               # Runs on localhost:3000
```

### 4. Deploy Backend
```bash
cd backend
npx serverless deploy --stage prod
# Note the API Gateway URL from the output
```

### 5. Deploy Frontend
```bash
cd frontend
npm run build
aws s3 sync build/ s3://YOUR-BUCKET-NAME --delete
```

---

## GitHub Secrets Required

Add these in GitHub → Settings → Secrets and Variables → Actions:

| Secret Name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `DB_HOST` | RDS endpoint URL |
| `DB_USER` | Database username (admin) |
| `DB_PASS` | Database password |
| `DB_NAME` | Database name (myapp) |
| `REACT_APP_API_URL` | API Gateway URL |
| `CF_DISTRIBUTION_ID` | CloudFront distribution ID |
| `LAMBDA_SECURITY_GROUP` | Lambda security group ID |
| `PRIVATE_SUBNET_1` | Private subnet 1 ID |
| `PRIVATE_SUBNET_2` | Private subnet 2 ID |

---

## Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── frontend/
│   ├── src/
│   │   ├── App.js              # Main React component
│   │   └── App.css             # Styles
│   ├── .env.example            # Environment template
│   └── package.json
├── backend/
│   ├── handler.js              # Lambda entry point
│   ├── routes/
│   │   ├── users.js            # User CRUD routes
│   │   └── orders.js           # Order routes
│   ├── serverless.yml          # Deployment config
│   ├── .env.example            # Environment template
│   └── package.json
├── database/
│   └── schema.sql              # Database schema
├── .gitignore
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| GET | `/orders` | Get all orders |
| POST | `/orders` | Create order |

---

## Security

- ✅ Lambda runs inside VPC private subnets
- ✅ RDS not publicly accessible - only Lambda can connect
- ✅ IAM roles with least privilege
- ✅ No credentials hardcoded - GitHub Secrets + env vars
- ✅ CloudFront HTTPS only
- ✅ S3 bucket not publicly accessible (served via CloudFront OAC)

---

## Cost Estimate (Free Tier / Low Traffic)

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| Lambda | 1M requests/month | $0/month |
| API Gateway | 1M calls/month | $0/month |
| S3 | 5GB storage | ~$0.01/month |
| CloudFront | 1TB transfer | $0/month |
| RDS (t3.micro) | 750 hours/month | $0/month |
| **Total** | | **~$0-5/month** |

---

## Mentors

- **Departmental Mentor:** Prof. Vishvadeep Nanavati, Assistant Professor, CE
- **Industrial Mentor:** Mr. Niken Wadkar, General Manager, IAMOPS

---

## References

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [Amazon RDS User Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/)
