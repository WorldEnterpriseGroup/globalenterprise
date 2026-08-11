targetScope = 'resourceGroup'

@description('Principal ID of the Function App user-assigned identity.')
param functionPrincipalId string

resource secretsVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: 'omlab-secrets'
}

resource functionKeyVaultSecretsUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, 'globalenterprise-briefs', 'Key Vault Secrets User')
  scope: secretsVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: functionPrincipalId
    principalType: 'ServicePrincipal'
  }
}
