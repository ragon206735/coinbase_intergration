import ethereumLogoUrl from 'assets/images/ethereum-logo.png'
import polygonMaticLogo from 'assets/svg/polygon-matic-logo.svg'
import celoLogo from 'assets/svg/celo.svg'
import baseLogo from 'assets/svg/base.svg'
import optLogo from 'assets/svg/Opt.svg'
import arbLogo from 'assets/svg/arb.svg'
import avaxLogo from 'assets/svg/avax.svg'
import gnosisLogo from 'assets/svg/gnosis.svg'

import { SupportedChainId } from './chains'

export enum NetworkType {
  L1,
  L2,
}

interface BaseChainInfo {
  readonly networkType: NetworkType
  readonly blockWaitMsBeforeWarning?: number
  readonly docs: string
  readonly bridge?: string
  readonly explorer: string
  readonly infoLink: string
  readonly logoUrl: string
  readonly label: string
  readonly helpCenterUrl?: string
  readonly nativeCurrency: {
    name: string // e.g. 'Goerli ETH',
    symbol: string // e.g. 'gorETH',
    decimals: number // e.g. 18,
  }
}

export interface L1ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L1
}

export interface L2ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L2
  readonly bridge: string
  readonly statusPage?: string
  readonly defaultListUrl: string
}

export const CHAIN_INFO: any = {
  [SupportedChainId.MAINNET]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    opensea: 'https://opensea.io/assets/ethereum/',
    label: 'Ethereum',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    chainId: '0x1',
    network: 'cyan',
    chainName: 'mainnet'
  },
  [SupportedChainId.GOERLI]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://goerli.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    opensea: 'https://testnets.opensea.io/assets/goerli/',
    label: 'Görli',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Görli Ether', symbol: 'GörETH', decimals: 18 },
    chainId: '0x5',
    network: 'testnet',
    chainName: 'goerli'
  },
  [SupportedChainId.POLYGON]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: `10m`,
    bridge: 'https://wallet.polygon.technology/bridge',
    docs: 'https://polygon.io/',
    explorer: 'https://polygonscan.com/',
    opensea: 'https://opensea.io/assets/matic/',
    infoLink: 'https://info.uniswap.org/#/polygon/',
    label: 'Polygon',
    logoUrl: polygonMaticLogo,
    nativeCurrency: { name: 'Polygon Matic', symbol: 'MATIC', decimals: 18 },
    chainId: '0x89',
    network: 'cyan',
    chainName: 'polygon'
  },
  [SupportedChainId.CELO]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: `10m`,
    docs: 'https://celo.io/',
    explorer: 'https://celoscan.io/',
    opensea: 'https://opensea.io/assets/celo/',
    infoLink: 'https://info.uniswap.org/#/celo/',
    label: 'Celo',
    logoUrl: celoLogo,
    nativeCurrency: { name: 'Celo Native Asset', symbol: 'CELO', decimals: 18 },
    chainId: '0xA4EC',
    network: 'cyan',
    chainName: 'celo'
  },
  [SupportedChainId.BASE]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: `10m`,
    docs: '	https://mainnet.base.org',
    explorer: '	https://mainnet.base.org',
    opensea: 'https://opensea.io/assets/base/',
    infoLink: 'https://info.uniswap.org/#/base/',
    label: 'Base',
    logoUrl: baseLogo,
    nativeCurrency: { name: 'Base Native Asset', symbol: 'BASE', decimals: 18 },
    chainId: '0x2105',
    network: 'cyan',
    chainName: 'base'
  },
  [SupportedChainId.GNOSIS]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: `10m`,
    docs: '	https://mainnet.base.org',
    explorer: '	https://mainnet.base.org',
    opensea: 'https://opensea.io/assets/gnosis/',
    infoLink: 'https://info.uniswap.org/#/gnosis/',
    label: 'Gnosis',
    logoUrl: gnosisLogo,
    nativeCurrency: { name: 'Gnosis Native Asset', symbol: 'xDAI', decimals: 18 },
    chainId: '0x64',
    network: 'cyan',
    chainName: 'gnosis'
  },
  [SupportedChainId.OPTIMISM]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: `10m`,
    docs: '	https://mainnet.base.org',
    explorer: '	https://mainnet.base.org',
    opensea: 'https://opensea.io/assets/optimism/',
    infoLink: 'https://info.uniswap.org/#/optimism/',
    label: 'Optimism',
    logoUrl: optLogo,
    nativeCurrency: { name: 'Optimism Native Asset', symbol: 'ETH', decimals: 18 },
    chainId: '0xa',
    network: 'cyan',
    chainName: 'opt'
  },
  [SupportedChainId.ARBITRUM]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: `10m`,
    docs: '	https://mainnet.base.org',
    explorer: '	https://mainnet.base.org',
    opensea: 'https://opensea.io/assets/arbitrum/',
    infoLink: 'https://info.uniswap.org/#/arbitrum/',
    label: 'Arbitrum',
    logoUrl: arbLogo,
    nativeCurrency: { name: 'Arbitrum Native Asset', symbol: 'ETH', decimals: 18 },
    chainId: '0xA4B1',
    network: 'cyan',
    chainName: 'arb'
  },
  [SupportedChainId.AVALANCHE]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: `10m`,
    docs: '	https://mainnet.base.org',
    explorer: '	https://mainnet.base.org',
    opensea: 'https://opensea.io/assets/avalanche/',
    infoLink: 'https://info.uniswap.org/#/avalanche/',
    label: 'Avax',
    logoUrl: avaxLogo,
    nativeCurrency: { name: 'Avalanche Native Asset', symbol: 'AVAX', decimals: 18 },
    chainId: '0xA86A',
    network: 'cyan',
    chainName: 'avax'
  }
}