import React, { useEffect, useState } from "react";
import { uniqBy as _uniqBy, get as _get, find as _find } from 'lodash'
import { Typography, Box, Drawer, InputAdornment } from "@mui/material";
import { makeStyles } from '@mui/styles';
import PercentIcon from '@mui/icons-material/Percent';
import IconButton from 'components/IconButton';
import TextInput from 'components/TextInput';
import Button from "components/Button";
import compensationStar from 'assets/svg/compensationStar.svg';
import CloseSVG from 'assets/svg/closeNew.svg'
import MilestoneSVG from 'assets/svg/milestone.svg'
import Dropdown from "components/Dropdown";
import Avatar from "components/Avatar";
import LabelDropdown from "components/LabelDropdown";
import theme from "theme";
import { useAppSelector } from "helpers/useAppSelector";
import CreatableSelectTag from "components/CreatableSelectTag";
import AmountInput from "components/AmountInput";
import useSafe from "hooks/useSafe";
import useGnosisSafeTransaction from "hooks/useGnosisSafeTransaction";
import useOffChainTransaction from "hooks/useOffChainTransaction";
import { useDAO } from "context/dao";
import { useWeb3Auth } from "context/web3Auth";
import { useAppDispatch } from "helpers/useAppDispatch";
import { updateMilestoneAction } from "store/actions/project";
import { toast } from "react-hot-toast";
import SwitchChain from "components/SwitchChain";

const useStyles = makeStyles((theme: any) => ({
    root: {
        height: '100vh',
        overflowY: 'scroll',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalConatiner: {
        width: 575,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '27px 27px 100px 27px !important',
        marginTop: '60px !important'
    },
    modalTitle: {
        color: '#C94B32',
        fontSize: '30px !important',
        fontWeight: '400',
        lineHeight: '33px !important',
        marginTop: '20px !important',
        marginBottom: '8px !important'
    },
    modalSubtitle: {
        color: '#76808d',
        fontSize: '14px !important',
        fontStyle: 'italic',
        marginBottom: '35px !important'
    },
    label: {
        fontSize: '16px !important',
        lineHeight: '18px !important',
        color: '#76808d',
        fontWeight: '700 !important',
        marginBottom: '8px !important'
    },
    dropdown: {
        background: 'linear-gradient(180deg, #FBF4F2 0 %, #EEF1F5 100 %) !important',
        borderRadius: '10px',
    },
    divider: {
        width: 210,
        border: '2px solid #C94B32',
        margin: '35px 0 !important'
    },
    mileStonePaper: {
        width: 340,
        padding: '20px 22px !important',
        background: '#FFF !important',
        boxShadow: '0px 3px 3px rgba(27, 43, 65, 0.1), -1px -2px 3px rgba(201, 75, 50, 0.05) !important',
        borderRadius: '5px !important',
        marginBottom: '35px !important'
    },
    paperTitle: {
        fontSize: '16px !important',
        fontWeight: '700 !important',
        lineHeight: '18px !important',
        color: '#B12F15',
        marginBottom: '20px !important'
    }
}));

interface Props {
    open: boolean;
    selectedMilestone: any,
    closeModal(): any;
}

export default ({ open, selectedMilestone, closeModal }: Props) => {
    const classes = useStyles();
    const dispatch = useAppDispatch()
    const { DAO } = useDAO();
    const { account, chainId } = useWeb3Auth()
    const { Project } = useAppSelector((store: any) => store.project);
    const [members, setMembers] = useState([])
    const { createSafeTransaction } = useGnosisSafeTransaction();
    const { createSafeTransaction: createOffChainSafeTransaction } = useOffChainTransaction();
    const { loadSafe, activeSafes } = useSafe()
    const [tag, setTag] = useState(null)
    const [sendTokensLoading, setSendTokensLoading] = useState(false)
    const [networkError, setNetworkError] = useState<any>(null)

    useEffect(() => {
        if (Project)
            setMembers(Project?.members)
    }, [Project, open])

    console.log("selectedMilestone", selectedMilestone)

    const handleCreateTransaction = async () => {
        setNetworkError(null)
        if(Project.isDummy) {
            const newArray1 = _get(Project, 'milestones', []).map((item: any, i: number) => {
                if (i === _get(selectedMilestone, 'pos', '')) {
                    return { ...item, complete: true };
                } else {
                    return item;
                }
            });
            dispatch(updateMilestoneAction({ projectId: Project._id, daoUrl: DAO?.url, payload: { milestones: newArray1 } }));
            closeModal()
            return;
        }
        const safe = loadSafe(Project?.compensation?.safeAddress || _get(DAO, 'safes.[0].address'))
        if(_get(Project, 'compensation.currency', 'SWEAT') !== "SWEAT") {
            if(chainId !== safe?.chainId) 
                return toast.custom(t => <SwitchChain t={t} nextChainId={safe?.chainId}/>)
        }
        const totalAllotedAmount = members.reduce((a: number, b: any) => a + (!(b?.percentage || 0) ? 0 : (((b?.percentage) / 100) * ((+Project?.compensation?.amount * (selectedMilestone?.amount / 100))))), 0)
        let sendArray: any = []
        let total = 0;
        let uMembers = _uniqBy(members, (t: any) => t._id);
        for (var i = 0; i < uMembers.length; i++) {
            const item = uMembers[i];
            total += item.percentage;
            if (item.percentage > 0 && item?.wallet) {
                sendArray.push({
                    amount: ((item.percentage * totalAllotedAmount) / 100).toFixed(5),
                    name: item.name,
                    recipient: item?.wallet,
                    label: `${item.name} | ${_get(Project, 'name', 'x')} | ${selectedMilestone.name}`,
                    tag
                })
            }
        }

        console.log("sendArray", sendArray)

        if (!safe) return;

        if ((chainId !== safe?.chainId) && Project?.compensation?.currency === "SWEAT") {
            return toast.custom(t => <SwitchChain t={t} nextChainId={safe?.chainId} />)
        }

        try {
            setSendTokensLoading(true)
            const method = Project?.compensation?.currency === "SWEAT" ? createOffChainSafeTransaction : createSafeTransaction
            const txn = await method({
                chainId: safe?.chainId,
                safeAddress: Project?.compensation?.safeAddress || _get(DAO, 'safes[0].address'),
                tokenAddress: Project?.compensation?.currency,
                send: sendArray,
                daoId: _get(DAO, '_id', null),
                isSafeOwner: _find(safe.owners, (owner: any) => owner?.wallet === account) !== null
            })
            const newArray = _get(Project, 'milestones', []).map((item: any, i: number) => {
                if (i === _get(selectedMilestone, 'pos', '')) {
                    return { ...item, complete: true };
                } else {
                    return item;
                }
            });
            dispatch(updateMilestoneAction({ projectId: Project._id, daoUrl: DAO?.url, payload: { milestones: newArray } }));
            closeModal()
            return setSendTokensLoading(false)
        } catch (e) {
            console.log(e)
            setSendTokensLoading(false)
            if(typeof e === 'string')
                setNetworkError(e)
            setTimeout(() => setNetworkError(null), 3000)
            return;
        }
    }

    return (
        <Drawer
            PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
            sx={{ zIndex: theme.zIndex.appBar + 1 }}
            anchor={'right'}
            open={open}
        >
            <Box className={classes.modalConatiner}>
                <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={closeModal}>
                    <img src={CloseSVG} />
                </IconButton>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <img src={MilestoneSVG} alt="project-resource" />
                    <Typography className={classes.modalTitle}>Assign Contributions</Typography>
                    <Typography className={classes.modalSubtitle}>Mark the milestone as completed and reward the contributors</Typography>
                </Box>
                <Box>
                    <Box sx={{ mb: 3 }} display="flex" flexDirection="row" alignItems="center">
                        <Typography sx={{ color: '#76808D', fontSize: '16px' }}>Compensation</Typography>
                        <Box display="flex" alignItems="center" justifyContent={"center"} sx={{ ml: 2, height: '35px', }}>
                            <img src={compensationStar} alt="compensation-star" style={{ marginRight: '7px' }} />
                            <Typography noWrap sx={{ width: 150 }}>{ (+Project?.compensation?.amount * (+selectedMilestone?.amount / 100)).toFixed(3) } {_get(Project, 'compensation.symbol', '')}</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box display="flex" flexDirection="column" justifyContent={"space-between"} alignItems={"center"} sx={{ width: '100%', height: '100%' }}>
                    <Box display="flex" flexDirection="column" alignItems={"center"} sx={{ width: '80%' }}>

                        <Box display="flex" alignItems={"center"} justifyContent={"space-between"} sx={{ marginBottom: '35px' }}>
                            <Button
                                variant='contained'
                                color="secondary"
                                size="small"
                                sx={{ width: 185, color: '#C94B32', fontSize: 14, marginRight: '16px' }}
                                onClick={() => {
                                    setMembers((prev: any) =>
                                        prev.map(((member: any) => {
                                            return { ...member, percentage: (100 / members.length).toFixed(2) }
                                        }))
                                    )
                                }}
                            >
                                SPLIT EQUALLY
                            </Button>
                            <Box sx={{ width: 185 }}>
                                <CreatableSelectTag onChangeOption={(e: any) => { setTag(e) }} />
                            </Box>
                        </Box>

                        {
                            members.map((item: any) => {
                                return (
                                    <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ my: 1, width: 350 }}>
                                        <Box>
                                            <Avatar name={item?.name} wallet={item?.wallet} />
                                        </Box>
                                        <Box>
                                            {/* <AmountInput height={40} 
                                            onChange={(e:any) => { setMembers((prev:any) => 
                                                prev.map(((member:any) => {
                                                    if(member._id === item?._id)
                                                        return { ...member, percentage: e }
                                                    return member
                                                }))
                                            )}} 
                                            value={item?.percentage || 0} /> */}
                                            <TextInput
                                                type="number"
                                                min={0}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                                                }}
                                                max={100}
                                                onChange={(e: any) => {
                                                    setMembers((prev: any) =>
                                                        prev.map(((member: any) => {
                                                            if (member._id === item?._id)
                                                                return { ...member, percentage: e.target.value }
                                                            return member
                                                        }))
                                                    )
                                                }}
                                                value={item?.percentage || 0}
                                                sx={{ width: 100 }} />
                                        </Box>
                                        <Box>
                                            <Typography noWrap sx={{ width: 80 }}>= {!(item?.percentage || 0) ? 0 : (((item?.percentage) / 100) * ((+Project?.compensation?.amount * (selectedMilestone?.amount / 100)))).toFixed(3)} {Project?.compensation?.symbol}</Typography>
                                        </Box>
                                    </Box>
                                )
                            })
                        }

                    </Box>
                    {/* <Box display={"flex"} alignItems={"center"} justifyContent={"center"} style={{ width: '100%' }}>
                        <Button fullWidth size="small" variant="outlined" sx={{ marginRight: '20px' }}>CANCEL</Button>
                        <Button fullWidth size="small" variant="contained">SAVE</Button>
                    </Box> */}
                </Box>
                <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px', padding: "30px 0 20px" }}>
                    { networkError ? <Box sx={{ py: 2 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}><Typography color="error">{ networkError }</Typography></Box> : null }
                    <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                        <Button sx={{ mr: 1 }} onClick={() => closeModal()} fullWidth variant='outlined' size="small">Cancel</Button>
                        <Button onClick={() => handleCreateTransaction()} loading={sendTokensLoading} disabled={sendTokensLoading} sx={{ ml: 1 }} fullWidth variant='contained' size="small">Save</Button>
                    </Box>
                </Box>
            </Box>
        </Drawer>
    )
}