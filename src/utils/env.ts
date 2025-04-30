import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

const keyVaultName = process.env.AZURE_KEY_VAULT_NAME;
const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;

const credential = new DefaultAzureCredential();
const client = new SecretClient(keyVaultUrl, credential);

export async function getSecret(secretName: string): Promise<string> {
  try {
    const secret = await client.getSecret(secretName);
    return secret.value;
  } catch (error) {
    console.error(`Error fetching secret ${secretName}:`, error);
    throw error;
  }
}

export async function loadEnvironmentVariables() {
  try {
    const envVars = await client.listPropertiesOfSecrets();
    for await (const secret of envVars) {
      const secretValue = await client.getSecret(secret.name);
      process.env[secret.name] = secretValue.value;
    }
  } catch (error) {
    console.error('Error loading environment variables:', error);
    throw error;
  }
} 