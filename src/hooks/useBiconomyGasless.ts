import React from "react"
import { find as _find } from 'lodash';
import axios from "axios"
import ABIV2 from 'abis/SBT.v2.json';
import ABIV3 from 'abis/SBT.v3.json';
import { BICONOMY_GAS_TANK_ADDRESSES } from "constants/addresses";
import { ethers } from "ethers";
import GASTANK_ABI from 'abis/BiconomyGasStation.json'
import { useContract } from "./useContract";
import { CHAIN_INFO } from "constants/chainInfo";
import { Biconomy } from "@biconomy/mexa";
import { useWeb3Auth } from "context/web3Auth";

const BICONOMY_ENDPOINT = 'https://api.biconomy.io'
const HEADERS: any = {
    "authToken": process.env.REACT_APP_BICONOMY_AUTH_KEY
}

export default (chain: number | undefined) => {

    const { account, provider } = useWeb3Auth()

    const gasTankContract = useContract(chain ? BICONOMY_GAS_TANK_ADDRESSES[chain]: '', GASTANK_ABI)


    const createDapp = async ({ name, chainId }: { name: string, chainId: number }) => {
        return axios.post(`${BICONOMY_ENDPOINT}/api/v1/dapp/public-api/create-dapp`, 
        {
            dappName: name, networkId: chainId, enableBiconomyWallet: false
        },
        {
            headers: HEADERS
        }).then(res => {
            if(res?.data?.code === 200) {
                return res.data
            }
            throw res?.data?.message
        })
    }

    const addContract = async ({ apiKey, name, contract, version = 2 }: { apiKey: string, name: string, contract: string, version: number }) => {

        return axios.post(`${BICONOMY_ENDPOINT}/api/v1/smart-contract/public-api/addContract`, 
        {
            contractName: name, contractAddress: contract, abi: JSON.stringify(version >= 3 ? ABIV3 : ABIV2), contractType: "SC", walletType: "", metaTransactionType: "TRUSTED_FORWARDER"
        },
        {
            headers: { ...HEADERS, apiKey }
        }).then(res => res.data)
    }

    const addMethod = async ({ apiKey, contract, method }: { apiKey: string, contract: string, method: string }) => {
        return axios.post(`${BICONOMY_ENDPOINT}/api/v1/meta-api/public-api/addMethod`, 
        {
           apiType: "custom", methodType: "write", name: method, contractAddress: contract, method
        },
        {
            headers: { ...HEADERS, apiKey }
        }).then(res => res.data)
    }

    const initBiconomyGasless = async ({ dappName, chainId, contract, version = 2 }: { dappName: string, chainId: number, contract: string, version: number }) => {
        try {
            const dappResp = await createDapp({ name: dappName, chainId })
            if(dappResp) {
                const addContractResp  = await addContract({ apiKey: dappResp?.data?.apiKey, name: dappName, contract, version })
                if(addContractResp) {
                    const methodResp = await addMethod({ apiKey: dappResp?.data?.apiKey, contract, method: version >=3 ? 'safeMint' : 'safeMintMeta' })
                    const response = {
                        apiKey: dappResp?.data?.apiKey,
                        fundingKey: dappResp?.data?.fundingKey,
                        apiIds: methodResp?.apiIds
                    }
                    return response
                }
            }
            throw "Unable to initiliaze Biconomy gasless"
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    const gasBalance = async ({ apiKey }: { apiKey: string }) => {
        return axios.get(`https://data.biconomy.io/api/v1/dapp/gas-tank-balance`, { 
            headers: { 
                ...HEADERS, apiKey
            }
        })
    }

    const fillGas = async ({ fundingKey, amount }: { fundingKey: string, amount: string }) => {
        if(!chain) return;
        try {
            const gasAmount = parseFloat(amount) * (10 **  CHAIN_INFO[chain]?.nativeCurrency?.decimals)
            console.log(gasAmount)
            const gasTx = await gasTankContract?.depositFor(fundingKey, {from: account, value: gasAmount.toString()});
            let receipt = await gasTx.wait(1);
            console.log("receipt", receipt);
            return receipt;
        } catch (e) {
            throw e
        }
    }

    const safeMintGasless = async ({ contract, version = 2, apiKey, mintParams }: { contract: string | undefined, version: number | undefined, apiKey: string | undefined, mintParams: any } ) => {
        if(!contract || !apiKey || !provider) return;
        try {
            const biconomy = new Biconomy(provider.provider, {
                apiKey,
                debug: true,
                contractAddresses: [contract],
              });
              const bicProvider = await biconomy.provider;
        
              const contractInstance = new ethers.Contract(
                contract,
                require(version >= 3 ? '../abis/SBT.v3.json' : '../abis/SBT.v2.json'),
                biconomy.ethersProvider
              );
              await biconomy.init();
              let data: any = null
              if(version >= 3) {
                data = await contractInstance.populateTransaction.safeMint(
                    mintParams.tokenURI,
                    mintParams.tokenId,
                    mintParams.payment,
                    mintParams.signature,
                    mintParams.tranaction_type
                  ); 
              } else {
                data = await contractInstance.populateTransaction.safeMintMeta(
                    mintParams.tokenURI,
                    mintParams.tokenId,
                    mintParams.payment,
                    mintParams.signature,
                  );
              }
        
              let txParams = {
                data: data?.data,
                to: contract,
                from: account,
                signatureType: "EIP712_SIGN",
                gasLimit: 5000000,
              };
              console.log("Sending transaction...");
              if(bicProvider && bicProvider.send) {
                // @ts-ignore
                const tx = await bicProvider?.send("eth_sendTransaction", [txParams])
                console.log("Transaction successful!");
                return tx
              } else {
                throw "Something went wrong"
              }
        }
        catch (e) {
            console.log(e)
            throw e
        }
    }

    return { safeMintGasless, fillGas, gasBalance, initBiconomyGasless, createDapp, addContract, addMethod }
}