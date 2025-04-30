# Fincy AI Monitoring Guide

This guide provides detailed information about monitoring the Fincy AI application using Prometheus and Grafana.

## Monitoring Architecture

The monitoring stack consists of:
- Prometheus for metrics collection
- Grafana for visualization
- Alertmanager for alerting
- ServiceMonitors for automatic service discovery

## Prometheus Configuration

### Service Monitor

The application includes a ServiceMonitor for automatic metrics collection:

```yaml
monitoring:
  prometheus:
    serviceMonitor:
      enabled: true
      interval: 30s
      scrapeTimeout: 10s
      path: /metrics
      port: http
```

### Key Metrics

The application exposes the following metrics:

1. **Application Metrics**:
   - `http_requests_total`
   - `http_request_duration_seconds`
   - `http_requests_in_flight`
   - `process_cpu_seconds_total`
   - `process_resident_memory_bytes`

2. **Business Metrics**:
   - `fincy_ai_processed_transactions_total`
   - `fincy_ai_prediction_accuracy`
   - `fincy_ai_processing_duration_seconds`

3. **System Metrics**:
   - `container_cpu_usage_seconds_total`
   - `container_memory_usage_bytes`
   - `kube_pod_status_phase`

## Grafana Configuration

### Default Dashboards

The application includes the following default dashboards:

1. **Application Overview**:
   - Request rates
   - Error rates
   - Response times
   - Resource usage

2. **Business Metrics**:
   - Transaction processing
   - Prediction accuracy
   - Processing duration

3. **System Health**:
   - Pod status
   - Resource utilization
   - Network traffic

### Accessing Grafana

1. Get the Grafana URL:
   ```bash
   kubectl get svc -n fincy-ai grafana
   ```

2. Get the admin password:
   ```bash
   kubectl get secret -n fincy-ai grafana -o jsonpath="{.data.admin-password}" | base64 --decode
   ```

## Alerting Configuration

### Alert Rules

The application includes the following alert rules:

```yaml
groups:
  - name: fincy-ai
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: Error rate is above 10% for 5 minutes

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High latency detected
          description: 95th percentile latency is above 1 second

      - alert: HighCPUUsage
        expr: rate(process_cpu_seconds_total[5m]) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High CPU usage
          description: CPU usage is above 80%
```

### Alertmanager Configuration

```yaml
alertmanager:
  config:
    global:
      resolve_timeout: 5m
    route:
      group_by: ['alertname']
      group_wait: 30s
      group_interval: 5m
      repeat_interval: 4h
      receiver: 'slack'
    receivers:
    - name: 'slack'
      slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'
        channel: '#alerts'
```

## Customizing Monitoring

### Adding Custom Metrics

1. Add metrics to your application code:
   ```javascript
   const prometheus = require('prom-client');
   
   const httpRequestsTotal = new prometheus.Counter({
     name: 'http_requests_total',
     help: 'Total number of HTTP requests',
     labelNames: ['method', 'status']
   });
   ```

2. Expose metrics endpoint:
   ```javascript
   app.get('/metrics', async (req, res) => {
     res.set('Content-Type', prometheus.register.contentType);
     res.end(await prometheus.register.metrics());
   });
   ```

### Creating Custom Dashboards

1. Access Grafana UI
2. Create new dashboard
3. Add panels with Prometheus queries
4. Save dashboard

Example Prometheus queries:
```
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

## Monitoring Best Practices

1. **Metric Collection**:
   - Collect metrics at appropriate intervals
   - Use meaningful metric names
   - Include relevant labels
   - Avoid high cardinality

2. **Alerting**:
   - Set appropriate thresholds
   - Use meaningful alert names
   - Include detailed descriptions
   - Configure proper notification channels

3. **Dashboard Design**:
   - Group related metrics
   - Use appropriate visualization types
   - Include time ranges
   - Add annotations for important events

4. **Performance**:
   - Monitor Prometheus resource usage
   - Configure appropriate retention periods
   - Use recording rules for expensive queries
   - Optimize metric cardinality

## Troubleshooting Monitoring Issues

1. **Missing Metrics**:
   ```bash
   kubectl port-forward -n fincy-ai svc/prometheus 9090
   curl localhost:9090/api/v1/targets
   ```

2. **Grafana Access Issues**:
   ```bash
   kubectl get secret -n fincy-ai grafana -o yaml
   ```

3. **Alert Issues**:
   ```bash
   kubectl logs -n fincy-ai -l app=alertmanager
   ```

## Next Steps

1. Review and customize alert thresholds
2. Create additional dashboards for specific use cases
3. Set up additional notification channels
4. Configure long-term storage for metrics

For more information about specific components, refer to:
- [CONFIGURATION.md](CONFIGURATION.md)
- [SECURITY.md](SECURITY.md)
- [BACKUP.md](BACKUP.md) 