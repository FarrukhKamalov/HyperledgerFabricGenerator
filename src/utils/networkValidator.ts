import type { NetworkConfig } from '../types';

export interface ValidationResult {
  status: 'error' | 'warning' | 'success';
  message: string;
  fix?: string;
}

export function validateNetworkConfig(config: NetworkConfig): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Check for organizations
  if (config.organizations.length === 0) {
    results.push({
      status: 'error',
      message: 'No organizations defined',
      fix: 'Add at least one organization to your network'
    });
  } else if (config.organizations.length < 2) {
    results.push({
      status: 'warning',
      message: 'Network has only one organization',
      fix: 'Consider adding more organizations for a decentralized network'
    });
  }

  // Check for peers
  config.organizations.forEach(org => {
    if (org.peers.length === 0) {
      results.push({
        status: 'error',
        message: `Organization ${org.name} has no peers`,
        fix: `Add at least one peer to ${org.name}`
      });
    } else if (org.peers.length > 4) {
      results.push({
        status: 'warning',
        message: `Organization ${org.name} has ${org.peers.length} peers`,
        fix: 'Consider reducing the number of peers to improve network performance'
      });
    }
  });

  // Check for orderers
  if (config.orderers.length === 0) {
    results.push({
      status: 'error',
      message: 'No orderers defined',
      fix: 'Add at least one orderer to your network'
    });
  } else if (config.orderers.length === 1 && config.orderers[0].type === 'etcdraft') {
    results.push({
      status: 'warning',
      message: 'Single orderer with Raft consensus',
      fix: 'Add more orderers for fault tolerance in Raft consensus'
    });
  }

  // Check for channel name
  if (!config.channelName) {
    results.push({
      status: 'error',
      message: 'Channel name not defined',
      fix: 'Set a channel name for your network'
    });
  }

  // Check for state database
  if (!config.stateDatabase) {
    results.push({
      status: 'warning',
      message: 'State database not specified',
      fix: 'Choose between CouchDB or GoLevelDB for state database'
    });
  }

  // Check for domain configurations
  config.organizations.forEach(org => {
    if (!org.domain) {
      results.push({
        status: 'error',
        message: `Domain not specified for organization ${org.name}`,
        fix: `Set a domain for ${org.name}`
      });
    }
  });

  // Check for MSP IDs
  config.organizations.forEach(org => {
    if (!org.mspID) {
      results.push({
        status: 'error',
        message: `MSP ID not specified for organization ${org.name}`,
        fix: `Set an MSP ID for ${org.name}`
      });
    }
  });

  return results;
}