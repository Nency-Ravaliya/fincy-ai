# Fincy AI Backup and Recovery Guide

This guide provides detailed information about backup and recovery procedures for the Fincy AI application.

## Backup Architecture

The backup system consists of:

1. **Automated Backups**:
   - Daily scheduled backups
   - Azure Blob Storage integration
   - Retention policies

2. **Data Protection**:
   - Application data
   - Configuration files
   - Secrets and credentials

3. **Recovery Options**:
   - Point-in-time recovery
   - Full system restore
   - Selective data restore

## Backup Configuration

### Schedule Configuration

Backups are configured in the Helm values:

```yaml
backup:
  enabled: true
  schedule: "0 1 * * *"
  retention: "720h"
  storageAccount: "fincyaibackup"
  containerName: "backups"
```

### Storage Configuration

Azure Blob Storage is used for backup storage:

```yaml
storage:
  type: azure
  accountName: fincyaibackup
  containerName: backups
  accessKey: ${AZURE_STORAGE_ACCESS_KEY}
```

## Backup Procedures

### Automated Backups

1. **Database Backup**:
   ```bash
   kubectl exec -n fincy-ai <pod-name> -- mongodump \
     --uri="mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:27017/${DB_NAME}" \
     --out=/backup/db
   ```

2. **Configuration Backup**:
   ```bash
   kubectl get all -n fincy-ai -o yaml > /backup/config/kubernetes-resources.yaml
   kubectl get secrets -n fincy-ai -o yaml > /backup/config/secrets.yaml
   ```

3. **Upload to Azure**:
   ```bash
   az storage blob upload-batch \
     --destination ${CONTAINER_NAME} \
     --source /backup \
     --account-name ${STORAGE_ACCOUNT} \
     --account-key ${ACCESS_KEY}
   ```

### Manual Backups

1. **Create Backup**:
   ```bash
   # Create backup directory
   mkdir -p /backup/$(date +%Y%m%d)

   # Backup database
   mongodump --uri="mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:27017/${DB_NAME}" \
     --out=/backup/$(date +%Y%m%d)/db

   # Backup configurations
   kubectl get all -n fincy-ai -o yaml > /backup/$(date +%Y%m%d)/kubernetes-resources.yaml
   kubectl get secrets -n fincy-ai -o yaml > /backup/$(date +%Y%m%d)/secrets.yaml

   # Upload to Azure
   az storage blob upload-batch \
     --destination ${CONTAINER_NAME} \
     --source /backup/$(date +%Y%m%d) \
     --account-name ${STORAGE_ACCOUNT} \
     --account-key ${ACCESS_KEY}
   ```

## Recovery Procedures

### Full System Recovery

1. **Restore Database**:
   ```bash
   # Download backup
   az storage blob download-batch \
     --destination /restore \
     --source ${CONTAINER_NAME} \
     --pattern "backup-20240101/*" \
     --account-name ${STORAGE_ACCOUNT} \
     --account-key ${ACCESS_KEY}

   # Restore database
   mongorestore --uri="mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:27017/${DB_NAME}" \
     /restore/backup-20240101/db
   ```

2. **Restore Configurations**:
   ```bash
   kubectl apply -f /restore/backup-20240101/kubernetes-resources.yaml
   kubectl apply -f /restore/backup-20240101/secrets.yaml
   ```

### Selective Recovery

1. **Database Collection**:
   ```bash
   mongorestore --uri="mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:27017/${DB_NAME}" \
     --nsInclude="${DB_NAME}.${COLLECTION_NAME}" \
     /restore/backup-20240101/db
   ```

2. **Specific Resource**:
   ```bash
   kubectl apply -f /restore/backup-20240101/kubernetes-resources.yaml \
     -l app.kubernetes.io/name=fincy-ai
   ```

## Backup Verification

### Verify Backup Integrity

1. **Check Backup Files**:
   ```bash
   az storage blob list \
     --container-name ${CONTAINER_NAME} \
     --account-name ${STORAGE_ACCOUNT} \
     --account-key ${ACCESS_KEY}
   ```

2. **Test Restore**:
   ```bash
   # Create test namespace
   kubectl create namespace fincy-ai-test

   # Restore to test namespace
   kubectl apply -f /restore/backup-20240101/kubernetes-resources.yaml \
     -n fincy-ai-test
   ```

## Backup Best Practices

1. **Schedule**:
   - Regular automated backups
   - Off-peak hours
   - Multiple backup copies

2. **Storage**:
   - Use geo-redundant storage
   - Implement access controls
   - Monitor storage usage

3. **Security**:
   - Encrypt backup data
   - Secure access keys
   - Regular access reviews

4. **Testing**:
   - Regular restore tests
   - Document procedures
   - Train staff

## Monitoring and Alerts

### Backup Monitoring

1. **Status Checks**:
   ```bash
   kubectl get cronjob -n fincy-ai
   kubectl get jobs -n fincy-ai
   ```

2. **Log Review**:
   ```bash
   kubectl logs -n fincy-ai -l app=backup
   ```

### Alert Configuration

```yaml
alerts:
  - name: BackupFailed
    expr: backup_status{status="failed"} > 0
    for: 1h
    labels:
      severity: critical
    annotations:
      summary: Backup failed
      description: Backup job has failed
```

## Disaster Recovery

### Recovery Time Objectives (RTO)

- Critical systems: 4 hours
- Non-critical systems: 24 hours

### Recovery Point Objectives (RPO)

- Critical data: 1 hour
- Non-critical data: 24 hours

### Recovery Procedures

1. **Assessment**:
   - Identify affected systems
   - Determine recovery priority
   - Notify stakeholders

2. **Recovery**:
   - Restore from latest backup
   - Verify system integrity
   - Test functionality

3. **Post-Recovery**:
   - Document recovery process
   - Update procedures
   - Schedule review

## Backup Maintenance

### Regular Tasks

1. **Daily**:
   - Monitor backup jobs
   - Check storage usage
   - Review logs

2. **Weekly**:
   - Verify backup integrity
   - Clean up old backups
   - Update documentation

3. **Monthly**:
   - Test recovery procedures
   - Review retention policies
   - Update backup scripts

## Next Steps

1. Review and customize backup schedules
2. Set up backup monitoring
3. Test recovery procedures
4. Document recovery plans

For more information about specific components, refer to:
- [CONFIGURATION.md](CONFIGURATION.md)
- [MONITORING.md](MONITORING.md)
- [SECURITY.md](SECURITY.md) 