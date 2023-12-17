import { useCallback, useState } from 'react'
import { get as _get, find as _find } from 'lodash';
import { MetaTransactionData, SafeTransactionDataPartial } from "@gnosis.pm/safe-core-sdk-types";
import axiosHttp from 'api'
import axios from 'axios';
import { ImportSafe, safeService } from "helpers/safe"
import { GNOSIS_SAFE_ALLOWANCE_MODULE_CONTRACT, GNOSIS_SAFE_BASE_URLS, SupportedChainId } from 'constants/chains';
import { SafeTransactionOptionalProps } from "@gnosis.pm/safe-core-sdk/dist/src/utils/transactions/types";
import { CreateTreasuryTransactionAction, updateTreasuryTransactionAction } from "store/actions/treasury"
import { Contract, utils } from "ethers"
import { useWeb3Auth } from 'context/web3Auth';
import { useSafeTokens } from 'context/safeTokens';
import { useContract } from './useContract';
import { useDispatch } from 'react-redux';
const { toChecksumAddress } = require('ethereum-checksum-address')


const useGnosisAllowance = (safeAddress: string | null, chainId: number | null) => {
    // if(!safeAddress || !chainId) return { setAllowance: () => {}, getSpendingAllowance: () => {}, createAllowanceTransaction: () => {}, gnosisAllowanceLoading: () => {} };
    const dispatch = useDispatch()
    const { provider, account } = useWeb3Auth();
    const [gnosisAllowanceLoading, setGnosisAllowanceLoading] = useState(false);
    const [createSafeTxnLoading, setCreateSafeTxnLoading] = useState(false);
    const allowanceContract = useContract(GNOSIS_SAFE_ALLOWANCE_MODULE_CONTRACT[`${chainId}`], require('abis/AllowanceModule.json'))
    console.log("safeAddress", safeAddress, "chainId", chainId, allowanceContract, GNOSIS_SAFE_ALLOWANCE_MODULE_CONTRACT[`${chainId}`])
    const { safeTokens, tokenBalance } = useSafeTokens()

    const checkModuleEnabled = async (safeSDK: any) => {
        if(!safeAddress) return;
        const moduleAddress = GNOSIS_SAFE_ALLOWANCE_MODULE_CONTRACT[`${chainId}`]
        const response = await safeSDK.isModuleEnabled(moduleAddress)
        return response
    }

    const getSpendingAllowance = async ({ delegate, token } : { delegate: string, token: string }) => {
        if(!safeAddress || !allowanceContract) return;
        try {
            const allowance = await allowanceContract?.getTokenAllowance(safeAddress, delegate, token)
            const data = { 
                amount: parseFloat(utils.formatEther(allowance[0])), 
                spent: parseFloat(utils.formatEther(allowance[1])),
                resetTimeMin: allowance[2].toNumber(),
                lastResetMin: allowance[3].toNumber(),
                nonce: allowance[4].toNumber(),
            }
            return data
        } catch (e) {
            return null
        }
    }

    const setAllowance = async ({ allowance, label, delegate, actualAmount, stop= false }: any) => {
        if(!safeAddress || !account || !chainId) return;
        setGnosisAllowanceLoading(true)

        try {  
            console.log("provider, safeAddress", provider, safeAddress)
            const safeSDK = await ImportSafe(provider, safeAddress);
            console.log(safeSDK)
            console.log("account", account)
            const isOwner = await safeSDK.isOwner(account as string);
            if(!isOwner) {
                setGnosisAllowanceLoading(false)
                throw 'Not allowed operation. Only safe owner can perform setAllowance operation'
            }
            // const addDelegateData = allowanceContract?.interface.encodeFunctionData('addDelegate', [delegate])
            // const allowanceData = allowanceContract?.interface.encodeFunctionData('setAllowance', [delegate, token, amount, resetMins, resetBaseMins ])
            const currentNonce = await (await safeService(provider, `${chainId}`)).getNextNonce(safeAddress);
            let onlyCalls = false;
            if(chainId === SupportedChainId.POLYGON)
                onlyCalls = true
            const options: any = { nonce: currentNonce };
            const moduleAddress = GNOSIS_SAFE_ALLOWANCE_MODULE_CONTRACT[`${chainId}`]
            let moduleTransactionData = undefined;
            const moduleEnabled = await checkModuleEnabled(safeSDK);
            if(!moduleEnabled)
                moduleTransactionData = await safeSDK.createEnableModuleTx(moduleAddress)
                
            const setAllowanceObj = allowance.map((a:any) => {
                return {
                    to: GNOSIS_SAFE_ALLOWANCE_MODULE_CONTRACT[`${chainId}`],
                    data: allowanceContract?.interface.encodeFunctionData('setAllowance', [delegate, a.token, a.amount, a.resetMins, a.resetBaseMins ]) as string,
                    value: '0'
                }
            })
            const safeTransactionData: SafeTransactionDataPartial[]  = [
                ...( !moduleEnabled ? [{   
                    to: safeAddress,
                    data: moduleTransactionData?.data?.data as string,
                    value: '0'
                }] : []),
                {   
                    to: GNOSIS_SAFE_ALLOWANCE_MODULE_CONTRACT[`${chainId}`],
                    data: allowanceContract?.interface.encodeFunctionData('addDelegate', [delegate]) as string,
                    value: '0'
                },
                ...setAllowanceObj
            ]
            console.log(chainId, provider, onlyCalls, GNOSIS_SAFE_ALLOWANCE_MODULE_CONTRACT[`${chainId}`])
            const safeTransaction = await safeSDK.createTransaction({ safeTransactionData, options, onlyCalls })
            await new Promise(resolve => setTimeout(resolve, 2000))
            const safeTxHash = await safeSDK.getTransactionHash(safeTransaction);
            const signature = await safeSDK.signTransactionHash(safeTxHash);
            await (await safeService(provider, `${chainId}`))
            .proposeTransaction({ safeAddress, safeTransactionData: safeTransaction.data, safeTxHash, senderAddress: account, senderSignature: signature.data })
            await (await safeService(provider, `${chainId}`)).confirmTransaction(safeTxHash, signature.data)

            let tx: any = await (await safeService(provider, `${chainId}`)).getTransaction(safeTxHash)

            const payload = { safeAddress, rawTx: tx, metadata: { [delegate] : { label, recurringPaymentAmount: stop? undefined : actualAmount }}}
            dispatch(CreateTreasuryTransactionAction(payload))
            
            // const payload = [{ safeAddress, safeTxHash, recipient: delegate, label, recurringPaymentAmount: actualAmount }]
            // await axiosHttp.post(`transaction/label`, payload)
            setGnosisAllowanceLoading(false)
            return { safeTxHash, currentNonce, signature };
        } catch (e) {
            console.log(_get(e, 'message', ''))
            setGnosisAllowanceLoading(false)
            throw _get(e, 'message', 'Something went wrong')
        }
    }

    const createMultiTxn = async ( send:any, safeToken: any) => {
        const safeTransactionData: SafeTransactionDataPartial[]  = await Promise.all(
            send.map(
                async (result: any, index: number) => {
                    const data = allowanceContract?.interface.encodeFunctionData('executeAllowanceTransfer', [
                        safeToken, 
                        toChecksumAddress(result.to), 
                        BigInt(parseFloat(result.amount) * 10 ** _get(safeToken, 'token.decimals', 18)),
                        "0x",
                        account as string,
                        
                    ])
                    const transactionData = {
                        to: GNOSIS_SAFE_ALLOWANCE_MODULE_CONTRACT[`${chainId}`],
                        data: data as string,
                        value: "0",
                    };
                    return transactionData;
                }
            )
        );
        return safeTransactionData;
    }

    const createAllowanceTransaction = async ({ tokenAddress, amount, to, label, delegate}: { tokenAddress: string, amount: number, to: string, label: string, delegate: string} ) => {
        if(!safeAddress || !account || !chainId || !amount || !tokenAddress) return;
        const safeToken = _find(safeTokens[safeAddress], t => _get(t, 'tokenAddress', null) === tokenAddress)
        console.log(safeToken)
        if(!safeToken)
            throw `Something went wrong`
        if(amount == 0) throw `Cannot send 0 ${_get(safeToken, 'token.symbol', '')}`
        if (tokenBalance(tokenAddress, safeAddress) < amount)
            throw `Low token balance. Available balance ${ tokenBalance(tokenAddress, safeAddress)} ${_get(safeToken, 'token.symbol', '')}`
        const allowance = await getSpendingAllowance({ delegate: delegate, token: tokenAddress })
        if(!allowance)
            throw 'Unable to fetch allowance'
        const balance = +allowance.amount - +allowance.spent
        if(balance < +amount)
            throw `Low spending allowance. required additional ${+amount - balance} ${_get(safeToken, 'token.symbol', '')} token(s).`
        try {
            setCreateSafeTxnLoading(true);
            const executeTxResponse = await allowanceContract?.executeAllowanceTransfer(
                safeAddress, 
                tokenAddress, 
                toChecksumAddress(to), 
                `${BigInt(amount * 10 ** _get(safeToken, 'token.decimals', 18))}`, 
                process.env.REACT_APP_NATIVE_TOKEN_ADDRESS, 
                '0', 
                delegate, 
                "0x"
            )
            console.log("executeTxResponse", executeTxResponse);
            const { transactionHash, ...rest } =
            executeTxResponse &&
            (await executeTxResponse.wait());

            console.log("executeTxResponse", transactionHash, rest)

            try {
                let { data: tx } = await axios.get(`${GNOSIS_SAFE_BASE_URLS[chainId]}/v1/module-transaction/${transactionHash}`) //await (await safeService(provider, `${chainId}`)).getTransaction(transactionHash)
                const payload = { safeAddress, rawTx: tx, metadata: { [toChecksumAddress(to)] : { label }}}
                dispatch(CreateTreasuryTransactionAction(payload))
            } catch (e) {}

            // let payload: any[] = [];
            // payload.push({ safeAddress, safeTxHash: transactionHash, recipient: toChecksumAddress(to), label })
            // await axiosHttp.post(`transaction/label`, payload)
            setCreateSafeTxnLoading(false)
            return { transactionHash };
        } catch(e) {
            setCreateSafeTxnLoading(false)
            console.log(e)
            return null
        }
    }

    return { setAllowance, getSpendingAllowance, createAllowanceTransaction, gnosisAllowanceLoading }
}

export default useGnosisAllowance