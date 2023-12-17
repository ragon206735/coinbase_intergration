import { get as _get, find as _find } from 'lodash'
import { useContract } from "hooks/useContract";
import { ethers } from "ethers";
import axiosHttp from 'api'
import axios from 'axios'
import MultiCall from "@indexed-finance/multicall";
import { USDC } from 'constants/tokens';
import { USDC_GOERLI, USDC_POLYGON } from 'constants/tokens'
import { useCallback, useEffect, useState } from 'react';
import { INFURA_NETWORK_URLS } from 'constants/infura';
import { CHAIN_INFO } from 'constants/chainInfo';
import useBiconomyGasless from './useBiconomyGasless';
import { useWeb3Auth } from 'context/web3Auth';
import { getRpcUrls } from 'constants/rpcUrl';
import { SupportedChainId } from 'constants/chains';
const { toChecksumAddress } = require('ethereum-checksum-address')


export type SBTParams = {
    name: string,
    tokenSymbol: string,
    supply: number,
    baseUrl: string,
    whitelisted: number
}

const useMintSBT = (contractAddress: string | undefined, version: string | undefined = "0", contractChainId: SupportedChainId) => {
    const { account, provider, chainId } = useWeb3Auth();

    const { safeMintGasless } = useBiconomyGasless(contractChainId)
    
    const mintContract = useContract(contractAddress, require(+version >=3 ? 'abis/SBT.v3.json' : 'abis/SBT.v2.json'), true);


    const weth = (price: string, token: string): any => {
      if(!contractChainId) return;
      const tokens = [
        {
          label: CHAIN_INFO[contractChainId]?.nativeCurrency?.symbol,
          value: process.env.REACT_APP_NATIVE_TOKEN_ADDRESS,
          decimals: CHAIN_INFO[contractChainId]?.nativeCurrency?.decimals
        },
        {
            label: _get(USDC, `[${contractChainId}].symbol`),
            value: _get(USDC, `[${contractChainId}].address`),
            decimals: _get(USDC, `[${contractChainId}].decimals`),
        }
      ]
      const payToken = _find(tokens, (t:any) => toChecksumAddress(t.value) === toChecksumAddress(token))
      return ethers.utils.parseUnits(price, payToken?.decimals)
  }

  const isNFTMinted = async ({ chainId, tokenAddress }: any) => {
    try {
      const nft = await axios.get(`https://nft.api.infura.io/networks/${chainId}/nfts/${tokenAddress}/owners`, 
      //@ts-ignore
      { auth: { username: process.env.REACT_APP_INFURA_KEY, password: process.env.REACT_APP_INFURA_SECRET } }).then(res => {
        console.log("isNFTMinted", res.data)
      })
    } catch (e) {
      console.log(e)
    }
  }

  const balanceOf = async () => {
    try {
      const rpcUrl = getRpcUrls(contractChainId)
      let provider = new ethers.providers.JsonRpcProvider(rpcUrl[0])
      const multicall = new MultiCall(provider);
      const calls: any = [
        {
          target: contractAddress,
          function: "balanceOf",
          args: [account],
        },
      ]
      const [, res] = await multicall.multiCall(require(+version >=3 ? 'abis/SBT.v3.json' : 'abis/SBT.v2.json'), calls);
      return res[0]
    } catch (e) {
      throw e
    }

    // if(mintContract?.signer){
    //   if(account && chainId && provider) {
    //     return mintContract?.balanceOf(account)
    //   }
    //   return null;
    // }
  }

    const getCurrentTokenId = async () => {
        if(mintContract?.signer){
          return mintContract?.getCurrentTokenId()
        }
    }

    const getTreasury = useCallback(async () => {
        return mintContract?.treasuryAddress()
    }, [provider, account, chainId, contractAddress, version])

    const getMintToken = useCallback(async () => {
      return mintContract?.mintToken()
    }, [provider, account, chainId, contractAddress, version])

    const getMintPrice = useCallback(async () => {
        return mintContract?.mintPrice()
    }, [provider, account, chainId, contractAddress, version])
    

    const payByCryptoEstimate = async (tokenContract: any, price: any, mt: any) => {
      console.log("tokenContract", tokenContract)
      try {
        const treasury = await getTreasury();
        //const mt = await getMintToken();
        const mp = await getMintPrice();
        const mintToken = (mt ? mt : process.env.REACT_APP_NATIVE_TOKEN_ADDRESS).toString()
        let mintPrice = null;
        if(!price) {
          mintPrice = mp.toString()
        } else {
          mintPrice = weth(price, mintToken)
        }
        console.log(mintPrice.toString())
        if(mintToken === process.env.REACT_APP_NATIVE_TOKEN_ADDRESS) {
          const gas = await axiosHttp.post('utility/estimate-gas', { chainId, to: treasury, value: '0x' + (+mintPrice).toString(16) }).then(res => res.data)
          return BigInt(gas).toString()
        } else {
          return await tokenContract.estimateGas.transfer(treasury, '0x' + (+mintPrice).toString(16))
        }
      }
      catch (e) {
        console.log(e)
        throw _get(e, 'data.message', 'Error while estimating')
      }
  }

    const payByCrypto = async (tokenContract: any, price: string | undefined,  mt: any) => {
        const treasury = await getTreasury();
        //const mt = await getMintToken();
        const mp = await getMintPrice();
        const mintToken = (mt ? mt : process.env.REACT_APP_NATIVE_TOKEN_ADDRESS).toString()
        let mintPrice = null;
        if(!price) {
          mintPrice = mp.toString()
        } else {
          mintPrice = weth(price, mintToken)
        }
        if(mintToken === process.env.REACT_APP_NATIVE_TOKEN_ADDRESS) {
          const params = {
            from: account, to: treasury, value: '0x' + (+mintPrice).toString(16)
          }
          /* @ts-ignore */
          const txHash = await provider?.send("eth_sendTransaction", [params]);
          const result = await new Promise((resolve, reject) => {
            const interval = setInterval(async ()=>{
              console.log("Attempting to get transaction receipt...");
              /* @ts-ignore */
              let receipt = await provider?.send("eth_getTransactionReceipt", [txHash]);
              if(receipt) {
                clearInterval(interval)
                resolve(receipt)
              }
            }, 2000);
          })
          console.log("receipt", result)
          return result
        } else {
          const tx = await tokenContract.transfer(treasury, '0x' + (+mintPrice).toString(16))
          return await tx.wait()
        }
    }

    const waitFor = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

    const retry = (promise: any, onRetry: Function, maxRetries: number) => {
      const retryWithBackoff: any = async (retries: number) => {
          try {
              if (retries > 0) {
                  const timeToWait = 2 ** retries * 1000;
                  console.log(`waiting for ${timeToWait}ms...`);
                  await waitFor(timeToWait);
              }
              return await promise();
          } catch (e) {
              if (retries < maxRetries) {
                  onRetry();
                  return retryWithBackoff(retries + 1);
              } else {
                  console.warn("Max retries reached. Bubbling the error up");
                  throw e;
              }
          }
      }
      return retryWithBackoff(0);
  }

    const getTxnStatus = async () => { 
      console.log("Checking balance...")
      const res = await balanceOf();
      if(parseInt(res._hex, 16) === 1)
        return true
      throw "Txn in progress.."
    }

    const mint = async (tokenURI: string | null | undefined, payment: string | undefined, signature: string | undefined, tokenContract: any, gasless: boolean = false, dappApiKey: string | undefined) => {
        try {
          const currTokId = await getCurrentTokenId()
          let tokenId = parseFloat(currTokId.toString());

          try {
            let tx: any = null;
            if(+version >= 1) {
              if(gasless) {
                tx = await safeMintGasless({ contract : contractAddress, version: +version, apiKey: dappApiKey,  mintParams : {tokenURI, tokenId, payment, signature, ...( +version >= 3 ? { tranaction_type: "meta" } : {} ) }} )
                if(tx?.transactionId) {
                  await retry(
                      () => getTxnStatus(),
                      () => { console.log('retry called...') },
                      10
                  )
                } else {
                  throw tx?.data?.error || "Error while minting"
                }
              } else {
                if(+version >= 3) {
                  tx = await mintContract?.safeMint(
                    tokenURI,
                    tokenId,
                    payment,
                    signature,
                    "sender"
                  );
                } else {
                  tx = await mintContract?.safeMint(
                    tokenURI,
                    tokenId,
                    payment,
                    signature
                  );
                }
              }
            } else {
              if(mintContract?.signer) {
                tx = await mintContract?.mintSBT(account);
              } 
            }
            if(tx?.wait) {
              const txn = await tx?.wait();
              return txn;
            }
            if(!tx) throw "Error while minting"
            return tx
          } catch (e) {
            console.log(e)
            throw _get(e, 'message', 'Error while minting')
          }
        }
        catch (e) {
           console.log(e)
           throw 'Error during mint'
        }
    }

    const estimateGas = async () => {
        if (mintContract?.signer) {
          const stats = await getCurrentTokenId()
          const tokenId = parseFloat(stats.toString());
          const payment = '--'
          const signature = await axiosHttp.post(`contract/whitelist-signature`, {
            chainId: chainId, 
            contract: contractAddress,
            tokenId,
            payment
          }).then(res => res.data.signature)
          try {
            let tx = null;
            if(+version>=3) {
              tx = await mintContract?.estimateGas.safeMint(
                  "",
                  tokenId,
                  payment,
                  signature,
                  "sender"
              );
            } else {
              tx = await mintContract?.estimateGas.safeMint(
                "",
                tokenId,
                payment,
                signature,
              );
            }
            return tx
          } catch (e) {
            console.log(e)
            throw _get(e, 'data.message', _get(e, 'message', 'Could not estimate gas. Please try after sometime'))
          }
        }
        throw 'Could not estimate gas. Please try after sometime'
      };

    const withdraw = async () => {
      if (mintContract?.signer) {

        const  overrides = {
          gasLimit: 3000000,
          gasPrice: ethers.utils.parseUnits('300', 'gwei').toString(),
          type: 1,
          accessList: [
            {
              address: "0xbd062EB9720c78f00c68770F3dE62118e66be404", // admin gnosis safe proxy address
              storageKeys: [
                  "0x0000000000000000000000000000000000000000000000000000000000000000"
              ]
            },
            {
              address: "0xEb42ab42685cF1C2Ad2A49d67C7f1363f2e7D807", // proceedsRecipient gnosis safe proxy address
              storageKeys: [
                  "0x0000000000000000000000000000000000000000000000000000000000000000"
              ]
            },
            {
              address: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',  // gnosis safe master address
              storageKeys: []
            }
          ]
        }

        try {
          const value = await mintContract?.withdraw(overrides)
        } catch (e) {
          console.log(e)
          throw _get(e, 'message', 'Could not withdraw')
        }
      }
      throw 'Could not withdraw. Please try after sometime'
    }

    const checkDiscount = async (inviteCode: string) => {
      if (mintContract?.signer) {
        try {
          const value = await mintContract?.getDiscount(inviteCode, account)
          const ethValue = ethers.utils.formatEther(value.toString());
          return ethValue
        } catch (e) {
          console.log(e)
          throw _get(e, 'message', 'Could not estimate gas. Please try after sometime')
        }
      }
      throw 'Could not estimate gas. Please try after sometime'
    }

    const updateContract = async (treasury: string, price: string, mintToken: string, whitelist: boolean) => {
      console.log("PRICE", price)
      if (mintContract?.signer) {
        console.log(mintContract)
        try {
          const tx = await mintContract?.setProperties(treasury, mintToken, weth(price, mintToken), whitelist ? 1 : 0)
          await tx.wait()
          return {
            mintPrice: price,
            mintPriceToken: mintToken,
            treasury: treasury,
            whitelisted: whitelist
        }
        } catch (e) {
          console.log(e)
          throw e
        }
      } else {
        throw "Transaction not signed"
      }
    }

    return { isNFTMinted, balanceOf, getTreasury, getCurrentTokenId, mint, estimateGas, checkDiscount, updateContract, withdraw, payByCrypto, payByCryptoEstimate }

}

export default useMintSBT;