import React, { useEffect, useMemo, useState } from "react"
import clsx from "clsx"
import { get as _get, find as _find } from 'lodash'
import { Drawer, Box, Grid, Typography, Stack, List, ListItem, ListItemButton } from "@mui/material"
import LomadsAvatar from "components/Avatar"
import Avatar from "boring-avatars";
import IconButton from "components/IconButton"
import CloseSVG from 'assets/svg/close-new.svg'
import EditSVG from 'assets/svg/edit.svg'
import LINK_SVG from 'assets/svg/ico-link.svg'
import SafeSVG from 'assets/svg/safe.svg'
import Checkbox from "components/Checkbox";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { toast } from 'react-hot-toast'
import { makeStyles } from '@mui/styles';
import Button from "components/Button"
import Skeleton from '@mui/material/Skeleton';
import { useDAO } from "context/dao"
import Accordion from '@mui/material/Accordion';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CHAIN_INFO } from "constants/chainInfo"
import { beautifyHexToken } from "utils"
import { useNavigate } from "react-router-dom"
import theme from "theme"
import TextInput from "components/TextInput"
import axiosHttp from 'api'
import useSafe from "hooks/useSafe"
import { off } from "process"
import SwitchChain from "components/SwitchChain"
import { useWeb3Auth } from "context/web3Auth"
import useGnosisSafeTransaction from "hooks/useGnosisSafeTransaction"
import Switch from "components/Switch"
import { useAppDispatch } from "helpers/useAppDispatch"
import { toggleSafeAction } from "store/actions/dao"
const { toChecksumAddress } = require('ethereum-checksum-address')

const useStyles = makeStyles((theme: any) => ({
    root: {

    },
    headerTitle: {
        fontFamily: 'Inter, sans-serif',
        fontStyle: 'normal',
        fontWeight: '400 !important',
        fontSize: '28px !important',
        lineHeight: '38px',
        color: '#C94B32'
    },
    headerDescription: {
        fontFamily: 'Inter, sans-serif',
        fontStyle: 'normal',
        textAlign: 'center',
        fontWeight: '400 !important',
        fontSize: '14px !important',
        lineHeight: '19px !important',
        color: '#1B2B41',
        "& span": {
            fontWeight: '600 !important',
        }
    },
    addSafeButtonText: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: '12px !important',
        color: '#C94B32'
    },
    safeItem: {
        height: 64,
        backgroundColor: "#FEF6F4 !important",
        padding: 16
    },
    safeDetails: {
        backgroundColor: "#FEF6F4 !important",
        borderTop: "1px solid #D1D4D9"
    },
    safeDisabled: {
        backgroundColor: "#F5f5f5 !important",
    },
    ownerTitle: {
        fontFamily: 'Inter, sans-serif',
        fontStyle: 'normal',
        fontWeight: '600 !important',
        fontSize: '12px',
        lineHeight: '16px',
        color: '#1B2B41'
    },
    ChainLogo: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EEE',
        borderRadius: '50%',
        width: 32,
        height: 32,
        margin: 10
    },
}));


const SafeModal = ({ open, onClose }: any) => {
    const classes = useStyles();
    const dispatch = useAppDispatch()
    const { chainId } = useWeb3Auth()
    const navigate = useNavigate();
    const { DAO, loadDAO } = useDAO();
    const { loadSafe } = useSafe()
    const [active, setActive] = useState<any>(null)
    const [editMode, setEditMode] = useState<any>(false)
    const [safeName, setSafeName] = useState<any>(null)
    const { updateOwnersWithThreshold } = useGnosisSafeTransaction()
    const [DAOMemberList, setDAOMemberList] = useState([])
    const [updateLoading, setUpdateLoading] = useState(false)

    const toggleMember = (member: any) => {
        setDAOMemberList((prev: any) => prev.map((mem: any) => {
            if (member.wallet === mem.wallet) {
                if (!(mem.owner && DAOMemberList.filter((mem: any) => mem.owner).length == 1)) {
                    return { ...mem, owner: !mem.owner }
                }
            }
            return mem
        }))
    }

    const newOwners = useMemo(() => {
        const data = DAOMemberList.filter((member: any) => {
            if (member?.owner === true && !_find(active?.owners, (m: any) => m.wallet.toLowerCase() === member.wallet.toLowerCase()))
                return true
            return false;
        })
        return data
    }, [DAOMemberList])

    console.log("newOwners", newOwners)

    const removeOwners = useMemo(() => {
        const data = DAOMemberList.filter((member: any) => {
            if (member?.owner === false && _find(active?.owners, (m: any) => m.wallet.toLowerCase() === member.wallet.toLowerCase()))
                return true
            return false;
        })
        return data
    }, [DAOMemberList])

    console.log("removeOwners", removeOwners)

    // const newOwnerCount = useMemo(() => {
    // 	return ((DAOMemberList.filter((mem: any) => mem.owner).length - removeOwners.length) + newOwners.length)
    // }, [DAOMemberList, newOwners, removeOwners])

    // console.log("newOwnerCount", newOwnerCount)

    const handleUpdateOwnersWithThreshold = async () => {
        try {
            setUpdateLoading(true)
            if(newOwners.map((o: any) => o.wallet).length > 0 || removeOwners.map((o: any) => o.wallet).length > 0 || loadSafe(active?.address).threshold !== active?.threshold) {
                if (active?.chainId !== chainId) {
                    toast.custom(t => <SwitchChain t={t} nextChainId={active?.chainId} />)
                    return;
                } 
                await updateOwnersWithThreshold({
                    safeAddress: active?.address,
                    chainId: active?.chainId,
                    newOwners: newOwners.map((o: any) => o.wallet),
                    removeOwners: removeOwners.map((o: any) => o.wallet),
                    threshold: active?.threshold,
                    ownerCount: DAOMemberList.filter((mem: any) => mem.owner).length,
                    thresholdChanged: loadSafe(active?.address).threshold !== active?.threshold
                })
            }
            await axiosHttp.patch(`safe/${active?.address}`, { name: safeName })
            loadDAO(DAO?.url)
            setUpdateLoading(false)
            setEditMode(false)
        } catch (e) {
            setUpdateLoading(false)
            console.log(e)
        }
    }

    const renderEditMode = () => {
        if(!active) return null
        return (
            <Box style={{ paddingTop: 60, paddingBottom: 80 }}>
                <TextInput
                    label="Name"
                    value={safeName}
                    inputProps={{ maxLength: 50 }}
                    onChange={(e:any) => setSafeName(e.target.value)}
                    fullWidth
                />
                <Box style={{ height: 3, backgroundColor: "#C94B32", width: 300, margin: '32px auto' }} ></Box>
                <Box sx={{ mt: 2 }} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                    <Typography style={{ fontFamily: 'Inter,sans-serif', fontWeight: 700, color: "#76808d", fontSize: 14 }}>Select owners</Typography>
                </Box>
                <List dense sx={{ mt: 2, maxHeight: 300, overflow: 'hidden', overflowY: 'scroll' }}>
                    {
                        DAOMemberList?.map((member: any) => {
                            const labelId = `checkbox-list-label-${member.wallet}`;
                            return (
                                <ListItem
                                    disablePadding key={member.wallet}>
                                    <ListItemButton onClick={() => toggleMember(member)} role={undefined} dense>
                                        <LomadsAvatar name={_get(member, 'name', '')} wallet={_get(member, 'wallet', '')} />
                                        <Checkbox
                                            edge="end"
                                            tabIndex={-1}
                                            checked={member.owner}
                                            inputProps={{ 'aria-labelledby': labelId }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            )
                        })
                    }
                </List>
                <Box style={{ height: 3, backgroundColor: "#C94B32", width: 300, margin: '32px auto' }} ></Box>
                <Box sx={{ mt: 2 }}>
                    <Typography style={{ fontSize: '12px', fontStyle: 'italic', fontWeight: 400 }}>Any transaction requires the confirmation of</Typography>
                    <Box sx={{ mt: 1 }} display="flex" flexDirection="row" alignItems="center">
                        {/* <Box onClick={handleClick} sx={{ p:2, cursor: 'pointer', width: 112, height: 40, borderRadius: '10px', backgroundColor: "#FFF" }} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                            <Box>{ safe?.threshold }</Box>
                            <ArrowDropDownIcon/>
                        </Box> */}
                        {active && <TextInput key={active.address} select style={{ minWidth: 80 }} size="small" value={active?.threshold}
                            onChange={(e: any) => setActive((prev: any) => { return { ...prev, threshold: e.target.value } })}>
                            {
                                [...Array(DAOMemberList.filter((mem: any) => mem.owner).length).keys()]?.map((_o: any, _i: number) => {
                                    return (
                                        <MenuItem key={_i + 1} value={_i + 1}>{_i + 1}</MenuItem>
                                    )
                                })
                            }
                        </TextInput>}
                        <Typography style={{ marginLeft: 16, fontSize: '12px', fontStyle: 'italic', fontWeight: 400 }}>{`of ${DAOMemberList.filter((mem: any) => mem.owner).length} Owners`}</Typography>
                    </Box>
                </Box>
                {active && <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px', padding: "30px 0 20px" }}>
                    <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                        <Button onClick={() => setEditMode(false)} sx={{ mr: 1 }} fullWidth variant='outlined' size="small">Cancel</Button>
                        <Button loading={updateLoading} onClick={() => handleUpdateOwnersWithThreshold()} sx={{ ml: 1 }} fullWidth variant='contained' size="small">Save</Button>
                    </Box>
                </Box>}
            </Box>
        )
    }

    const renderSafeList = () => {
        return (
            <>
                <Box sx={{ mt: 0 }} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <img src={SafeSVG} />
                    <Typography sx={{ mt: 4 }} className={classes.headerTitle}>Safes</Typography>
                    <Typography sx={{ mt: 2 }} className={classes.headerDescription}>Easily customize your multi-sig wallet with a <br /><span>personal name, signatories</span> and <span>voting threshold.</span></Typography>
                </Box>
                <Box sx={{ mt: 4 }}>
                    <Button onClick={() => navigate(`/${DAO?.url}/attach-safe/new`)} sx={{ borderRadius: '10px' }} size="small" fullWidth variant="contained" color="secondary"><Typography color="primary">Add new safe</Typography></Button>
                </Box>
                <Box sx={{ mt: 2 }}>
                    {
                        !DAO ?
                            <Stack spacing={1} direction="column">
                                {['', '', '', '', '', '', '', ''].map(s => <Skeleton variant="rectangular" animation="wave" height={64} width={'100%'} />)}
                            </Stack> :
                            <Stack spacing={1} direction="column">
                                {
                                    DAO?.safes?.map((safe: any) => {
                                        console.log("SAFESAFE", safe)
                                        return (
                                            <Accordion TransitionProps={{ unmountOnExit: true }} key={safe.address} elevation={0} onChange={() => setActive((prev: any) => {
                                                if (prev && prev._id === safe._id) {
                                                    return null
                                                }
                                                return safe
                                            })} expanded={active && active?._id === safe?._id}>
                                                <AccordionSummary
                                                    expandIcon={
                                                        <ExpandMoreIcon color="primary" />
                                                    }
                                                    aria-controls={`panel1bh-header-${safe?.address}`}
                                                    id={`panel1bh-header-${safe?.address}`}
                                                    className={clsx(safe?.enabled ? [classes.safeItem] : [classes.safeItem, classes.safeDisabled])}
                                                >
                                                    <Box display="flex" flexDirection="row" alignItems="center" width={"100%"}>
                                                        <Box className={classes.ChainLogo}>
                                                            <img width={18} height={18} src={CHAIN_INFO[safe?.chainId]?.logoUrl} alt="seek-logo" />
                                                        </Box>
                                                        {/* <Avatar sx={{ width: 32, height: 32 }} src={CHAIN_INFO[safe?.chainId]?.logoUrl} /> */}
                                                        <Box sx={{ ml: 2, flexGrow: 1 }}>
                                                            <Typography style={{ color: "#1B2B41", fontWeight: 600, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>{safe?.name || 'Multi-sig wallet'}</Typography>
                                                            <Typography style={{ color: "#1B2B41", opacity: 0.59, fontWeight: 600, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>{beautifyHexToken(safe?.address)}
                                                               
                                                            </Typography>
                                                        </Box>
                                                        <IconButton style={{ marginRight: 6 }} onClick={(e:any) => {
                                                                e.stopPropagation()
                                                                navigator.clipboard.writeText(safe?.address)
                                                                    toast.success('Copied to clipboard')
                                                            }}>
                                                                <img src={LINK_SVG} />
                                                        </IconButton>
                                                        <IconButton onClick={(e:any) => {
                                                                e.stopPropagation()
                                                                setActive((prev: any) => {
                                                                    // if (prev && prev._id === safe._id) {
                                                                    //     return null
                                                                    // }
                                                                    return safe
                                                                })
                                                                setSafeName(safe?.name)
                                                                setDAOMemberList(DAO?.members?.map((member: any) => member?.member).map((member: any) => { return { ...member, owner: safe?.owners?.map((o: any) => toChecksumAddress(o.wallet)).indexOf(toChecksumAddress(member?.wallet)) > -1 } }))
                                                                setTimeout(() => {
                                                                    setEditMode((prev: any) => !prev)
                                                                }, 100)
                                                            }}>
                                                                <img src={EditSVG} />
                                                        </IconButton>
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails key={`panel1bh-header-${safe?.address}`} 
                                                className={clsx(safe?.enabled ? [classes.safeDetails] : [classes.safeDetails, classes.safeDisabled])}
                                                >
                                                    <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
                                                        <Typography className={classes.ownerTitle}>{ safe?.enabled ? 'Enabled' : 'Disabled' }</Typography>
                                                        <Switch checked={safe?.enabled} onChange={() => dispatch(toggleSafeAction({ url: DAO?.url, params: { safeAddress: safe?.address } }))} />
                                                    </Box>
                                                    <Box sx={{ mb: 1 }}>
                                                        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                                                            <Typography className={classes.ownerTitle}>{`${active?.owners?.length} Owners`}</Typography>
                                                            <Box>
                        
                                                            {/* {active && <IconButton onClick={() => {
                                                                console.log(active?.owners)
                                                                setDAOMemberList(DAO?.members?.map((member: any) => member?.member).map((member: any) => { return { ...member, owner: active?.owners?.map((o: any) => toChecksumAddress(o.wallet)).indexOf(toChecksumAddress(member?.wallet)) > -1 } }))
                                                                setEditMode((prev: any) => !prev)
                                                            }}>
                                                                <img src={EditSVG} />
                                                            </IconButton>} */}
                                                            </Box>
                                                        </Box>
                                                        {active && <Box style={{ maxHeight: 250, overflow: 'hidden', overflowY: 'auto' }}>
                                                            {
                                                                active?.owners?.map((owner: any) => (
                                                                    <Box key={`${safe.address}-${owner?.wallet}`} sx={{ my: 2, zIndex: '999' }}>
                                                                        { active && <LomadsAvatar name={owner.name} wallet={owner.wallet} /> }
                                                                    </Box>
                                                                ))
                                                            }
                                                        </Box>}
                                                    </Box>
                                                    <Box sx={{ width: 190, border: "2px solid #C94B32" }} ></Box>
                                                    <Box sx={{ mt: 2 }}>
                                                        <Typography style={{ fontSize: '12px', fontStyle: 'italic', fontWeight: 400 }}>Any transaction requires the confirmation of</Typography>
                                                        <Stack sx={{ mt: 2 }} direction="row" alignItems="center">
                                                            {/* <Box onClick={handleClick} sx={{ p:2, cursor: 'pointer', width: 112, height: 40, borderRadius: '10px', backgroundColor: "#FFF" }} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                                                            <Box>{ safe?.threshold }</Box>
                                                            <ArrowDropDownIcon/>
                                                        </Box> */}
                                                            {active && <TextInput disabled key={safe.address} select style={{ minWidth: 80 }} size="small" value={active?.threshold}
                                                                onChange={(e: any) => setActive((prev: any) => { return { ...prev, threshold: e.target.value } })}>
                                                                {
                                                                    active?.owners?.map((_o: any, _i: number) => {
                                                                        return (
                                                                            <MenuItem key={_i + 1} value={_i + 1}>{_i + 1}</MenuItem>
                                                                        )
                                                                    })
                                                                }
                                                            </TextInput>}
                                                            <Typography style={{ marginLeft: 16, fontSize: '12px', fontStyle: 'italic', fontWeight: 400 }}>{`of ${active?.owners?.length} Owners`}</Typography>
                                                        </Stack>
                                                    </Box>
                                                </AccordionDetails>
                                            </Accordion>
                                        )
                                    })
                                }
                            </Stack>
                    }
                </Box>
                {/* { active && <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px' , padding: "30px 0 20px" }}>
                        <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                            <Button onClick={() => onClose()} sx={{ mr:1 }} fullWidth variant='outlined' size="small">Cancel</Button>
                            <Button sx={{ ml:1 }} disabled={active?.threshold === loadSafe(active?.address)?.threshold} fullWidth variant='contained' size="small">Save</Button>
                        </Box>
                </Box> } */}
            </>
        )
    }

    return (
        <Box sx={{ pb: 8 }} style={{ position: 'relative' }}>
            <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={onClose}>
                <img src={CloseSVG} />
            </IconButton>
            {!editMode && renderSafeList()}
            {editMode && active && renderEditMode()}
        </Box>
    )
}

export default SafeModal