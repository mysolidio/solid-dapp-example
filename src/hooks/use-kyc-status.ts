import { useQuery } from '@tanstack/react-query'
import { useSolanaWallet } from '@wallet-ui/react'
import { SolidSdk } from '@/lib/solid-sdk'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'

// Constants
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000'
const PROGRAM_ID = 'GLa2bi8bH8P4HaACwGhqEBZttSFh9Vafjtb9zfzo5xyu'
const SCHEMA_ADDRESS = '9XneNxwqSXPYJfzQrzUPkz5jNM96rUrH7C6DFKcr5SWZ'

export function useKycStatus() {
  const [selectedWalletAccount] = useSolanaWallet()
  
  return useQuery({
    queryKey: ['kyc-status', selectedWalletAccount?.address],
    queryFn: async () => {
      if (!selectedWalletAccount) {
        return { isVerified: false }
      }

      try {
        console.log('selectedWalletAccount', selectedWalletAccount)

        const response = await fetch(`${API_ENDPOINT}/user/attestation/${selectedWalletAccount.address}`)
        if (!response.ok) {
          console.error('Failed to fetch attestation address:', await response.text())
          return { isVerified: false }
        }

        console.log('response', response)
        
        const { data: { attestationAddress } } = await response.json()
        if (!attestationAddress) {
          console.error('No attestation address returned from API')
          return { isVerified: false }
        }

        // Initialize SDK with connection and program ID
        const connection = new Connection(clusterApiUrl("devnet"))
        const sdk = new SolidSdk(connection, new PublicKey(PROGRAM_ID))
        
        // Fetch schema and attestation
        const schema = await sdk.fetchSchema(new PublicKey(SCHEMA_ADDRESS))
        if (!schema) {
          console.error('Failed to fetch schema')
          return { isVerified: false }
        }
        
        const attestation = await sdk.fetchAttestation(new PublicKey(attestationAddress))
        if (!attestation) {
          console.error('Failed to fetch attestation')
          return { isVerified: false }
        }

        // Decode attestation data
        const data = new Uint8Array(attestation.data)
        const decodedAttestation = sdk.decodeAttestationData(data, schema.layout, schema.fieldNames)
        console.log('decodedAttestation', decodedAttestation)
        return { 
          isVerified: decodedAttestation.kyced || false,
          attestationAddress,
          schemaAddress: SCHEMA_ADDRESS
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error)
        return { isVerified: false }
      }
    },
    enabled: !!selectedWalletAccount,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    retry: 2 // Retry failed requests twice
  })
} 