import React, { useEffect, useMemo, useState } from "react";
import { get as _get, find as _find } from 'lodash'
import { Drawer, Box, Typography, Select, FormControl, InputLabel, MenuItem, List, ListItem, ListItemText, ListItemButton, ListItemIcon, Divider, TableContainer, TableBody, Table, TableRow, TableCell, FormLabel } from "@mui/material"
import theme from "theme";
import IconButton from "components/IconButton";
import RecurringPaymentSvg from 'assets/svg/recurring_payment_XL.svg'
import CloseSVG from 'assets/svg/close-btn.svg'
import { makeStyles } from "@mui/styles";
import palette from "theme/palette";
import TextInput from "components/TextInput";
import axiosHttp from 'api'
import { useDAO } from "context/dao";
import { toast } from "react-hot-toast";
import { useWeb3Auth } from "context/web3Auth";
import Avatar from "components/Avatar";
import CurrencyInput from "components/CurrencyInput";
import { useSafeTokens } from "context/safeTokens";
import { beautifyHexToken } from "utils";
import moment from "moment";
import Checkbox from "components/Checkbox";
import SwitchChain from "components/SwitchChain";
import AmountInput from "components/AmountInput";
import Button from "components/Button";
import useGnosisAllowance from "hooks/useGnosisAllowance";
import useSafe from "hooks/useSafe";
import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";
import { createRecurringPaymentAction, loadRecurringPaymentsAction } from "store/actions/treasury";

const FREQUENCY = [{ label: "Weekly", value: "weekly" }, { label: "Monthly", value: "monthly" }]

const format = (val:any) => (val || '0') + ` occurrences`
const parse = (val:any) => (val || '0').replace(/^\occurrences/, '')

const useStyles = makeStyles((theme: any) => ({
    root: {
        width: '575px', 
        position: 'relative', 
        flex: 1, 
        padding: '32px 72px 80px 72px', 
        borderRadius: '20px 0px 0px 20px'
    },
  }));

export default ({ open, onClose, transaction }: any) => {
    const dispatch = useAppDispatch();
    const { createRecurringPaymentsLoading } = useAppSelector((store:any) => store?.treasury)
    const [createLoading, setCreateLoading] = useState(false)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [stopLoading, setStopLoading] = useState(false)
    const { adminSafes } = useSafe()
    const classes = useStyles()
    const { DAO } = useDAO();
    const { account, chainId: currentChainId } = useWeb3Auth()
    const { safeTokens, getToken } = useSafeTokens()
    const [state, setState] = useState<any>({
        frequency: 'weekly',
        ends: { value: "NEVER" }
    })
    const { loadSafe } = useSafe()
    const { setAllowance, getSpendingAllowance } = useGnosisAllowance(state?.safeAddress, loadSafe(state?.safeAddress)?.chainId);
    const [errors, setErrors] = useState<any>({})

    useEffect(() => {
        if(createRecurringPaymentsLoading === false){
            setCreateLoading(false)
            onClose()
        }
    }, [createRecurringPaymentsLoading])

    const ReceiversList = useMemo(() => {
        return DAO?.members?.map((member:any) => member.member)
    }, [DAO?.url])

    const eligibleSafes = useMemo(() => {
        return DAO?.safes?.map((safe:any) => {
            const isOwner = Boolean(_find(safe?.owners, (o:any) => o?.wallet.toLowerCase() === account.toLowerCase()))
            return {
                ...safe,
                isOwner
            }
        })
    }, [DAO?.url])

    useEffect(() => {
        if(transaction) {
            if (DAO?.url && safeTokens && ReceiversList) {
                //console.log("transaction, 'receiver._id', null),", transaction)
                    setState((prev:any) => {
                        return {
                            ...prev,
                            receiver: _get(transaction, 'receiver._id', null),
                            safeAddress: _get(transaction, 'safeAddress', null),
                            amount: _get(transaction, 'compensation.amount', null),
                            tokenAddress: _get(transaction, 'compensation.currency', null),
                            frequency: _get(transaction, 'frequency', null),
                            startDate: moment(_get(transaction, 'startDate', null)).format('YYYY-MM-DD'),
                            ends: {
                                value: _get(transaction, 'ends.key', null),
                                endOn: _get(transaction, 'ends.key', '') === 'ON' ? _get(transaction, 'ends.value', null) : undefined,
                                occurances: _get(transaction, 'ends.key', '') === 'AFTER' ? parse(_get(transaction, 'ends.value', null)) : undefined,
                            }
                        }
                    })
            }
        } else {
            setState((prev:any) => {
                const safe = _get(adminSafes, '[0].address')
                return {
                    safeAddress: safe ? _get(adminSafes, '[0].address') : null,
                    tokenAddress: safe ? _get(_get(safeTokens, safe?.address, []), '[0].tokenAddress', null) : null,
                    frequency: 'weekly',
                    ends: { value: "NEVER" }
                }
            })
        }
    }, [DAO?.url, transaction, safeTokens, ReceiversList, open, adminSafes])

    useEffect(() => {
        console.log("transaction, 'receiver._id', null),", state)
    }, [state])

    const handleCreateRecurringPayment = async () => {
        const safe = loadSafe(state?.safeAddress);
        if(currentChainId !== safe?.chainId)
            toast.custom(t => <SwitchChain t={t} nextChainId={safe?.chainId}/>)
        else {
            try {
                console.log(state?.ends)
                setErrors({})
                let err: any = {}
                if (!state?.receiver)
                    err.receiver = 'Please select valid receiver'
                if (!state?.startDate)
                    err.startDate = 'Please select valid startdate'
                if (!state?.ends || (state?.ends && state?.ends.value !== "NEVER" && (( state?.ends?.value === "AFTER" && (!state?.ends?.occurances || state?.ends?.occurances === "" || state?.ends?.occurances === "0")) || (state?.ends.value === "ON" && !state?.ends?.endOn) )))
                    err['ends'] = 'Please select valid end'
                if(!state?.safeAddress)
                    err.safeAddress = 'Please select valid safeAddress'
                if(!state?.amount || +state?.amount == 0 || !state?.tokenAddress)
                    err.safeAddress = 'Please select valid compensation'
                if (Object.keys(err).length > 0) {
                    console.log("err", err)
                    setErrors(err)
                    return;
                }
                setCreateLoading(true)
                const token = getToken(state?.tokenAddress, state?.safeAddress)
                let m = _find(ReceiversList, (m) => m._id === state?.receiver)
                const currentAllowance = await getSpendingAllowance({ delegate: m?.wallet, token: state?.tokenAddress });
                console.log("currentAllowance", currentAllowance)
                let amount = _get(state, 'amount');
                let resetMins = +moment.duration(moment().startOf('day').add(30, 'days').diff(moment().startOf('day'))).asMinutes()
                let resetBaseMins = Math.floor((moment().unix() / 60))
                if (state?.frequency === 'weekly')
                    amount = (amount * 4)

                if (currentAllowance && currentAllowance?.amount > 0) {
                    amount = amount + currentAllowance?.amount
                    resetMins = currentAllowance.resetTimeMin
                    resetBaseMins = currentAllowance.lastResetMin
                }
                const memberName = m.name && m.name !== "" ? m.name : beautifyHexToken(m.wallet)
                const txnHash = await setAllowance({
                    allowance: [{ token: state?.tokenAddress, amount: `${BigInt(parseFloat(amount) * 10 ** _get(token, 'token.decimal', 18))}`, resetMins: `${resetMins}`, resetBaseMins: `${resetBaseMins}` }],
                    label: `Approval for ${state?.frequency} payment | ${memberName} | ${_get(state, 'amount')} ${_get(token, 'token.symbol')}`,
                    actualAmount: state?.amount,
                    delegate: _get(m, 'wallet', null),
                })
                const payload = {
                    daoId: _get(DAO, '_id', null),
                    safeAddress: state?.safeAddress,
                    receiver: state?.receiver,
                    delegate: state?.receiver,
                    compensation: {
                        safeAddress: state?.safeAddress,
                        symbol: token?.token?.symbol,
                        currency: state?.tokenAddress,
                        amount: state?.amount
                    },
                    frequency: state?.frequency,
                    startDate: moment(state?.startDate, 'YYYY-MM-DD').startOf('day').utc().toDate(),
                    ends: {
                        key: state?.ends?.value,
                        value: state?.ends?.value === "ON" ? state?.ends?.endOn : state?.ends?.value === "AFTER" ? state?.ends?.occurances : null
                    },
                    allowanceTxnHash: txnHash?.safeTxHash,
                }
                dispatch(createRecurringPaymentAction(payload))
            } catch (e) {
                setCreateLoading(false)
                console.log(e)
            }
        }
    }

    const handleUpdateRecurringPayment = async () => {
        const safe = loadSafe(state?.safeAddress);
        if(currentChainId !== safe?.chainId)
            toast.custom(t => <SwitchChain t={t} nextChainId={safe?.chainId}/>)
        else {
            try {
                console.log(state?.ends)
                setErrors({})
                let err: any = {}
                if (!state?.receiver)
                    err.receiver = 'Please select valid receiver'
                if (!state?.startDate)
                    err.startDate = 'Please select valid startdate'
                if (!state?.ends || (state?.ends && state?.ends.value !== "NEVER" && (( state?.ends?.value === "AFTER" && (!state?.ends?.occurances || state?.ends?.occurances === "" || state?.ends?.occurances === "0")) || (state?.ends.value === "ON" && !state?.ends?.endOn) )))
                    err['ends'] = 'Please select valid end'
                if(!state?.safeAddress)
                    err.safeAddress = 'Please select valid safeAddress'
                if(!state?.amount || +state?.amount == 0 || !state?.tokenAddress)
                    err.safeAddress = 'Please select valid compensation'
                if (Object.keys(err).length > 0) {
                    console.log("err", err)
                    setErrors(err)
                    return;
                }
                setUpdateLoading(true)
                const token = getToken(state?.tokenAddress, state?.safeAddress)
                let m = _find(ReceiversList, (m) => m._id === state?.receiver)
                
                const isReceiverChanged = _get(transaction, 'receiver._id', '') !== state?.receiver
                const isTokenChanged = _get(transaction, 'compensation.currency') !== _get(state, 'tokenAddress')
                const isAmountChanged = _get(transaction, 'compensation.amount') !== _get(state, 'amount')
                const isFrequencyChanged = _get(transaction, 'frequency') !== state?.frequency
                const isStartDateChanged = !(moment(_get(transaction, 'startDate')).startOf('day').isSame(moment(state?.startDate, 'YYYY-MM-DD').startOf('day')))
                const isEndChanged = (_get(transaction, 'ends.key') !== state?.ends?.value || (_get(transaction, 'ends.value') !== state?.ends?.endOn) || (_get(transaction, 'ends.value') !== state?.ends?.occurances))
    
                console.log(
                    "isReceiverChanged::", isReceiverChanged, "\n",
                    "isTokenChanged::", isTokenChanged, "\n",
                    "isAmountChanged::", isAmountChanged, "\n",
                    "isFrequencyChanged::", isFrequencyChanged, "\n",
                    "isStartDateChanged::", isStartDateChanged, "\n",
                    "isEndChanged::", isEndChanged, "\n",
                )
    
                let payload = {
                    daoId: _get(DAO, '_id', null),
                    safeAddress: state?.safeAddress,
                    receiver: state?.receiver,
                    delegate: state?.receiver,
                    compensation: {
                        safeAddress: state?.safeAddress,
                        symbol: token?.token?.symbol,
                        currency: state?.tokenAddress,
                        amount: state?.amount
                    },
                    frequency: state?.frequency,
                    startDate: moment(state?.startDate, 'YYYY-MM-DD').startOf('day').utc().toDate(),
                    ends: {
                        key: state?.ends?.value,
                        value: state?.ends?.value === "ON" ? state?.ends?.endOn : state?.ends?.value === "AFTER" ? state?.ends?.occurances : null
                    },
                    allowanceTxnHash: transaction.allowanceTxnHash,
                }
    
                if (isTokenChanged) {
                    const oldAllowance = await getSpendingAllowance({ delegate: _get(m, 'wallet', null), token: transaction?.compensation?.currency });
                    // Reset old allowance
                    const resetAllowanceAmount = _get(oldAllowance, 'amount', 0) - (_get(transaction, 'compensation.amount', 0) * (transaction.frequency === 'weekly' ? 4 : 1))
    
                    const currentAllowance = await getSpendingAllowance({ delegate: _get(m, 'wallet', null), token: state?.tokenAddress});
                    // New Allowance for new Token
                    let amount = _get(state, 'amount');
                    let resetMins = +moment.duration(moment().startOf('day').add(30, 'days').diff(moment().startOf('day'))).asMinutes()
                    let resetBaseMins = Math.floor((moment().unix() / 60))
                    if (state?.frequency === 'weekly')
                        amount = (amount * 4)
    
                    if (currentAllowance && currentAllowance?.amount > 0) {
                        amount = amount + currentAllowance?.amount
                        resetMins = currentAllowance.resetTimeMin
                        resetBaseMins = currentAllowance.lastResetMin
                    }
    
                    const memberName = transaction?.receiver?.name && transaction?.receiver?.name !== "" ? transaction?.receiver?.name : beautifyHexToken(transaction?.receiver?.wallet)
                    const txnHash = await setAllowance({
                        allowance: [
                            { token: transaction?.compensation?.currency, amount: `${BigInt(parseFloat(`${resetAllowanceAmount}`) * 10 ** _get(token, 'token.decimal', 18))}`, resetMins: `${oldAllowance?.resetTimeMin}`, resetBaseMins: `${oldAllowance?.lastResetMin}` },
                            { token: state?.tokenAddress, amount: `${BigInt(parseFloat(amount) * 10 ** _get(token, 'token.decimal', 18))}`, resetMins: `${resetMins}`, resetBaseMins: `${resetBaseMins}` }
                        ],
                        actualAmount: _get(state, 'amount'),
                        label: `Allowance reset for ${state?.frequency} payment | ${memberName} | ${_get(state, 'amount')} ${_get(token, 'token.symbol')}`,
                        delegate: transaction?.receiver?.wallet
                    })
                    payload.allowanceTxnHash = txnHash?.safeTxHash
                } else if (isAmountChanged) {
                    const currentAllowance = await getSpendingAllowance({ delegate: account, token: transaction?.compensation?.currency });
                    // New Allowance for new Token
                    let amount = -(transaction.compensation.amount - _get(state, 'amount'));
                    let resetMins = +moment.duration(moment().startOf('day').add(30, 'days').diff(moment().startOf('day'))).asMinutes()
                    let resetBaseMins = Math.floor((moment().unix() / 60))
                    if (state?.frequency === 'weekly')
                        amount = (amount * 4)
    
                    if (currentAllowance && currentAllowance?.amount > 0) {
                        amount = currentAllowance?.amount + amount
                        resetMins = currentAllowance.resetTimeMin
                        resetBaseMins = currentAllowance.lastResetMin
                    }
                    const memberName = transaction?.receiver?.name && transaction?.receiver?.name !== "" ? transaction?.receiver?.name : beautifyHexToken(transaction?.receiver?.wallet)
                    const txnHash = await setAllowance({
                        allowance: [
                            { token: state?.tokenAddress, amount: `${BigInt(parseFloat(`${amount}`) * 10 ** _get(token, 'token.decimal', 18))}`, resetMins: `${resetMins}`, resetBaseMins: `${resetBaseMins}` }
                        ],
                        actualAmount: _get(state, 'amount'),
                        label: `Allowance update for ${state?.frequency} payment | ${memberName} | ${_get(state, 'amount')} ${_get(token, 'token.symbol', '')}`,
                        delegate: transaction?.receiver?.wallet
                    })
                    payload.allowanceTxnHash = txnHash?.safeTxHash
    
                }

    
                await axiosHttp.patch(`recurring-payment/${transaction._id}`, payload)
                setTimeout(() => {
                    setUpdateLoading(false)
                    const safes = DAO?.safes?.map((safe:any) => safe?.address)
                    dispatch(loadRecurringPaymentsAction({ safes }))
                    onClose()
                }, 100)
            } catch (e) {
                setUpdateLoading(false)
                console.log(e)
            }
        }
    }

    const handleDeleteRecurringPayment = async () => {
        const safe = loadSafe(state?.safeAddress);
        if(currentChainId !== safe?.chainId)
            toast.custom(t => <SwitchChain t={t} nextChainId={safe?.chainId}/>)
        else {
            try {
                setStopLoading(true)
                const token = getToken(state?.tokenAddress, state?.safeAddress)
                let m = _find(ReceiversList, (m) => m._id === state?.receiver)
    
                const currentAllowance = await getSpendingAllowance({ delegate: _get(m , 'wallet'), token: transaction?.compensation?.currency });
                // New Allowance for new Token
                let amount = transaction.compensation.amount;
                let resetMins = +moment.duration(moment().startOf('day').add(30, 'days').diff(moment().startOf('day'))).asMinutes()
                let resetBaseMins = Math.floor((moment().unix() / 60))
                if (state?.frequency === 'weekly')
                    amount = (amount * 4)
        
                if (currentAllowance && currentAllowance?.amount > 0) {
                    amount = currentAllowance?.amount - amount
                    resetMins = currentAllowance.resetTimeMin
                    resetBaseMins = currentAllowance.lastResetMin
                }
    
                if(amount < 0)
                    amount = 0
    
                const memberName = transaction?.receiver?.name && transaction?.receiver?.name !== "" ? transaction?.receiver?.name : beautifyHexToken(transaction?.receiver?.wallet)
                const txnHash = await setAllowance({
                    allowance: [
                        { token: state?.tokenAddress, amount: `${BigInt(parseFloat(`${amount}`) * 10 ** _get(token, 'token.decimal', 18))}`, resetMins: `${resetMins}`, resetBaseMins: `${resetBaseMins}` }
                    ],
                    actualAmount: transaction.compensation.amount,
                    label: `Stopping ${state?.frequency} payment | ${memberName} | ${transaction.compensation.amount} ${_get(token, 'token.symbol', 18)}`,
                    delegate: transaction?.receiver?.wallet,
                    stop: true
                })
                await axiosHttp.delete(`recurring-payment/${transaction._id}`)
                .then(res => {
                    setTimeout(() => {
                        const safes = DAO?.safes?.map((safe:any) => safe?.address)
                        dispatch(loadRecurringPaymentsAction({ safes }))
                        onClose()
                        setStopLoading(false)
                    }, 200)
                })
            } catch (e) {
                setStopLoading(false)
                console.log(e)
            }
        }
    }


    return (
        <Drawer
            PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
            sx={{ zIndex: theme.zIndex.drawer + 2 }}
            anchor={'right'}
            open={open}
            onClose={() => onClose()}>
        <Box className={classes.root}>
            <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={onClose}>
                <img src={CloseSVG} />
            </IconButton>
            <Box display="flex" flexDirection="column" mt={6} mb={3} alignItems="center">
                <img src={RecurringPaymentSvg} />
                <Typography my={4} style={{ color: palette.primary.main, fontSize: '30px', fontWeight: 400 }}>Recurring Payment</Typography>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="center">
                <Box width={380}>
                    <Box my={2}>
                        <TextInput disabled={transaction} displayEmpty error={errors?.receiver} helperText={errors?.receiver} defaultValue={state?.receiver} value={state?.receiver} onChange={(e:any) => setState((prev:any) => { return { ...prev, receiver: e.target.value } })} label="Receiver" size="medium" select fullWidth>
                            {
                                ReceiversList?.map((_o:any) => {
                                    return (
                                        <MenuItem key={_o._id} value={_o._id}>
                                            <Avatar name={_o?.name} wallet={_o?.wallet} />
                                        </MenuItem>
                                    )
                                })
                            }
                        </TextInput>
                    </Box>
                    <Box my={2}>
                        <TextInput
                            id="outlined-select-currency"
                            select
                            displayEmpty
                            disabled={transaction || eligibleSafes.length < 2}
                            error={errors?.safeAddress} helperText={errors?.safeAddress}
                            fullWidth
                            label="Treasury"
                            defaultValue={state?.safeAddress}
                            value={state?.safeAddress}
                            onChange={(e: any) => {
                                setState((prev:any) => { return {
                                    ...prev,
                                    safeAddress: e.target.value,
                                    tokenAddress: state?.tokenAddress ? state?.tokenAddress : transaction ? _get(transaction, 'compensation.currency') ? _get(transaction, 'compensation.currency') : _get(_get(safeTokens, e.target.value, []), '[0].tokenAddress', 'SWEAT') : _get(_get(safeTokens, e.target.value, []), '[0].tokenAddress', 'SWEAT')
                                } })
                            }}
                        >
                            {
                               eligibleSafes?.map((safe: any) => {
                                    return (
                                        <MenuItem disabled={!safe?.isOwner} key={safe?.address} value={safe?.address}>{(safe?.name || "Multi-sig wallet") + " (" + beautifyHexToken(safe?.address) + ")"}</MenuItem>
                                    )
                                })
                            }
                        </TextInput>
                    </Box>
                    <Box my={2} id="error-currency-amt">
                        <Typography sx={{ marginBottom: 2, color: '#76808D', fontWeight: '700', fontSize: '16px' }}>Compensation</Typography>
                        <CurrencyInput
                            value={state?.amount}
                            onChange={(e:any) => setState((prev:any) => { return { ...prev, amount: e } })}
                            options={_get(safeTokens, state?.safeAddress, []).map((token: any) => { return { label: token?.token?.symbol, value: token?.tokenAddress } })}
                            dropDownvalue={state?.tokenAddress}
                            onDropDownChange={(value: any) => {
                                setState((prev:any) => { return { ...prev, tokenAddress: value } })
                            }}
                            variant="primary"
                        />
                    </Box>   
                    <Box my={2}>
                        <TextInput
                            id="outlined-select-currency"
                            select
                            fullWidth
                            error={errors?.frequency} helperText={errors?.frequency}
                            label="Frequency"
                            value={state?.frequency}
                            onChange={(e: any) => {
                                setState((prev:any) => { return {
                                    ...prev,
                                    frequency: e.target.value,
                                } })
                            }}
                        >
                            {
                                FREQUENCY?.map((frequency: any) => {
                                    return (
                                        <MenuItem key={frequency?.value} value={frequency?.value}>{frequency?.label}</MenuItem>
                                    )
                                })
                            }
                        </TextInput>
                    </Box>
                    <Box my={2}>
                        <TextInput
                            date
                            fullWidth
                            disabled={transaction}
                            error={errors?.startDate} helperText={errors?.startDate}
                            label="Start Date"
                            value={state?.startDate ? moment(state?.startDate, 'YYYY-MM-DD') : undefined}
                            onChange={(e: any) => {
                                setState((prev:any) => { return {
                                    ...prev,
                                    startDate: moment(e).format('YYYY-MM-DD'),
                                } })
                            }}
                        >
                        </TextInput>
                    </Box>    
                    <Box py={2}>
                        <FormLabel style={{ marginBottom: "10px" }} component="legend">Ends</FormLabel>
                        <Box display="flex" flexDirection="row" alignItems="center" sx={{ my: 2 }}>
                            <Box>
                                <Checkbox onChange={() => setState((prev:any) => { return {
                                    ...prev,
                                    ends: { ...prev?.ends, value: "NEVER", occurances: undefined, endOn: undefined }
                                } })} checked={state?.ends?.value === 'NEVER'} />
                            </Box>
                            <Box>
                                <Typography>When it is cancelled</Typography>
                            </Box>
                        </Box>
                        <Box display="flex" flexDirection="row" alignItems="center" sx={{ my: 2 }} justifyContent="space-between">
                            <Box display="flex" flexDirection="row" alignItems="center">
                                <Checkbox onChange={() => setState((prev:any) => { return {
                                                    ...prev,
                                                    ends: { ...prev?.ends, value: "ON", occurances: undefined, endOn: undefined  }
                                                } })} checked={state?.ends?.value === 'ON'} />
                                                <Typography>On</Typography>
                            </Box>
                            <Box width={200}>
                                <TextInput
                                    date
                                    size="small"
                                    fullWidth
                                    disabled={state?.ends?.value !== 'ON'}
                                    defaultValue={state?.ends?.endOn ? moment(state?.ends?.endOn, 'YYYY-MM-DD') : undefined}
                                    value={state?.ends?.endOn ? moment(state?.ends?.endOn, 'YYYY-MM-DD') : undefined}
                                    onChange={(e: any) => {
                                        setState((prev:any) => { return {
                                            ...prev,
                                            ends: { ...prev?.ends, endOn: moment(e).format('YYYY-MM-DD') },
                                        } })
                                    }}
                                />
                            </Box>
                        </Box>
                        <Box display="flex" flexDirection="row" alignItems="center" sx={{ my: 2 }} justifyContent="space-between">
                            <Box display="flex" flexDirection="row" alignItems="center">
                                <Checkbox onChange={() => setState((prev:any) => { return {
                                    ...prev,
                                    ends: { ...prev?.ends, value: "AFTER", occurances: undefined, endOn: undefined  }
                                } })} checked={state?.ends?.value === 'AFTER'} />
                                <Typography>After</Typography>
                            </Box>
                            <Box width={200}>
                                <AmountInput disabled={state?.ends?.value !== 'AFTER'} height={50} width={150} 
                                                onChange={(e:any) => setState((prev:any) => { return {
                                                    ...prev,
                                                    ends: { ...prev?.ends, occurances: parse(e) }
                                                } })}
                                                value={format(state?.ends?.occurances)}
                                />
                            </Box>
                        </Box>
                    </Box> 
                        { transaction && 
                            <Box sx={{ pb: 3, mt: 5 }}>
                                <Box display="flex" flexDirection="column" alignItems="center">
                                    <Button loading={stopLoading} disabled={updateLoading || stopLoading} onClick={() => handleDeleteRecurringPayment()} fullWidth color="primary" size="small" variant="contained">STOP PAYMENTS</Button>
                                    <span style={{ marginTop: 16, color: 'hsla(214,9%,51%,.5)', fontSize: 14, fontWeight: 400 }} className='info'>All next payments will be cancelled.</span>
                                </Box>
                            </Box> 
                        }
                    </Box>
            </Box>
            <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px' , padding: "30px 0 20px" }}>
                    <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                        <Button onClick={() => onClose()} sx={{ mr:1 }} fullWidth variant='outlined' size="small">Cancel</Button>
                        { !transaction ? <Button loading={createLoading || createRecurringPaymentsLoading} onClick={() => handleCreateRecurringPayment()}
                        disabled={!state?.safeAddress || createLoading}
                        sx={{ ml:1 }}  fullWidth variant='contained' size="small">Create</Button> : 
                        <Button onClick={() => handleUpdateRecurringPayment()}
                        loading={updateLoading}
                        disabled={!state?.safeAddress || updateLoading || stopLoading}
                        sx={{ ml:1 }}  fullWidth variant='contained' size="small">Save</Button> }
                    </Box>
            </Box>
        </Box>
    </Drawer>
    )
}
