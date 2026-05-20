# Cloud-Native E-Commerce Deployment Platform

A production-style cloud-native deployment of a Spring Boot e-commerce application using Docker, Docker Compose, Nginx reverse proxy, PostgreSQL, HTTPS SSL, and GitHub Actions CI/CD on a GCP VM.

---

# Project Overview

This project demonstrates how to deploy and operate a containerized Spring Boot application in a production-like environment.

The system includes:

- Dockerized Spring Boot application
- PostgreSQL persistent database
- Nginx reverse proxy
- HTTPS SSL using Let's Encrypt
- GitHub Actions CI/CD pipeline
- Automated deployment to GCP VM
- Monitoring and logging
- Database backup strategy
- Rollback deployment strategy

The goal of this project is to practice real-world DevOps, Cloud, and Cloud-Native deployment workflows.

---

# Tech Stack

## Backend
- Spring Boot
- Spring Data JPA
- PostgreSQL

## DevOps & Cloud
- Docker
- Docker Compose
- Nginx
- GitHub Actions
- Docker Hub
- GCP VM (Ubuntu Linux)
- DuckDNS
- Let's Encrypt SSL

## Monitoring & Operations
- Portainer
- Docker Healthcheck
- Docker Logging
- PostgreSQL Backup Cronjob

---

# Features

- HTTPS SSL with Let's Encrypt
- Reverse Proxy using Nginx
- Dockerized multi-container deployment
- GitHub Actions CI/CD pipeline
- Automatic deployment to GCP VM
- PostgreSQL persistent storage
- Docker healthcheck
- Docker restart policy
- Docker log rotation
- Database backup with cronjob
- Rollback deployment strategy
- Container monitoring with Portainer
- Production-style Linux deployment

---

# System Architecture

## Architecture Diagram

![Architecture](./docs/architecture.png)

---

# Request Flow

```text
User Browser
      ↓
DuckDNS Domain
      ↓
HTTPS SSL (Let's Encrypt)
      ↓
Nginx Reverse Proxy Container
      ↓
Spring Boot Application Container
      ↓
PostgreSQL Container
      ↓
Docker Volume (Persistent Storage)
```

---

# CI/CD Flow

```text
Developer Push Code
      ↓
GitHub Repository
      ↓
GitHub Actions
      ↓
Build JAR
      ↓
Build Docker Image
      ↓
Push Docker Hub
      ↓
SSH Deploy to GCP VM
      ↓
Docker Compose Up
```

---

# Project Structure

```text
shopquanao/
│
├── backend/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── nginx/
│   └── nginx.conf
│
├── docs/
│   └── architecture.png
│
├── docker-compose.yml
├── .env
├── backup.sh
└── README.md
```

---

# Docker Containers

| Container | Purpose |
|---|---|
| Nginx | Reverse Proxy + HTTPS |
| Spring Boot App | Backend Application |
| PostgreSQL | Database |
| Portainer | Container Monitoring |

---

# Environment Variables

Example `.env` file:

```env
POSTGRES_DB=shop
POSTGRES_USER=shop_user
POSTGRES_PASSWORD=StrongPassword123@
```

---

# Deployment Guide

## Clone Repository

```bash
git clone https://github.com/your-username/shopquanao.git
cd shopquanao
```

---

## Start Containers

```bash
docker compose up -d
```

---

## View Running Containers

```bash
docker ps
```

---

## View Logs

```bash
docker logs -f container_name
```

---

# HTTPS SSL

HTTPS SSL is configured using:

- Nginx Reverse Proxy
- Let's Encrypt
- DuckDNS Domain

Example:

```text
https://your-domain.duckdns.org
```

---

# Docker Healthcheck

Example healthcheck configuration:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
  interval: 30s
  timeout: 10s
  retries: 5
```

---

# Restart Policy

```yaml
restart: unless-stopped
```

This ensures containers automatically restart after server reboot or container failure.

---

# Persistent Storage

PostgreSQL data is stored using Docker Volumes to prevent data loss.

Example:

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

---

# Backup Strategy

Database backup is automated using cronjob.

Example backup script:

```bash
#!/bin/bash

DATE=$(date +%Y-%m-%d_%H-%M-%S)

docker exec postgres_container \
pg_dump -U shop_user shop \
> /backup/shop_$DATE.sql
```

---

# Rollback Deployment

If deployment fails, rollback can be performed using a previous Docker image version.

Example:

```bash
docker tag old_version phan2uan/shopquanao:latest

docker compose up -d
```

---

# Monitoring

Basic monitoring includes:

- Portainer
- Docker logs
- Healthcheck
- CPU/RAM monitoring
- Container status monitoring

Useful commands:

```bash
docker stats
```

```bash
docker logs -f container_name
```

---

# Linux Operations

Useful Linux commands used in this project:

```bash
df -h
```

```bash
htop
```

```bash
journalctl
```

```bash
systemctl
```

```bash
netstat -tulpn
```

---

# Security Improvements

Production security improvements include:

- HTTPS SSL
- Reverse Proxy
- Private PostgreSQL network
- Environment variable management
- Non-public database port
- Docker internal networking

---

# CI/CD Pipeline

GitHub Actions is used for:

- Build automation
- Docker image build
- Push Docker image to Docker Hub
- Auto deployment to GCP VM

Example workflow:

```text
Push Code
   ↓
GitHub Actions
   ↓
Build Docker Image
   ↓
Push Docker Hub
   ↓
SSH Deploy
   ↓
Docker Compose Restart
```

---

# Future Improvements

Planned future improvements:

- Kubernetes deployment
- Prometheus monitoring
- Grafana dashboard
- Redis cache
- Terraform infrastructure
- Multi-service architecture
- Cloud Load Balancer

---

# Learning Outcomes

This project helped practice:

- Docker & Docker Compose
- Linux server operations
- Reverse proxy architecture
- HTTPS SSL configuration
- Cloud VM deployment
- CI/CD automation
- PostgreSQL persistence
- Production troubleshooting
- Monitoring & logging
- Cloud-Native deployment concepts

---

# Screenshots

## Application

Add application screenshot here.

```text
/docs/app.png
```

---

## Portainer Dashboard

Add Portainer screenshot here.

```text
/docs/portainer.png
```

---

## GitHub Actions CI/CD

Add CI/CD screenshot here.

```text
/docs/github-actions.png
```

---

# Author

Phan Quan

DevOps / Cloud / Platform Engineering Learning Project

---
