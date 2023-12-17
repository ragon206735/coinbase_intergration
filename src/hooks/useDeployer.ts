import { ethers } from "ethers";
import { get as _get, find as _find } from 'lodash'
import ABI from '../abis/SBT.v3.json'
import bytecode from '../abis/SBT.v3.bytecode'
import { useWeb3Auth } from "context/web3Auth";
import { useState } from "react";
import { CHAIN_INFO } from "constants/chainInfo";
import { USDC } from "constants/tokens";
import { BICONOMY_FORWARDER_ADDRESS } from "constants/addresses";


export type SBTParams = {
    name: string,
    symbol: string,
    mintToken: string,
    treasury: string,
    mintPrice: string,
    whitelisted: number,
    chainId: number
}


export default () => {
    const { provider, account } = useWeb3Auth();
    const [deployLoading, setDeployLoading] = useState(false)

    const weth = (price: string, token: string, chainId: number): any => {
        const tokens = [
            {
                label: CHAIN_INFO[chainId]?.nativeCurrency?.symbol,
                value: process.env.REACT_APP_NATIVE_TOKEN_ADDRESS,
                decimals: CHAIN_INFO[chainId]?.nativeCurrency?.decimals
            },
            {
                label: _get(USDC, `[${chainId}].symbol`),
                value: _get(USDC, `[${chainId}].address`),
                decimals: _get(USDC, `[${chainId}].decimals`),
            }
        ]
        const payToken = _find(tokens, (t:any) => t.value === token)
        return ethers.utils.parseUnits(price, payToken?.decimals)
    }

    const deploy = async ({ name, symbol, mintToken, treasury, mintPrice, whitelisted, chainId }: SBTParams) => {
        setDeployLoading(true);
        const signer = await provider.getSigner();
        try {
            if(!signer) throw 'Error during deployment'
            const factory = new ethers.ContractFactory(ABI, bytecode, signer);
            const contract = await factory.deploy(
                name, 
                symbol, 
                weth(mintPrice, mintToken, chainId),
                mintToken,
                treasury,
                account,
                BICONOMY_FORWARDER_ADDRESS[chainId],
                whitelisted ? 1 : 0
            );
            await contract.deployed();
            setDeployLoading(false);
            return contract.address
        } catch (e) {
            console.log(e)
            setDeployLoading(false);
            throw 'Error during deployment'
        }
    }
    return { deploy, deployLoading }
}