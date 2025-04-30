# Fincy AI - Kubernetes Setup Guide

This guide provides step-by-step instructions for deploying the Fincy AI application to Azure Kubernetes Service (AKS).

## Prerequisites
- Azure CLI installed
- Docker installed
- kubectl installed
- Node.js and npm installed

## 1. Azure Login and Setup
```bash
# Login to Azure
az login

# Create Resource Group
az group create --name fincy-ai-rg --location eastus
```

## 2. Azure Container Registry (ACR) Setup
```bash
# Create ACR
az acr create --resource-group fincy-ai-rg --name fincyairegistry --sku Basic

# Enable Admin Access
az acr update -n fincyairegistry --admin-enabled true

# Login to ACR
az acr login --name fincyairegistry
```

## 3. Build and Push Docker Image
```bash
# Build Docker Image for AMD64 Platform
docker buildx create --use
docker buildx build --platform linux/amd64 -t fincyairegistry.azurecr.io/fincy-ai:latest --push .
```

## 4. Azure Kubernetes Service (AKS) Setup
```bash
# Create AKS Cluster
az aks create --resource-group fincy-ai-rg \
              --name fincy-ai-cluster \
              --node-count 3 \
              --enable-managed-identity \
              --generate-ssh-keys

# Get AKS Credentials
az aks get-credentials --resource-group fincy-ai-rg --name fincy-ai-cluster

# Connect AKS to ACR
az aks update -n fincy-ai-cluster -g fincy-ai-rg --attach-acr fincyairegistry
```

## 5. Kubernetes Deployment Setup

### Create Namespace
```bash
kubectl create namespace fincy-ai-prod
```

### Create ACR Pull Secret
```bash
kubectl create secret docker-registry acr-auth \
        --docker-server=fincyairegistry.azurecr.io \
        --docker-username=fincyairegistry \
        --docker-password=$(az acr credential show --name fincyairegistry --query "passwords[0].value" -o tsv) \
        --docker-email=nensi.ravaliya@studentambassadors.com \
        -n fincy-ai-prod
```

### Deploy Application
```bash
# Apply Kubernetes Configuration
kubectl apply -f k8s/deployment.yaml

# Verify Deployment
kubectl get all -n fincy-ai-prod
```

## 6. Kubernetes Configuration Files

### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fincy-ai
  namespace: fincy-ai-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fincy-ai
  template:
    metadata:
      labels:
        app: fincy-ai
    spec:
      imagePullSecrets:
      - name: acr-auth
      containers:
      - name: fincy-ai
        image: fincyairegistry.azurecr.io/fincy-ai:latest
        ports:
        - containerPort: 3000
        env:
        - name: PORT
          value: "3000"
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: fincy-ai-service
  namespace: fincy-ai-prod
spec:
  selector:
    app: fincy-ai
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## 7. Useful Commands

### Monitoring
```bash
# Get all resources
kubectl get all -n fincy-ai-prod

# Get pod logs
kubectl logs -n fincy-ai-prod <pod-name>

# Describe pod details
kubectl describe pod -n fincy-ai-prod <pod-name>
```

### Troubleshooting
```bash
# Delete all pods (they will be recreated)
kubectl delete pods --all -n fincy-ai-prod

# Delete deployment and service
kubectl delete -f k8s/deployment.yaml

# Get detailed pod information
kubectl describe pod -n fincy-ai-prod
```

### Scaling
```bash
# Scale deployment manually
kubectl scale deployment fincy-ai -n fincy-ai-prod --replicas=5
```

## 8. Cleanup
```bash
# Delete the entire namespace
kubectl delete namespace fincy-ai-prod

# Delete AKS cluster
az aks delete --resource-group fincy-ai-rg --name fincy-ai-cluster --yes

# Delete ACR
az acr delete --resource-group fincy-ai-rg --name fincyairegistry --yes

# Delete resource group
az group delete --name fincy-ai-rg --yes
```

## 9. Accessing the Application and Monitoring

### Accessing the Application
```bash
# Get the external IP of the application
kubectl get svc fincy-ai-service -n fincy-ai-prod

# Access the application using the external IP
# Example: http://<external-ip>
```

### Accessing Grafana
```bash
# Port-forward Grafana to local machine
kubectl port-forward pod/fincy-ai-grafana-<pod-id> 3000:3000 -n fincy-ai-prod

# Access Grafana at:
# URL: http://localhost:3000
# Username: admin
# Password: FincyAI@2025
```

### Accessing Prometheus
```bash
# Port-forward Prometheus to local machine
kubectl port-forward svc/fincy-ai-prometheus-server 9090:9090 -n fincy-ai-prod

# Access Prometheus at:
# URL: http://localhost:9090
``` 