#!/bin/bash

# Set variables (replace these with your values)
RESOURCE_GROUP="fincy-ai-rg"
LOCATION="eastus"
KEYVAULT_NAME="fincy-ai-kv"

# Create Key Vault
echo "Creating Key Vault..."
az keyvault create --name $KEYVAULT_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION

# Add secrets to Key Vault
echo "Adding secrets to Key Vault..."

# Application secrets
az keyvault secret set --vault-name $KEYVAULT_NAME --name "VITE-APP-TITLE" --value "Fincy AI"
az keyvault secret set --vault-name $KEYVAULT_NAME --name "VITE-API-URL" --value "https://api.fincy-ai.com"
az keyvault secret set --vault-name $KEYVAULT_NAME --name "VITE-SUPABASE-URL" --value "https://your-project.supabase.co"
az keyvault secret set --vault-name $KEYVAULT_NAME --name "VITE-SUPABASE-ANON-KEY" --value "your-supabase-anon-key"

# Azure configuration secrets
az keyvault secret set --vault-name $KEYVAULT_NAME --name "AZURE-KEY-VAULT-NAME" --value $KEYVAULT_NAME
az keyvault secret set --vault-name $KEYVAULT_NAME --name "AZURE-TENANT-ID" --value "84c31ca0-ac3b-4eae-ad11-519d80233e6f"
az keyvault secret set --vault-name $KEYVAULT_NAME --name "AZURE-CLIENT-ID" --value "your-client-id"
az keyvault secret set --vault-name $KEYVAULT_NAME --name "AZURE-CLIENT-SECRET" --value "your-client-secret"

# Grant Web App access to Key Vault
echo "Granting Web App access to Key Vault..."
WEBAPP_IDENTITY=$(az webapp identity assign --name fincy-ai --resource-group $RESOURCE_GROUP --query principalId --output tsv)
az keyvault set-policy --name $KEYVAULT_NAME \
    --object-id $WEBAPP_IDENTITY \
    --secret-permissions get list \
    --key-permissions get list \
    --certificate-permissions get list

echo "Key Vault setup complete!" 