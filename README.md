# HabitFlow
**A Production-Grade Full-Stack Habit Tracking and Accountability Platform**

HabitFlow is a high-performance, containerized web application designed to help users build consistency through gamification, social interaction, and automated data synchronization. Built with a focus on scalability, type-safety, and automated infrastructure, this project serves as a comprehensive demonstration of modern full-stack engineering and DevOps best practices.

---

## Core Technology Stack

### Frontend
*   **Next.js 14 (App Router)**: Utilizing server components and optimized routing for high-performance rendering.
*   **React 18 and TypeScript**: Ensuring strict type-safety across the entire UI component library.
*   **Tailwind CSS**: Implementing a custom design system with built-in theme support (Pastel, Cyberpunk, Classic).
*   **TanStack Query (React Query)**: Managing asynchronous state and local caching for a snappy user experience.
*   **Framer Motion**: Powering fluid, high-frame-rate micro-animations for enhanced user engagement.

### Backend
*   **Node.js and Express**: A modular, service-oriented architecture designed for easy horizontal scaling.
*   **Prisma ORM**: Type-safe database access with automated schema management and synchronization.
*   **PostgreSQL**: Relational data storage utilizing advanced indexing (GIN, BTREE) for performant queries.
*   **JWT and AuthJS**: Multi-stage authentication including Two-Factor Authentication (2FA) support.
*   **Stripe SDK**: Modular infrastructure for handling recurring billing and payment cycles.

---

## DevOps and Orchestration

HabitFlow is engineered with a "Deployment-First" mindset, utilizing industry-standard tools to ensure reliability and consistency across environments.

*   **Docker and Docker Compose**: Full containerization of Frontend, Backend, and Database services for "Run Anywhere" reproducibility.
*   **Infrastructure as Code (Terraform)**: Automated provisioning of AWS resources (VPC, ECS Fargate, ALB, CloudWatch) ensuring deterministic infrastructure.
*   **CI/CD (Jenkins)**: Orchestrated pipeline logic defined in `Jenkinsfile`, handling automated linting, multi-arch builds, and registry deployment.
*   **Cloud Architecture**: Optimized for AWS ECS Fargate, utilizing an Application Load Balancer (ALB) for intelligent request routing and private subnets for enhanced security.
*   **Database Management**: Integrated with Supabase (Managed Postgres) using transaction-mode pooling to handle high-concurrency connections.

---

## Features and Technical Highlights

*   **OAuth2 Integration (Handshake Ready)**: Built-in service layer for Google Calendar and Strava, allowing users to sync their real-world activities to digital habits.
*   **Gamification Engine**: Complex level/XP logic that scales rewards based on habit difficulty and streak consistency.
*   **PWA (Progressive Web App)**: Service workers and manifest configurations allow for a native-like installation on iOS and Android.
*   **Analytics Engine**: Personalized insights and success probability metrics derived from historical completion data.
*   **Data Portability**: Full JSON/CSV export functionality, ensuring users maintain ownership of their personal data.

---

## Getting Started

HabitFlow is fully containerized for local development.

### 1. Clone and Setup
```bash
git clone https://github.com/lumixed/habitflow.git
cd habitflow
```

### 2. Launch Environment
```bash
docker compose up --build
```
*   **Frontend**: http://localhost:3000
*   **Backend API**: http://localhost:3001

### 3. Database Sync
```bash
docker compose exec backend npx prisma db push
```

---

## Documentation
*   [AWS Deployment Guide (Terraform)](./DEPLOYMENT_AWS.md)
*   [DevOps and CI/CD Pipeline Logic](./DEVOPS.md)

---

## Note to Hiring Managers
This project was built to demonstrate proficiency in moving beyond simple "code" and into System Design. It showcases my ability to handle:
*   **Multi-service orchestration** (Docker).
*   **Automated Infrastructure** (Terraform/AWS).
*   **API Design** (RESTful architecture).
*   **Security** (Private VPC networking, JWT, 2FA).
*   **Modern Frontend Optimization** (PWA, Next.js Server Components).

---
*Licensed under the MIT License.*
