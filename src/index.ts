import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { decodeProfilePictureAccount, generateUrl, getImageUrlFromMetadataUrl, getProfilePicturePDA } from './utils';
import { ProfilePicture, ProfilePictureConfig } from './types';
import { Buffer } from 'buffer';

export const PROFILE_PICTURE_PROGRAM = new PublicKey('6UQLqKYWqErHqdsX6WtANQsMmvfKtWNuSSRj6ybg5in3');

export async function getProfilePicture (connection: Connection, publicKey: PublicKey, config: ProfilePictureConfig = { fallback: true }): Promise<ProfilePicture> {
  try {
    const profilePictureAccountPublicKey = await getProfilePicturePDA(publicKey);

    const profilePictureAccount = await connection.getAccountInfo(profilePictureAccountPublicKey);

    if (!profilePictureAccount) {
      throw new Error('PDA is empty');
    }

    const profilePictureData = decodeProfilePictureAccount(profilePictureAccount);

    const tokenAccount = await connection.getParsedAccountInfo(profilePictureData.nftTokenAccount);

    if (!tokenAccount) {
      throw new Error('No token account');
    }

    // @ts-ignore
    if (tokenAccount?.value?.data?.parsed?.info?.tokenAmount?.uiAmount < 1) {
      throw new Error('No NFT token in the token account');
    }

    // @ts-ignore
    if (tokenAccount?.value?.data?.parsed?.info?.owner !== publicKey.toString()) {
      throw new Error('Invalid token account owner');
    }

    // @ts-ignore
    if (tokenAccount?.value?.data?.parsed?.info?.mint !== profilePictureData.nftMint.toString()) {
      throw new Error('Invalid token account mint');
    }

    const nftMetadataAccountPublicKey = await Metadata.getPDA(profilePictureData.nftMint);

    const nftMetadata = await Metadata.load(connection, nftMetadataAccountPublicKey);

    if (!nftMetadata?.data?.data?.uri) {
      throw new Error('No metadata URL');
    }

    const imageUrl = await getImageUrlFromMetadataUrl(nftMetadata.data.data.uri);

    return {
      isAvailable: true,
      url: generateUrl(imageUrl, publicKey, config)
    };
  } catch (err) {
    return {
      isAvailable: false,
      url: generateUrl(null, publicKey, config)
    };
  }
}

export async function createSetProfilePrictureTransaction (ownerPublicKey: PublicKey, mintPublicKey: PublicKey, tokenAccountPublicKey: PublicKey): Promise<Transaction> {
  const profilePictureAccountPublicKey = await getProfilePicturePDA(ownerPublicKey);

  const nftMetadataAccountPublicKey = await Metadata.getPDA(mintPublicKey);

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
