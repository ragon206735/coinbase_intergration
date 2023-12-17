/**
 * List of all the networks supported by the Uniswap Interface
 */
export enum SupportedChainId {
  MAINNET = 1,
  GOERLI = 5,
  POLYGON = 137,
  CELO = 42220,
  BASE = 8453,
  GNOSIS = 100,
  OPTIMISM = 10,
  ARBITRUM = 42161,
  AVALANCHE = 43114
}

export const CHAIN_IDS_TO_NAMES = {
  [`${SupportedChainId.MAINNET}`]: 'mainnet',
  [`${SupportedChainId.GOERLI}`]: 'goerli',
  [`${SupportedChainId.POLYGON}`]: 'polygon',
  [`${SupportedChainId.CELO}`]: 'celo',
  [`${SupportedChainId.BASE}`]: 'base',
  [`${SupportedChainId.GNOSIS}`]:'gnosis',
  [`${SupportedChainId.OPTIMISM}`]:'opt',
  [`${SupportedChainId.ARBITRUM}`]:'arb',
  [`${SupportedChainId.AVALANCHE}`]:'avax'
}

/**
 * Array of all the supported chain IDs
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (id) => typeof id === 'number'
) as SupportedChainId[]

export const SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.POLYGON,
  SupportedChainId.GOERLI,
  SupportedChainId.CELO,
  SupportedChainId.BASE,
  SupportedChainId.GNOSIS,
  SupportedChainId.OPTIMISM,
  SupportedChainId.ARBITRUM,
  SupportedChainId.AVALANCHE,
]

export const GNOSIS_SAFE_BASE_URLS:any = {
  [SupportedChainId.MAINNET]: 'https://safe-transaction-mainnet.safe.global',
  [SupportedChainId.GOERLI]: 'https://safe-transaction-goerli.safe.global',
  [SupportedChainId.POLYGON]: 'https://safe-transaction-polygon.safe.global',
  [SupportedChainId.CELO]: 'https://safe-transaction-celo.safe.global',
  [SupportedChainId.BASE]: 'https://safe-transaction-base.safe.global',
  [SupportedChainId.GNOSIS]:'https://safe-transaction-gnosis-chain.safe.global/',
  [SupportedChainId.OPTIMISM]:'https://safe-transaction-optimism.safe.global',
  [SupportedChainId.ARBITRUM]:'https://safe-transaction-arbitrum.safe.global',
  [SupportedChainId.AVALANCHE]:'https://safe-transaction-avalanche.safe.global',
}

export const GNOSIS_SAFE_ALLOWANCE_MODULE_CONTRACT :any = {
  [SupportedChainId.GOERLI]: '0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134',
  [SupportedChainId.POLYGON]: '0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134',
  [SupportedChainId.MAINNET]: '0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134',
  [SupportedChainId.CELO]: '0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134',
  [SupportedChainId.BASE]: '0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134',
  [SupportedChainId.GNOSIS]:'0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134',
  [SupportedChainId.OPTIMISM]:'0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134',
  [SupportedChainId.ARBITRUM]:'0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134',
  [SupportedChainId.AVALANCHE]:'0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134',
}

export const CHAIN_GAS_STATION :any = {
  [SupportedChainId.POLYGON]: {
    url: 'https://gasstation-mainnet.matic.network/v2',
    symbol: 'GWei'
  },
  [SupportedChainId.GOERLI]: ''
}

export const SUPPORTED_ASSETS: any = {
  [`${SupportedChainId.MAINNET}`]: {
    id: "ethereum",
    symbol: "ETH",
  },
  [`${SupportedChainId.GOERLI}`]: {
    id: "ethereum",
    symbol: "ETH",
  },
  [`${SupportedChainId.POLYGON}`]: {
    id: "wmatic",
    symbol: "MATIC",
  },
  [`${SupportedChainId.CELO}`]: {
    id: "celo",
    symbol: "CELO",
  },
  [`${SupportedChainId.BASE}`]: {
    id: "base",
    symbol: "ETH",
  },
  [`${SupportedChainId.GNOSIS}`]: {
    id: "xDAI",
    symbol: "xDAI",
  },
  [`${SupportedChainId.OPTIMISM}`]: {
    id: "opt",
    symbol: "ETH",
  },
  [`${SupportedChainId.ARBITRUM}`]: {
    id: "arb",
    symbol: "ETH",
  },
  [`${SupportedChainId.AVALANCHE}`]: {
    id: "avax",
    symbol: "AVAX",
  },

};



  export const WEB3AUTH_NETWORK = {
    mainnet: {
      displayName: "Mainnet",
      clientId: "BB7Cycr4trvRLqKMQViPrMUz5pJ2OTezkMzezdvoZ3wYvtepFGqOWwJBOZVTMtcmZNgBKsMUqGi5NZ9xvJjNThw",
      googleClientId: "490211141645-b4jreehsanlfkf8ag88c8rq1q2f4603d.apps.googleusercontent.com"
    },
    testnet: {
      displayName: "Testnet",
      clientId: "BPtseKNlLAexW69f-3RI3smDoUg4JH0OUdq5yckWnIfs78EP_GDpHQTS66q8cVihnjXHulzGP9mUh5wdpRajQns",
      googleClientId: "490211141645-6gbbufuedlrnq8s2ilmq21nkq30aguh4.apps.googleusercontent.com"
    },
    cyan: {
      displayName: "Cyan",
      clientId: "BHI9J8T5iU84wSJunaui1EABfRAvlBlxg-iN86jUXbi4IZ9uGOcqh5pJSBwsag0ObEA1eC1KiBvEDVcAZN0FU84",
      googleClientId: "490211141645-b4jreehsanlfkf8ag88c8rq1q2f4603d.apps.googleusercontent.com"
    },
  } as const;
  
  export type WEB3AUTH_NETWORK_TYPE = keyof typeof WEB3AUTH_NETWORK;