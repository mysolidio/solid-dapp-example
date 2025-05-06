import { Connection, PublicKey } from '@solana/web3.js'
import { Address, Lamports } from '@solana/kit'
import { getSchemaDecoder } from './sas-sdk/accounts/schema'
import { getAttestationDecoder } from './sas-sdk/accounts/attestation'
import { decodeAccount } from '@solana/kit'

export class SolidSdk {
  constructor(
    private readonly connection: Connection,
    private readonly programId: PublicKey,
  ) {}

  /**
   * Fetch a schema by its address
   */
  async fetchSchema(schemaAddress: PublicKey) {
    try {
      const schemaAccount = await this.connection.getAccountInfo(schemaAddress)
      if (!schemaAccount) {
        throw new Error('Schema not found')
      }

      const encodedAccount = {
        address: schemaAddress.toBase58() as Address<string>,
        data: schemaAccount.data,
        exists: true,
        programAddress: this.programId.toBase58() as Address<string>,
        space: BigInt(schemaAccount.data.length),
        executable: false,
        lamports: BigInt(0) as Lamports,
      }

      const schema = decodeAccount(encodedAccount, getSchemaDecoder())

      const fieldNamesBuffer = Buffer.from(schema.data.fieldNames)
      const fieldNames: string[] = []
      let offset = 0

      while (offset < fieldNamesBuffer.length) {
        const length = fieldNamesBuffer.readUInt32LE(offset)
        offset += 4
        const data = fieldNamesBuffer.slice(offset, offset + length)
        const name = new TextDecoder().decode(data)
        fieldNames.push(name)
        offset += length
      }

      console.log('fieldNames', fieldNames)

      return {
        ...schema.data,
        name: new TextDecoder().decode(schema.data.name),
        description: new TextDecoder().decode(schema.data.description),
        layout: Array.from(schema.data.layout),
        fieldNames,
        isPaused: schema.data.isPaused,
        version: schema.data.version,
      }
    } catch (error) {
      console.error('Failed to fetch schema:', error)
      throw error
    }
  }

  /**
   * Fetch an attestation by its address
   */
  async fetchAttestation(attestationAddress: PublicKey) {
    try {
      const attestationAccount = await this.connection.getAccountInfo(attestationAddress)
      if (!attestationAccount) {
        throw new Error('Attestation not found')
      }

      const encodedAccount = {
        address: attestationAddress.toBase58() as Address<string>,
        data: attestationAccount.data,
        exists: true,
        programAddress: this.programId.toBase58() as Address<string>,
        space: BigInt(attestationAccount.data.length),
        executable: false,
        lamports: BigInt(0) as Lamports,
      }

      const attestation = decodeAccount(encodedAccount, getAttestationDecoder())
      return attestation.data
    } catch (error) {
      console.error('Failed to fetch attestation:', error)
      throw error
    }
  }

  /**
   * Decode attestation data according to schema layout
   */
  decodeAttestationData(data: Uint8Array, layout: number[], fieldNames: string[]): Record<string, unknown> {
    let offset = 0
    const result: Record<string, unknown> = {}
    const dataBuffer = Buffer.from(data)

    for (let i = 0; i < layout.length; i++) {
      const type = layout[i]
      const fieldName = fieldNames[i]

      switch (type) {
        case 12: // String
          const stringLength = dataBuffer.readUInt32LE(offset)
          offset += 4
          const stringValue = new TextDecoder().decode(dataBuffer.slice(offset, offset + stringLength))
          offset += stringLength
          result[fieldName] = stringValue
          break
        case 10: // bool
          const boolValue = dataBuffer[offset] === 1
          offset += 1
          result[fieldName] = boolValue
          break
        // Add more type handlers as needed
        default:
          throw new Error(`Unsupported type: ${type}`)
      }
    }

    return result
  }

  /**
   * Find schema PDA
   */
  findSchemaPDA(credentialAddress: PublicKey, name: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('schema'), credentialAddress.toBuffer(), Buffer.from(name), Buffer.from([1])],
      this.programId,
    )
  }

  /**
   * Find attestation PDA
   */
  findAttestationPDA(
    credentialAddress: PublicKey,
    authorityAddress: PublicKey,
    schemaAddress: PublicKey,
    nonce: PublicKey,
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('attestation'),
        credentialAddress.toBuffer(),
        authorityAddress.toBuffer(),
        schemaAddress.toBuffer(),
        nonce.toBuffer(),
      ],
      this.programId,
    )
  }
}
