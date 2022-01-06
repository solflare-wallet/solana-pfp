import * as Borsh from '@project-serum/borsh';

export const ProfilePictureAccountLayout = Borsh.struct([
  Borsh.u8('isInitialized'),

  Borsh.u8('version'),

  Borsh.publicKey('owner'),
  Borsh.publicKey('nftMint'),
  Borsh.publicKey('nftTokenAccount'),

  Borsh.u64('updatedAt')
]);
