import { PublicKey } from '@solana/web3.js';

export interface ProfilePicture {
  isAvailable: boolean;
  url: string;
  name?: string;
  metadata?: any;
  tokenAccount?: PublicKey;
  mintAccount?: PublicKey;
}

export interface ProfilePictureConfig {
  fallback?: boolean;
  resize?: any;
}

export interface ProfilePictureAccount {
  isInitialized: number;

  version: number;

  owner: PublicKey;
  nftMint: PublicKey;
  nftTokenAccount: PublicKey;

  updatedAt: number;
}
