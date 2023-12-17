import { useSafeTokens } from "context/safeTokens"
import { SafeTransactionDataPartial, MetaTransactionData, SafeTransactionData } from '@safe-global/safe-core-sdk-types'
// import { SafeTransactionDataPartial, MetaTransactionData } from "@gnosis.pm/safe-core-sdk-types";
// import { SafeTransactionOptionalProps } from "@gnosis.pm/safe-core-sdk/dist/src/utils/transactions/types";
import { useWeb3Auth } from "context/web3Auth"
import { ImportSafe, safeService } from "helpers/safe"
import { find as _find, get as _get } from 'lodash'
import DAOTokenABI from 'abis/DAOToken.json'
import { ethers } from "ethers";
import { CreateTreasuryTransactionAction, updateTreasuryTransactionAction } from "store/actions/treasury"
import { useAppDispatch } from "helpers/useAppDispatch"
import { AddOwnerTxParams, EthSafeSignature, SafeTransactionOptionalProps } from "@safe-global/protocol-kit"
import { beautifyHexToken, retry } from "utils"
import { useDAO } from "context/dao"
const { toChecksumAddress } = require('ethereum-checksum-address')


export type CreateSafeTransaction = {
    safeAddress: string,
    chainId: number,
    tokenAddress: string,
    send: Array<any>,
    offChainTxHash?: string | null | undefined,
    reject?: boolean | null | undefined,
}

export type ConfirmTransaction = {
    chainId: number,
    safeAddress: string,
    safeTxnHash: string
}

export type RejectTransaction = {
    safeAddress: string,
    chainId: number,
    _nonce: number
    sign?: string | undefined
}

export type ExecuteTransaction = {
    chainId: number,
    safeAddress: string,
    safeTxnHash: string
}


export default () => {
    const dispatch = useAppDispatch()
    const { DAO } = useDAO();
    const { provider, account } = useWeb3Auth();
    const { safeTokens, tokenBalance } = useSafeTokens()

    const createNativeSingleTxn = async (send: any, token: any) => {
        const safeTransactionData: SafeTransactionDataPartial[] = [{
            to: toChecksumAddress(_get(send, '[0].recipient')),
            data: "0x",
            value: `${BigInt((parseFloat(_get(send, '[0].amount')) * (10 ** _get(token, 'token.decimals', 18))).toFixed(0))}`,
        }]
        return safeTransactionData;
    }

    const createNativeMultiTxn = async (send: any, token: any) => {
        const safeTransactionData: SafeTransactionDataPartial[] =
            send.map((result: any, index: number) => {
                console.log((parseFloat(result.amount) * (10 ** _get(token, 'token.decimals', 18))).toFixed(0))
                return {
                    to: toChecksumAddress(result.recipient),
                    data: "0x",
                    value: `${BigInt((parseFloat(result.amount) * (10 ** _get(token, 'token.decimals', 18))).toFixed(0))}`
                };
            }
            )
        return safeTransactionData;
    }

    const createMultiTxn = async (send: any, safeToken: any) => {
        const token = new ethers.Contract(safeToken.tokenAddress, DAOTokenABI)
        const safeTransactionData: SafeTransactionDataPartial[] = await Promise.all(
            send.map(
                async (result: any, index: number) => {
                    const unsignedTransaction = await token.populateTransaction.transfer(
                        toChecksumAddress(result.recipient),
                        BigInt((parseFloat(result.amount) * (10 ** _get(safeToken, 'token.decimals', 18))).toFixed(0))
                    );
                    console.log("unsignedTransaction", unsignedTransaction)
                    const transactionData = {
                        to: safeToken.tokenAddress,
                        data: unsignedTransaction.data as string,
                        value: "0",
                    };
                    return transactionData;
                }
            )
        );
        return safeTransactionData;
    }

    const createSafeTransaction = async ({
        safeAddress,
        chainId,
        tokenAddress,
        send,
        offChainTxHash = undefined,
        reject = false
    }: CreateSafeTransaction) => {
        try {
            console.log(safeAddress, tokenAddress)
            let signature: any = null;
            const safeToken = _find(_get(safeTokens, safeAddress, []), t => _get(t, 'tokenAddress', null) === tokenAddress)
            if (!safeToken) throw 'Something went wrong'
            let total = send.reduce((pv: any, cv: any) => pv + (+cv.amount), 0);
            if (total == 0) throw 'Cannot send 0'
            const balance = tokenBalance(tokenAddress, safeAddress);
            console.log(balance)
            if (balance < total)
                throw `Low token balance. Available balance in safe ${beautifyHexToken(safeAddress)} is ${balance} ${safeToken?.token?.symbol}`
            let safeTransactionData: any = null;
            const safeSDK = await ImportSafe(provider, safeAddress);
        
            if (tokenAddress === process.env.REACT_APP_NATIVE_TOKEN_ADDRESS) {
                if(send.length === 1)
                    safeTransactionData = await createNativeSingleTxn(send, safeToken)
                else
                    safeTransactionData = await createNativeMultiTxn(send, safeToken)
            } else {
                safeTransactionData = await createMultiTxn(send, safeToken)
            }
            const currentNonce = await (await safeService(provider, `${chainId}`)).getNextNonce(safeAddress);
            const options: any = { nonce: currentNonce };
            const safeTransaction = await safeSDK.createTransaction({
                safeTransactionData,
                options,
            });
            await new Promise(resolve => setTimeout(resolve, 2000))
            const safeTxHash = await safeSDK.getTransactionHash(safeTransaction);
            signature = await safeSDK.signTransactionHash(safeTxHash);
            const senderAddress = account as string;
            await (await safeService(provider, `${chainId}`))
                .proposeTransaction({ safeAddress, safeTransactionData: safeTransaction.data, safeTxHash, senderAddress, senderSignature: signature.data })
            console.log("transaction has been proposed");
            
            console.log("REJECT==TXN", reject)

            if(!reject)
                await (await safeService(provider, `${chainId}`)).confirmTransaction(safeTxHash, signature.data)

            let tx: any = await (await safeService(provider, `${chainId}`)).getTransaction(safeTxHash)

            if(!offChainTxHash) {
                const payload = {
                    safeAddress,
                    rawTx: tx,
                    metadata: send.reduce((a, v) => ({ ...a, [v.recipient]: { parsedTxValue: {
                        value: BigInt((parseFloat(v.amount) * 10 ** _get(safeToken, 'token.decimals', 18)).toFixed(0)).toString(),
                        formattedValue: v?.amount.toString(),
                        symbol: safeToken?.token?.symbol,
                        decimals: safeToken?.token?.decimals,
                        tokenAddress: safeToken?.tokenAddress
                    }, label: v.label,
                        tag: v.tag, 
                        sweatConversion: v.sweatConversion ? v.sweatConversion : undefined, 
                        taskId: v?.taskId || undefined }}), {}) 
                }
                console.log(payload)
                dispatch(CreateTreasuryTransactionAction(payload))
            } else {
                const payload = { offChainTxHash, safeAddress, rawTx: tx }
                dispatch(updateTreasuryTransactionAction(payload))
            }
            tx = { ...tx, mySign: signature }
            return tx
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    const confirmTransaction = async ({ safeAddress, safeTxnHash, chainId  } : ConfirmTransaction) => {
        try {
            const safeSDK = await ImportSafe(provider, safeAddress);
            let signature = await safeSDK.signTransactionHash(safeTxnHash)
            await await (await safeService(provider, `${chainId}`)).confirmTransaction(safeTxnHash, signature.data)
            const tx = await (await safeService(provider, `${chainId}`)).getTransaction(safeTxnHash)
            const payload = { safeAddress,  rawTx: tx }
            dispatch(updateTreasuryTransactionAction(payload))
            return tx
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    const rejectTransaction = async ({ safeAddress, chainId, _nonce, sign} : RejectTransaction) => {
        try {
            const safeSDK = await ImportSafe(provider, safeAddress);
            const transactionObj: any = await safeSDK.createRejectionTransaction(_nonce)
            const safeTxHash = await safeSDK.getTransactionHash(transactionObj);
            let signature: any = sign;
            if(!signature)
                signature = await safeSDK.signTransactionHash(safeTxHash);
            const senderAddress = account as string;
            await (await safeService(provider, `${chainId}`))
                .proposeTransaction({ safeAddress, safeTransactionData: transactionObj.data, safeTxHash, senderAddress, senderSignature: signature.data, })
            console.log("on chain rejection transaction has been proposed successfully.");
            await (await safeService(provider, `${chainId}`)).confirmTransaction(safeTxHash, signature.data)
            console.log("on chain transaction has been confirmed by the signer");
            const tx = await (await safeService(provider, `${chainId}`)).getTransaction(safeTxHash)
            const payload = {
                safeAddress,
                rawTx: tx,
                metadata: {}
            }
            dispatch(CreateTreasuryTransactionAction(payload))
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    const executionComplete = async ({ safeTxnHash, chainId }: any) => {
        const tx = await (await safeService(provider, `${chainId}`)).getTransaction(safeTxnHash)
        if(!tx.isExecuted)
            throw "not executed"
        return tx
    }

    const executeTransaction = async ({ safeAddress, chainId, safeTxnHash }: ExecuteTransaction) => {
        try {
            const safeSDK = await ImportSafe(provider, safeAddress);
            const txn = await (await safeService(provider, `${chainId}`)).getTransaction(safeTxnHash)
            const safeTransactionData: any = {
                to: txn.to,
                value: txn.value,
                data: txn?.data ? txn?.data : "0x",
                operation: txn.operation,
                safeTxGas: `${txn.safeTxGas}`,
                baseGas: `${txn.baseGas}`,
                gasPrice: `${txn.gasPrice}`,
                gasToken: txn.gasToken,
                refundReceiver: `${txn.refundReceiver}`,
                nonce: txn.nonce,
            };
            const safeTransaction = await safeSDK.createTransaction({
                safeTransactionData,
            });
            txn.confirmations &&
                txn.confirmations.forEach((confirmation: any) => {
                    const signature = new EthSafeSignature(
                        confirmation.owner,
                        confirmation.signature
                    );
                    safeTransaction.addSignature(signature);
                });
            const executeTxResponse = await safeSDK.executeTransaction(safeTransaction);
            const receipt =
            executeTxResponse.transactionResponse &&
            (await executeTxResponse.transactionResponse.wait());
            console.log("receipt", receipt)
            if(receipt) {
                const executedTxn = await retry(
                    () => executionComplete({ safeTxnHash, chainId }),
                    () => { console.log('retry called...') },
                    10
                )
                const payload = { safeAddress, rawTx: executedTxn }
                dispatch(updateTreasuryTransactionAction(payload))
            }
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    const updateOwnersWithThreshold = async ({ safeAddress, chainId, newOwners = [], removeOwners = [], threshold, thresholdChanged = false, ownerCount = 0 }: any) => {
        if (!safeAddress || !account || !chainId) return;
        try {
            const safeSDK = await ImportSafe(provider, safeAddress);
            const isOwner = await safeSDK.isOwner(account as string);
            if (!isOwner) {
                throw 'Not allowed operation. Only safe owner can perform setAllowance operation'
            }

            const currentNonce = await (await safeService(provider, `${chainId}`)).getNextNonce(safeAddress);

            const options: any = { nonce: currentNonce };

            const newOwnerTxnData: SafeTransactionDataPartial[] = await Promise.all(
                newOwners.map(async (owner: string) => {
                    const params: AddOwnerTxParams = {
                        ownerAddress: owner,
                        threshold
                    }
                    const ownerTxn = await safeSDK.createAddOwnerTx(params)
                    const transactionData = {
                        to: ownerTxn.data.to,
                        data: ownerTxn.data.data,
                        value: "0",
                    };
                    return transactionData;
                })
            )

            const removeOwnerTxnData: SafeTransactionDataPartial[] = await Promise.all(
                removeOwners.map(async (owner: string) => {
                    const params: AddOwnerTxParams = {
                        ownerAddress: owner,
                        threshold
                    }
                    const ownerTxn = await safeSDK.createRemoveOwnerTx(params)
                    const transactionData = {
                        to: ownerTxn.data.to,
                        data: ownerTxn.data.data,
                        value: "0",
                    };
                    return transactionData;
                })
            )

            let txnPayload: any = [...removeOwnerTxnData, ...newOwnerTxnData]
            if (txnPayload.length === 0) {
                const thresholdTxn = await safeSDK.createChangeThresholdTx(threshold, options)
                txnPayload = thresholdTxn.data
            }

            const safeTransaction = await safeSDK.createTransaction({ safeTransactionData: txnPayload, options })
            console.log(safeTransaction)
            const safeTxHash = await safeSDK.getTransactionHash(safeTransaction);
            const signature = await safeSDK.signTransactionHash(safeTxHash);
            await (await safeService(provider, `${chainId}`))
                .proposeTransaction({ safeAddress, safeTransactionData: safeTransaction.data, safeTxHash, senderAddress: account, senderSignature: signature.data })
            await (await safeService(provider, `${chainId}`)).confirmTransaction(safeTxHash, signature.data)

            let labels: any[] = [];
            newOwners.map((r: any) => {
                labels.push({ recipient: safeAddress, label: thresholdChanged ? `Add Owner: ${beautifyHexToken(r)} | Change Threshold ${threshold}/${ownerCount}` : `Add Owner: ${beautifyHexToken(r)}` })
            })
            removeOwners.map((r: any) => {
                labels.push({ recipient: safeAddress, label: `Remove Owner: ${beautifyHexToken(r)} | Change Threshold ${threshold}/${ownerCount}` })
            })
            if (newOwners.length === 0 && removeOwners.length === 0)
                labels.push({ recipient: safeAddress, label: `Change Threshold ${threshold}/${ownerCount}` })
            const tx = await (await safeService(provider, `${chainId}`)).getTransaction(safeTxHash)
            const payload = {
                safeAddress,
                rawTx: tx,
                metadata: labels.reduce((a, v) => ({ ...a, [v.recipient]: { label: v?.label }}), {}) 
            }
            dispatch(CreateTreasuryTransactionAction(payload))
            return safeTxHash
        } catch (e) {
            console.log(e)
            throw 'Something went wrong. Please try again.'
        }
    }

    return { createSafeTransaction, confirmTransaction, rejectTransaction, executeTransaction, updateOwnersWithThreshold }
}