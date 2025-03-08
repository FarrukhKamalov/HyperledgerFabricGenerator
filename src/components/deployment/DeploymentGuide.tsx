import React, { useState, useRef } from 'react';
import { 
  Terminal, 
  CheckCircle, 
  Circle, 
  X, 
  AlertTriangle, 
  Info, 
  HelpCircle,
  Download,
  ExternalLink,
  Play,
  Pause
} from 'lucide-react';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../ui/Button';
import DeploymentStep from './DeploymentStep';
import HelpSection from './HelpSection';

interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  command: string;
  output: string;
  tips: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'error';
}

interface DeploymentGuideProps {
  isDark: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export default function DeploymentGuide({ isDark, onClose, isModal = false }: DeploymentGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<DeploymentStep[]>([
    {
      id: 'crypto-config',
      title: 'Generate Crypto Materials',
      description: 'Generate the cryptographic materials required for your organizations and peers.',
      command: './bin/cryptogen generate --config=./crypto-config.yaml --output="crypto-config"',
      output: `org1.example.com
  Generating peer0.org1.example.com
  Generating peer1.org1.example.com
org2.example.com
  Generating peer0.org2.example.com
  Generating peer1.org2.example.com
Generating orderer certificates
  Generating orderer.example.com`,
      tips: [
        'Make sure cryptogen binary is in your PATH or in ./bin directory',
        'Verify crypto-config.yaml exists in your current directory',
        'The output directory will be created if it doesn\'t exist'
      ],
      status: 'completed'
    },
    {
      id: 'genesis-block',
      title: 'Generate Genesis Block',
      description: 'Create the genesis block for the ordering service using the configtx tool.',
      command: './bin/configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block',
      output: `2023-05-15 10:23:45.123 EDT [common.tools.configtxgen] main -> INFO 001 Loading configuration
2023-05-15 10:23:45.234 EDT [common.tools.configtxgen.localconfig] completeInitialization -> INFO 002 orderer type: etcdraft
2023-05-15 10:23:45.345 EDT [common.tools.configtxgen.localconfig] Load -> INFO 003 Loaded configuration: ./configtx.yaml
2023-05-15 10:23:45.456 EDT [common.tools.configtxgen] doOutputBlock -> INFO 004 Generating genesis block
2023-05-15 10:23:45.567 EDT [common.tools.configtxgen] doOutputBlock -> INFO 005 Writing genesis block`,
      tips: [
        'Ensure configtxgen binary is available in your PATH or ./bin directory',
        'Create a channel-artifacts directory if it doesn\'t exist',
        'The profile name should match what\'s defined in your configtx.yaml'
      ],
      status: 'completed'
    },
    {
      id: 'channel-tx',
      title: 'Generate Channel Transaction',
      description: 'Create the channel configuration transaction for your application channel.',
      command: './bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID mychannel',
      output: `2023-05-15 10:25:12.123 EDT [common.tools.configtxgen] main -> INFO 001 Loading configuration
2023-05-15 10:25:12.234 EDT [common.tools.configtxgen.localconfig] Load -> INFO 002 Loaded configuration: ./configtx.yaml
2023-05-15 10:25:12.345 EDT [common.tools.configtxgen] doOutputChannelCreateTx -> INFO 003 Generating new channel configtx
2023-05-15 10:25:12.456 EDT [common.tools.configtxgen] doOutputChannelCreateTx -> INFO 004 Writing new channel tx`,
      tips: [
        'The channel ID must be lowercase, less than 250 characters, and match the regex [a-z][a-z0-9.-]*',
        'This transaction will be used to create the channel in a later step',
        'You can create multiple channels by running this command with different channel IDs'
      ],
      status: 'in-progress'
    },
    {
      id: 'anchor-peers',
      title: 'Generate Anchor Peer Updates',
      description: 'Create the anchor peer update transactions for each organization.',
      command: './bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP',
      output: `2023-05-15 10:26:34.123 EDT [common.tools.configtxgen] main -> INFO 001 Loading configuration
2023-05-15 10:26:34.234 EDT [common.tools.configtxgen.localconfig] Load -> INFO 002 Loaded configuration: ./configtx.yaml
2023-05-15 10:26:34.345 EDT [common.tools.configtxgen] doOutputAnchorPeersUpdate -> INFO 003 Generating anchor peer update
2023-05-15 10:26:34.456 EDT [common.tools.configtxgen] doOutputAnchorPeersUpdate -> INFO 004 Writing anchor peer update`,
      tips: [
        'Run this command once for each organization in your network',
        'Change the -asOrg parameter to match each organization\'s MSP ID',
        'Anchor peers enable cross-organization gossip communication'
      ],
      status: 'pending'
    },
    {
      id: 'start-network',
      title: 'Start the Network',
      description: 'Start the Hyperledger Fabric network using Docker Compose.',
      command: 'docker-compose -f docker-compose.yaml up -d',
      output: `Creating network "fabric_test" with the default driver
Creating orderer.example.com ... done
Creating peer0.org1.example.com ... done
Creating peer1.org1.example.com ... done
Creating peer0.org2.example.com ... done
Creating peer1.org2.example.com ... done
Creating cli ... done`,
      tips: [
        'Ensure Docker and Docker Compose are installed and running',
        'Check that all required images are available or will be pulled automatically',
        'Use docker ps to verify all containers are running properly'
      ],
      status: 'pending'
    },
    {
      id: 'create-channel',
      title: 'Create Channel',
      description: 'Create the application channel using the previously generated transaction.',
      command: 'docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem',
      output: `2023-05-15 10:30:12.123 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2023-05-15 10:30:12.234 UTC [cli.common] readBlock -> INFO 002 Received block: 0
2023-05-15 10:30:12.345 UTC [channelCmd] InitCmdFactory -> INFO 003 Endorser and orderer connections initialized
2023-05-15 10:30:12.456 UTC [channelCmd] executeJoin -> INFO 004 Successfully submitted proposal to join channel`,
      tips: [
        'This command creates the channel and generates the genesis block for this channel',
        'The channel.tx file was generated in step 3',
        'The --cafile path may vary depending on your network configuration'
      ],
      status: 'pending'
    },
    {
      id: 'join-channel',
      title: 'Join Channel',
      description: 'Join peers to the channel.',
      command: 'docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer channel join -b mychannel.block',
      output: `2023-05-15 10:32:45.123 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2023-05-15 10:32:45.234 UTC [channelCmd] executeJoin -> INFO 002 Successfully submitted proposal to join channel`,
      tips: [
        'Run this command for each peer in your network',
        'Adjust the environment variables for each organization and peer',
        'The block file was generated when creating the channel'
      ],
      status: 'pending'
    },
    {
      id: 'update-anchors',
      title: 'Update Anchor Peers',
      description: 'Update the anchor peers for each organization.',
      command: 'docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer channel update -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/Org1MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem',
      output: `2023-05-15 10:35:23.123 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2023-05-15 10:35:23.234 UTC [channelCmd] update -> INFO 002 Successfully submitted channel update`,
      tips: [
        'Run this command for each organization in your network',
        'Adjust the environment variables and file paths for each organization',
        'The anchor peer update transactions were generated in step 4'
      ],
      status: 'pending'
    },
    {
      id: 'install-chaincode',
      title: 'Install Chaincode',
      description: 'Install the chaincode on the peers.',
      command: 'docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer lifecycle chaincode package mycc.tar.gz --path github.com/hyperledger/fabric-samples/chaincode/asset-transfer-basic/chaincode-javascript --lang node --label mycc_1.0',
      output: `2023-05-15 10:38:12.123 UTC [cli.lifecycle.chaincode] submitInstallProposal -> INFO 001 Installed remotely: response:<status:200 payload:"\\n\\rmycc_1.0:dee01d1bd7c4c57d66a6997c75c0c3e3dbc9a7479a80981b237cc3d2bae54ad7\\n" > 
2023-05-15 10:38:12.234 UTC [cli.lifecycle.chaincode] submitInstallProposal -> INFO 002 Chaincode code package identifier: mycc_1.0:dee01d1bd7c4c57d66a6997c75c0c3e3dbc9a7479a80981b237cc3d2bae54ad7`,
      tips: [
        'Run this command for each peer that will endorse transactions',
        'The --path should point to your chaincode directory',
        'The --lang parameter depends on your chaincode language (node, golang, java)'
      ],
      status: 'pending'
    },
    {
      id: 'approve-chaincode',
      title: 'Approve Chaincode Definition',
      description: 'Approve the chaincode definition for your organization.',
      command: 'docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --channelID mychannel --name mycc --version 1.0 --package-id mycc_1.0:dee01d1bd7c4c57d66a6997c75c0c3e3dbc9a7479a80981b237cc3d2bae54ad7 --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem',
      output: `2023-05-15 10:40:45.123 UTC [cli.lifecycle.chaincode] submitChaincodeDefinitionForOrg -> INFO 001 Approved chaincode definition for org: Org1MSP`,
      tips: [
        'Run this command for each organization in your network',
        'The package-id comes from the output of the install command',
        'All organizations must approve the same parameters for successful commit'
      ],
      status: 'pending'
    },
    {
      id: 'commit-chaincode',
      title: 'Commit Chaincode Definition',
      description: 'Commit the chaincode definition to the channel.',
      command: 'docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer lifecycle chaincode commit -o orderer.example.com:7050 --channelID mychannel --name mycc --version 1.0 --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt',
      output: `2023-05-15 10:42:34.123 UTC [cli.lifecycle.chaincode] submitChaincodeDefinition -> INFO 001 Submitting chaincode definition [mycc, 1.0, dee01d1bd7c4c57d66a6997c75c0c3e3dbc9a7479a80981b237cc3d2bae54ad7, 1] to channel mychannel
2023-05-15 10:42:34.234 UTC [cli.lifecycle.chaincode] submitChaincodeDefinition -> INFO 002 Successfully submitted chaincode definition to channel mychannel`,
      tips: [
        'This command only needs to be run once for the entire network',
        'Include --peerAddresses and --tlsRootCertFiles for each organization',
        'The commit will fail if not enough organizations have approved'
      ],
      status: 'pending'
    },
    {
      id: 'invoke-chaincode',
      title: 'Invoke Chaincode',
      description: 'Invoke the chaincode to test its functionality.',
      command: 'docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n mycc --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c \'{"function":"InitLedger","Args":[]}\'',
      output: `2023-05-15 10:45:12.123 UTC [chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200 payload:"OK" 
2023-05-15 10:45:12.234 UTC [chaincodeCmd] chaincodeInvokeOrQuery -> INFO 002 Chaincode transaction committed successfully`,
      tips: [
        'The -c parameter contains the function name and arguments in JSON format',
        'Include --peerAddresses and --tlsRootCertFiles for each endorsing organization',
        'Adjust the function name and arguments based on your chaincode implementation'
      ],
      status: 'pending'
    },
    {
      id: 'query-chaincode',
      title: 'Query Chaincode',
      description: 'Query the chaincode to verify the previous invocation.',
      command: 'docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer chaincode query -C mychannel -n mycc -c \'{"function":"GetAllAssets","Args":[]}\'',
      output: `[
  {
    "ID": "asset1",
    "Color": "blue",
    "Size": 5,
    "Owner": "Tomoko",
    "AppraisedValue": 300
  },
  {
    "ID": "asset2",
    "Color": "red",
    "Size": 5,
    "Owner": "Brad",
    "AppraisedValue": 400
  },
  {
    "ID": "asset3",
    "Color": "green",
    "Size": 10,
    "Owner": "Jin Soo",
    "AppraisedValue": 500
  }
]`,
      tips: [
        'Query operations do not change the ledger state',
        'Only one peer is needed for query operations',
        'The output format depends on your chaincode implementation'
      ],
      status: 'pending'
    }
  ]);
  
  const [autoScroll, setAutoScroll] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [runSpeed, setRunSpeed] = useState(3); // seconds
  const runIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />;
      case 'in-progress':
        return (
          <div className={`h-5 w-5 rounded-full border-2 ${isDark ? 'border-indigo-400' : 'border-indigo-500'} border-t-transparent animate-spin`}></div>
        );
      case 'error':
        return <X className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-500'}`} />;
      default:
        return <Circle className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />;
    }
  };
  
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      const newSteps = [...steps];
      newSteps[currentStep].status = 'completed';
      newSteps[currentStep + 1].status = 'in-progress';
      setSteps(newSteps);
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      const newSteps = [...steps];
      newSteps[currentStep].status = 'pending';
      newSteps[currentStep - 1].status = 'in-progress';
      setSteps(newSteps);
      setCurrentStep(currentStep - 1);
    }
  };
  
  const toggleRunSimulation = () => {
    if (isRunning) {
      // Stop simulation
      if (runIntervalRef.current) {
        clearInterval(runIntervalRef.current);
        runIntervalRef.current = null;
      }
      setIsRunning(false);
    } else {
      // Start simulation
      setIsRunning(true);
      runIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) {
            const newSteps = [...steps];
            newSteps[prev].status = 'completed';
            newSteps[prev + 1].status = 'in-progress';
            setSteps(newSteps);
            return prev + 1;
          } else {
            // End of steps, clear interval
            if (runIntervalRef.current) {
              clearInterval(runIntervalRef.current);
              runIntervalRef.current = null;
            }
            setIsRunning(false);
            return prev;
          }
        });
      }, runSpeed * 1000);
    }
  };
  
  const downloadScript = () => {
    const scriptContent = `#!/bin/bash
# Hyperledger Fabric Network Deployment Script
# Generated by Fabric Network Constructor

set -e

echo "Starting Hyperledger Fabric network deployment..."

# Step 1: Generate Crypto Materials
echo "Step 1: Generating crypto materials..."
./bin/cryptogen generate --config=./crypto-config.yaml --output="crypto-config"

# Step 2: Generate Genesis Block
echo "Step 2: Generating genesis block..."
mkdir -p channel-artifacts
./bin/configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block

# Step 3: Generate Channel Transaction
echo "Step 3: Generating channel transaction..."
./bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID mychannel

# Step 4: Generate Anchor Peer Updates
echo "Step 4: Generating anchor peer updates..."
./bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP
./bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID mychannel -asOrg Org2MSP

# Step 5: Start the Network
echo "Step 5: Starting the network..."
docker-compose -f docker-compose.yaml up -d

# Wait for network to start
echo "Waiting for network to start..."
sleep 10

# Step 6: Create Channel
echo "Step 6: Creating channel..."
docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Step 7: Join Channel - Org1
echo "Step 7: Joining peers to channel..."
# Join Org1 peers
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer channel join -b mychannel.block

docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer1.org1.example.com:8051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt cli peer channel join -b mychannel.block

# Join Org2 peers
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID="Org2MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt cli peer channel join -b mychannel.block

docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer1.org2.example.com:10051 -e CORE_PEER_LOCALMSPID="Org2MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/ca.crt cli peer channel join -b mychannel.block

# Step 8: Update Anchor Peers
echo "Step 8: Updating anchor peers..."
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer channel update -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/Org1MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID="Org2MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt cli peer channel update -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/Org2MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Step 9: Install Chaincode
echo "Step 9: Installing chaincode..."
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer lifecycle chaincode package mycc.tar.gz --path github.com/hyperledger/fabric-samples/chaincode/asset-transfer-basic/chaincode-javascript --lang node --label mycc_1.0

# Install on Org1 peers
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer lifecycle chaincode install mycc.tar.gz

# Install on Org2 peers
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID="Org2MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt cli peer lifecycle chaincode install mycc.tar.gz

# Get package ID (this is just an example, you'll need to use the actual package ID from the install output)
PACKAGE_ID=mycc_1.0:dee01d1bd7c4c57d66a6997c75c0c3e3dbc9a7479a80981b237cc3d2bae54ad7

# Step 10: Approve Chaincode Definition
echo "Step 10: Approving chaincode definition..."
# Approve for Org1
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --channelID mychannel --name mycc --version 1.0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Approve for Org2
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID="Org2MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --channelID mychannel --name mycc --version 1.0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Step 11: Commit Chaincode Definition
echo "Step 11: Committing chaincode definition..."
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer lifecycle chaincode commit -o orderer.example.com:7050 --channelID mychannel --name mycc --version 1.0 --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt

# Step 12: Invoke Chaincode
echo "Step 12: Invoking chaincode..."
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n mycc --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"InitLedger","Args":[]}'

# Wait for transaction to be committed
sleep 5

# Step 13: Query Chaincode
echo "Step 13: Querying chaincode..."
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID="Org1MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt cli peer chaincode query -C mychannel -n mycc -c '{"function":"GetAllAssets","Args":[]}'

echo "Deployment completed successfully!"
`;

    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deploy-fabric-network.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectStep = (index: number) => {
    const newSteps = [...steps];
    newSteps[currentStep].status = currentStep < index ? 'completed' : 'pending';
    newSteps[index].status = 'in-progress';
    setSteps(newSteps);
    setCurrentStep(index);
  };

  return (
    <div className={`${isModal ? '' : 'min-h-screen transition-colors duration-300'} ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {!isModal && (
        <Header 
          title="Deployment Guide" 
          icon={Terminal}
          isDark={isDark}
        >
          <Button
            onClick={downloadScript}
            variant="primary"
            icon={Download}
          >
            Download Script
          </Button>
          <Button
            onClick={() => window.open('https://hyperledger-fabric.readthedocs.io/en/latest/deployment_guide_overview.html', '_blank')}
            variant="secondary"
            icon={ExternalLink}
          >
            Official Docs
          </Button>
        </Header>
      )}

      <div className={`${isModal ? 'p-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ml-20 md:ml-auto transition-all duration-300'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Hyperledger Fabric Deployment Guide</h1>
            <p className="mt-1 text-sm opacity-70">Follow these steps to deploy your Hyperledger Fabric network</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm">Speed:</label>
              <select
                value={runSpeed}
                onChange={(e) => setRunSpeed(parseInt(e.target.value))}
                className={`text-sm rounded-lg ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="1">Fast (1s)</option>
                <option value="3">Normal (3s)</option>
                <option value="5">Slow (5s)</option>
              </select>
            </div>
            
            <Button
              onClick={toggleRunSimulation}
              variant={isRunning ? 'danger' : 'success'}
              icon={isRunning ? Pause : Play}
            >
              {isRunning ? 'Pause' : 'Auto-Run'}
            </Button>
            
            {isModal && onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                icon={X}
              >
                Close
              </Button>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm">{currentStep + 1} of {steps.length}</span>
          </div>