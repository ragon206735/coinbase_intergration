import sendTokenOutline from "../../../../assets/svg/sendTokenOutline.svg";
import React, { useMemo, useState } from 'react'
import { get as _get, find as _find, orderBy as _orderBy } from 'lodash'
import { beautifyHexToken } from 'utils'
import moment from 'moment';
import useGnosisAllowance from 'hooks/useGnosisAllowance';
import axiosHttp from 'api'
import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";
import { useDAO } from "context/dao";
import useSafe from "hooks/useSafe";
import { TableCell, TableRow, Tooltip } from "@mui/material";
import Button from "components/Button";
import CreditDebit from "./CreditDebit";
import Label from "./Label";
import Recipient from "./Recipient";
import { loadRecurringPaymentsAction } from "store/actions/treasury";
const { toChecksumAddress } = require('ethereum-checksum-address')

const RecurringTxnTreasury = ({ transaction, onExecute }: any) => {
    const dispatch = useAppDispatch()
    const { DAO } = useDAO()
    const { loadSafe } = useSafe();
    const { createAllowanceTransaction } = useGnosisAllowance(transaction?.safeAddress, loadSafe(transaction?.safeAddress)?.chainId);
    const [loading, setLoading] = useState(false);


    const nextQueue = useMemo(() => {
        if(transaction && transaction.queue) {
            let queue = transaction.queue.filter((q:any) => !q.moduleTxnHash);
            queue = _orderBy(queue, q => q.nonce, 'asc')
            if(queue && queue.length > 0) return queue[0]
        }
        return null
    }, [transaction])
    
    const handleCreateAllowanceTxn = async (queue:any, transaction:any) => {
        try {
            setLoading(true);
            const response = await createAllowanceTransaction({
                tokenAddress: transaction.compensation.currency,
                to: transaction.receiver.wallet, 
                amount: transaction.compensation.amount,
                label: `${transaction.frequency} payment | ${transaction.receiver.name ? transaction.receiver.name : beautifyHexToken(transaction.receiver.wallet)} | ${moment.unix(queue.nonce).local().format('MM/DD/YYYY')}`,
                delegate: toChecksumAddress(transaction.receiver.wallet)
            })
            await axiosHttp.post(`recurring-payment/${queue._id}/complete`, { txHash: response?.transactionHash })
            .then(res =>
                setTimeout(() => {
                    const safes = DAO?.safes?.map((safe:any) => safe?.address)
                    dispatch(loadRecurringPaymentsAction({ safes }))
                    setLoading(false);
                }, 1000)
                )
        } catch (e) {
            console.log(e)
            setLoading(false);
        }
    }

    const label = useMemo(() => 
            transaction.ends && transaction.ends.key === 'NEVER' ?
            `Recurring Payment | ${_get(transaction, 'frequency', '')} | from ${ moment(transaction.startDate).local().format('MM/DD/YYYY') }` : 
            transaction.ends && transaction.ends.key === 'ON' ?
            `Recurring Payment | ${_get(transaction, 'frequency', '')} | from ${ moment(transaction.startDate).local().format('MM/DD/YYYY') } to ${ moment(transaction.ends.value).local().format('MM/DD/YYYY') }` : 
            transaction.ends && transaction.ends.key === 'AFTER' && !transaction.active ?
            `Recurring Payment | ${_get(transaction, 'frequency', '')} | ${transaction.ends.value} occurrences` :
            transaction.ends && transaction.ends.key === 'AFTER' && transaction.active && transaction.queue.filter((t:any) => t.moduleTxnHash).length > 0 ?
            `Recurring Payment | ${_get(transaction, 'frequency', '')} | ${transaction.queue.filter((t:any) => t.moduleTxnHash).length}/${transaction.ends.value} occurrences completed` :
            transaction.ends && transaction.ends.key === 'AFTER' && transaction.active && transaction.queue.filter((t:any) => t.moduleTxnHash).length == 0 ?
            `Recurring Payment | ${_get(transaction, 'frequency', '')} | ${transaction.ends.value} occurrences` :
            `Recurring Payment | ${_get(transaction, 'frequency', '')} | from ${ moment(transaction.startDate).local().format('MM/DD/YYYY') }`
    , [transaction])

    return (
    
                <TableRow>
                    <CreditDebit amount={_get(transaction, 'compensation.amount')} token={_get(transaction, 'compensation.symbol')}/>
                    <Label defaultLabel={label} />
                    <Recipient safeAddress={transaction?.safeAddress} recipient={_get(transaction, 'receiver.wallet', '')}  />
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell style={{ width: 120 }} align="right">
                        <Tooltip placement='top' title={`Recurring payment for ${moment.unix(nextQueue.nonce).local().format(`MM/DD/YYYY`)}`}>
                            <span>
                                <Button loading={loading} disabled={loading} onClick={() => handleCreateAllowanceTxn(nextQueue, transaction)} sx={{ height: 30, padding: 0, minWidth: 120, width: 120, fontSize: 14 }} size="small" variant="contained" color="primary">Execute</Button>
                            </span>
                        </Tooltip>
                    </TableCell>
                </TableRow>
    )
}

export default RecurringTxnTreasury