import { AccountInfo, PublicKey } from '@solana/web3.js';
import jdenticon from 'jdenticon';
import fetch from 'cross-fetch';
import btoa from 'btoa';
import { ProfilePictureAccountLayout } from './layouts';
import { ProfilePictureAccount, ProfilePictureConfig } from './types';
import { PROFILE_PICTURE_PROGRAM } from './index';

const PROFILE_PICTURE_PREFIX = 'nft_profile';

export function decodeProfilePictureAccount (account: AccountInfo<any>): ProfilePictureAccount {
  if (account.data.length !== ProfilePictureAccountLayout.span) {
    throw new Error(`Invalid account size. Expected ${ProfilePictureAccountLayout.span}, got ${account.data.length}`);
  }

  return ProfilePictureAccountLayout.decode(account.data);
}

export async function getProfilePicturePDA (publicKey: PublicKey): Promise<PublicKey> {
  const [ result ] = await PublicKey.findProgramAddress([
    Buffer.from(PROFILE_PICTURE_PREFIX),
    publicKey.toBuffer()
  ], PROFILE_PICTURE_PROGRAM);

  return result;
}

export async function getImageUrlFromMetadataUrl (url: string): Promise<string | null> {
  try {
    const response = await fetch(url);

    if (response.status >= 300) {
      return null;
    }

    const data = await response.json();

    return data.image || null;
  } catch (err) {
    return null;
  }
}

export function generateUrl (url: string | null, ownerPublicKey: PublicKey, config: ProfilePictureConfig): string {
  if (url) {
    return url;
  }

  if (config.fallback) {
    const svg = jdenticon.toSvg(ownerPublicKey.toString(), 100);
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  return 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxNiAxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBpZD0iYm9yZGVycy1hbmQtYmFja2dyb3VuZHMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEpIj48Zz48cGF0aCBkPSJtMCAwaDEwdjFoLTl2MTRoMXYxaC0yeiIvPjxwYXRoIGQ9Im0xMCA0aDR2M2gtMXYtMmgtM3oiLz48cGF0aCBkPSJtMTQgMTZ2LTZoLTF2NWgtNXYxeiIvPjwvZz48cGF0aCBkPSJtMTIgMTR2LTNoLTF2MmgtMnYxeiIgZmlsbD0iI2JjYmNjMyIvPjxwYXRoIGQ9Im0xMCAwaDF2MWgxdjFoMXYxaDF2MWgtMXYtMWgtMXYtMWgtMXYyaC0xeiIgZmlsbD0iIzg3ODc4NyIvPjxwYXRoIGQ9Im0yIDJoOHYzaDJ2MmgtNHY1aC0ydjFoLTJ2MWgtMnoiIGZpbGw9IiNiY2JjYzMiLz48L2c+PGcgaWQ9ImxlZnRleWUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEpIj48cGF0aCBkPSJtNSAzaDJ2M2gtM3YtMmgxdjFoMXYtMWgtMXoiIGZpbGw9IiMwMDg5MWUiLz48cGF0aCBkPSJtNSA0aDF2MWgtMXoiIGZpbGw9IiMwMGYyNDgiLz48cGF0aCBkPSJtNyA0aDF2MmgtMXYxaC0ydi0xaDJ6Ii8+PC9nPjxnIGlkPSJyaWdodGV5ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMSkiPjxwYXRoIGQ9Im04IDdoM3YyaC0xdi0xaC0xdjFoMXYxaC0yeiIgZmlsbD0iIzAwNjRmYiIvPjxwYXRoIGQ9Im05IDhoMXYxaC0xeiIgZmlsbD0iIzAwZmJmZSIvPjxwYXRoIGQ9Im0xMCA5aDF2MWgtMXoiIGZpbGw9IiMwMDMyOTMiLz48cGF0aCBkPSJtMTEgN2gxdjJoLTF6Ii8+PHBhdGggZD0ibTggMTBoMnYxaC0yeiIvPjwvZz48ZyBpZD0ibW91dGgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEpIj48cGF0aCBkPSJtMyA4aDF2MWgxdjFoMXYxaDF2MWgtMXYtMWgtMXYtMWgtMXYtMWgtMXoiIGZpbGw9IiNmZjM5MDAiLz48cGF0aCBkPSJtMyA5aDF2MWgxdjFoMXYxaC0zeiIgZmlsbD0iI2Y3M2FlMSIvPjxwYXRoIGQ9Im0zIDEyaDN2MWgtM3oiLz48L2c+PC9zdmc+';
}
