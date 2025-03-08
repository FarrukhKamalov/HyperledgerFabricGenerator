import type { NetworkConfig, Organization, Orderer, YAMLConfig } from '../types';

const generateMSPConfig = (org: Organization) => `
  - &${org.mspID || org.name}
    Name: ${org.mspID || org.name}
    ID: ${org.mspID || org.name}
    MSPDir: crypto-config/peerOrganizations/${org.domain}/msp
    Policies:
      Readers:
        Type: Signature
        Rule: "OR('${org.mspID || org.name}.admin', '${org.mspID || org.name}.peer', '${org.mspID || org.name}.client')"
      Writers:
        Type: Signature
        Rule: "OR('${org.mspID || org.name}.admin', '${org.mspID || org.name}.client')"
      Admins:
        Type: Signature
        Rule: "OR('${org.mspID || org.name}.admin')"
      Endorsement:
        Type: Signature
        Rule: "OR('${org.mspID || org.name}.peer')"`;

const generateOrdererConfig = (orderer: Orderer) => `
  - &${orderer.name}
    Addresses:
      - ${orderer.domain}:${orderer.port}
    BatchTimeout: ${orderer.batchTimeout || '2s'}
    BatchSize:
      MaxMessageCount: ${orderer.batchSize?.maxMessageCount || 500}
      AbsoluteMaxBytes: ${orderer.batchSize?.absoluteMaxBytes || 10485760}
      PreferredMaxBytes: ${orderer.batchSize?.preferredMaxBytes || 2097152}
    OrdererType: ${orderer.type}
    Policies:
      Readers:
        Type: ImplicitMeta
        Rule: "ANY Readers"
      Writers:
        Type: ImplicitMeta
        Rule: "ANY Writers"
      Admins:
        Type: ImplicitMeta
        Rule: "MAJORITY Admins"`;

export function generateYAMLConfigs(config: NetworkConfig): YAMLConfig {
  const configtx = `
Organizations:
${config.organizations.map(org => generateMSPConfig(org)).join('\n')}

Orderer:
${config.orderers.map(orderer => generateOrdererConfig(orderer)).join('\n')}

Profiles:
  TwoOrgsOrdererGenesis:
    <<: *ChannelDefaults
    Orderer:
      <<: *OrdererDefaults
      Organizations:
        - *OrdererOrg
    Consortiums:
      ${config.consortium || 'SampleConsortium'}:
        Organizations:
${config.organizations.map(org => `          - *${org.mspID || org.name}`).join('\n')}`;

  const cryptoConfig = `
OrdererOrgs:
  - Name: Orderer
    Domain: ${config.orderers[0]?.domain || 'example.com'}
    Specs:
${config.orderers.map(orderer => `      - Hostname: ${orderer.name}`).join('\n')}

PeerOrgs:
${config.organizations.map(org => `
  - Name: ${org.name}
    Domain: ${org.domain}
    Template:
      Count: ${org.peers.length}
    Users:
      Count: 1`).join('\n')}`;

  const dockerCompose = `
version: '2'

networks:
  ${config.channelName || 'test'}:

services:
${config.orderers.map(orderer => `
  ${orderer.name}:
    container_name: ${orderer.name}
    image: hyperledger/fabric-orderer:latest
    environment:
      - ORDERER_GENERAL_LOGLEVEL=INFO
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_LISTENPORT=${orderer.port}
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    ports:
      - ${orderer.port}:${orderer.port}
    networks:
      - ${config.channelName || 'test'}`).join('\n')}

${config.organizations.map(org => 
  org.peers.map(peer => `
  ${peer.name}.${org.domain}:
    container_name: ${peer.name}.${org.domain}
    image: hyperledger/fabric-peer:latest
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_PEER_ID=${peer.name}.${org.domain}
      - CORE_PEER_ADDRESS=${peer.name}.${org.domain}:${peer.port}
      - CORE_PEER_LISTENADDRESS=0.0.0.0:${peer.port}
      - CORE_PEER_CHAINCODEADDRESS=${peer.name}.${org.domain}:${peer.chaincodePort || 7052}
      - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:${peer.chaincodePort || 7052}
      - CORE_PEER_GOSSIP_BOOTSTRAP=${peer.name}.${org.domain}:${peer.port}
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=${peer.name}.${org.domain}:${peer.port}
      - CORE_PEER_LOCALMSPID=${org.mspID || org.name}
    volumes:
      - /var/run/:/host/var/run/
      - ./crypto-config/peerOrganizations/${org.domain}/peers/${peer.name}.${org.domain}/msp:/etc/hyperledger/fabric/msp
      - ./crypto-config/peerOrganizations/${org.domain}/peers/${peer.name}.${org.domain}/tls:/etc/hyperledger/fabric/tls
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: peer node start
    ports:
      - ${peer.port}:${peer.port}
    networks:
      - ${config.channelName || 'test'}`).join('\n')).join('\n')}`;

  return {
    configtx,
    cryptoConfig,
    dockerCompose
  };
}