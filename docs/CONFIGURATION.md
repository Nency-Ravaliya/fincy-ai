# Fincy AI Configuration Guide

This guide provides detailed information about configuring the Fincy AI application.

## Helm Values Configuration

The application is configured through Helm values. The main configuration file is `helm/fincy-ai/values.yaml`.

### Basic Configuration

```yaml
replicaCount: 3

image:
  repository: fincyairegistry.azurecr.io/fincy-ai
  tag: latest
  pullPolicy: Always
```

### SSL/TLS Configuration

```yaml
ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: fincy-ai.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: fincy-ai-tls
      hosts:
        - fincy-ai.example.com
```

### Auto-scaling Configuration

```yaml
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80
```

### Resource Configuration

```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

### Network Policy Configuration

```yaml
networkPolicy:
  enabled: true
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: nginx-ingress
  egress:
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
            except:
              - 169.254.0.0/16
              - 172.16.0.0/12
              - 192.168.0.0/16
```

### Security Configuration

```yaml
podSecurityContext:
  runAsUser: 1000
  runAsGroup: 3000
  fsGroup: 2000
  runAsNonRoot: true

securityContext:
  capabilities:
    drop:
      - ALL
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 1000
```

### Monitoring Configuration

```yaml
monitoring:
  enabled: true
  prometheus:
    enabled: true
    serviceMonitor:
      enabled: true
  grafana:
    enabled: true
    adminPassword: "changeme"
    dashboards:
      enabled: true
      label: grafana_dashboard
```

### Backup Configuration

```yaml
backup:
  enabled: true
  schedule: "0 1 * * *"
  retention: "720h"
  storageAccount: "fincyaibackup"
  containerName: "backups"
```

### Health Probes Configuration

```yaml
probes:
  liveness:
    path: /health
    port: 3000
    initialDelaySeconds: 15
    periodSeconds: 20
  readiness:
    path: /health
    port: 3000
    initialDelaySeconds: 5
    periodSeconds: 10
```

## Environment Variables

The application supports the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Application port | 3000 |
| NODE_ENV | Environment | production |
| LOG_LEVEL | Logging level | info |
| DATABASE_URL | Database connection string | - |
| REDIS_URL | Redis connection string | - |
| RABBITMQ_URL | RabbitMQ connection string | - |

## Customizing Configuration

### Overriding Values

To override default values during installation:

```bash
helm install fincy-ai helm/fincy-ai \
  --set replicaCount=5 \
  --set resources.limits.cpu=1000m \
  --set resources.limits.memory=1Gi
```

### Using Custom Values File

Create a custom values file:

```yaml
# custom-values.yaml
replicaCount: 5
resources:
  limits:
    cpu: 1000m
    memory: 1Gi
```

Install using custom values:

```bash
helm install fincy-ai helm/fincy-ai -f custom-values.yaml
```

## Configuration Best Practices

1. **Resource Limits**:
   - Set appropriate CPU and memory limits based on application requirements
   - Monitor resource usage and adjust limits accordingly

2. **Auto-scaling**:
   - Set minimum replicas based on expected load
   - Configure appropriate CPU and memory thresholds
   - Monitor scaling behavior

3. **Security**:
   - Always use non-root containers
   - Enable network policies
   - Use SSL/TLS for all external communications

4. **Monitoring**:
   - Enable Prometheus metrics collection
   - Configure appropriate alerting rules
   - Set up Grafana dashboards

5. **Backup**:
   - Configure appropriate backup schedules
   - Set retention periods based on business requirements
   - Test backup and restore procedures regularly

## Configuration Validation

To validate your configuration:

```bash
helm lint helm/fincy-ai
helm template fincy-ai helm/fincy-ai --debug
```

## Troubleshooting Configuration Issues

1. **Invalid Values**:
   ```bash
   helm install fincy-ai helm/fincy-ai --dry-run --debug
   ```

2. **Configuration Conflicts**:
   ```bash
   kubectl describe configmap -n fincy-ai
   ```

3. **Environment Variables**:
   ```bash
   kubectl describe pod -n fincy-ai
   ```

For more detailed information about specific components, refer to:
- [MONITORING.md](MONITORING.md)
- [SECURITY.md](SECURITY.md)
- [BACKUP.md](BACKUP.md) 