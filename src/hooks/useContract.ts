import { Contract } from '@ethersproject/contracts'
import { useWeb3Auth } from 'context/web3Auth'
import ERC20_ABI from 'abis/erc20.json'
import { useMemo } from 'react'

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { provider, account, chainId } = useWeb3Auth()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      console.log("useContract", addressOrAddressMap)
      const signerOrProvider: any = account ? provider.getSigner(account).connectUnchecked() : provider
      return new Contract(address, ABI, signerOrProvider)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, provider, chainId, withSignerIfPossible, account]) as T
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
  return useContract<any>(tokenAddress, ERC20_ABI, withSignerIfPossible)
}