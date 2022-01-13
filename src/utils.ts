import { AccountInfo, PublicKey } from '@solana/web3.js';
import { toSvg } from 'jdenticon';
import fetch from 'cross-fetch';
import btoa from 'btoa';
import { ProfilePictureAccountLayout } from './layouts';
import { ProfilePictureAccount, ProfilePictureConfig } from './types';
import { PROFILE_PICTURE_PROGRAM } from './index';
import { Buffer } from 'buffer';

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

export async function getMetadataFromUrl (url: string) {
  try {
    const response = await fetch(url);

    if (response.status >= 300) {
      return null;
    }

    return await response.json() || null;
  } catch (err) {
    return null;
  }
}

export function generateUrl (url: string | null, ownerPublicKey: PublicKey, config: ProfilePictureConfig): string {
  if (url) {
    return url;
  }

  if (config.fallback) {
    const svg = toSvg(ownerPublicKey.toString(), 100);
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  return 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgaGVpZ2h0PSIxMDAiIHdpZHRoPSIxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgaWQ9ImJvcmRlcnMtYW5kLWJhY2tncm91bmRzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1LDQpIj48cGF0aCBkPSJtMCAwaDEwdjFoLTl2MTRoMXYxaC0yeiIvPjxwYXRoIGQ9Im0xMCA0aDR2M2gtMXYtMmgtM3oiLz48cGF0aCBkPSJtMTQgMTZ2LTZoLTF2NWgtNXYxeiIvPjxwYXRoIGQ9Im0xMiAxNHYtM2gtMXYyaC0ydjF6IiBmaWxsPSIjYmNiY2MzIi8+PHBhdGggZD0ibTEwIDBoMXYxaDF2MWgxdjFoMXYxaC0xdi0xaC0xdi0xaC0xdjJoLTF6IiBmaWxsPSIjODc4Nzg3Ii8+PHBhdGggZD0ibTIgMmg4djNoMnYyaC00djVoLTJ2MWgtMnYxaC0yeiIgZmlsbD0iI2JjYmNjMyIvPjwvZz48ZyBpZD0ibGVmdGV5ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNSw0KSI+PHBhdGggZD0ibTUgM2gydjNoLTN2LTJoMXYxaDF2LTFoLTF6IiBmaWxsPSIjMDA4OTFlIi8+PHBhdGggZD0ibTUgNGgxdjFoLTF6IiBmaWxsPSIjMDBmMjQ4Ii8+PHBhdGggZD0ibTcgNGgxdjJoLTF2MWgtMnYtMWgyeiIvPjwvZz48ZyBpZD0icmlnaHRleWUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUsNCkiPjxwYXRoIGQ9Im04IDdoM3YyaC0xdi0xaC0xdjFoMXYxaC0yeiIgZmlsbD0iIzAwNjRmYiIvPjxwYXRoIGQ9Im05IDhoMXYxaC0xeiIgZmlsbD0iIzAwZmJmZSIvPjxwYXRoIGQ9Im0xMCA5aDF2MWgtMXoiIGZpbGw9IiMwMDMyOTMiLz48cGF0aCBkPSJtMTEgN2gxdjJoLTF6Ii8+PHBhdGggZD0ibTggMTBoMnYxaC0yeiIvPjwvZz48ZyBpZD0ibW91dGgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUsNCkiPjxwYXRoIGQ9Im0zIDhoMXYxaDF2MWgxdjFoMXYxaC0xdi0xaC0xdi0xaC0xdi0xaC0xeiIgZmlsbD0iI2ZmMzkwMCIvPjxwYXRoIGQ9Im0zIDloMXYxaDF2MWgxdjFoLTN6IiBmaWxsPSIjZjczYWUxIi8+PHBhdGggZD0ibTMgMTJoM3YxaC0zeiIvPjwvZz48L3N2Zz4=';
}
