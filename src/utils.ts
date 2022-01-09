import { AccountInfo, PublicKey } from '@solana/web3.js';
import { toSvg } from 'jdenticon';
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
    const svg = toSvg(ownerPublicKey.toString(), 100);
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  return 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgaWQ9ImJvcmRlcnMtYW5kLWJhY2tncm91bmRzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxKSI+PGc+PHBhdGggZD0ibTAgMGgxMHYxaC05djE0aDF2MWgtMnoiLz48cGF0aCBkPSJtMTAgNGg0djNoLTF2LTJoLTN6Ii8+PHBhdGggZD0ibTE0IDE2di02aC0xdjVoLTV2MXoiLz48L2c+PHBhdGggZD0ibTEyIDE0di0zaC0xdjJoLTJ2MXoiIGZpbGw9IiNiY2JjYzMiLz48cGF0aCBkPSJtMTAgMGgxdjFoMXYxaDF2MWgxdjFoLTF2LTFoLTF2LTFoLTF2MmgtMXoiIGZpbGw9IiM4Nzg3ODciLz48cGF0aCBkPSJtMiAyaDh2M2gydjJoLTR2NWgtMnYxaC0ydjFoLTJ6IiBmaWxsPSIjYmNiY2MzIi8+PC9nPjxnIGlkPSJsZWZ0ZXllIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxKSI+PHBhdGggZD0ibTUgM2gydjNoLTN2LTJoMXYxaDF2LTFoLTF6IiBmaWxsPSIjMDA4OTFlIi8+PHBhdGggZD0ibTUgNGgxdjFoLTF6IiBmaWxsPSIjMDBmMjQ4Ii8+PHBhdGggZD0ibTcgNGgxdjJoLTF2MWgtMnYtMWgyeiIvPjwvZz48ZyBpZD0icmlnaHRleWUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEpIj48cGF0aCBkPSJtOCA3aDN2MmgtMXYtMWgtMXYxaDF2MWgtMnoiIGZpbGw9IiMwMDY0ZmIiLz48cGF0aCBkPSJtOSA4aDF2MWgtMXoiIGZpbGw9IiMwMGZiZmUiLz48cGF0aCBkPSJtMTAgOWgxdjFoLTF6IiBmaWxsPSIjMDAzMjkzIi8+PHBhdGggZD0ibTExIDdoMXYyaC0xeiIvPjxwYXRoIGQ9Im04IDEwaDJ2MWgtMnoiLz48L2c+PGcgaWQ9Im1vdXRoIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxKSI+PHBhdGggZD0ibTMgOGgxdjFoMXYxaDF2MWgxdjFoLTF2LTFoLTF2LTFoLTF2LTFoLTF6IiBmaWxsPSIjZmYzOTAwIi8+PHBhdGggZD0ibTMgOWgxdjFoMXYxaDF2MWgtM3oiIGZpbGw9IiNmNzNhZTEiLz48cGF0aCBkPSJtMyAxMmgzdjFoLTN6Ii8+PC9nPjwvc3ZnPg==';
}
