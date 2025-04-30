#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Install Azure CLI if not already installed
if ! command -v az &> /dev/null; then
    echo "Installing Azure CLI..."
    curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
fi

# Login to Azure (this will open a browser for authentication)
echo "Logging into Azure..."
az login

# Set variables (replace these with your values)
RESOURCE_GROUP="fincy-ai-rg"
LOCATION="eastus"
APP_NAME="fincy-ai"
SKU="B1"

# Create resource group if it doesn't exist
echo "Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service plan
echo "Creating App Service plan..."
az appservice plan create --name "${APP_NAME}-plan" \
    --resource-group $RESOURCE_GROUP \
    --sku $SKU \
    --is-linux

# Create Web App
echo "Creating Web App..."
az webapp create --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan "${APP_NAME}-plan" \
    --runtime "NODE:18-lts"

# Configure Web App settings
echo "Configuring Web App settings..."
az webapp config set --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --startup-file "npm run start"

# Deploy the application
echo "Deploying the application..."
az webapp deployment source config-zip \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --src dist.zip

echo "Deployment complete!" 