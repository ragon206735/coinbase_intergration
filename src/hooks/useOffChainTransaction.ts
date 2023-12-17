import React from "react";
import axiosHttp from 'api'
import moment from "moment";
import { useWeb3Auth } from "context/web3Auth";
import { CreateTreasuryTransactionAction, updateTreasuryTransactionAction } from "store/actions/treasury";
import { useAppDispatch } from "helpers/useAppDispatch";
import { nanoid } from "nanoid";
import { useSafeTokens } from "context/safeTokens";

export type CreateSafeTransaction = {
    safeAddress: string,
    chainId: number,
    tokenAddress: string,
    send: Array<any>,
    daoId?: string,
    isSafeOwner?: boolean
}

export default () => {

    const dispatch = useAppDispatch()
    const { account } = useWeb3Auth()
    const { getToken } = useSafeTokens()

    const createSafeTransaction = ({
        safeAddress,
        chainId,
        tokenAddress,
        send,
        daoId,
        isSafeOwner
    }: CreateSafeTransaction) => {
        console.log("calleddddd...")
        const token = getToken(tokenAddress, safeAddress)
        try {
            const nonce = moment().unix();
            let payload = {}
            if (send.length > 1) {
                payload = {
                    daoId: daoId,
                    safe: safeAddress,
                    safeTxHash: nanoid(32),
                    nonce,
                    executor: null,
                    isExecuted: false,
                    offChain: true,
                    executionDate: null,
                    submissionDate: moment().utc().toDate(),
                    token: {
                        symbol: token ? token?.token?.symbol : 'SWEAT',
                        tokenAddress: tokenAddress,
                    },
                    confirmations: isSafeOwner ? [{
                        owner: account,
                        submissionDate: moment().utc().toDate()
                    }] : [],
                    dataDecoded: {
                        method: "multiSend",
                        parameters: [{
                            valueDecoded: send.map(r => {
                                return {
                                    dataDecoded: {
                                        method: 'transfer',
                                        parameters: [
                                            { name: 'to', type: "address", value: r.recipient },
                                            { name: 'value', type: "uint256", value: `${BigInt((parseFloat(r.amount) * 10 ** (token ? token?.token?.decimals : 18))).toString()}`.split(".")[0] },
                                        ]
                                    }
                                }
                            })
                        }]
                    }
                }
            }
            else {
                payload = {
                    daoId: daoId,
                    safe: safeAddress,
                    nonce,
                    safeTxHash: nanoid(32),
                    isExecuted: false,
                    offChain: true,
                    executor: null,
                    executionDate: null,
                    submissionDate: moment().utc().toDate(),
                    token: {
                        symbol: token ? token?.token?.symbol : 'SWEAT',
                        tokenAddress: tokenAddress,
                    },
                    confirmations: isSafeOwner ? [{
                        owner: account,
                        submissionDate: moment().utc().toDate()
                    }] : [],
                    dataDecoded: {
                        method: 'transfer',
                        parameters: [
                            { name: 'to', type: "address", value: send[0].recipient },
                            { name: 'value', type: "uint256", value: `${BigInt((parseFloat(send[0].amount) * 10 ** (token ? token?.token?.decimals : 18))).toString()}`.split(".")[0] },
                        ]
                    }
                }
            }
            const params = {
                safeAddress,
                rawTx: payload,
                metadata: send.reduce((a, v) => ({
                    ...a, [v.recipient]: {
                        parsedTxValue: {
                            // value: BigInt(parseFloat(v.amount) * 10 ** (token?.token?.decimals || 18)),
                            value: `${BigInt(parseFloat(v.amount) * 10 ** (token?.token?.decimals || 18)).toString()}`.split(".")[0],
                            formattedValue: v?.amount.toString(),
                            symbol: token ? token?.token?.symbol : 'SWEAT',
                            decimals: token ? token?.token?.decimals : 18,
                            tokenAddress: tokenAddress
                        }, label: v.label, tag: v.tag,
                        taskId: v?.taskId || undefined
                    }
                }), {})
            }
            console.log(params)
            dispatch(CreateTreasuryTransactionAction(params))
        } catch (e) {
            throw e
        }
    }

    const confirmTransaction = async ({ safeAddress, safeTxnHash, chainId }: any) => {
        try {
            const { data: txn } = await axiosHttp.get(`gnosis-safe/${safeTxnHash}?safeAddress=${safeAddress}`)
            const payload = { safeAddress, rawTx: { ...txn.rawTx, confirmations: [...txn.rawTx.confirmations, { owner: account, submissionDate: moment().utc().toDate() }] } }
            dispatch(updateTreasuryTransactionAction(payload))
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    const rejectTransaction = async ({ safeAddress, safeTxnHash, _nonce }: any) => {
        try {
            if (!safeTxnHash) {
                const payload = {
                    nonce: _nonce,
                    safeTxHash: nanoid(32),
                    value: "0",
                    isExecuted: false,
                    offChain: true,
                    executionDate: null,
                    submissionDate: moment().utc().toDate(),
                    token: { symbol: 'SWEAT' },
                    confirmations: [{
                        owner: account,
                        submissionDate: moment().utc().toDate()
                    }],
                    data: null,
                    dataDecoded: null
                }
                const params = {
                    safeAddress,
                    rawTx: payload,
                    metadata: {}
                }
                dispatch(CreateTreasuryTransactionAction(params))
            } else {
                const { data: txn } = await axiosHttp.get(`gnosis-safe/${safeTxnHash}?safeAddress=${safeAddress}`)
                const payload = { safeAddress, rawTx: { ...txn.rawTx, confirmations: [...txn.rawTx.confirmations, { owner: account, submissionDate: moment().utc().toDate() }] } }
                dispatch(updateTreasuryTransactionAction(payload))
            }
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    const executeTransaction = async ({ safeAddress, safeTxnHash }: any) => {
        try {
            const { data: txn } = await axiosHttp.get(`gnosis-safe/${safeTxnHash}?safeAddress=${safeAddress}`)
            const payload = { safeAddress, rawTx: { ...txn.rawTx, executor: account, isExecuted: true, executionDate: moment().utc().toDate() } }
            dispatch(updateTreasuryTransactionAction(payload))
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    return { confirmTransaction, createSafeTransaction, rejectTransaction, executeTransaction }

}