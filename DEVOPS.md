# HabitFlow DevOps & CI/CD Guide

This guide describes how to implement a high-level, production-grade CI/CD pipeline using **Bitbucket** and **Jenkins**, designed to stand out to hiring managers.

## 1. Pipeline Overview

The goal is to automate the following workflow:
1.  **Code Push**: A developer pushes to a Bitbucket repository.
2.  **Trigger**: Bitbucket kicks off a Jenkins build.
3.  **CI Process**: Jenkins runs linting, unit tests, and builds Docker images.
4.  **Feedback**: Jenkins updates the Bitbucket commit status (✓ or ✗).

## 2. Server-Side Git Hook (Self-Hosted Bitbucket)

If you are using a self-hosted Bitbucket Server (or an on-premise Git server), you would use a **post-receive hook**. This is a script located in:
`<repo-path>/hooks/post-receive`.

### Example Hook Script (`post-receive`)
```bash
#!/bin/bash
# Trigger Jenkins Job via API
JENKINS_URL="http://your-jenkins-instance.com/job/habitflow/build?token=YOUR_API_TOKEN"
USER="jenkins_user"
API_TOKEN="your_jenkins_api_key_or_crumb"

curl -X POST -u "$USER:$API_TOKEN" "$JENKINS_URL"
echo "✅ Jenkins build triggered!"
```

---

## 3. Jenkins Configuration

### Essential Plugins
In your Jenkins instance, you will need the following plugins installed:
-   **Docker Pipeline**: For building and pushing Docker images.
-   **Bitbucket Build Status Notifier**: Allows Jenkins to talk back to Bitbucket.
-   **Pipeline**: The core Jenkins engine.

### Pipeline as Code (`Jenkinsfile`)
The `Jenkinsfile` (already created in the project root) defines the logic. It includes:
-   **Parallel Stages**: We install and lint both frontend and backend at the same time to speed up the build.
-   **Docker Build**: Creates images tagged with the build number.
-   **Credential Management**: Uses Jenkins Credentials for the Docker Hub login.

---

## 4. Reporting Status to Bitbucket

We use the `bitbucketStatusNotify` step in the `post` block of the `Jenkinsfile`.

### How to set up the connection:
1.  **Bitbucket Settings**:
    -   Go to **Repository Settings** -> **Webhooks**.
    -   URL: `http://<jenkins-url>/bitbucket-hook/`
2.  **Jenkins Credentials**:
    -   Add your Bitbucket credentials (Username/App Password) to Jenkins with ID `bitbucket-credentials`.
3.  **Feedback Loop**:
    -   Jenkins will automatically update the Build status icon in Bitbucket next to each commit.

---

## 5. Local Simulation
To test the pipeline locally during development, you can run:
```bash
# Lint the backend
cd backend && npm run lint

# Lint the frontend
cd frontend && npm run lint

# Build the images (simulates the 'Docker Build' stage)
docker compose build
```

---

## Architecture Diagram

Developer → **Push to Bitbucket** 
               ↓ (Post-Receive Hook / Webhook)
Jenkins → **Pulls Code** → **Runs Tests** → **Builds Docker**
               ↓ (Reporting back)
**Bitbucket UI** (Shows Build Passed/Failed icon)

---

**Note to Interviewer:** 
This setup demonstrates proficiency in "Pipeline-as-Code", containerization (Docker), security (credential injection), and CI/CD feedback loops. It solves the "black hole" problem where developers don't know if their pushed code is broken until someone manually checks it.
