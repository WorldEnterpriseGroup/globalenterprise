targetScope = 'subscription'

@description('One resource group for the Global Enterprise brief delivery service.')
param resourceGroupName string = 'rg-globalenterprise-briefs'

@description('Azure region for the Function App, Storage account, and Communication resource.')
param location string = 'eastus'

@description('Human-readable subscription label used in tags only.')
param subscriptionLabel string = 'focushive-mpn'

@description('The public hostname used in email and the eventual Front Door custom domain.')
param briefApiHost string = 'briefs.globalenterprise.com'

@description('The public site URL used for redirect and unsubscribe links.')
param publicSiteUrl string = 'https://globalenterprise.com'

@description('Allowed browser origins. Native HTML forms do not require CORS, but the list protects future fetch clients.')
param allowedOrigins array = [
  'https://globalenterprise.com'
  'https://www.globalenterprise.com'
]

@description('Set after the Azure-managed or verified custom sender domain is provisioned.')
@secure()
param acsSenderAddress string = ''

@description('Optional Cloudflare Turnstile secret. Leave empty to use honeypot and rate limiting only.')
@secure()
param turnstileSecret string = ''

@description('Optional HMAC-protected Logic App or Dynamics bridge URL.')
param nurtureWebhookUrl string = ''

@description('Secret used to sign events sent to the optional nurture bridge.')
@secure()
param nurtureWebhookSecret string = ''

@description('A random secret used to encrypt unsubscribe tokens at rest. Supply with the deployment secret store.')
@secure()
param unsubscribeTokenKey string = ''

@description('Enable Turnstile validation only after the corresponding site widget is present in the forms.')
param turnstileRequired bool = false

var tags = {
  environment: 'production'
  managedBy: 'iac'
  project: 'globalenterprise'
  service: 'brief-delivery'
  subscription: subscriptionLabel
  dataClassification: 'lead-metadata'
}

resource briefResourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module briefInfrastructure 'briefs.bicep' = {
  name: 'globalenterprise-brief-delivery'
  scope: briefResourceGroup
  params: {
    location: location
    publicSiteUrl: publicSiteUrl
    briefApiHost: briefApiHost
    allowedOrigins: allowedOrigins
    acsSenderAddress: acsSenderAddress
    turnstileSecret: turnstileSecret
    nurtureWebhookUrl: nurtureWebhookUrl
    nurtureWebhookSecret: nurtureWebhookSecret
    unsubscribeTokenKey: unsubscribeTokenKey
    turnstileRequired: turnstileRequired
    tags: tags
  }
}

output resourceGroupName string = briefResourceGroup.name
output storageAccountName string = briefInfrastructure.outputs.storageAccountName
output functionAppName string = briefInfrastructure.outputs.functionAppName
output functionHostname string = briefInfrastructure.outputs.functionHostname
output communicationServiceName string = briefInfrastructure.outputs.communicationServiceName
output emailDomainResourceId string = briefInfrastructure.outputs.emailDomainResourceId
