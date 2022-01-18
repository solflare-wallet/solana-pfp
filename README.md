# @solflare-wallet/pfp

## Description

The Solana Profile Picture Protocol allows Solana users to set a single Metaplex-standard NFT as a universal PFP for the Solana blockchain.

Individual Solana protocols can use the documentation below both to show PFPs in their FE, and to provide functionality within their own FE to allow users to set a new PFP.

## Example

```javascript
import { Connection, PublicKey } from '@solana/web3.js';
import { getProfilePicture } from '@solflare-wallet/pfp';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const walletPubkey = new PublicKey('ES8rZr16f5eAc9PkUcAbafwg5JjEJANbpwu92CF2Cbox');

const { isAvailable, url } = await getProfilePicture(connection, walletPubkey);
```

## API

### Get the wallet's profile picture

```javascript
function getProfilePicture (connection: Connection, publicKey: PublicKey, config: ProfilePictureConfig): Promise<ProfilePicture>
```

#### Params
- `connection` - RPC connection object
- `publicKey` - The public key of the wallet
- `config` (optional)
  - `fallback` - Boolean, use a fallback generated image (default `true`)
  - `resize` - Object with Cloudflare image resize params (default `{ width: 100 }`)

#### Return value
Object with the following fields:
- `isAvailable` - Boolean, `true` if there is a profile picture for the given wallet
- `url` - The URL of the profile image, always populated (either a fallback image or an empty-image icon), you can choose to ignore it if `isAvailable` is false
- `name` - NFT name (only if `isAvailable: true`)
- `metadata` - NFT metadata object (only if `isAvailable: true`)
- `tokenAccount` - The public key of the token account that holds the NFT (only if `isAvailable: true`)
- `mintAccount` - The public key of the NFT's mint (only if `isAvailable: true`)

### Transactions for setting an NFT for the profile picture

```javascript
function createSetProfilePictureTransaction (ownerPublicKey: PublicKey, mintPublicKey: PublicKey, tokenAccountPublicKey: PublicKey): Promise<Transaction>
```

#### Params
- `ownerPublicKey` - The public key of the wallet
- `mintPublicKey` - The public key of the NFT's mint
- `tokenAccountPublicKey` - The public key of the token account that holds the NFT

#### Return value
A Web3 Transaction object

### Transaction for removing the profile picture

```javascript
function createRemoveProfilePictureTransaction (ownerPublicKey: PublicKey): Promise<Transaction>
```

#### Params
- `ownerPublicKey` - The public key of the wallet

#### Return value
A Web3 Transaction object
