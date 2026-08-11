param location string
param publicSiteUrl string
param briefApiHost string
param allowedOrigins array
@secure()
param acsSenderAddress string
@secure()
param turnstileSecret string
param nurtureWebhookUrl string
@secure()
param nurtureWebhookSecret string
@secure()
param unsubscribeTokenKey string
param turnstileRequired bool = false
param tags object

var suffix = uniqueString(resourceGroup().id)
var storageAccountName = 'stgebbriefs${suffix}'
var functionAppName = 'fn-geb-briefs-${suffix}'
var servicePlanName = 'asp-geb-briefs-${suffix}'
var emailServiceName = 'email-geb-briefs-${suffix}'
var communicationServiceName = 'acs-geb-briefs-${suffix}'
var briefContainerName = 'briefs'
var deploymentContainerName = 'deployments'
var functionEndpoint = 'https://${functionAppName}.azurewebsites.net'
var storageBlobDataContributorRoleId = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
var storageQueueDataContributorRoleId = '974c5e8b-45b9-4653-ba55-5f855dd0fb88'
var storageTableDataContributorRoleId = '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3'
var communicationEmailOwnerRoleId = '09976791-48a7-449e-bb21-39d1a415f350'
var storageSuffix = environment().suffixes.storage

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  tags: tags
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowCrossTenantReplication: false
    allowSharedKeyAccess: false
    publicNetworkAccess: 'Enabled'
    accessTier: 'Hot'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  name: 'default'
  parent: storage
  properties: {
    deleteRetentionPolicy: {
      enabled: true
      days: 7
    }
    containerDeleteRetentionPolicy: {
      enabled: true
      days: 7
    }
  }
}

resource briefContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  name: briefContainerName
  parent: blobService
  properties: {
    publicAccess: 'None'
  }
}

resource deploymentContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  name: deploymentContainerName
  parent: blobService
  properties: {
    publicAccess: 'None'
  }
}

resource emailService 'Microsoft.Communication/emailServices@2025-09-01' = {
  name: emailServiceName
  location: 'global'
  tags: tags
  properties: {
    dataLocation: 'United States'
  }
}

resource emailDomain 'Microsoft.Communication/emailServices/domains@2025-09-01' = {
  name: 'AzureManagedDomain'
  parent: emailService
  location: 'global'
  properties: {
    domainManagement: 'AzureManaged'
    userEngagementTracking: 'Disabled'
  }
}

resource communicationService 'Microsoft.Communication/communicationServices@2025-09-01' = {
  name: communicationServiceName
  location: 'global'
  identity: {
    type: 'SystemAssigned'
  }
  tags: tags
  properties: {
    dataLocation: 'United States'
    linkedDomains: [
      emailDomain.id
    ]
  }
}

resource functionIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'uai-geb-briefs-${suffix}'
  location: location
  tags: tags
}

resource plan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: servicePlanName
  location: location
  kind: 'functionapp'
  sku: {
    name: 'FC1'
    tier: 'FlexConsumption'
  }
  properties: {
    reserved: true
  }
  tags: tags
}

resource functionApp 'Microsoft.Web/sites@2024-04-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${functionIdentity.id}': {}
    }
  }
  tags: tags
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    functionAppConfig: {
      deployment: {
        storage: {
          type: 'blobContainer'
          value: '${storage.properties.primaryEndpoints.blob}${deploymentContainerName}'
          authentication: {
            type: 'UserAssignedIdentity'
            userAssignedIdentityResourceId: functionIdentity.id
          }
        }
      }
      scaleAndConcurrency: {
        maximumInstanceCount: 40
        instanceMemoryMB: 2048
      }
      runtime: {
        name: 'node'
        version: '22'
      }
    }
    siteConfig: {
      minTlsVersion: '1.2'
      http20Enabled: true
      cors: {
        allowedOrigins: allowedOrigins
        supportCredentials: false
      }
      appSettings: [
        {
          name: 'AzureWebJobsStorage__accountName'
          value: storage.name
        }
        {
          name: 'AzureWebJobsStorage__credential'
          value: 'managedidentity'
        }
        {
          name: 'AzureWebJobsStorage__clientId'
          value: functionIdentity.properties.clientId
        }
        {
          name: 'AzureWebJobsStorage__blobServiceUri'
          value: 'https://${storage.name}.blob.${storageSuffix}'
        }
        {
          name: 'AzureWebJobsStorage__queueServiceUri'
          value: 'https://${storage.name}.queue.${storageSuffix}'
        }
        {
          name: 'AzureWebJobsStorage__tableServiceUri'
          value: 'https://${storage.name}.table.${storageSuffix}'
        }
        {
          name: 'AZURE_CLIENT_ID'
          value: functionIdentity.properties.clientId
        }
        {
          name: 'BRIEF_STORAGE_ACCOUNT_NAME'
          value: storage.name
        }
        {
          name: 'BRIEF_CONTAINER_NAME'
          value: briefContainerName
        }
        {
          name: 'BRIEF_PUBLIC_SITE_URL'
          value: publicSiteUrl
        }
        {
          name: 'BRIEF_API_HOST'
          value: briefApiHost
        }
        {
          name: 'ALLOWED_ORIGINS'
          value: join(allowedOrigins, ',')
        }
        {
          name: 'ACS_ENDPOINT'
          value: 'https://${communicationServiceName}.communication.azure.com'
        }
        {
          name: 'ACS_SENDER_ADDRESS'
          value: acsSenderAddress
        }
        {
          name: 'TURNSTILE_SECRET'
          value: turnstileSecret
        }
        {
          name: 'TURNSTILE_REQUIRED'
          value: string(turnstileRequired)
        }
        {
          name: 'UNSUBSCRIBE_TOKEN_KEY'
          value: unsubscribeTokenKey
        }
        {
          name: 'NURTURE_WEBHOOK_URL'
          value: nurtureWebhookUrl
        }
        {
          name: 'NURTURE_WEBHOOK_SECRET'
          value: nurtureWebhookSecret
        }
        {
          name: 'RATE_LIMIT_PER_HOUR'
          value: '5'
        }
        {
          name: 'SAS_HOURS'
          value: '48'
        }
      ]
    }
  }
  dependsOn: [
    briefContainer
    deploymentContainer
    communicationService
    storageBlobContributor
    storageQueueContributor
    storageTableContributor
    communicationEmailOwner
  ]
}

resource storageBlobContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storage.id, functionIdentity.id, 'Storage Blob Data Contributor')
  scope: storage
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageBlobDataContributorRoleId)
    principalId: functionIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource storageQueueContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storage.id, functionIdentity.id, 'Storage Queue Data Contributor')
  scope: storage
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageQueueDataContributorRoleId)
    principalId: functionIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource storageTableContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storage.id, functionIdentity.id, 'Storage Table Data Contributor')
  scope: storage
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageTableDataContributorRoleId)
    principalId: functionIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource communicationEmailOwner 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(communicationService.id, functionIdentity.id, 'Communication and Email Service Owner')
  scope: communicationService
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', communicationEmailOwnerRoleId)
    principalId: functionIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

output storageAccountName string = storage.name
output functionAppName string = functionApp.name
output functionHostname string = functionEndpoint
output functionPrincipalId string = functionIdentity.properties.principalId
output communicationServiceName string = communicationService.name
output emailDomainResourceId string = emailDomain.id
output briefApiEndpoint string = '${functionEndpoint}/api/brief-request'
