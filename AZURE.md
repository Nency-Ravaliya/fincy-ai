# Azure DevOps Setup Guide for Fincy AI

This guide explains how to set up Azure DevOps for continuous integration and deployment (CI/CD) of the Fincy AI application.

## Prerequisites
- Azure DevOps account
- Azure subscription
- Azure CLI installed
- Repository pushed to Azure DevOps

## 1. Azure DevOps Project Setup

1. Create a new project in Azure DevOps:
   - Go to https://dev.azure.com
   - Click "New Project"
   - Name: `fincy-ai`
   - Visibility: Private
   - Click "Create"

2. Import repository:
   - Go to Repos
   - Import repository
   - Paste your Git repository URL

## 2. Service Connections Setup

### Azure Container Registry Connection
1. Go to Project Settings > Service connections
2. Click "New service connection"
3. Select "Docker Registry"
4. Choose "Azure Container Registry"
5. Connection name: `ACR`
6. Select your subscription and registry
7. Click "Save"

### Azure Kubernetes Service Connection
1. Go to Project Settings > Service connections
2. Click "New service connection"
3. Select "Kubernetes"
4. Connection name: `aks-connection`
5. Choose "Azure subscription"
6. Select your cluster
7. Click "Save"

### Azure Resource Manager Connection
1. Go to Project Settings > Service connections
2. Click "New service connection"
3. Select "Azure Resource Manager"
4. Connection name: `Azure Subscription`
5. Scope level: `Subscription`
6. Select your subscription
7. Click "Save"

## 3. Pipeline Setup

1. Go to Pipelines
2. Click "New pipeline"
3. Select "Azure Repos Git"
4. Select your repository
5. Choose "Existing Azure Pipelines YAML file"
6. Select `/azure-pipelines.yml`
7. Click "Continue"
8. Click "Run"

## 4. Environment Setup

1. Go to Environments
2. Click "New environment"
3. Name: `production`
4. Choose "Kubernetes"
5. Click "Next"
6. Select your AKS cluster
7. Namespace: `fincy-ai-prod`
8. Click "Create"

## 5. Pipeline Variables

The following variables are used in the pipeline:

```yaml
variables:
  AZURE_RESOURCE_GROUP: 'fincy-ai-rg'
  AZURE_LOCATION: 'eastus'
  ACR_NAME: 'fincyairegistry'
  IMAGE_NAME: 'fincy-ai'
  AKS_CLUSTER_NAME: 'fincy-ai-cluster'
  NAMESPACE: 'fincy-ai-prod'
```

## 6. Pipeline Stages

### Build Stage
- Installs Node.js
- Builds the application
- Creates Docker image
- Pushes to Azure Container Registry

### Deploy Stage
- Creates Kubernetes secrets
- Deploys to AKS
- Verifies deployment

## 7. Monitoring and Logs

1. View build logs:
   - Go to Pipelines
   - Click on the latest run
   - View stage and task logs

2. View deployment status:
   - Go to Environments
   - Select 'production'
   - View deployment history

3. Monitor application:
   - Go to Environments > production
   - View Kubernetes resources
   - Check pod status and logs
   - Access Grafana:
     ```bash
     kubectl port-forward pod/fincy-ai-grafana-<pod-id> 3000:3000 -n fincy-ai-prod
     ```
     - URL: http://localhost:3000
     - Username: admin
     - Password: FincyAI@2025
   - Access Prometheus:
     ```bash
     kubectl port-forward svc/fincy-ai-prometheus-server 9090:9090 -n fincy-ai-prod
     ```
     - URL: http://localhost:9090

## 8. Troubleshooting

### Common Issues

1. Pipeline Authentication:
```bash
# Check service principal permissions
az role assignment list --assignee <service-principal-id>

# Add contributor role if needed
az role assignment create --assignee <service-principal-id> --role Contributor --scope /subscriptions/<subscription-id>
```

2. Image Pull Errors:
```bash
# Verify ACR credentials
az acr credential show --name $ACR_NAME

# Check AKS-ACR integration
az aks check-acr --name $AKS_CLUSTER_NAME --resource-group $AZURE_RESOURCE_GROUP --acr $ACR_NAME.azurecr.io
```

3. Deployment Issues:
```bash
# Check pod status
kubectl get pods -n $NAMESPACE

# View pod logs
kubectl logs <pod-name> -n $NAMESPACE

# Describe pod for events
kubectl describe pod <pod-name> -n $NAMESPACE
```

## 9. Security Best Practices

1. **Secrets Management**:
   - Use Azure Key Vault for sensitive data
   - Never commit secrets to source control
   - Rotate credentials regularly

2. **Access Control**:
   - Use Role-Based Access Control (RBAC)
   - Implement least privilege principle
   - Regular access reviews

3. **Network Security**:
   - Enable network policies
   - Use private endpoints where possible
   - Implement proper firewall rules

## 10. Maintenance

1. **Regular Updates**:
```bash
# Update AKS cluster
az aks upgrade --resource-group $AZURE_RESOURCE_GROUP --name $AKS_CLUSTER_NAME --kubernetes-version <version>

# Update node pools
az aks nodepool upgrade --resource-group $AZURE_RESOURCE_GROUP --cluster-name $AKS_CLUSTER_NAME --name nodepool1 --kubernetes-version <version>
```

2. **Backup and Recovery**:
   - Enable AKS backup
   - Regular disaster recovery drills
   - Document recovery procedures

3. **Monitoring**:
   - Set up Azure Monitor
   - Configure alerts
   - Regular performance reviews 