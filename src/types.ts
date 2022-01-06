import { PublicKey } from '@solana/web3.js';

export interface ProfilePicture {
  isAvailable: boolean;
  url: string;
}

export interface ProfilePictureConfig {
  fallback: boolean;
}

export interface ProfilePictureAccount {
  isInitialized: number;

  version: number;

  owner: PublicKey;
  nftMint: PublicKey;
  nftTokenAccount: PublicKey;

  updatedAt: number;
}
