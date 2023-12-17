import { CHAIN_NAMESPACES, CustomChainConfig } from "@web3auth/base";
import { SupportedChainId } from "./chains";
import { INFURA_NETWORK_URLS } from 'constants/infura';


export const CHAIN_CONFIG = {
  mainnet: {
    displayName: "Ethereum Mainnet",
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x1",
    rpcTarget: INFURA_NETWORK_URLS[SupportedChainId.MAINNET],
    blockExplorer: "https://etherscan.io/",
    ticker: "ETH",
    tickerName: "Ethereum",
  } as CustomChainConfig,
  goerli: {
    displayName: "Goerli",
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x5",
    rpcTarget: INFURA_NETWORK_URLS[SupportedChainId.GOERLI],
    blockExplorer: "https://goerli.etherscan.io/",
    ticker: "ETH",
    tickerName: "Ethereum",
  } as CustomChainConfig,
  solana: {
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    rpcTarget: "https://api.mainnet-beta.solana.com",
    blockExplorer: "https://explorer.solana.com/",
    chainId: "0x1",
    displayName: "Solana Mainnet",
    ticker: "SOL",
    tickerName: "Solana",
  } as CustomChainConfig,
  polygon: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    rpcTarget: 'https://polygon-rpc.com/',
    blockExplorer: "https://polygonscan.com/",
    chainId: "0x89",
    displayName: "Polygon Mainnet",
    ticker: "MATIC",
    tickerName: "Matic",
  } as CustomChainConfig,
  celo: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    rpcTarget: 'https://forno.celo.org',
    blockExplorer: "https://celoscan.io/",
    chainId: '0xA4EC',
    displayName: "Celo Mainnet",
    ticker: "CELO",
    tickerName: "Celo",
  } as CustomChainConfig,
  base: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    rpcTarget: 'https://mainnet.base.org',
    blockExplorer: "https://basescan.org",
    chainId: '0x2105',
    displayName: "Base Mainnet",
    ticker: "ETH",
    tickerName: "Base",
  } as CustomChainConfig,
  gnosis: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    rpcTarget: 'https://rpc.gnosischain.com',
    blockExplorer: "https://gnosisscan.io",
    chainId: '0x64',
    displayName: "Gnosis",
    ticker: "xDAI",
    tickerName: "xDAI",
  } as CustomChainConfig,
  opt: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    rpcTarget: 'https://mainnet.optimism.io',
    blockExplorer: "https://optimistic.etherscan.io",
    chainId: '0xa',
    displayName: "Optimism",
    ticker: "ETH",
    tickerName: "Optimism",
  } as CustomChainConfig,
  arb: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    rpcTarget: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: "https://arbiscan.io",
    chainId: '0xA4B1',
    displayName: "Arbitrum",
    ticker: "ETH",
    tickerName: "Arbitrum",
  } as CustomChainConfig,
  avax: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    rpcTarget: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorer: "https://snowtrace.io",
    chainId: '0xA86A',
    displayName: "Avalanche",
    ticker: "AVAX",
    tickerName: "Avax",
  } as CustomChainConfig,
} as const;

export type CHAIN_CONFIG_TYPE = keyof typeof CHAIN_CONFIG;