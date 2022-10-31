import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { decodeProfilePictureAccount, getParsedMultipleAccountsInfo, getProfilePicturePDA } from './utils';
import { Metaplex } from '@metaplex-foundation/js';
import { ProfilePictureAccount } from './types';

export type ResolveCallback = (value: any) => any;
export type RejectCallback = (reason?: any) => any;

export type Resolver = {
  resolve: ResolveCallback;
  reject: RejectCallback;
};

export type BatchedRequest = {
  publicKey: PublicKey;
  resolvers: Resolver[];
  resolved: boolean;
  pfpAccountPublicKey?: PublicKey;
  profilePictureAccount?: any;
  profilePictureData?: ProfilePictureAccount;
  tokenAccount?: any;
  metadata?: any;
};

const BATCH_INTERVAL = 200;
const BATCH_SIZE = 50;

const batchedRequests = new Map<string, Map<string, Resolver[]>>();
const timeouts = new Map<string, any>();

function rejectRequest (request: BatchedRequest, error: any) {
  request.resolved = true;
  for (const resolver of request.resolvers) {
    resolver.reject(error);
  }
}

function filterResolved (requests: BatchedRequest[]) {
  return requests.filter((request) => !request.resolved);
}

async function processRequests (endpoint: string, commitment: Commitment) {
  if (!batchedRequests.has(endpoint)) {
    return;
  }

  let requests: Array<BatchedRequest> = [];
  for (const [pubkey, resolvers] of batchedRequests.get(endpoint)!) {
    requests.push({ publicKey: new PublicKey(pubkey), resolvers, resolved: false });
  }

  timeouts.delete(endpoint);
  batchedRequests.delete(endpoint);

  try {
    const connection = new Connection(endpoint, commitment);

    for (const request of requests) {
      request.pfpAccountPublicKey = await getProfilePicturePDA(new PublicKey(request.publicKey));
    }

    const profilePictureAccounts = await connection.getMultipleAccountsInfo(
      requests.map((request) => request.pfpAccountPublicKey!)
    );

    for (let i = 0; i < profilePictureAccounts.length; i++) {
      if (profilePictureAccounts[i]) {
        requests[i].profilePictureAccount = profilePictureAccounts[i];
        try {
          requests[i].profilePictureData = decodeProfilePictureAccount(profilePictureAccounts[i]!);
        } catch (err) {
          rejectRequest(requests[i], new Error('Failed to decode PFP PDA'));
        }
      } else {
        rejectRequest(requests[i], new Error('PFP PDA is empty'));
      }
    }

    requests = filterResolved(requests);

    const tokenAccounts = await getParsedMultipleAccountsInfo(
      connection,
      requests.map((request) => request.profilePictureData!.nftTokenAccount)
    );

    for (let i = 0; i < tokenAccounts.length; i++) {
      if (!tokenAccounts[i]) {
        rejectRequest(requests[i], new Error('No PFP token account'));
        continue;
      }

      if (tokenAccounts[i]?.data?.parsed?.info?.tokenAmount?.uiAmount < 1) {
        rejectRequest(requests[i], new Error('PFP NFT token account is empty'));
        continue;
      }

      if (tokenAccounts[i]?.data?.parsed?.info?.owner !== requests[i].publicKey.toString()) {
        rejectRequest(requests[i], new Error('Invalid PFP token account owner'));
        continue;
      }

      if (tokenAccounts[i]?.data?.parsed?.info?.mint !== requests[i].profilePictureData!.nftMint.toString()) {
        rejectRequest(requests[i], new Error('Invalid token account mint'));
        continue;
      }

      requests[i].tokenAccount = tokenAccounts[i];
    }

    requests = filterResolved(requests);

    const metaplex = Metaplex.make(connection);

    const metadatas = await metaplex.nfts().findAllByMintList({ mints: requests.map((request) => request.profilePictureData!.nftMint) }).run();

    for (let i = 0; i < metadatas.length; i++) {
      if (metadatas[i]?.uri) {
        requests[i].metadata = metadatas[i];
      } else {
        rejectRequest(requests[i], new Error('No PFP metadata URL'));
      }
    }

    requests = filterResolved(requests);

    await Promise.all(requests.map(async (request) => {
      try {
        const nft = await metaplex.nfts().load({ metadata: request.metadata }).run();

        if (!nft?.jsonLoaded || !nft?.json) {
          throw new Error('No PFP JSON metadata');
        }

        request.metadata = nft;
      } catch (err) {
        rejectRequest(request, err);
      }
    }));

    requests = filterResolved(requests);

    for (const request of requests) {
      request.resolved = true;
      for (const resolver of request.resolvers) {
        resolver.resolve({
          pfpAccountPublicKey: request.pfpAccountPublicKey,
          profilePictureAccount: request.profilePictureAccount,
          profilePictureData: request.profilePictureData,
          tokenAccount: request.tokenAccount,
          metadata: request.metadata
        });
      }
    }
  } catch (err) {
    for (const request of requests) {
      rejectRequest(request, err);
    }
  }
}

export function pushRequest (connection: Connection, publicKey: PublicKey, resolve: ResolveCallback, reject: RejectCallback) {
  const endpoint = connection.rpcEndpoint;
  const pubkey = publicKey.toString();

  if (!batchedRequests.has(endpoint)) {
    batchedRequests.set(endpoint, new Map());
  }

  if (!batchedRequests.get(endpoint)!.has(pubkey)) {
    batchedRequests.get(endpoint)!.set(pubkey, []);
  }

  batchedRequests.get(endpoint)!.get(pubkey)!.push({ resolve, reject });

  if (batchedRequests.get(endpoint)!.size >= BATCH_SIZE && timeouts.has(endpoint)) {
    processRequests(endpoint, connection.commitment || 'processed');
  }

  const timeout = setTimeout(() => processRequests(endpoint, connection.commitment || 'processed'), BATCH_INTERVAL);

  timeouts.set(endpoint, timeout);
}
