# Fincy AI Setup Guide

This guide provides detailed instructions for setting up the Fincy AI application in a Kubernetes environment.

## Prerequisites

### Required Tools

- Kubernetes cluster (AKS recommended)
- Helm 3.x
- Azure CLI
- kubectl
- Docker

### Required Azure Resources

- Azure Container Registry (ACR)
- Azure Kubernetes Service (AKS)
- Azure Storage Account (for backups)
- Azure Key Vault (for secrets management)

## Cluster Setup

1. Create an AKS cluster:
   ```bash
   az aks create \
     --resource-group fincy-ai-rg \
     --name fincy-ai-cluster \
     --node-count 3 \
     --enable-managed-identity \
     --enable-addons monitoring \
     --generate-ssh-keys
   ```

2. Get cluster credentials:
   ```bash
   az aks get-credentials --resource-group fincy-ai-rg --name fincy-ai-cluster
   ```

## Application Deployment

1. Create a namespace:
   ```bash
   kubectl create namespace fincy-ai
   ```

2. Install cert-manager:
   ```bash
   helm repo add jetstack https://charts.jetstack.io
   helm repo update
   helm install cert-manager jetstack/cert-manager \
     --namespace cert-manager \
     --create-namespace \
     --version v1.13.0 \
     --set installCRDs=true
   ```

3. Install Prometheus and Grafana:
   ```bash
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm repo add grafana https://grafana.github.io/helm-charts
   helm repo update
   ```

4. Deploy Fincy AI:
   ```bash
   helm install fincy-ai helm/fincy-ai \
     --namespace fincy-ai \
     --set image.repository=fincyairegistry.azurecr.io/fincy-ai \
     --set ingress.hosts[0].host=fincy-ai.example.com \
     --set backup.storageAccount=fincyaibackup
   ```

## Post-Deployment Steps

1. Verify deployment:
   ```bash
   kubectl get all -n fincy-ai
   ```

2. Check ingress:
   ```bash
   kubectl get ingress -n fincy-ai
   ```

3. Verify SSL certificate:
   ```bash
   kubectl get certificate -n fincy-ai
   ```

## Configuration

### Environment Variables

Key environment variables can be configured in the Helm values:

```yaml
env:
  - name: PORT
    value: "3000"
  - name: NODE_ENV
    value: "production"
```

### Resource Configuration

Resource limits and requests can be adjusted:

```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

### Auto-scaling

Auto-scaling parameters can be configured:

```yaml
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80
```

## Troubleshooting

Common issues and solutions:

1. **Certificate Issues**:
   ```bash
   kubectl describe certificate -n fincy-ai
   kubectl describe order -n fincy-ai
   ```

2. **Pod Issues**:
   ```bash
   kubectl describe pod -n fincy-ai
   kubectl logs -n fincy-ai <pod-name>
   ```

3. **Ingress Issues**:
   ```bash
   kubectl describe ingress -n fincy-ai
   ```

## Next Steps

After successful deployment:
1. Configure monitoring dashboards in Grafana
2. Set up backup schedules
3. Configure network policies
4. Set up CI/CD pipelines

For more detailed information, refer to the specific documentation files:
- [CONFIGURATION.md](CONFIGURATION.md)
- [MONITORING.md](MONITORING.md)
- [SECURITY.md](SECURITY.md)
- [BACKUP.md](BACKUP.md) 