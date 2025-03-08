export function generateNetworkScript(): string {
  return `#!/bin/bash

# Hyperledger Fabric Network Management Script

# Default values
CHANNEL_NAME="mychannel"
CC_NAME="basic"
CC_VERSION="1.0"
CC_SEQUENCE="1"
DELAY="3"
MAX_RETRY="5"
VERBOSE="false"

# Print usage
function printHelp() {
  echo "Usage: "
  echo "  network.sh <Mode> [Flags]"
  echo "    Modes:"
  echo "      up - Bring up the network"
  echo "      down - Bring down the network"
  echo "      restart - Restart the network"
  echo "      createChannel - Create and join a channel"
  echo "      deployCC - Deploy chaincode"
  echo "    Flags:"
  echo "      -c <channel name> - Channel name (default \"mychannel\")"
  echo "      -ca - Deploy Certificate Authority"
  echo "      -s <dbtype> - Database type (goleveldb or couchdb)"
  echo "      -verbose - Verbose mode"
  echo "      -h - Print this message"
}

# Set environment variables for organization
function setOrg() {
  ORG=$1
  export CORE_PEER_LOCALMSPID="\${ORG}MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=\$PWD/organizations/peerOrganizations/\${ORG,,}.example.com/peers/peer0.\${ORG,,}.example.com/tls/ca.crt
  export CORE_PEER_MSPCONFIGPATH=\$PWD/organizations/peerOrganizations/\${ORG,,}.example.com/users/Admin@\${ORG,,}.example.com/msp
  export CORE_PEER_ADDRESS=localhost:7051
}

# Bring up the network
function networkUp() {
  docker-compose -f docker-compose.yaml up -d
  echo "Waiting for network to start..."
  sleep \$DELAY
  echo "Network is up"
}

# Bring down the network
function networkDown() {
  docker-compose -f docker-compose.yaml down --volumes --remove-orphans
  echo "Network is down"
}

# Create and join channel
function createChannel() {
  configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/\$CHANNEL_NAME.tx -channelID \$CHANNEL_NAME
  peer channel create -o localhost:7050 -c \$CHANNEL_NAME -f ./channel-artifacts/\$CHANNEL_NAME.tx --outputBlock ./channel-artifacts/\$CHANNEL_NAME.block
  peer channel join -b ./channel-artifacts/\$CHANNEL_NAME.block
}

# Deploy chaincode
function deployChaincode() {
  peer lifecycle chaincode package \$CC_NAME.tar.gz --path \$CC_PATH --lang node --label \$CC_NAME\_\$CC_VERSION
  peer lifecycle chaincode install \$CC_NAME.tar.gz
  peer lifecycle chaincode approveformyorg -o localhost:7050 --channelID \$CHANNEL_NAME --name \$CC_NAME --version \$CC_VERSION --package-id \$CC_NAME\_\$CC_VERSION --sequence \$CC_SEQUENCE
  peer lifecycle chaincode commit -o localhost:7050 --channelID \$CHANNEL_NAME --name \$CC_NAME --version \$CC_VERSION --sequence \$CC_SEQUENCE
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="\$1"
  case \$key in
  up)
    MODE="up"
    shift
    ;;
  down)
    MODE="down"
    shift
    ;;
  restart)
    MODE="restart"
    shift
    ;;
  createChannel)
    MODE="createChannel"
    shift
    ;;
  deployCC)
    MODE="deployCC"
    shift
    ;;
  -h)
    printHelp
    exit 0
    ;;
  -c)
    CHANNEL_NAME="\$2"
    shift
    shift
    ;;
  -ca)
    CRYPTO="Certificate Authorities"
    shift
    ;;
  -s)
    DB_TYPE="\$2"
    shift
    shift
    ;;
  -verbose)
    VERBOSE=true
    shift
    ;;
  *)
    echo "Unknown flag: \$key"
    printHelp
    exit 1
    ;;
  esac
done

# Execute mode
case \$MODE in
"up")
  networkUp
  ;;
"down")
  networkDown
  ;;
"restart")
  networkDown
  networkUp
  ;;
"createChannel")
  createChannel
  ;;
"deployCC")
  deployChaincode
  ;;
*)
  printHelp
  exit 1
  ;;
esac
`;
}