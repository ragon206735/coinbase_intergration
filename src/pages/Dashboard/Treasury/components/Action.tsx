import { TableCell, Box, Typography } from "@mui/material";
import { find as _find, get as _get } from 'lodash';
import moment from "moment";
import React, { useMemo, useState } from "react";
import { makeStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import palette from "theme/palette";
import { toast } from "react-hot-toast";
import useGnosisSafeTransaction, { ExecuteTransaction, RejectTransaction } from "hooks/useGnosisSafeTransaction";
import { LeapFrog } from "@uiball/loaders";
import Button from "components/Button";
import Tooltip from '@mui/material/Tooltip';
import useSafe from "hooks/useSafe";
import { useWeb3Auth } from "context/web3Auth";
import SwitchChain from "components/SwitchChain";
import { beautifyHexToken } from "utils";
import { useSafeTokens } from "context/safeTokens";
import useOffChainTransaction from "hooks/useOffChainTransaction";


const useStyles = makeStyles((theme: any) => ({
    root: {

    }
  }));

export default ({ txnGroup, safeAddress, tokenAddress, transaction, txnCount, chainId, index, executableNonce,  amount, token, onPostExecution }: any) => {
    const classes = useStyles()
    const { account, chainId: currentChainId } = useWeb3Auth()
    const { loadSafe } = useSafe()
    const { confirmTransaction, rejectTransaction, executeTransaction, createSafeTransaction } = useGnosisSafeTransaction()
    const { confirmTransaction: offChainConfirmTransaction, rejectTransaction: offChainRejectTransaction, executeTransaction: offChainExecuteTransaction } = useOffChainTransaction()

    const isMultiTxn = useMemo(() => txnCount > 1, [transaction, txnCount])

    const [confirmLoading, setConfirmLoading] = useState(false)
    const [rejectLoading, setRejectLoading] = useState(false)
    const [executeTxLoading, setExecuteTxLoading] = useState(false)
    const [rejectTxLoading, setRejectTxLoading] = useState(false)

    const isSafeOwner = useMemo(() => {
        if(safeAddress && account) {
            const safe = loadSafe(safeAddress)
            return Boolean(_find(safe?.owners, (ownr:any) => ownr?.wallet?.toLowerCase() === account.toLowerCase()))
        }
        return false
    }, [safeAddress, account])

    const canPerformAction = useMemo(() => {
        return (token === 'SWEAT' || isSafeOwner)
    }, [isSafeOwner, token])

    const moveTxnToOnChain = async (reject: boolean = false) => {
        try {
            let payload = {
                safeAddress,
                chainId,
                tokenAddress,
                send: txnGroup.map((tx:any) => { return { recipient: tx?.to, amount: +tx?.formattedValue } }),
                offChainTxHash: transaction?.safeTxHash,
                reject
            }
            return createSafeTransaction(payload)
        } catch (e) {
            console.log(e) 
            return null
        }
    }

    const handleConfirmTransaction = async () => {
        try {
            console.log(transaction?.safeTxHash)
            const safe = loadSafe(safeAddress)
            if((+safe?.chainId !== +currentChainId) && token !== 'SWEAT') {
                toast.custom(t => <SwitchChain t={t} nextChainId={+safe?.chainId}/>)
            } else {
                setConfirmLoading(true)
                if(transaction?.offChain && token !== 'SWEAT') {
                   const onChainTx = await moveTxnToOnChain()
                   if(!onChainTx) throw 'Unable to move txn to onchain'
                } else {
                    try {
                        setConfirmLoading(true)
                        const payload = { safeAddress, chainId, safeTxnHash: transaction?.safeTxHash  }
                        if(transaction?.offChain && token === 'SWEAT')
                            await offChainConfirmTransaction(payload)
                        else
                            await confirmTransaction(payload)
                        setConfirmLoading(false)
                    } catch(e) {
                        console.log(e)
                        setConfirmLoading(false)
                    }
                }
            }
        } catch(e) {
            setConfirmLoading(false)
            console.log(e)
            if(typeof e === 'string')
                toast.error(e)
            else
                toast.error(_get(e, 'message', 'Something went wrong'))
        }
    }

    const handleRejectTransaction = async () => {
        try {
            const safe = loadSafe(safeAddress)
            if((+safe?.chainId !== +currentChainId) && token !== 'SWEAT') {
                toast.custom(t => <SwitchChain t={t} nextChainId={+safe?.chainId}/>)
            } else {
                try {
                    setRejectLoading(true)
                    let payload: RejectTransaction = { safeAddress, chainId, _nonce: transaction?.nonce }
                    if(transaction?.offChain && token !== 'SWEAT') {
                        const onChainTx = await moveTxnToOnChain(true)
                        if(!onChainTx) throw 'Unable to move txn to onchain'
                        payload = { ...payload, _nonce: onChainTx?.nonce, sign: onChainTx?.mySign }
                    }
                    if(transaction?.offChain && token === 'SWEAT')
                        await offChainRejectTransaction({ ...payload, safeTxnHash: transaction?.rejectionSafeTxHash })
                    else 
                        await rejectTransaction(payload)
                    setRejectLoading(false)
                } catch(e) {
                    console.log(e)
                    setRejectLoading(false)
                }
            }
        } catch(e) {
            setRejectLoading(false)
            console.log(e)
            if(typeof e === 'string')
                toast.error(e)
            else
                toast.error(_get(e, 'message', 'Something went wrong'))
        }
    }

    const handleExecuteTransaction = async (safeTxnHash: string, reject: boolean = false) => {
        const safe = loadSafe(safeAddress)
        if((+safe?.chainId !== +currentChainId) && token !== 'SWEAT') {
            toast.custom(t => <SwitchChain t={t} nextChainId={+safe?.chainId}/>)
        } else {
            try {
                setExecuteTxLoading(true)
                const payload: ExecuteTransaction = { safeTxnHash, safeAddress, chainId }
                if(transaction?.offChain)
                    await offChainExecuteTransaction(payload)
                else
                    await executeTransaction(payload)
                onPostExecution(reject)
                setExecuteTxLoading(false)
            } catch(e) {
                console.log(e)
                setExecuteTxLoading(false)
            }
        } 
    }

    if(index === 0) {
        if(transaction.executionDate) {
            return <TableCell style={{ width: 120 }} align="right">
                <Typography>{ moment.utc(transaction.executionDate).local().format('MM/DD HH:mm') }</Typography>
            </TableCell>
        } else {
            return (
                <TableCell style={{ width: 120 }} align="right">
                    { ( transaction?.canExecuteTxn || transaction?.canRejectTxn ) ?
                        <Box>
                            { 
                                transaction?.canExecuteTxn ? 
                                <Tooltip title={!transaction.offChain && (transaction.nonce !== executableNonce) ? `Transaction from safe ${beautifyHexToken(safeAddress)} with nonce ${executableNonce} needs to be executed first` : `Execute nonce ${transaction?.nonce}`} placement="top-start">
                                    <span>
                                        <Button loading={executeTxLoading} disabled={executeTxLoading || (!transaction.offChain && (transaction.nonce !== executableNonce))} onClick={() => handleExecuteTransaction(transaction?.safeTxHash)} sx={{ height: 30, padding: 0, minWidth: 120, width: 120, fontSize: 14 }} size="small" variant="contained" color="primary">Execute</Button>
                                    </span>
                                </Tooltip>
                                 : 
                                transaction?.canRejectTxn ? 
                                <Tooltip title={!transaction.offChain && (transaction.nonce !== executableNonce) ? `Transaction from safe ${beautifyHexToken(safeAddress)} with nonce ${executableNonce} needs to be executed first` : `Execute nonce ${transaction?.nonce}`} placement="top-start">
                                    <span>
                                        <Button loading={executeTxLoading}  disabled={!canPerformAction || executeTxLoading || (!transaction.offChain && (transaction.nonce !== executableNonce))}  onClick={() => handleExecuteTransaction(transaction?.rejectionSafeTxHash, true)} sx={{ height: 30, padding: 0, minWidth: 120, width: 120, fontSize: 14 }} size="small" variant="contained" color="primary">Reject</Button> 
                                    </span>
                                 </Tooltip>
                                : null
                            }
                        </Box> : 
                        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="flex-end">
                            <Button onClick={() => handleRejectTransaction()} style={{ padding: 0, minWidth: 30, maxWidth: 30, width: 30, height: 30 }} color="primary" variant="outlined" disabled={!canPerformAction || transaction?.hasMyRejection || rejectLoading} size="small">
                                { rejectLoading ? <LeapFrog size={10} color="#C94B32" /> : <CloseIcon style={{ fontSize: 16 }} /> }
                            </Button>
                            <Button onClick={() => handleConfirmTransaction()} sx={{ ml: 1 }} color="primary" variant="contained" style={{ padding: 0, minWidth: 30, maxWidth: 30, width: 30, height: 30 }} disabled={!canPerformAction || transaction?.hasMyConfirmation || confirmLoading} size="small">
                                { confirmLoading ? <LeapFrog size={10} color="#C94B32" /> : <CheckIcon style={{ fontSize: 16 }} /> }
                            </Button>
                        </Box>
                    }
                </TableCell>
            )
        }
    } else if (isMultiTxn && (index == txnCount - 1)) {
        return (
            <TableCell  align="right" sx={{ position: 'relative' }}>
                <Box style={{ height: '50%', bottom: 0, right: 16, top: 0, left: 16, position: 'absolute', borderBottom: '1px solid #76808D' }}></Box>
                <Box style={{ height: '50%', bottom: 0, right: 16, top: 0, left: 16, position: 'absolute', borderRight: '1px solid #76808D' }}></Box>
            </TableCell>
        )
    } else {
        return (
            <TableCell align="right" sx={{ position: 'relative' }}>
                <Box style={{ height: '50%', bottom: 0, right: 16, top: 0, left: 16, position: 'absolute', borderBottom: '1px solid #76808D' }}></Box>
                <Box style={{ bottom: 0, right: 16, top: 0, left: 16, position: 'absolute', borderRight: '1px solid #76808D' }}></Box>
            </TableCell>
        )
    }
}