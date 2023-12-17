import React, { useMemo } from "react"
import { find as _find, get as _get } from 'lodash'
import { TableCell, TableRow } from "@mui/material"
import useGnosisTxnTransform from "hooks/useGnosisTxnTransform"
import axiosHttp from 'api'
import CreditDebit from "./CreditDebit"

import { useDAO } from "context/dao"
import Label from "./Label"
import Recipient from "./Recipient"
import Tag from "./Tag"
import Sign from "./Sign"
import Action from "./Action"
import useSafe from "hooks/useSafe"
import { useAppDispatch } from "helpers/useAppDispatch"
import { loadRecurringPaymentsAction } from "store/actions/treasury"
import { useSafeTokens } from "context/safeTokens"

export default ({ transaction, executableNonce }: any) => {
    const dispatch = useAppDispatch()
    const { DAO } = useDAO();
    const { loadSafe } = useSafe()
    const { safeTokens } = useSafeTokens()

    const safeChainId = useMemo(() => {
        if (DAO?.url)
            return _find(DAO?.safes, s => s.address === transaction?.safeAddress)?.chainId
        return undefined
    }, [DAO?.url])

    const { transformTx } = useGnosisTxnTransform();

    const txn = useMemo(() => {
        return transformTx(transaction?.rawTx, [], transaction?.safeAddress)
    }, [transaction])

    const handlePostExecution = async (reject: boolean) => {
        let actionList: any = [];
        for (let index = 0; index < txn.length; index++) {
            const tx = txn[index];
            const metadata = _get(transaction, `metadata.${tx.to}`)
            const token = _find(_get(safeTokens, transaction?.safeAddress, []), (tkn: any) => tkn?.tokenAddress === tx?.tokenAddress)
            if (!tx.to || tx.to === "0x") break;
            let actions: any = {}
            if (metadata?.sweatConversion) {
                // reset sweat for recipient && update user earnings
                actions = {
                    ...actions,
                    "RESET_SWEAT": { user: tx?.to, daoId: DAO?._id, },
                    "UPDATE_EARNING": { user: tx?.to, daoId: DAO?._id, symbol: tx?.symbol, value: +tx?.formattedValue, currency: tx?.tokenAddress || 'SWEAT' },
                    "UPDATE_FIAT_CONVERSION": { txId: transaction?._id, recipient: tx?.to, fiatConversion: token?.fiatConversion }
                }
            } else if (metadata?.taskId || transaction?.rawTx?.taskId) {
                // close task && update payment for user
                actions = {
                    ...actions,
                    "TASK_PAID": { taskId: metadata?.taskId ||  transaction?.rawTx?.taskId, user: tx?.to },
                    "UPDATE_EARNING": { user: tx?.to, daoId: DAO?._id, symbol: tx?.symbol, value: +tx?.formattedValue, currency: tx?.tokenAddress || 'SWEAT' },
                    "UPDATE_FIAT_CONVERSION": { txId: transaction?._id, recipient: tx?.to, fiatConversion: token?.fiatConversion }
                }
            } else if (metadata?.recurringPaymentAmount) {
                // update recurring payment status
                actions = {
                    ...actions,
                    "RECURRING_PAYMENT": { safeTxHash: transaction?.rawTx?.safeTxHash, reject }
                }
            } else {
                // update user earnings
                actions = {
                    ...actions,
                    "UPDATE_EARNING": { user: tx?.to, daoId: DAO?._id, symbol: tx?.symbol, value: +tx?.formattedValue, currency: tx?.tokenAddress || 'SWEAT' },
                    "UPDATE_FIAT_CONVERSION": { txId: transaction?._id, recipient: tx?.to, fiatConversion: token?.fiatConversion }
                }
            }
            actionList.push(actions)
        }
        if (actionList.length > 0) {
            await axiosHttp.post(`gnosis-safe/${transaction?.rawTx?.safeTxHash}/executed`, actionList)
                .then(res => {
                    console.log(res.data)
                    const safes = DAO?.safes.map((safe: any) => safe?.address)
                    dispatch(loadRecurringPaymentsAction({ safes }))
                })
        }
    }

    if (transaction?.rawTx?.daoId && transaction?.rawTx?.token?.tokenAddress === 'SWEAT' && transaction?.rawTx?.daoId !== DAO?._id)
        return null

    if (transaction?.daoId && transaction?.rawTx?.token?.tokenAddress === 'SWEAT' && transaction?.daoId !== DAO?._id)
        return null

    // if (transaction?.rawTx?.daoId && transaction?.rawTx?.daoId !== DAO?._id)
    //     return null

    // if (transaction?.daoId && transaction?.daoId !== DAO?._id)
    //     return null

    if (!txn) return null

    return (
        <>
            {
                txn.map((tx: any, _i: number) => {
                    if(tx.safeTxHash === '0x27a1c3f94c4806d81daa3bc2efdb722cf573d88371b9399dfd502d51c4a8f015') {
                        console.log("tx.to === '0x'", _i, txn, transaction)
                    }
                    let amount = null
                    if(tx.allowanceTxn) {
                        const metadata = _get(transaction, `metadata.${tx.to === '0x' ? transaction?.safeAddress : tx.to}`, null)
                        if(metadata && metadata?.label){
                            let lab = metadata?.label?.split('|');
                            if(lab && lab.length > 0)
                                amount = lab[lab.length - 1].replace(tx?.symbol, '')
                        }
                    }
                    return (
                        <TableRow key={tx.safeTxHash}>
                            <CreditDebit credit={tx?.isCredit} fiatConversion={tx?.executionDate ? _get(transaction, `metadata.${tx?.to}.fiatConversion`, undefined) : _get(tx, 'fiatConversion', undefined)} executed={tx?.executionDate} amount={amount ? amount : tx?.formattedValue} token={tx?.symbol} />
                            <Label transaction={transaction} recipient={tx?.to} />
                            <Recipient safeAddress={transaction?.safeAddress} credit={tx?.isCredit} recipient={tx?.to} token={tx?.symbol} />
                            <Tag transaction={transaction} recipient={tx?.to} />
                            <Sign transaction={tx} index={_i} />
                            <Action txnGroup={txn} amount={tx?.formattedValue} onPostExecution={handlePostExecution} token={tx?.symbol} tokenAddress={tx?.tokenAddress} executableNonce={executableNonce} safeAddress={transaction?.safeAddress} transaction={tx} txnCount={txn.length} chainId={loadSafe(transaction?.safeAddress)?.chainId} index={_i} />
                        </TableRow>
                    )
                })
            }
        </>
    )
}