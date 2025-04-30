# Fincy AI Kubernetes Implementation Testing Guide

## Prerequisites
1. Azure CLI installed and logged in
2. kubectl configured with your AKS cluster
3. Helm installed
4. Access to Azure Container Registry

## 1. Deploy the Application
```bash
# Add the Helm repository
helm repo add fincy-ai https://charts.fincy-ai.com

# Install the chart
helm install fincy-ai helm/fincy-ai -n fincy-ai --create-namespace
```

## 2. Verify Basic Configuration
```bash
# Check pods
kubectl get pods -n fincy-ai

# Verify replicas
kubectl get deployment fincy-ai -n fincy-ai

# Check service
kubectl get svc -n fincy-ai
```

## 3. Test Security Features
```bash
# Verify SSL/TLS
kubectl get certificate -n fincy-ai

# Check network policies
kubectl get networkpolicy -n fincy-ai

# Verify security context
kubectl describe pod <pod-name> -n fincy-ai | grep -A 10 "Security Context"
```

## 4. Test Scaling
```bash
# Test HPA
kubectl get hpa -n fincy-ai

# Generate load to test autoscaling
kubectl run -i --tty load-generator --rm --image=busybox --restart=Never -n fincy-ai -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://fincy-ai; done"
```

## 5. Verify Monitoring
```bash
# Check Prometheus
kubectl get pods -n monitoring | grep prometheus

# Access Grafana
kubectl port-forward svc/grafana 3000:3000 -n monitoring
# Open http://localhost:3000 in browser
# Default credentials: admin/changeme
```

## 6. Test High Availability
```bash
# Check pod distribution
kubectl get pods -n fincy-ai -o wide

# Test pod disruption budget
kubectl get pdb -n fincy-ai
```

## 7. Verify Backup
```bash
# Check backup cronjob
kubectl get cronjob -n fincy-ai

# Manually trigger backup
kubectl create job --from=cronjob/backup backup-test -n fincy-ai
```

## 8. Test Health Probes
```bash
# Check pod health
kubectl describe pod <pod-name> -n fincy-ai | grep -A 10 "Liveness"
kubectl describe pod <pod-name> -n fincy-ai | grep -A 10 "Readiness"

# Simulate health check failure
kubectl exec -it <pod-name> -n fincy-ai -- curl http://localhost:3000/health
```

## 9. Verify Storage
```bash
# Check PVC
kubectl get pvc -n fincy-ai

# Verify storage class
kubectl get storageclass
```

## 10. Test Environment Variables
```bash
# Check environment variables
kubectl exec -it <pod-name> -n fincy-ai -- env | grep -E "PORT|NODE_ENV"
```

## 11. Verify Service Account
```bash
# Check service account
kubectl get serviceaccount -n fincy-ai

# Verify RBAC
kubectl get role,rolebinding -n fincy-ai
```

## 12. Test Monitoring Integration
```bash
# Check Prometheus metrics
kubectl port-forward svc/prometheus-server 9090:9090 -n monitoring
# Open http://localhost:9090 in browser
# Query: container_cpu_usage_seconds_total{namespace="fincy-ai"}
```

## Expected Results
1. All pods should be in Running state
2. SSL/TLS certificates should be valid
3. Network policies should be enforced
4. HPA should scale pods based on load
5. Monitoring dashboards should show metrics
6. Backups should be created successfully
7. Health probes should respond correctly
8. Storage should be properly mounted
9. Environment variables should be set
10. Service account should have correct permissions
11. Monitoring metrics should be collected

## Troubleshooting
If any test fails:
1. Check logs: `kubectl logs <pod-name> -n fincy-ai`
2. Describe resources: `kubectl describe <resource-type> <resource-name> -n fincy-ai`
3. Check events: `kubectl get events -n fincy-ai`
4. Verify configurations: `kubectl get configmap -n fincy-ai`

## Cleanup
```bash
# Uninstall the release
helm uninstall fincy-ai -n fincy-ai

# Delete namespace
kubectl delete namespace fincy-ai
``` 