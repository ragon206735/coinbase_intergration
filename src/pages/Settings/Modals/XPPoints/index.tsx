import { Box, Dialog, DialogActions, DialogContent, MenuItem, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@mui/material";
import { get as _get, find as _find } from 'lodash'
import IconButton from "components/IconButton";
import { makeStyles } from '@mui/styles';
import XPPointsSvg from 'assets/images/settings-page/5-xp-points-color.svg'
import StarSvg from 'assets/svg/star.svg'
import CompensateMemberSvg from 'assets/images/settings-page/8-compensate-member.svg'
import XPPointsIconSvg from 'assets/images/settings-page/5-xp-points.svg'
import CloseSVG from 'assets/svg/close-new.svg'
import React, { useEffect, useMemo, useState } from "react";
import Button from "components/Button";
import Switch from "components/Switch";
import { useDAO } from "context/dao";
import TextInput from "components/TextInput";
import { beautifyHexToken } from "utils";
import CurrencyInput from "components/CurrencyInput";
import { useSafeTokens } from "context/safeTokens";
import Avatar from "components/Avatar";
import CreatableSelectTag from "components/CreatableSelectTag";
import { CHAIN_INFO } from "constants/chainInfo";
import useSafe from "hooks/useSafe";
import useGnosisSafeTransaction from "hooks/useGnosisSafeTransaction";
import { toast } from "react-hot-toast";
import SwitchChain from "components/SwitchChain";
import { useWeb3Auth } from "context/web3Auth";


const useStyles = makeStyles((theme: any) => ({
    headerTitle: {
        fontFamily: 'Inter, sans-serif',
        fontStyle: 'normal',
        fontWeight: '400 !important',
        fontSize: '28px !important',
        lineHeight: '38px',
        color:'#C94B32'
    },
    headerDescription: {
        fontFamily: 'Inter, sans-serif',
        fontStyle: 'normal',
        textAlign: 'center',
        fontWeight: '400 !important',
        fontSize: '14px !important',
        lineHeight: '19px !important',
        color: '#76808d',
        "& span": {
            fontWeight: '600 !important', 
        }
    },
  }));


const XPPoints = ({ open, onClose }: any) => {
    const classes = useStyles()
    const { chainId } = useWeb3Auth()
    const [activeTab, setActiveTab] = useState<number>(1)
    const [txnLoading, setTxnLoading] = useState<boolean>(false)
    const { DAO, updateDAO } = useDAO()
    const { loadSafe, adminSafes } = useSafe()
    const { safeTokens } = useSafeTokens()
    const { createSafeTransaction } = useGnosisSafeTransaction()
    const [enabled, setEnabled] = useState(false);
    const [showDisableAlert, setShowDisableAlert] = useState(false);
    const [networkError, setNetworkError] = useState<string | null>(null)
    const [state, setState] = useState<any>({
        sweatValue: 0
    })
    
    useEffect(() => {
        updateDAO({ url: DAO?.url, payload: { sweatPoints: enabled } })
    }, [enabled])

    const safe = useMemo(() => {
        return loadSafe(state?.safeAddress)
    }, [state?.safeAddress])

    useEffect(() => {
        if(DAO?.url) {
            setEnabled(DAO?.sweatPoints)
        }
    }, [DAO?.url])
    
    useEffect(() => {
        if(DAO?.safes && DAO?.safes?.length > 0) {
            setState((prev:any) => { return { ...prev, safeAddress: DAO?.safes[0].address } })
        }
    }, [DAO?.safes])

    useEffect(() => {
        if(state?.safeAddress) {
            setState((prev:any) => { return { ...prev, currency: _get(_get(safeTokens, state?.safeAddress, ''), '[0].tokenAddress', null) } })
        }
    }, [state?.safeAddress])

    const handleCreateTransaction = async () => {
        if(+safe?.chainId !== +chainId) {
            toast.custom(t => <SwitchChain t={t} nextChainId={+safe?.chainId}/>)
        } else {
            const send = sweatMembers?.map((member:any) => { return { recipient: member?.member?.wallet, amount: member?.amount, label: "Sweat conversion", tag: state?.tag, sweatConversion: true } })
            try {
                setTxnLoading(true)
                await createSafeTransaction({
                    safeAddress: state?.safeAddress,
                    chainId: safe?.chainId,
                    tokenAddress: state?.currency,
                    send
                })
                setTxnLoading(false)
                onClose()
            } catch (e) {
                setTxnLoading(false)
                console.log(e)
                if(typeof e === 'string'){
                    setNetworkError(e)
                } else {
                    setNetworkError(_get(e, 'message', 'Unable to create transaction. Please Try again'))
                }
                setTimeout(() => setNetworkError(null), 3000)
            }
        }
    }

    const sweatMembers = useMemo(() => {
        if(DAO) {
          let members = _get(DAO, 'members', []).filter((m:any) => _find(_get(m, 'member.earnings'), e => e.currency === 'SWEAT' && e.daoId === _get(DAO, '_id', '') && e.value > 0))
          members = members.map((m:any) => {
            const sweat = _find(_get(m, 'member.earnings', []), e => e.currency === 'SWEAT' && e.daoId === _get(DAO, '_id', ''))
            return {
              ...m, amount: _get(sweat, 'value', 0) * (+state?.sweatValue)
            }
          })
          return members
        }
        return []
      }, [DAO.url, state?.sweatValue])

    

    const total = useMemo(() => {
        let t = 0;
        for (let index = 0; index < sweatMembers.length; index++) {
          const m = sweatMembers[index];
          const sweat = _find(_get(m, 'member.earnings', []), e => e.currency === 'SWEAT' && e.daoId === _get(DAO, '_id', ''))
          t = t + (_get(sweat, 'value', 0) * (+state?.sweatValue))
        }
        return t;
      }, [sweatMembers, state?.sweatValue])

    const Tab1 = () => {
        return (
            <Box sx={{ mt: 6 }}>
                <Box sx={{ mt: 0, mb: 6 }} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                        <img style={{ marginBottom: 6, width: 50, height: 50 }} src={XPPointsSvg} />
                        <Typography sx={{ mt: 2 }} className={classes.headerTitle}>SWEAT Points</Typography>
                        <Typography sx={{ mt: 6 }} className={classes.headerDescription}>Get ahead of the game with SWEAT points during your organization's bootstrapping phase. <span>Track contributions</span> and <span>reward members</span> based on their SWEAT points, once your organization has the funds</Typography>
                </Box>
                { enabled && <Box sx={{ my: 4 }}>
                    <Button onClick={() => setActiveTab(2)} fullWidth style={{ padding: 0 }} variant="contained" size="small" color="primary">Convert to tokens & Compensate members</Button>
                </Box> }
                <Box display="flex" alignItems="center" justifyContent="center">
                    <Switch
                        label={ enabled? 'ENABLED': 'DISABLED' }
                        onChange={(e: any) => {
                            if(enabled)
                                setShowDisableAlert(true)
                            else
                                setEnabled(true)
                        }}
                        checked={enabled} />
                </Box>
                <Dialog
                    open={showDisableAlert}
                    PaperProps={{ style: { borderRadius: 20 } }}
                    onClose={() => setShowDisableAlert(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent>
                        <Box sx={{  }} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                            <img style={{ width: 50, height: 50 }} src={XPPointsSvg} />
                            <Typography sx={{ mt: 2, mb:4 }} className={classes.headerTitle}>Disable SWEAT Points</Typography>
                            <Typography className={classes.headerDescription}>You will no more be able to send SWEAT points and the current SWEAT points accumulated by members will be reset to zero.</Typography>
                        </Box>
                    </DialogContent>
                    <Box sx={{ p:3 }} display="flex" flexDirection="row" alignItems="center" justifyContent="center">
                        <Button style={{ margin: '0 8px' }} size="small" variant="outlined" onClick={() => setShowDisableAlert(false)}>No</Button>
                        <Button onClick={() => { setEnabled(false); setShowDisableAlert(false) }} style={{ margin: '0 8px' }} size="small" variant="contained" autoFocus>Yes</Button>
                    </Box>
                </Dialog>
            </Box>
        )
    }

    const Tab2 = () => {
        return (
            <Box sx={{ mt: 6 }}>
                <Box sx={{ mt: 0, mb: 6 }} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <img style={{ marginBottom: 6, width: 50, height: 50 }} src={CompensateMemberSvg} />
                    <Typography sx={{ mt: 2 }} className={classes.headerTitle}>Compensate Members</Typography>
                </Box>
                <Box>
                    <Box sx={{ my: 4 }} component="form" noValidate autoComplete="off">
                        <TextInput id="outlined-select-currency" select disabled={DAO?.safes.length < 2} fullWidth label="Treasury" value={state?.safeAddress} 
                            onChange={(e:any) =>  setState((prev:any) => {
                                 return { ...prev, safeAddress: e.target.value, currency: _get(_get(safeTokens, e.target.value, ''), '[0].tokenAddress', null) } 
                            })}
                        >
                            {
                                DAO?.safes?.map((safe:any) => {
                                    return (
                                        <MenuItem disabled={!_find(adminSafes, (s:any) => s.address === safe?.address)} key={safe?.address} value={safe?.address}>{ (safe?.name || "Multi-sig wallet") +" ("+ beautifyHexToken(safe?.address) +")" }</MenuItem>
                                    )
                                })
                            }
                        </TextInput>
                    </Box>
                    <Box display="flex" flexDirection="row" alignItems="center" sx={{ my: 2 }}>
                    <img src={XPPointsIconSvg} />
                    <Typography sx={{ fontSize: 16, mx:2, whiteSpace: 'nowrap' }}>1 SWT =</Typography>
                    <Box sx={{ width: '100%' }}>
                        <CurrencyInput
                                value={state?.sweatValue || 0}
                                onChange={(value: any) => {
                                    setState((prev: any) => { return { ...prev, sweatValue: value } })
                                }}
                                options={
                                    _get(safeTokens, state?.safeAddress, []).filter((t:any) => t.tokenAddress !== 'SWEAT').map((t:any) => {
                                        return { value: t.tokenAddress, label: t.token.symbol }
                                    })
                                }
                                dropDownvalue={state?.currency}
                                onDropDownChange={(value: any) => {
                                    setState((prev: any) => { return { ...prev, currency: value } })
                                }}
                            />
                        </Box>
                    </Box>
                    <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px' , padding: "30px 0 20px" }}>
                        <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                            <Button onClick={() => setActiveTab(1)} sx={{ mr:1 }} fullWidth variant='outlined' size="small">Cancel</Button>
                            <Button disabled={!(state?.safeAddress && state?.currency && (+state?.sweatValue > 0))} onClick={() => setActiveTab(3)} sx={{ ml:1 }}  fullWidth variant='contained' size="small">Next</Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        )
    }

    const Tab3 = () => {
        return (
            <Box sx={{ mt: 6 }}>
                <Box sx={{ mt: 0, mb: 6 }} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <img style={{ marginBottom: 6, width: 50, height: 50 }} src={CompensateMemberSvg} />
                    <Typography sx={{ mt: 2 }} className={classes.headerTitle}>Compensate Members</Typography>
                </Box>
                <Box>
                    <TableContainer component={Box}>
                        <Table  size="small" aria-label="simple table">
                            <TableBody>
                                {
                                    sweatMembers.map((member:any) => {
                                        const sweat = _find(_get(member, 'member.earnings', []), e => e.currency === 'SWEAT' && e.daoId === _get(DAO, '_id', ''))
                                        return (
                                            <TableRow>
                                                <TableCell>
                                                    <Avatar name={member?.member?.name} wallet={member?.member?.wallet} />
                                                </TableCell>
                                                <TableCell padding="none" align="right">
                                                    <img style={{ marginTop: 2, width: 16, height: 16 }} src={XPPointsIconSvg} />
                                                </TableCell>
                                                <TableCell padding="none" align="right">
                                                    <Typography>{ sweat?.value } SWT   =</Typography>
                                                </TableCell>
                                                <TableCell padding="none" align="right">
                                                        <Typography style={{ fontWeight: 700 }}>{ (sweat?.value * (+state?.sweatValue)).toFixed(3) }</Typography>
                                                </TableCell>
                                                <TableCell padding="none" align="left">
                                                    <img style={{ marginLeft: 6, marginTop: 2, width: 16, height: 16 }} src={ state?.currency === process.env.REACT_APP_NATIVE_TOKEN_ADDRESS ? CHAIN_INFO[safe?.chainId].logoUrl : StarSvg } />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                }
                                <TableRow>
                                    <TableCell>
                                        <Box sx={{ height: 60 }}></Box>
                                    </TableCell>
                                    <TableCell padding="none" align="right">

                                    </TableCell>
                                    <TableCell padding="none" align="right">
                                        <Typography>Total =</Typography>
                                    </TableCell>
                                    <TableCell padding="none" align="right">
                                        <Typography style={{ fontWeight: 700 }}>{ (total).toFixed(3) }</Typography>
                                    </TableCell>
                                    <TableCell padding="none" align="left">
                                        <img style={{ marginLeft: 6, marginTop: 2, width: 16, height: 16 }} src={ state?.currency === process.env.REACT_APP_NATIVE_TOKEN_ADDRESS ? CHAIN_INFO[safe?.chainId].logoUrl : StarSvg }/>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ p: 2 }}>
                        <Typography>All SWEAT counter will be reset to 0.</Typography>
                        <Box sx={{ mt: 3 }}>
                            <CreatableSelectTag defaultMenuIsOpen={false} onChangeOption={(tag:any) => { 
                                setState((prev:any) => { return { ...prev, tag } })
                            }}/>
                        </Box>
                    </Box>
                </Box>
                { networkError && <Typography color="error" variant="body1" sx={{ textAlign: 'center' }}>{ networkError }</Typography> }
                <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px' , padding: "30px 0 20px" }}>
                        <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                            <Button onClick={() => setActiveTab(2)} sx={{ mr:1 }} fullWidth variant='outlined' size="small">Cancel</Button>
                            <Button loading={txnLoading} disabled={txnLoading || total === 0 || sweatMembers.length == 0} onClick={() => handleCreateTransaction()} sx={{ ml:1 }}  fullWidth variant='contained' size="small">Send</Button>
                        </Box>
                </Box>
            </Box>
        )
    }

    return (
        <Box sx={{ pb: 8, pt: 6 }} style={{ position: 'relative' }}>
            <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={onClose}>
                <img src={CloseSVG} />
            </IconButton>
            { activeTab === 1 && Tab1() }
            { activeTab === 2 && Tab2() }
            { activeTab === 3 && Tab3() }
        </Box>
    )
}

export default XPPoints