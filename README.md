# AWS CI/CD Automated Deployment Architecture

This repository contains a full-stack multi-tier application (Node.js/Express frontend and Python/Flask backend) deployed on an Amazon EC2 instance. The infrastructure utilizes Jenkins and GitHub Webhooks to achieve a fully automated Continuous Integration and Continuous Deployment (CI/CD) pipeline, ensuring zero-downtime updates managed by PM2.

## 🏗️ Architecture Overview

The deployment architecture is designed for continuous delivery, segregating the build and execution environments on a single AWS EC2 instance.

* **Frontend Layer:** A Node.js application serving the user interface on port `3000`.
* **Backend Layer:** A Python Flask REST API processing business logic on port `5000`.
* **Automation Server:** Jenkins running on port `8080`, configured with explicit pipeline definitions (`Jenkinsfile`) mapped directly to Source Control Management (SCM).
* **Process Management:** PM2 daemonizes both applications, ensuring they restart automatically upon server reboot or code updates.

### System Architecture Diagram

```text
+-----------------+       +------------------------------------+
|                 |       |                                    |
|   Developer     | ----> |   GitHub Repository                |
|  (Local IDE)    | Push  |  (aws-jenkins-automated-deployment)|
|                 |       |   Branch: master                   |
+-----------------+       +------------------------------------+
                                      |
                                      | (JSON Payload / push event)
                                      v
+-----------------------------------------------------------------------+
|                       AWS EC2 Instance (Ubuntu Linux)                 |
|                                                                       |
|  +-------------------------+          +----------------------------+  |
|  |   Jenkins (Port 8080)   |          |      PM2 Process Manager   |  |
|  |                         |          |                            |  |
|  | 1. Receives Webhook     | =======> |  +----------------------+  |  |
|  | 2. Clones Repository    | Executes |  | Node.js Frontend     |  |  |
|  | 3. Parses Jenkinsfile   | Scripts  |  | (Port 3000)          |  |  |
|  | 4. Installs Packages    |          |  +----------------------+  |  |
|  +-------------------------+          |                            |  |
|                                       |  +----------------------+  |  |
|                                       |  | Python/Flask Backend |  |  |
|                                       |  | (Port 5000)          |  |  |
|                                       |  +----------------------+  |  |
|                                       +----------------------------+  |
+-----------------------------------------------------------------------+
                                      |
                                      v
                             +------------------+
                             |   End Users      |
                             | (HTTP Requests)  |
                             +------------------+

```

## ⚙️ CI/CD Pipeline Setup

The continuous integration and deployment workflow is established using Jenkins and GitHub Webhooks. The setup ensures that any code committed to the `master` branch is immediately reflected in the live production environment.

### 1. GitHub Webhook Configuration

A webhook is configured within the GitHub repository settings targeting the Jenkins server URL: `http://<EC2-IP>:8080/github-webhook/`.

* **Content type:** `application/json`
* **Trigger:** Configured to push on `Just the push event`.

### 2. Jenkins Pipeline Configuration (SCM)

Two distinct Jenkins pipelines (`Express-Frontend-Pipeline` and `Flask-Backend-Pipeline`) were created to handle the distinct lifecycle requirements of each application tier.

* **Definition:** Configured as `Pipeline script from SCM`.
* **SCM Provider:** Git.
* **Branch Specifier:** `*/master`.
* **Script Path:** Explicitly points to the respective `Jenkinsfile-express` and `Jenkinsfile-flask` located in the repository root.
* **Build Triggers:** `GitHub hook trigger for GITScm polling` is enabled to listen for incoming webhook payloads.

## 🚀 Automated Deployment Process

When a developer pushes a commit to the `master` branch, the following automated sequence executes without manual intervention:

1. **Event Trigger:** GitHub dispatches a webhook payload to the EC2 Jenkins server.
2. **Repository Checkout:** Jenkins identifies the repository mapping, connects via Git SCM, and pulls the latest source code into the Jenkins workspace.
3. **Pipeline Initialization:** Jenkins reads the `Jenkinsfile` (Declarative Pipeline) corresponding to the triggered job.
4. **Dependency Resolution:**
* *Backend:* The pipeline navigates to the `/backend` directory, activates the Python virtual environment (`venv`), and runs `pip install -r requirements.txt`.
* *Frontend:* The pipeline navigates to the `/frontend` directory and executes `npm install` to update `node_modules`.


5. **Application Restart:** Jenkins executes PM2 commands (`pm2 restart <app-name>`) to hot-reload the updated application code without dropping the active server process.

## 🌐 Infrastructure & Network Configuration

The application requires specific inbound network rules to function correctly. The AWS EC2 Security Group is configured to allow inbound traffic from `Anywhere (0.0.0.0/0)` on the following ports:

* **Port 22 (SSH):** For administrative server access.
* **Port 8080 (TCP):** Exposes the Jenkins dashboard and webhook listener.
* **Port 3000 (TCP):** Exposes the Node.js Express user interface.
* **Port 5000 (TCP):** Exposes the Python Flask REST API endpoints.