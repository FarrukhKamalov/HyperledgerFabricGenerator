import React, { useState } from 'react';
import { Code, Search, Eye, Copy, Check, X, Download, Zap, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';

// Types
interface ChaincodeTemplate {
  id: string;
  name: string;
  description: string;
  language: 'javascript' | 'typescript' | 'go';
  complexity: 'basic' | 'intermediate' | 'advanced';
  category: string;
  code: string;
}

interface AssetProperty {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

interface NoCodeChaincode {
  name: string;
  description: string;
  assetName: string;
  properties: AssetProperty[];
  functions: string[];
  accessControl: string;
}

// Constants
const PROPERTY_TYPES = ['string', 'number', 'boolean', 'datetime', 'array', 'object'];
const FUNCTION_TYPES = ['create', 'read', 'update', 'delete', 'transfer', 'query', 'history'];
const ACCESS_CONTROL_TYPES = ['public', 'private', 'org-based', 'role-based', 'attribute-based'];

// Helper function to generate TypeScript chaincode
function generateTypescriptChaincode(chaincode: NoCodeChaincode): string {
  const properties = chaincode.properties.map(prop => {
    return `    ${prop.name}${prop.required ? '' : '?'}: ${prop.type};`;
  }).join('\n');

  const assetInterface = `interface ${chaincode.assetName} {
    ID: string;
${properties}
}`;

  const createFunction = chaincode.functions.includes('create') ? `
  // CreateAsset issues a new asset to the world state with given details.
  @Transaction()
  public async Create${chaincode.assetName}(ctx: Context, id: string, ${chaincode.properties.map(p => `${p.name}: ${p.type}`).join(', ')}): Promise<void> {
    const exists = await this.${chaincode.assetName}Exists(ctx, id);
    if (exists) {
      throw new Error("The asset ${chaincode.assetName} " + id + " already exists");
    }

    const asset: ${chaincode.assetName} = {
      ID: id,
      ${chaincode.properties.map(p => `${p.name}: ${p.name}`).join(',\n      ')}
    };
    
    await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
  }` : '';

  const readFunction = chaincode.functions.includes('read') ? `
  // Read${chaincode.assetName} returns the asset stored in the world state with given id.
  @Transaction(false)
  public async Read${chaincode.assetName}(ctx: Context, id: string): Promise<string> {
    const assetJSON = await ctx.stub.getState(id);
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error("The asset ${chaincode.assetName} " + id + " does not exist");
    }
    return assetJSON.toString();
  }` : '';

  const updateFunction = chaincode.functions.includes('update') ? `
  // Update${chaincode.assetName} updates an existing asset in the world state with provided parameters.
  @Transaction()
  public async Update${chaincode.assetName}(ctx: Context, id: string, ${chaincode.properties.map(p => `${p.name}: ${p.type}`).join(', ')}): Promise<void> {
    const exists = await this.${chaincode.assetName}Exists(ctx, id);
    if (!exists) {
      throw new Error("The asset ${chaincode.assetName} " + id + " does not exist");
    }

    const asset: ${chaincode.assetName} = {
      ID: id,
      ${chaincode.properties.map(p => `${p.name}: ${p.name}`).join(',\n      ')}
    };
    
    await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
  }` : '';

  const deleteFunction = chaincode.functions.includes('delete') ? `
  // Delete${chaincode.assetName} deletes an given asset from the world state.
  @Transaction()
  public async Delete${chaincode.assetName}(ctx: Context, id: string): Promise<void> {
    const exists = await this.${chaincode.assetName}Exists(ctx, id);
    if (!exists) {
      throw new Error("The asset ${chaincode.assetName} " + id + " does not exist");
    }
    return ctx.stub.deleteState(id);
  }` : '';

  const transferFunction = chaincode.functions.includes('transfer') ? `
  // Transfer${chaincode.assetName} updates the owner field of asset with given id in world state.
  @Transaction()
  public async Transfer${chaincode.assetName}(ctx: Context, id: string, newOwner: string): Promise<void> {
    const assetString = await this.Read${chaincode.assetName}(ctx, id);
    const asset: ${chaincode.assetName} = JSON.parse(assetString);
    asset.owner = newOwner;
    await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
  }` : '';

  const queryFunction = chaincode.functions.includes('query') ? `
  // GetAll${chaincode.assetName}s returns all assets found in world state.
  @Transaction(false)
  public async GetAll${chaincode.assetName}s(ctx: Context): Promise<string> {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }` : '';

  const historyFunction = chaincode.functions.includes('history') ? `
  // Get${chaincode.assetName}History returns the chain of custody for an asset since issuance.
  @Transaction(false)
  public async Get${chaincode.assetName}History(ctx: Context, id: string): Promise<string> {
    const iterator = await ctx.stub.getHistoryForKey(id);
    const results = [];
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      results.push({
        txId: result.value.txId,
        timestamp: result.value.timestamp,
        value: record
      });
      result = await iterator.next();
    }
    return JSON.stringify(results);
  }` : '';

  const existsFunction = `
  // ${chaincode.assetName}Exists returns true when asset with given ID exists in world state.
  @Transaction(false)
  public async ${chaincode.assetName}Exists(ctx: Context, id: string): Promise<boolean> {
    const assetJSON = await ctx.stub.getState(id);
    return assetJSON && assetJSON.length > 0;
  }`;

  const accessControlComment = `
  // Access control based on ${chaincode.accessControl} permissions
  // ${chaincode.accessControl === 'public' ? 'Anyone can access this chaincode' : 
      chaincode.accessControl === 'private' ? 'Only specific identities can access this chaincode' :
      chaincode.accessControl === 'org-based' ? 'Access is restricted to specific organizations' :
      chaincode.accessControl === 'role-based' ? 'Access is based on user roles' :
      'Access is based on user attributes'}`;

  return `/*
 * ${chaincode.name}
 * ${chaincode.description}
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

${assetInterface}

@Info({title: '${chaincode.name}', description: '${chaincode.description}'})
export class ${chaincode.name} extends Contract {

  // InitLedger adds a base set of assets to the ledger
  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
    const assets: ${chaincode.assetName}[] = [
      {
        ID: 'asset1',
        ${chaincode.properties.map(p => {
          if (p.type === 'string') return `${p.name}: 'Sample value'`;
          if (p.type === 'number') return `${p.name}: 100`;
          if (p.type === 'boolean') return `${p.name}: true`;
          return `${p.name}: 'Sample value'`;
        }).join(',\n        ')}
      },
      {
        ID: 'asset2',
        ${chaincode.properties.map(p => {
          if (p.type === 'string') return `${p.name}: 'Another sample'`;
          if (p.type === 'number') return `${p.name}: 200`;
          if (p.type === 'boolean') return `${p.name}: false`;
          return `${p.name}: 'Another sample'`;
        }).join(',\n        ')}
      }
    ];

    for (const asset of assets) {
      await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
      console.log("Asset " + asset.ID + " initialized");
    }
  }
${accessControlComment}
${existsFunction}
${createFunction}
${readFunction}
${updateFunction}
${deleteFunction}
${transferFunction}
${queryFunction}
${historyFunction}
}`;
}

// Chaincode Templates
const CHAINCODE_TEMPLATES: ChaincodeTemplate[] = [
  {
    id: 'asset-transfer-basic',
    name: 'Asset Transfer (Basic)',
    description: 'A basic sample for transferring assets on a ledger',
    language: 'typescript',
    complexity: 'basic',
    category: 'asset-management',
    code: `/*
 * Asset Transfer Basic
 * A basic sample for transferring assets on a ledger
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

export interface Asset {
    ID: string;
    Color: string;
    Size: number;
    Owner: string;
    AppraisedValue: number;
}

@Info({title: 'AssetTransfer', description: 'Smart contract for trading assets'})
export class AssetTransfer extends Contract {

    // InitLedger adds a base set of assets to the ledger
    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const assets: Asset[] = [
            {
                ID: 'asset1',
                Color: 'blue',
                Size: 5,
                Owner: 'Tomoko',
                AppraisedValue: 300,
            },
            {
                ID: 'asset2',
                Color: 'red',
                Size: 5,
                Owner: 'Brad',
                AppraisedValue: 400,
            },
            {
                ID: 'asset3',
                Color: 'green',
                Size: 10,
                Owner: 'Jin Soo',
                AppraisedValue: 500,
            },
            {
                ID: 'asset4',
                Color: 'yellow',
                Size: 10,
                Owner: 'Max',
                AppraisedValue: 600,
            },
            {
                ID: 'asset5',
                Color: 'black',
                Size: 15,
                Owner: 'Adriana',
                AppraisedValue: 700,
            },
            {
                ID: 'asset6',
                Color: 'white',
                Size: 15,
                Owner: 'Michel',
                AppraisedValue: 800,
            },
        ];

        for (const asset of assets) {
            await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
            console.log("Asset " + asset.ID + " initialized");
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    @Transaction()
    public async CreateAsset(ctx: Context, id: string, color: string, size: number, owner: string, appraisedValue: number): Promise<void> {
        const asset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    }

    // ReadAsset returns the asset stored in the world state with given id.
    @Transaction(false)
    public async ReadAsset(ctx: Context, id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error("The asset " + id + " does not exist");
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    @Transaction()
    public async UpdateAsset(ctx: Context, id: string, color: string, size: number, owner: string, appraisedValue: number): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error("The asset " + id + " does not exist");
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedAsset)));
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteAsset(ctx: Context, id: string): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error("The asset " + id + " does not exist");
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    public async AssetExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    @Transaction()
    public async TransferAsset(ctx: Context, id: string, newOwner: string): Promise<void> {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        asset.Owner = newOwner;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    }

    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    public async GetAllAssets(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}`
  },
  {
    id: 'token-erc20',
    name: 'Token Contract (ERC20-like)',
    description: 'A token contract similar to ERC20 standard',
    language: 'typescript',
    complexity: 'intermediate',
    category: 'tokens',
    code: `/*
 * Token Contract (ERC20-like)
 * A token contract similar to ERC20 standard
 */

import { Context, Contract, Info, Transaction } from 'fabric-contract-api';

interface TokenBalance {
    owner: string;
    balance: number;
}

@Info({title: 'TokenContract', description: 'ERC20-like token contract'})
export class TokenContract extends Contract {

    // Initialize the ledger with token balances
    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const balances: TokenBalance[] = [
            { owner: 'admin', balance: 1000000 },
            { owner: 'user1', balance: 100 },
            { owner: 'user2', balance: 200 }
        ];

        for (const balance of balances) {
            await ctx.stub.putState(balance.owner, Buffer.from(JSON.stringify(balance)));
            console.log("Balance for " + balance.owner + " initialized");
        }
    }

    // Get the balance of a specific account
    @Transaction(false)
    public async BalanceOf(ctx: Context, owner: string): Promise<number> {
        const balanceBytes = await ctx.stub.getState(owner);
        if (!balanceBytes || balanceBytes.length === 0) {
            return 0;
        }
        const balance: TokenBalance = JSON.parse(balanceBytes.toString());
        return balance.balance;
    }

    // Transfer tokens from one account to another
    @Transaction()
    public async Transfer(ctx: Context, from: string, to: string, amount: number): Promise<boolean> {
        amount = parseInt(amount.toString());
        if (amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        // Get the balance of the sender
        const fromBalanceBytes = await ctx.stub.getState(from);
        if (!fromBalanceBytes || fromBalanceBytes.length === 0) {
            throw new Error("Sender account " + from + " not found");
        }
        const fromBalance: TokenBalance = JSON.parse(fromBalanceBytes.toString());

        // Check if the sender has enough tokens
        if (fromBalance.balance < amount) {
            throw new Error("Insufficient funds");
        }

        // Get the balance of the recipient
        let toBalance: TokenBalance;
        const toBalanceBytes = await ctx.stub.getState(to);
        if (!toBalanceBytes || toBalanceBytes.length === 0) {
            toBalance = { owner: to, balance: 0 };
        } else {
            toBalance = JSON.parse(toBalanceBytes.toString());
        }

        // Update balances
        fromBalance.balance -= amount;
        toBalance.balance += amount;

        // Save the updated balances
        await ctx.stub.putState(from, Buffer.from(JSON.stringify(fromBalance)));
        await ctx.stub.putState(to, Buffer.from(JSON.stringify(toBalance)));

        // Emit a transfer event
        const transferEvent = { from, to, amount };
        ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

        return true;
    }

    // Mint new tokens and assign them to an account
    @Transaction()
    public async Mint(ctx: Context, to: string, amount: number): Promise<boolean> {
        // Check if the caller is the admin
        const clientID = this.getClientID(ctx);
        if (clientID !== 'admin') {
            throw new Error("Only admin can mint tokens");
        }

        amount = parseInt(amount.toString());
        if (amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        // Get the balance of the recipient
        let toBalance: TokenBalance;
        const toBalanceBytes = await ctx.stub.getState(to);
        if (!toBalanceBytes || toBalanceBytes.length === 0) {
            toBalance = { owner: to, balance: 0 };
        } else {
            toBalance = JSON.parse(toBalanceBytes.toString());
        }

        // Update balance
        toBalance.balance += amount;

        // Save the updated balance
        await ctx.stub.putState(to, Buffer.from(JSON.stringify(toBalance)));

        // Emit a mint event
        const mintEvent = { to, amount };
        ctx.stub.setEvent('Mint', Buffer.from(JSON.stringify(mintEvent)));

        return true;
    }

    // Burn tokens from an account
    @Transaction()
    public async Burn(ctx: Context, from: string, amount: number): Promise<boolean> {
        // Check if the caller is the admin or the owner
        const clientID = this.getClientID(ctx);
        if (clientID !== 'admin' && clientID !== from) {
            throw new Error("Only admin or owner can burn tokens");
        }

        amount = parseInt(amount.toString());
        if (amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        // Get the balance of the account
        const fromBalanceBytes = await ctx.stub.getState(from);
        if (!fromBalanceBytes || fromBalanceBytes.length === 0) {
            throw new Error("Account " + from + " not found");
        }
        const fromBalance: TokenBalance = JSON.parse(fromBalanceBytes.toString());

        // Check if the account has enough tokens
        if (fromBalance.balance < amount) {
            throw new Error("Insufficient funds");
        }

        // Update balance
        fromBalance.balance -= amount;

        // Save the updated balance
        await ctx.stub.putState(from, Buffer.from(JSON.stringify(fromBalance)));

        // Emit a burn event
        const burnEvent = { from, amount };
        ctx.stub.setEvent('Burn', Buffer.from(JSON.stringify(burnEvent)));

        return true;
    }

    // Get all token balances
    @Transaction(false)
    public async GetAllBalances(ctx: Context): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // Helper function to get the client ID
    private getClientID(ctx: Context): string {
        const clientID = ctx.clientIdentity.getID();
        const idComponents = clientID.split('::');
        return idComponents[1].split('/')[0];
    }
}`
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain Management',
    description: 'Track products through a supply chain',
    language: 'typescript',
    complexity: 'advanced',
    category: 'supply-chain',
    code: `/*
 * Supply Chain Management
 * Track products through a supply chain
 */

import { Context, Contract, Info, Transaction } from 'fabric-contract-api';

enum ProductStatus {
    CREATED = 'CREATED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    RECEIVED = 'RECEIVED'
}

interface Product {
    id: string;
    name: string;
    description: string;
    manufacturer: string;
    owner: string;
    status: ProductStatus;
    createdAt: number;
    updatedAt: number;
    location: string;
    temperature?: number;
    humidity?: number;
}

interface ShipmentEvent {
    productId: string;
    from: string;
    to: string;
    timestamp: number;
    location: string;
    temperature?: number;
    humidity?: number;
}

@Info({title: 'SupplyChainContract', description: 'Smart contract for tracking products in a supply chain'})
export class SupplyChainContract extends Contract {

    // Initialize the ledger with sample products
    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const products: Product[] = [
            {
                id: 'product1',
                name: 'Laptop',
                description: 'High-end laptop with 16GB RAM',
                manufacturer: 'TechCorp',
                owner: 'TechCorp',
                status: ProductStatus.CREATED,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                location: 'Factory A, Building 1'
            },
            {
                id: 'product2',
                name: 'Smartphone',
                description: 'Latest smartphone model',
                manufacturer: 'MobileTech',
                owner: 'MobileTech',
                status: ProductStatus.CREATED,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                location: 'Factory B, Building 2'
            }
        ];

        for (const product of products) {
            await ctx.stub.putState(product.id, Buffer.from(JSON.stringify(product)));
            console.log("Product " + product.id + " initialized");
        }
    }

    // Create a new product
    @Transaction()
    public async CreateProduct(ctx: Context, id: string, name: string, description: string): Promise<void> {
        const exists = await this.ProductExists(ctx, id);
        if (exists) {
            throw new Error("The product " + id + " already exists");
        }

        const manufacturer = this.getClientID(ctx);
        const timestamp = Date.now();

        const product: Product = {
            id,
            name,
            description,
            manufacturer,
            owner: manufacturer,
            status: ProductStatus.CREATED,
            createdAt: timestamp,
            updatedAt: timestamp,
            location: 'Manufacturer Facility'
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(product)));
        
        // Emit a product created event
        const event = { id, manufacturer, timestamp };
        ctx.stub.setEvent('ProductCreated', Buffer.from(JSON.stringify(event)));
    }

    // Ship a product to a new owner
    @Transaction()
    public async ShipProduct(ctx: Context, id: string, newOwner: string, location: string, temperature?: number, humidity?: number): Promise<void> {
        const productString = await this.ReadProduct(ctx, id);
        const product: Product = JSON.parse(productString);

        // Check if the caller is the current owner
        const clientID = this.getClientID(ctx);
        if (clientID !== product.owner) {
            throw new Error("Only the current owner can ship the product");
        }

        // Update product status and details
        product.status = ProductStatus.SHIPPED;
        product.updatedAt = Date.now();
        product.location = location;
        
        if (temperature) {
            product.temperature = parseFloat(temperature.toString());
        }
        
        if (humidity) {
            product.humidity = parseFloat(humidity.toString());
        }

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(product)));

        // Record shipment event
        const shipmentEvent: ShipmentEvent = {
            productId: id,
            from: product.owner,
            to: newOwner,
            timestamp: product.updatedAt,
            location,
            temperature: product.temperature,
            humidity: product.humidity
        };

        const shipmentKey = id + '-shipment-' + product.updatedAt;
        await ctx.stub.putState(shipmentKey, Buffer.from(JSON.stringify(shipmentEvent)));

        // Emit a product shipped event
        ctx.stub.setEvent('ProductShipped', Buffer.from(JSON.stringify(shipmentEvent)));
    }

    // Deliver a product
    @Transaction()
    public async DeliverProduct(ctx: Context, id: string, location: string, temperature?: number, humidity?: number): Promise<void> {
        const productString = await this.ReadProduct(ctx, id);
        const product: Product = JSON.parse(productString);

        // Check if the product is in SHIPPED status
        if (product.status !== ProductStatus.SHIPPED) {
            throw new Error("Product must be in SHIPPED status to be delivered");
        }

        // Update product status and details
        product.status = ProductStatus.DELIVERED;
        product.updatedAt = Date.now();
        product.location = location;
        
        if (temperature) {
            product.temperature = parseFloat(temperature.toString());
        }
        
        if (humidity) {
            product.humidity = parseFloat(humidity.toString());
        }

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(product)));

        // Emit a product delivered event
        const event = { id, location, timestamp: product.updatedAt };
        ctx.stub.setEvent('ProductDelivered', Buffer.from(JSON.stringify(event)));
    }

    // Receive a product
    @Transaction()
    public async ReceiveProduct(ctx: Context, id: string): Promise<void> {
        const productString = await this.ReadProduct(ctx, id);
        const product: Product = JSON.parse(productString);

        // Check if the product is in DELIVERED status
        if (product.status !== ProductStatus.DELIVERED) {
            throw new Error("Product must be in DELIVERED status to be received");
        }

        // Get the client ID of the receiver
        const clientID = this.getClientID(ctx);

        // Update product status and owner
        product.status = ProductStatus.RECEIVED;
        product.owner = clientID;
        product.updatedAt = Date.now();

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(product)));

        // Emit a product received event
        const event = { id, receiver: clientID, timestamp: product.updatedAt };
        ctx.stub.setEvent('ProductReceived', Buffer.from(JSON.stringify(event)));
    }

    // Read a product
    @Transaction(false)
    public async ReadProduct(ctx: Context, id: string): Promise<string> {
        const productJSON = await ctx.stub.getState(id);
        if (!productJSON || productJSON.length === 0) {
            throw new Error("The product " + id + " does not exist");
        }
        return productJSON.toString();
    }

    // Check if a product exists
    @Transaction(false)
    public async ProductExists(ctx: Context, id: string): Promise<boolean> {
        const productJSON = await ctx.stub.getState(id);
        return productJSON && productJSON.length > 0;
    }

    // Get all products
    @Transaction(false)
    public async GetAllProducts(ctx: Context): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Only include records that have an id field (products, not events)
                if (record.id) {
                    allResults.push(record);
                }
            } catch (err) {
                console.log(err);
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // Get the history of a product
    @Transaction(false)
    public async GetProductHistory(ctx: Context, id: string): Promise<string> {
        const exists = await this.ProductExists(ctx, id);
        if (!exists) {
            throw new Error("The product " + id + " does not exist");
        }

        const iterator = await ctx.stub.getHistoryForKey(id);
        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            results.push({
                txId: result.value.txId,
                timestamp: result.value.timestamp,
                value: record
            });
            result = await iterator.next();
        }
        return JSON.stringify(results);
    }

    // Get all shipment events for a product
    @Transaction(false)
    public async GetShipmentHistory(ctx: Context, id: string): Promise<string> {
        const exists = await this.ProductExists(ctx, id);
        if (!exists) {
            throw new Error("The product " + id + " does not exist");
        }

        const allResults = [];
        const iterator = await ctx.stub.getStateByPartialCompositeKey(id + '-shipment-', []);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                allResults.push(record);
            } catch (err) {
                console.log(err);
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // Helper function to get the client ID
    private getClientID(ctx: Context): string {
        const clientID = ctx.clientIdentity.getID();
        const idComponents = clientID.split('::');
        return idComponents[1].split('/')[0];
    }
}`
  },
  {
    id: 'voting-system',
    name: 'Voting System',
    description: 'A decentralized voting system',
    language: 'go',
    complexity: 'intermediate',
    category: 'governance',
    code: `/*
 * Voting System
 * A decentralized voting system
 */

package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// VotingContract provides functions for managing voting
type VotingContract struct {
	contractapi.Contract
}

// Election describes a voting election
type Election struct {
	ID          string    ` + "`json:\"id\"`" + `
	Name        string    ` + "`json:\"name\"`" + `
	Description string    ` + "`json:\"description\"`" + `
	StartTime   time.Time ` + "`json:\"startTime\"`" + `
	EndTime     time.Time ` + "`json:\"endTime\"`" + `
	Status      string    ` + "`json:\"status\"`" + `
	Creator     string    ` + "`json:\"creator\"`" + `
	Options     []string  ` + "`json:\"options\"`" + `
}

// Vote represents a vote cast by a voter
type Vote struct {
	ElectionID string ` + "`json:\"electionId\"`" + `
	Voter      string ` + "`json:\"voter\"`" + `
	Option     string ` + "`json:\"option\"`" + `
	Timestamp  int64  ` + "`json:\"timestamp\"`" + `
}

// VoteCount represents the count of votes for an option
type VoteCount struct {
	Option string ` + "`json:\"option\"`" + `
	Count  int    ` + "`json:\"count\"`" + `
}

// ElectionResult represents the result of an election
type ElectionResult struct {
	ElectionID string      ` + "`json:\"electionId\"`" + `
	Name       string      ` + "`json:\"name\"`" + `
	TotalVotes int         ` + "`json:\"totalVotes\"`" + `
	Results    []VoteCount ` + "`json:\"results\"`" + `
}

// InitLedger adds a base set of elections to the ledger
func (s *VotingContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	elections := []Election{
		{
			ID:          "election1",
			Name:        "Board Member Election",
			Description: "Election for the new board member",
			StartTime:   time.Now(),
			EndTime:     time.Now().Add(7 * 24 * time.Hour),
			Status:      "ACTIVE",
			Creator:     "admin",
			Options:     []string{"Candidate A", "Candidate B", "Candidate C"},
		},
	}

	for _, election := range elections {
		electionJSON, err := json.Marshal(election)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(election.ID, electionJSON)
		if err != nil {
			return fmt.Errorf("failed to put to world state: %v", err)
		}
		fmt.Println("Election " + election.ID + " initialized")
	}

	return nil
}

// CreateElection creates a new election
func (s *VotingContract) CreateElection(ctx contractapi.TransactionContextInterface, id string, name string, description string, startTimeStr string, endTimeStr string, options string) error {
	exists, err := s.ElectionExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the election %s already exists", id)
	}

	// Parse start and end times
	startTime, err := time.Parse(time.RFC3339, startTimeStr)
	if err != nil {
		return fmt.Errorf("invalid start time format: %v", err)
	}

	endTime, err := time.Parse(time.RFC3339, endTimeStr)
	if err != nil {
		return fmt.Errorf("invalid end time format: %v", err)
	}

	// Parse options
	var optionsArray []string
	err = json.Unmarshal([]byte(options), &optionsArray)
	if err != nil {
		return fmt.Errorf("invalid options format: %v", err)
	}

	// Get the creator's identity
	creator, err := s.getClientID(ctx)
	if err != nil {
		return err
	}

	// Create the election
	election := Election{
		ID:          id,
		Name:        name,
		Description: description,
		StartTime:   startTime,
		EndTime:     endTime,
		Status:      "CREATED",
		Creator:     creator,
		Options:     optionsArray,
	}

	electionJSON, err := json.Marshal(election)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, electionJSON)
}

// StartElection changes the status of an election to ACTIVE
func (s *VotingContract) StartElection(ctx contractapi.TransactionContextInterface, id string) error {
	election, err := s.ReadElection(ctx, id)
	if err != nil {
		return err
	}

	// Check if the caller is the creator
	creator, err := s.getClientID(ctx)
	if err != nil {
		return err
	}
	if creator != election.Creator {
		return fmt.Errorf("only the creator can start the election")
	}

	// Update the status
	election.Status = "ACTIVE"
	election.StartTime = time.Now()

	electionJSON, err := json.Marshal(election)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, electionJSON)
}

// EndElection changes the status of an election to ENDED
func (s *VotingContract) EndElection(ctx contractapi.TransactionContextInterface, id string) error {
	election, err := s.ReadElection(ctx, id)
	if err != nil {
		return err
	}

	// Check if the caller is the creator
	creator, err := s.getClientID(ctx)
	if err != nil {
		return err
	}
	if creator != election.Creator {
		return fmt.Errorf("only the creator can end the election")
	}

	// Update the status
	election.Status = "ENDED"
	election.EndTime = time.Now()

	electionJSON, err := json.Marshal(election)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, electionJSON)
}

// CastVote allows a voter to cast a vote in an election
func (s *VotingContract) CastVote(ctx contractapi.TransactionContextInterface, electionID string, option string) error {
	// Get the election
	election, err := s.ReadElection(ctx, electionID)
	if err != nil {
		return err
	}

	// Check if the election is active
	if election.Status != "ACTIVE" {
		return fmt.Errorf("the election is not active")
	}

	// Check if the option is valid
	optionValid := false
	for _, validOption := range election.Options {
		if option == validOption {
			optionValid = true
			break
		}
	}
	if !optionValid {
		return fmt.Errorf("invalid option: %s", option)
	}

	// Get the voter's identity
	voter, err := s.getClientID(ctx)
	if err != nil {
		return err
	}

	// Check if the voter has already voted
	voteKey := electionID + "-vote-" + voter
	voteBytes, err := ctx.GetStub().GetState(voteKey)
	if err != nil {
		return fmt.Errorf("failed to read vote: %v", err)
	}
	if voteBytes != nil {
		return fmt.Errorf("you have already voted in this election")
	}

	// Create the vote
	vote := Vote{
		ElectionID: electionID,
		Voter:      voter,
		Option:     option,
		Timestamp:  time.Now().Unix(),
	}

	voteJSON, err := json.Marshal(vote)
	if err != nil {
		return err
	}

	// Save the vote
	err = ctx.GetStub().PutState(voteKey, voteJSON)
	if err != nil {
		return fmt.Errorf("failed to save vote: %v", err)
	}

	// Update vote count
	countKey := electionID + "-count-" + option
	countBytes, err := ctx.GetStub().GetState(countKey)
	if err != nil {
		return fmt.Errorf("failed to read vote count: %v", err)
	}

	var count int
	if countBytes != nil {
		err = json.Unmarshal(countBytes, &count)
		if err != nil {
			return fmt.Errorf("failed to unmarshal vote count: %v", err)
		}
	}

	count++
	countJSON, err := json.Marshal(count)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(countKey, countJSON)
	if err != nil {
		return fmt.Errorf("failed to save vote count: %v", err)
	}

	return nil
}

// GetElectionResults returns the results of an election
func (s *VotingContract) GetElectionResults(ctx contractapi.TransactionContextInterface, electionID string) (*ElectionResult, error) {
	// Get the election
	election, err := s.ReadElection(ctx, electionID)
	if err != nil {
		return nil, err
	}

	// Check if the election has ended
	if election.Status != "ENDED" {
		return nil, fmt.Errorf("the election has not ended yet")
	}

	// Get the vote counts for each option
	var results []VoteCount
	totalVotes := 0

	for _, option := range election.Options {
		countKey := electionID + "-count-" + option
		countBytes, err := ctx.GetStub().GetState(countKey)
		if err != nil {
			return nil, fmt.Errorf("failed to read vote count: %v", err)
		}

		var count int
		if countBytes != nil {
			err = json.Unmarshal(countBytes, &count)
			if err != nil {
				return nil, fmt.Errorf("failed to unmarshal vote count: %v", err)
			}
		}

		results = append(results, VoteCount{
			Option: option,
			Count:  count,
		})

		totalVotes += count
	}

	// Create the election result
	electionResult := ElectionResult{
		ElectionID: electionID,
		Name:       election.Name,
		TotalVotes: totalVotes,
		Results:    results,
	}

	return &electionResult, nil
}

// ReadElection returns the election stored in the world state with given id
func (s *VotingContract) ReadElection(ctx contractapi.TransactionContextInterface, id string) (*Election, error) {
	electionJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if electionJSON == nil {
		return nil, fmt.Errorf("the election %s does not exist", id)
	}

	var election Election
	err = json.Unmarshal(electionJSON, &election)
	if err != nil {
		return nil, err
	}

	return &election, nil
}

// ElectionExists returns true when election with given ID exists in world state
func (s *VotingContract) ElectionExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	electionJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return electionJSON != nil, nil
}

// GetAllElections returns all elections found in world state
func (s *VotingContract) GetAllElections(ctx contractapi.TransactionContextInterface) ([]*Election, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var elections []*Election
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		// Skip vote and count records
		if len(queryResponse.Key) > 6 && (queryResponse.Key[:5] == "vote-" || queryResponse.Key[:6] == "count-") {
			continue
		}

		var election Election
		err = json.Unmarshal(queryResponse.Value, &election)
		if err != nil {
			return nil, err
		}
		elections = append(elections, &election)
	}

	return elections, nil
}

// Helper function to get the client ID
func (s *VotingContract) getClientID(ctx contractapi.TransactionContextInterface) (string, error) { func (s *VotingContract) getClientID(ctx contractapi.TransactionContextInterface) (string, error) {
	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return "", fmt.Errorf("failed to get client identity: %v", err)
	}

	return clientID, nil
}

// main function starts up the chaincode in the container during instantiate
func main() {
	chaincode, err := contractapi.NewChaincode(new(VotingContract))
	if err != nil {
		fmt.Printf("Error creating voting chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting voting chaincode: %s", err.Error())
	}
}
`
  }
];

function ChaincodeTemplateCard({ template, onSelect, isDark }: { template: ChaincodeTemplate, onSelect: () => void, isDark: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'javascript': return 'bg-yellow-500 dark:bg-yellow-600';
      case 'typescript': return 'bg-blue-500 dark:bg-blue-600';
      case 'go': return 'bg-cyan-500 dark:bg-cyan-600';
      default: return 'bg-gray-500 dark:bg-gray-600';
    }
  };
  
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'bg-green-500 dark:bg-green-600';
      case 'intermediate': return 'bg-yellow-500 dark:bg-yellow-600';
      case 'advanced': return 'bg-red-500 dark:bg-red-600';
      default: return 'bg-gray-500 dark:bg-gray-600';
    }
  };
  
  return (
    <div 
      className={`border rounded-lg p-5 transition-all duration-200 ${
        isHovered 
          ? isDark ? 'border-indigo-500 bg-indigo-900/30 transform scale-[1.02]' : 'border-indigo-500 bg-indigo-50 transform scale-[1.02]'
          : isDark ? 'border-gray-700 hover:border-indigo-500' : 'border-gray-200 hover:border-indigo-300'
      } cursor-pointer`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium">{template.name}</h3>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full text-white ${getLanguageColor(template.language)}`}>
            {template.language}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full text-white ${getComplexityColor(template.complexity)}`}>
            {template.complexity}
          </span>
        </div>
      </div>
      <p className="text-sm opacity-70 mb-4">{template.description}</p>
      <div className="flex justify-end space-x-2">
        <button 
          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg ${
            isDark 
              ? 'bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-300'
              : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
          } transition-colors duration-200`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          Preview
        </button>
      </div>
    </div>
  );
}

function NoCodeChaincodeForm({ 
  chaincode, 
  setChaincode, 
  onGenerate, 
  isDark 
}: { 
  chaincode: NoCodeChaincode, 
  setChaincode: React.Dispatch<React.SetStateAction<NoCodeChaincode>>, 
  onGenerate: () => void,
  isDark: boolean
}) {
  const [newProperty, setNewProperty] = useState<AssetProperty>({
    id: '',
    name: '',
    type: 'string',
    required: true
  });
  
  const addProperty = () => {
    if (!newProperty.name) return;
    
    setChaincode(prev => ({
      ...prev,
      properties: [...prev.properties, {
        ...newProperty,
        id: crypto.randomUUID()
      }]
    }));
    
    setNewProperty({
      id: '',
      name: '',
      type: 'string',
      required: true
    });
  };
  
  const removeProperty = (id: string) => {
    setChaincode(prev => ({
      ...prev,
      properties: prev.properties.filter(prop => prop.id !== id)
    }));
  };
  
  const toggleFunction = (func: string) => {
    setChaincode(prev => {
      if (prev.functions.includes(func)) {
        return {
          ...prev,
          functions: prev.functions.filter(f => f !== func)
        };
      } else {
        return {
          ...prev,
          functions: [...prev.functions, func]
        };
      }
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">
              Contract Name
            </label>
            <input
              type="text"
              value={chaincode.name}
              onChange={(e) => setChaincode(prev => ({ ...prev, name: e.target.value }))}
              placeholder="MyAssetContract"
              className={`block w-full rounded-lg ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">
              Asset Name
            </label>
            <input
              type="text"
              value={chaincode.assetName}
              onChange={(e) => setChaincode(prev => ({ ...prev, assetName: e.target.value }))}
              placeholder="Asset"
              className={`block w-full rounded-lg ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 opacity-70">
            Description
          </label>
          <textarea
            value={chaincode.description}
            onChange={(e) => setChaincode(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your chaincode..."
            rows={3}
            className={`block w-full rounded-lg ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
        </div>
      </div>
      
      {/* Asset Properties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Asset Properties</h3>
          <div className="text-xs opacity-70">
            Define the structure of your asset
          </div>
        </div>
        
        <div className="space-y-4">
          {chaincode.properties.map(property => (
            <div 
              key={property.id} 
              className={`flex items-center space-x-4 p-3 rounded-lg ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-50'
              }`}
            >
              <div className="flex-grow">
                <div className="font-medium">{property.name}</div>
                <div className="text-xs opacity-70">
                  Type: {property.type} • {property.required ? 'Required' : 'Optional'}
                </div>
              </div>
              <button
                onClick={() => removeProperty(property.id)}
                className={`p-1.5 rounded-full ${
                  isDark 
                    ? 'hover:bg-red-900/50 text-red-400 hover:text-red-300'
                    : 'hover:bg-red-100 text-red-500 hover:text-red-600'
                }`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1 opacity-70">
                  Property Name
                </label>
                <input
                  type="text"
                  value={newProperty.name}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., owner"
                  className={`block w-full rounded-lg ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 opacity-70">
                  Type
                </label>
                <select
                  value={newProperty.type}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, type: e.target.value }))}
                  className={`block w-full rounded-lg ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 opacity-70">
                  Required
                </label>
                <div className="flex items-center h-9">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProperty.required}
                      onChange={(e) => setNewProperty(prev => ({ ...prev, required: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className={`relative w-11 h-6 ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    } peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      isDark ? 'peer-checked:bg-indigo-600' : 'peer-checked:bg-indigo-600'
                    }`}></div>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={addProperty}
                disabled={!newProperty.name}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg ${
                  !newProperty.name
                    ? isDark ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed'
                    : isDark ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white transition-colors duration-200`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Property
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Functions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Functions</h3>
          <div className="text-xs opacity-70">
            Select the functions to include
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FUNCTION_TYPES.map(func => (
            <div 
              key={func}
              onClick={() => toggleFunction(func)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                chaincode.functions.includes(func)
                  ? isDark ? 'bg-indigo-900/50 border-2 border-indigo-700' : 'bg-indigo-100 border-2 border-indigo-300'
                  : isDark ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium capitalize">{func}</div>
                <div className={`w-4 h-4 rounded-full ${
                  chaincode.functions.includes(func)
                    ? isDark ? 'bg-indigo-500' : 'bg-indigo-600'
                    : isDark ? 'bg-gray-700' : 'bg-gray-300'
                }`}></div>
              </div>
              <div className="text-xs opacity-70">
                {func === 'create' && 'Create new assets'}
                {func === 'read' && 'Read asset details'}
                {func === 'update' && 'Update existing assets'}
                {func === 'delete' && 'Delete assets'}
                {func === 'transfer' && 'Transfer ownership'}
                {func === 'query' && 'Query all assets'}
                {func === 'history' && 'Get asset history'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Access Control */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Access Control</h3>
          <div className="text-xs opacity-70">
            Define who can access your chaincode
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ACCESS_CONTROL_TYPES.map(type => (
            <div 
              key={type}
              onClick={() => setChaincode(prev => ({ ...prev, accessControl: type }))}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                chaincode.accessControl === type
                  ? isDark ? 'bg-indigo-900/50 border-2 border-indigo-700' : 'bg-indigo-100 border-2 border-indigo-300'
                  : isDark ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium capitalize">{type.replace('-', ' ')}</div>
                <div className={`w-4 h-4 rounded-full ${
                  chaincode.accessControl === type
                    ? isDark ? 'bg-indigo-500' : 'bg-indigo-600'
                    : isDark ? 'bg-gray-700' : 'bg-gray-300'
                }`}></div>
              </div>
              <div className="text-xs opacity-70">
                {type === 'public' && 'Anyone can access'}
                {type === 'private' && 'Only specific identities'}
                {type === 'org-based' && 'Based on organization'}
                {type === 'role-based' && 'Based on user roles'}
                {type === 'attribute-based' && 'Based on attributes'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Generate Button */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onGenerate}
          disabled={!chaincode.name || !chaincode.assetName || chaincode.properties.length === 0 || chaincode.functions.length === 0}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg ${
            !chaincode.name || !chaincode.assetName || chaincode.properties.length === 0 || chaincode.functions.length === 0
              ? isDark ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed'
              : isDark ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white transition-colors duration-200`}
        >
          <Zap className="h-4 w-4 mr-2" />
          Generate Chaincode
        </button>
      </div>
    </div>
  );
}

export default function Chaincodes({ isDark }: { isDark: boolean }) {
  const [activeTab, setActiveTab] = useState<'templates' | 'generator'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ChaincodeTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [noCodeChaincode, setNoCodeChaincode] = useState<NoCodeChaincode>({
    name: 'AssetContract',
    description: 'A contract for managing assets',
    assetName: 'Asset',
    properties: [
      {
        id: crypto.randomUUID(),
        name: 'owner',
        type: 'string',
        required: true
      },
      {
        id: crypto.randomUUID(),
        name: 'value',
        type: 'number',
        required: true
      }
    ],
    functions: ['create', 'read', 'update', 'delete'],
    accessControl: 'public'
  });
  
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleTemplateSelect = (template: ChaincodeTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };
  
  const handleGenerateCode = () => {
    const code = generateTypescriptChaincode(noCodeChaincode);
    setGeneratedCode(code);
    setShowPreview(true);
  };
  
  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleDownload = () => {
    if (activeTab === 'templates' && selectedTemplate) {
      downloadCode(selectedTemplate.code, `${selectedTemplate.id}.${selectedTemplate.language === 'go' ? 'go' : 'js'}`);
    } else if (activeTab === 'generator' && generatedCode) {
      downloadCode(generatedCode, `${noCodeChaincode.name.toLowerCase()}.js`);
    }
  };
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <nav className={`sticky top-0 z-30 backdrop-blur-md ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center ml-16 md:ml-0">
              <Code className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 text-xl font-semibold">
                Chaincode Development
              </span>
            </div>
            <div className="flex space-x-2">
              {(showPreview && (selectedTemplate || generatedCode)) && (
                <button
                  onClick={handleDownload}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg ${
                    isDark ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white transition-colors duration-200`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ml-20 md:ml-auto transition-all duration-300">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          <button
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'templates'
                ? isDark ? 'border-indigo-500 text-indigo-400' : 'border-indigo-600 text-indigo-700'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'
            } transition-colors duration-200`}
            onClick={() => {
              setActiveTab('templates');
              setShowPreview(false);
            }}
          >
            Chaincode Templates
          </button>
          <button
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'generator'
                ? isDark ? 'border-indigo-500 text-indigo-400' : 'border-indigo-600 text-indigo-700'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'
            } transition-colors duration-200`}
            onClick={() => {
              setActiveTab('generator');
              setShowPreview(false);
            }}
          >
            No-Code Generator
          </button>
        </div>
        
        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel */}
          <div className={`${showPreview ? 'lg:block' : 'lg:col-span-2'} ${showPreview ? 'hidden' : 'block'}`}>
            {activeTab === 'templates' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Chaincode Templates</h2>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      className={`pl-9 pr-4 py-2 text-sm rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {CHAINCODE_TEMPLATES.map(template => (
                    <ChaincodeTemplateCard 
                      key={template.id} 
                      template={template} 
                      onSelect={() => handleTemplateSelect(template)}
                      isDark={isDark}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">No-Code Chaincode Generator</h2>
                </div>
                
                <NoCodeChaincodeForm 
                  chaincode={noCodeChaincode} 
                  setChaincode={setNoCodeChaincode} 
                  onGenerate={handleGenerateCode}
                  isDark={isDark}
                />
              </div>
            )}
          </div>
          
          {/* Right Panel - Code Preview */}
          {showPreview && (
            <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">
                  {activeTab === 'templates' && selectedTemplate 
                    ? selectedTemplate.name 
                    : `Generated ${noCodeChaincode.name} Contract`}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopy(activeTab === 'templates' && selectedTemplate ? selectedTemplate.code : generatedCode || '')}
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } transition-colors duration-200`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy Code
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } transition-colors duration-200`}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Close
                  </button>
                </div>
              </div>
              
              <div className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`px-4 py-2 text-xs font-mono ${isDark ? 'bg-gray-900' : 'bg-gray-200'} border-b ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                  {activeTab === 'templates' && selectedTemplate 
                    ? `${selectedTemplate.id}.${selectedTemplate.language === 'go' ? 'go' : 'js'}`
                    : `${noCodeChaincode.name.toLowerCase()}.js`}
                </div>
                <pre className="p-4 overflow-auto max-h-[600px] text-xs">
                  <code>
                    {activeTab === 'templates' && selectedTemplate 
                      ? selectedTemplate.code
                      : generatedCode}
                  </code>
                </pre>
              </div>
              
              {activeTab === 'templates' && selectedTemplate && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium mb-3">Template Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="opacity-70">Language:</span> {selectedTemplate.language}
                    </div>
                    <div>
                      <span className="opacity-70">Complexity:</span> {selectedTemplate.complexity}
                    </div>
                    <div>
                      <span className="opacity-70">Category:</span> {selectedTemplate.category}
                    </div>
                    <div>
                      <span className="opacity-70">ID:</span> {selectedTemplate.id}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'generator' && generatedCode && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium mb-3">Generated Contract Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="opacity-70">Contract Name:</span> {noCodeChaincode.name}
                    </div>
                    <div>
                      <span className="opacity-70">Asset Name:</span> {noCodeChaincode.assetName}
                    </div>
                    <div>
                      <span className="opacity-70">Properties:</span> {noCodeChaincode.properties.length}
                    </div>
                    <div>
                      <span className="opacity-70">Functions:</span> {noCodeChaincode.functions.length}
                    </div>
                    <div>
                      <span className="opacity-70">Access Control:</span> {noCodeChaincode.accessControl}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}