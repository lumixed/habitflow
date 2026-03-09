# HabitFlow AWS Deployment Guide (Terraform + Supabase)

This project uses **AWS ECS Fargate** for production hosting, providing a highly available, scalable, and serverless container environment. **Supabase** is used for the managed PostgreSQL database.

## 1. Prerequisites

- **AWS CLI**: Configured with credentials.
- **Terraform**: Installed on your local machine.
- **Supabase Account**: A new project created, and the "Connection String" (Transaction mode, port 6543) copied.
- **ECR/Docker Hub**: You need your `habitflow-backend` and `habitflow-frontend` images pushed to a container registry.

## 2. Infrastructure Overview

The Terraform configuration in `terraform/` sets up:
1.  **VPC**: Public and Private subnets across two Availability Zones.
2.  **ALB (Application Load Balancer)**: Handles incoming traffic on port 80.
    - Path `/api/*` routes to the **Backend Service**.
    - All other paths (`/*`) route to the **Frontend Service**.
3.  **ECS Fargate Cluster**: Runs the containers in private subnets for security.
4.  **Security Groups**: Only allows traffic from the ALB to the ECS tasks.
5.  **CloudWatch Logs**: Centralized logging for both services.

## 3. Deployment Steps

### Step A: Initialize Terraform
```bash
cd terraform
terraform init
```

### Step B: Create a `terraform.tfvars` file
Create a file named `terraform.tfvars` (do NOT commit this file) with your variables:
```hcl
supabase_database_url = "postgresql://postgres:your_password@db.xxxx.supabase.co:6543/postgres"
backend_image         = "your-username/habitflow-backend:latest"
frontend_image        = "your-username/habitflow-frontend:latest"
aws_region            = "us-east-1"
```

### Step C: Plan and Apply
```bash
terraform plan
terraform apply
```

## 4. Connecting Supabase

Ensure that your `DATABASE_URL` uses the **transaction pooling** connection string from Supabase (usually ends in `:5432` or `:6543` depending on your setup). 

### Security Note
For production, you should ideally add your AWS VPC's NAT Gateway IP to the Supabase database's allowed IP addresses (Network Restrictions) to further secure the connection.

## 5. Cleaning Up
To avoid charges when not using the environment:
```bash
terraform destroy
```

---

**Technical Highlight for Hire**: 
*"I implemented a zero-infrastructure-management stack using AWS Fargate. By separating the containers into private subnets and using an ALB for traffic routing, I ensured a highly secure network perimeter. I also decoupled the state layer by utilizing Supabase, allowing for easy database scaling and management outside of the container lifecycle."*
