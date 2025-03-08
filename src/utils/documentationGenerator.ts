import type { NetworkConfig, Organization, Orderer } from '../types';

function generateOrganizationDetails(org: Organization): string {
  return `
### ${org.name}
- **Domain:** \`${org.domain}\`
- **MSP ID:** \`${org.mspID}\`
- **Peers:**
${org.peers.map(peer => `  - ${peer.name}
    - Port: ${peer.port}
    - Chaincode Port: ${peer.chaincodePort}
    - CouchDB Port: ${peer.couchDBPort}`).join('\n')}
`;
}

function generateOrdererDetails(orderer: Orderer): string {
  return `
### ${orderer.name}
- **Domain:** \`${orderer.domain}\`
- **Port:** ${orderer.port}
- **Type:** ${orderer.type}
- **Batch Timeout:** ${orderer.batchTimeout}
- **Batch Size:**
  - Max Message Count: ${orderer.batchSize?.maxMessageCount}
  - Absolute Max Bytes: ${orderer.batchSize?.absoluteMaxBytes}
  - Preferred Max Bytes: ${orderer.batchSize?.preferredMaxBytes}
`;
}

export function generateNetworkDocumentation(config: NetworkConfig): string {
  return `# Hyperledger Fabric Network Configuration

## Network Overview
- **Channel Name:** ${config.channelName || 'Not specified'}
- **Consortium:** ${config.consortium || 'Not specified'}
- **Network Version:** ${config.networkVersion || 'Not specified'}
- **State Database:** ${config.stateDatabase || 'Not specified'}
${config.template ? `- **Template:** ${config.template.name}` : ''}

## Organizations
${config.organizations.map(org => generateOrganizationDetails(org)).join('\n')}

## Orderers
${config.orderers.map(orderer => generateOrdererDetails(orderer)).join('\n')}

## Network Topology
- Total Organizations: ${config.organizations.length}
- Total Peers: ${config.organizations.reduce((sum, org) => sum + org.peers.length, 0)}
- Total Orderers: ${config.orderers.length}

## Deployment Instructions

1. Extract the configuration files from the downloaded ZIP archive
2. Set up the network:
   \`\`\`bash
   ./network.sh up -ca -s ${config.stateDatabase}
   \`\`\`
3. Create the channel:
   \`\`\`bash
   ./network.sh createChannel -c ${config.channelName}
   \`\`\`
4. Deploy chaincode:
   \`\`\`bash
   ./network.sh deployCC -c ${config.channelName} -ccn basic -ccp ../asset-transfer-basic/chaincode-typescript
   \`\`\`

## Network Scripts

The following scripts are included in the ZIP archive:
- \`network.sh\`: Main script for managing the network
- \`configtx.yaml\`: Channel configuration
- \`crypto-config.yaml\`: Cryptographic material configuration
- \`docker-compose.yaml\`: Container configuration

## Best Practices
1. Regularly backup configuration files
2. Monitor resource usage on peer nodes
3. Implement proper security measures
4. Keep the network up to date
`;
}