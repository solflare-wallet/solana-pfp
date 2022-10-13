import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
import { generateUrl, getProfilePicturePDA } from './utils';
import { ProfilePicture, ProfilePictureConfig } from './types';
import { Buffer } from 'buffer';
import { pushRequest } from './batchedLoader';
import { findMetadataPda } from '@metaplex-foundation/js';

export const PROFILE_PICTURE_PROGRAM = new PublicKey('6UQLqKYWqErHqdsX6WtANQsMmvfKtWNuSSRj6ybg5in3');

const DEFAULT_CONFIG = {
  fallback: true,
  resize: {
    width: 100
  }
};

export async function getProfilePicture (connection: Connection, publicKey: PublicKey, config?: ProfilePictureConfig): Promise<ProfilePicture> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    const { profilePictureData, metadata } = await new Promise((resolve: (value: any) => any, reject) => {
      pushRequest(connection, publicKey, resolve, reject);
    });

    return {
      isAvailable: true,
      url: generateUrl(metadata?.json?.image || null, publicKey, finalConfig),
      name: metadata?.name || '',
      metadata: metadata?.json || {},
      tokenAccount: profilePictureData.nftTokenAccount,
      mintAccount: profilePictureData.nftMint
    };
  } catch (err) {
    return {
      isAvailable: false,
      url: generateUrl(null, publicKey, finalConfig)
    };
  }
}

export async function createSetProfilePictureTransaction (ownerPublicKey: PublicKey, mintPublicKey: PublicKey, tokenAccountPublicKey: PublicKey): Promise<Transaction> {
  const profilePictureAccountPublicKey = await getProfilePicturePDA(ownerPublicKey);

  const nftMetadataAccountPublicKey = findMetadataPda(mintPublicKey);

  const transaction = new Transaction();

  transaction.add(
    new TransactionInstruction({
      keys: [
        { pubkey: ownerPublicKey, isSigner: true, isWritable: false },
        { pubkey: profilePictureAccountPublicKey, isSigner: false, isWritable: true },
        { pubkey: mintPublicKey, isSigner: false, isWritable: false },
        { pubkey: tokenAccountPublicKey, isSigner: false, isWritable: false },
        { pubkey: nftMetadataAccountPublicKey, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROFILE_PICTURE_PROGRAM,
      data: Buffer.from([ 0 ])
    })
  );

  return transaction;
}

export async function createRemoveProfilePictureTransaction (ownerPublicKey: PublicKey): Promise<Transaction> {
  const profilePictureAccountPublicKey = await getProfilePicturePDA(ownerPublicKey);

  const transaction = new Transaction();

  transaction.add(
    new TransactionInstruction({
      keys: [
        { pubkey: ownerPublicKey, isSigner: true, isWritable: false },
        { pubkey: profilePictureAccountPublicKey, isSigner: false, isWritable: true }
      ],
      programId: PROFILE_PICTURE_PROGRAM,
      data: Buffer.from([ 1 ])
    })
  );

  return transaction;
}
