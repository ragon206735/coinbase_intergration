import { Box, TableCell, TableRow, Typography } from "@mui/material";
import { orderBy as _orderBy, get as _get, find as _find } from "lodash";
import moment from "moment";
import React, { useMemo, useState } from "react";
import Tooltip from '@mui/material/Tooltip';
import Avatar from "components/Avatar";
import Button from "components/Button";
import useSafe from "hooks/useSafe";
import { useWeb3Auth } from "context/web3Auth";

export default ({ transaction, onRecurringEdit }: any) => {
    const { account } = useWeb3Auth()
    const [showEdit, setShowEdit] = useState(false)

    const { loadSafe } = useSafe()

    const isOwner = useMemo(() => {
        if(transaction?.safeAddress) {
            const safe = loadSafe(transaction?.safeAddress)
            return Boolean(_find(safe?.owners, (o:any) => o?.wallet?.toLowerCase() === account.toLowerCase()))
        }
        return false
    }, [account, transaction?.safeAddress])

    const nextQueue = useMemo(() => {
        if(transaction && transaction.queue) {
            let queue = transaction.queue.filter((q: any) => !q.moduleTxnHash);
            queue = _orderBy(queue, q => q.nonce, 'asc')
            if(queue && queue.length > 0) return queue[0]
        }
        return null
    }, [transaction])

    const renderNextSection = (nextQueue: any, transaction: any) => {
        if(nextQueue && nextQueue.nonce > moment().utc().endOf('day').unix())
            return (
                <Tooltip placement='top-start' title={`Payment for ${moment.unix(nextQueue.nonce).local().format(`MM/DD/YYYY`)}`}>
                        <Typography className="text">Next: { `${ moment.unix(nextQueue.nonce).local().format('MM/DD/YYYY') }` }</Typography> 
                        {/* { account !== toChecksumAddress(transaction.receiver.wallet) ?
                        <div className="text">Next: { `${ moment.unix(nextQueue.nonce).local().format('MM/DD/YYYY') }` }</div> 
                        :
                        <SimpleLoadButton onClick={() => handleCreateAllowanceTxn(nextQueue, transaction)} condition={loading} width={"100%"}  height={30} title="EXECUTE" bgColor={loading ? 'grey': "#C94B32"} className="button" /> } */}
                </Tooltip>
        )
        else if(nextQueue)
            return <Typography className="text">Next: { `${ moment.unix(nextQueue.nonce).local().format('MM/DD/YYYY') }` }</Typography>
        else
            return <Typography className="text">Payment ended</Typography>   
    }

    return (
    <TableRow sx={{ my: 1 }} className='recurringtxn-row' key={_get(transaction, '_id', '')} onMouseEnter={() => setShowEdit(true)} onMouseLeave={() => setShowEdit(false)} >
        <TableCell style={{width:'200px',height:'70px'}}>
            <Typography>
                {/* <img className="img" src={Bigmember} alt="" />
                <div className="name">
                    { _get(transaction, 'receiver.name', '') === '' ? beautifyHexToken(_get(transaction, 'receiver.wallet', '')) :  _get(transaction, 'receiver.name', '')}
                </div> */}
                <Avatar name={_get(transaction, 'receiver.name', '')} wallet={_get(transaction, 'receiver.wallet', '')} />
            </Typography>
        </TableCell>
        <TableCell style={{width:'125px',height:'70px'}}>
            <div className="frequency">
                <Typography className="text">
                    { _get(transaction, 'frequency', '') }
                </Typography>
            </div>
        </TableCell>
        <TableCell style={{width:'175px',height:'70px'}}>
            <div className="info" >
                <Typography className="text">{
                    transaction.ends && transaction.ends.key === 'NEVER' ?
                    `from ${ moment(transaction.startDate).local().format('MM/DD/YYYY') }` : 
                    transaction.ends && transaction.ends.key === 'ON' ?
                    `from ${ moment(transaction.startDate).local().format('MM/DD/YYYY') } to ${ moment(transaction.ends.value).local().format('MM/DD/YYYY') }` : 
                    transaction.ends && transaction.ends.key === 'AFTER' && !transaction.active ?
                    `${transaction.ends.value} occurances` :
                    transaction.ends && transaction.ends.key === 'AFTER' && transaction.active && transaction.queue.filter((t:any) => t.moduleTxnHash).length > 0 ?
                    `${transaction.queue.filter((t:any) => t.moduleTxnHash).length}/${transaction.ends.value} occurances completed` :
                    transaction.ends && transaction.ends.key === 'AFTER' && transaction.active && transaction.queue.filter((t:any) => t.moduleTxnHash).length == 0 ?
                    `${transaction.ends.value} occurances` :
                    `from ${ moment(transaction.startDate).local().format('MM/DD/YYYY') }`
                }</Typography>
            </div>
        </TableCell>
        <TableCell style={{width:'175px',height:'70px'}}>
            <div className="compensation">
                <Typography className="text">To pay <span>{ `${ _get(transaction, 'compensation.amount') } ${ _get(transaction, 'compensation.symbol') }` }</span></Typography>
            </div>
        </TableCell>
        <TableCell className='recurringtxn-row-item'>
            <div className="status">
                {
                    transaction.active ? renderNextSection(nextQueue, transaction) :
                    <Typography className="text">Waiting for approval</Typography>
                }
            </div>
        </TableCell>
        <TableCell style={{ minWidth: 300 }} className='recurringtxn-row-item'>
        { isOwner &&
            <div className="edit">
                    { showEdit && transaction.active && nextQueue &&
                    <Button onClick={() => onRecurringEdit(transaction)} variant="contained" color="secondary" sx={{ height: 34, fontSize: 14 }} size="small">EDIT</Button> }
            </div>
        }
        </TableCell>
    </TableRow>
    )
}