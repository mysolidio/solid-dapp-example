/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  addDecoderSizePrefix,
  addEncoderSizePrefix,
  assertAccountExists,
  assertAccountsExist,
  combineCodec,
  decodeAccount,
  fetchEncodedAccount,
  fetchEncodedAccounts,
  getAddressDecoder,
  getAddressEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getI64Decoder,
  getI64Encoder,
  getStructDecoder,
  getStructEncoder,
  getU32Decoder,
  getU32Encoder,
  getU8Decoder,
  getU8Encoder,
  type Account,
  type Address,
  type Codec,
  type Decoder,
  type EncodedAccount,
  type Encoder,
  type FetchAccountConfig,
  type FetchAccountsConfig,
  type MaybeAccount,
  type MaybeEncodedAccount,
  type ReadonlyUint8Array,
} from '@solana/kit';

export type Attestation = {
  discriminator: number;
  nonce: Address;
  credential: Address;
  schema: Address;
  data: ReadonlyUint8Array;
  signer: Address;
  expiry: bigint;
};

export type AttestationArgs = {
  discriminator: number;
  nonce: Address;
  credential: Address;
  schema: Address;
  data: ReadonlyUint8Array;
  signer: Address;
  expiry: number | bigint;
};

export function getAttestationEncoder(): Encoder<AttestationArgs> {
  return getStructEncoder([
    ['discriminator', getU8Encoder()],
    ['nonce', getAddressEncoder()],
    ['credential', getAddressEncoder()],
    ['schema', getAddressEncoder()],
    ['data', addEncoderSizePrefix(getBytesEncoder(), getU32Encoder())],
    ['signer', getAddressEncoder()],
    ['expiry', getI64Encoder()],
  ]);
}

export function getAttestationDecoder(): Decoder<Attestation> {
  return getStructDecoder([
    ['discriminator', getU8Decoder()],
    ['nonce', getAddressDecoder()],
    ['credential', getAddressDecoder()],
    ['schema', getAddressDecoder()],
    ['data', addDecoderSizePrefix(getBytesDecoder(), getU32Decoder())],
    ['signer', getAddressDecoder()],
    ['expiry', getI64Decoder()],
  ]);
}

export function getAttestationCodec(): Codec<AttestationArgs, Attestation> {
  return combineCodec(getAttestationEncoder(), getAttestationDecoder());
}

export function decodeAttestation<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress>
): Account<Attestation, TAddress>;
export function decodeAttestation<TAddress extends string = string>(
  encodedAccount: MaybeEncodedAccount<TAddress>
): MaybeAccount<Attestation, TAddress>;
export function decodeAttestation<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>
): Account<Attestation, TAddress> | MaybeAccount<Attestation, TAddress> {
  return decodeAccount(
    encodedAccount as MaybeEncodedAccount<TAddress>,
    getAttestationDecoder()
  );
}

export async function fetchAttestation<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<Account<Attestation, TAddress>> {
  const maybeAccount = await fetchMaybeAttestation(rpc, address, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeAttestation<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<MaybeAccount<Attestation, TAddress>> {
  const maybeAccount = await fetchEncodedAccount(rpc, address, config);
  return decodeAttestation(maybeAccount);
}

export async function fetchAllAttestation(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<Account<Attestation>[]> {
  const maybeAccounts = await fetchAllMaybeAttestation(rpc, addresses, config);
  assertAccountsExist(maybeAccounts);
  return maybeAccounts;
}

export async function fetchAllMaybeAttestation(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<MaybeAccount<Attestation>[]> {
  const maybeAccounts = await fetchEncodedAccounts(rpc, addresses, config);
  return maybeAccounts.map((maybeAccount) => decodeAttestation(maybeAccount));
}
