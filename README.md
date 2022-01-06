# @solflare-wallet/pfp

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

#### Return value
Object with the following fields:
- `isAvailable` - boolean
- `url` - The URL of the profile image, always populated (either a fallback image or an empty-image icon), you can choose to ignore it if `isAvailable` is false

### Transactions for setting an NFT for the profile picture

```javascript
function createSetProfilePrictureTransaction (ownerPublicKey: PublicKey, mintPublicKey: PublicKey, tokenAccountPublicKey: PublicKey): Promise<Transaction>
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
