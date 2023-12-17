## Add a New Blockchain

To add a new blockchain take  the following steps

### Step 1: Add chain name to supported chain list
  
Go to to file [src/constants/chains.ts](src/constants/chains.ts) and make the following additions

- Define Chain id

        export enum SupportedChainId {
          MAINNET = 1,
          ....
          ....
          POLYGON = 137,
          POLYGON_MUMBAI = 80001
          New_Chain_Name = chain_id
        }

- Define Chain name

        export const CHAIN_IDS_TO_NAMES = {
        [`${SupportedChainId.MAINNET}`]: 'mainnet',
        [`${SupportedChainId.GOERLI}`]: 'goerli',
        ....
        [`${SupportedChainId.New_Chain_Name}`]: 'Chain Name',

      }

- Add new chain to supported chains list on Lomads

        export const SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
        SupportedChainId.MAINNET,
        SupportedChainId.POLYGON,
        SupportedChainId.GOERLI,
        SupportedChainId.New_Chain_Name,
        ]

- Add supported assets

        export const SUPPORTED_ASSETS = {
          [`${SupportedChainId.GOERLI}`]: {
            id: "ethereum",
            symbol: "ETH",
          },
        ....
          [`${SupportedChainId.New_chain_name}`]: {
            id: "",  ## eg."celo"
            symbol: "", ## "CELO"
          },
        };

- Add Gnosis Safe contracts for the new chain

        export const GNOSIS_SAFE_BASE_URLS:any = {
        [SupportedChainId.MAINNET]: 'https://safe-transaction-mainnet.safe.global',
        [SupportedChainId.GOERLI]: 'https://safe-transaction-goerli.safe.global',
        [SupportedChainId.POLYGON]: 'https://safe-transaction-polygon.safe.global'
        [SupportedChainId.New_Chain_Name]: 'Gnosis Safe API URL'
      }
      
      export const GNOSIS_SAFE_ALLOWANCE_MODULE_CONTRACT :any = {
        [SupportedChainId.GOERLI]: '0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134',
        [SupportedChainId.POLYGON]: '0x1Fb403834C911eB98d56E74F5182b0d64C3b3b4D',
        [SupportedChainId.MAINNET]: '0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'
        [SupportedChainId.New_Chain_Name]: 'Allowance Module Contract Address'
      }


### Step 2: Add chain info

Go to to file [src/constants/chainInfo.ts](src/constants/chainInfo.ts) and make the following additions

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
          ....
          [SupportedChainId.New_Chain_Name]: {
            networkType: ,
            blockWaitMsBeforeWarning: ,
            bridge: ,
            docs: ,
            explorer: ,
            opensea: ,
            infoLink: ,
            label: ,
            logoUrl: ,
            nativeCurrency: ,
            chainId: ,
            network: ,
            chainName: 
          }
        }



### Step 3:

Go to to file [src/constants/infura.ts](src/constants/infura.ts) and make the following additions

- Add Infura Key for the new chain
  
        export const INFURA_NETWORK_URLS: { [key in SupportedChainId]: string } = {
        [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
        ....
        [SupportedChainId.POLYGON]: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
        [SupportedChainId.POLYGON_MUMBAI]: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
        [SupportedChainId.New_Chain_Name]: `URL/${INFURA_KEY}`,
  
      }


### Step 4: Add USDC Token

Go to to file [src/constants/tokens.ts](src/constants/tokens.ts) and make the following additions

- Add new chain to the USDC list
  
      export const USDC: { [chainId in SupportedChainId]: Token } = {
        [SupportedChainId.MAINNET]: USDC_MAINNET,
        ....
        [SupportedChainId.POLYGON]: USDC_POLYGON,
        ....
        [SupportedChainId.New_Chain_Name]: USDC_NewChain,
      }

- Create USDC info for the new chain

      export const USDC_POLYGON = new Token(
        SupportedChainId.POLYGON,
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        6,
        'USDC',
        'USD//C'
      )
      
      export const USDC_NewChain = new Token(
        SupportedChainId.New_Chain_Name,
        'USDC contract address',
        decimals,
        'USDC',
        'USD//C'
      )

### Step 5: Configure the new chain

Go to to file [src/constants/rpcUrl.ts](src/constants/rpcUrl.ts) and add the chain rpc url

        export function getRpcUrls(chainId: SupportedChainId): [string] {
            switch (chainId) {
              ....
              case SupportedChainId.GOERLI:
                return [INFURA_NETWORK_URLS[chainId]]
              ....
              case SupportedChainId.POLYGON:
                return ['https://polygon-rpc.com/']
              case SupportedChainId.POLYGON_MUMBAI:
                return ['https://rpc-mumbai.matic.today']
              case SupportedChainId.New_Chain_Name:
                return ['URL']
              default:
            }


Go to to file [src/constants/chainConfig.ts](src/constants/chainConfig.ts) and add the chain configuration 

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
          
          chainName: {
            displayName: "Name",
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "",
            rpcTarget: INFURA_NETWORK_URLS[SupportedChainId.New_Chain_Name],
            blockExplorer: "",
            ticker: "",
            tickerName: "",
          } as CustomChainConfig,

### Step 6: Configure new chain for gasless SBT minting using Biconomy

Go to to file [src/constants/addresses.ts](src/constants/addresses.ts) and add forwarder contract address of the new chain.

Refer: [Biconomy Docs](https://docs-gasless.biconomy.io/misc/contract-addresses)


        export const BICONOMY_FORWARDER_ADDRESS: AddressMap = {
          [SupportedChainId.GOERLI]: '0xE041608922d06a4F26C0d4c27d8bCD01daf1f792',
          [SupportedChainId.POLYGON]: '0xf0511f123164602042ab2bCF02111fA5D3Fe97CD',
          [SupportedChainId.New_Chain_Name]: 'contract address',
        }
        
        export const BICONOMY_GAS_TANK_ADDRESSES: AddressMap = {
          [SupportedChainId.GOERLI]: '0x6781dbfdbd6a2803e1698c6e705659d3b597f643',
          [SupportedChainId.POLYGON]: '0xeb808ba857a080d35554fe5830dc61df1ba53e0c',
          [SupportedChainId.New_Chain_Name]: 'contract address',
        }

### Step 7: Check the Backend repos and make the necessary changes
