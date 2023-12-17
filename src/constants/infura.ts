import { JsonRpcProvider } from '@ethersproject/providers'

import { SupportedChainId } from './chains'

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY
if (typeof INFURA_KEY === 'undefined') {
  throw new Error(`REACT_APP_INFURA_KEY must be a defined environment variable`)
}

export const MAINNET_PROVIDER = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_KEY}`)

/**
 * These are the network URLs used by the interface when there is not another available source of chain data
 */
export const INFURA_NETWORK_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.GOERLI]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.POLYGON]: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.CELO]: `https://celo-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.BASE]: `https://base-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.GNOSIS]: `https://gnosis-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.OPTIMISM]: `https://optimism-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ARBITRUM]: `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.AVALANCHE]: `https://avalanche-mainnet.infura.io/v3/${INFURA_KEY}`,
}