import React, { useState, useEffect, useMemo } from "react";
import { find as _find, get as _get, debounce as _debounce, findIndex as _findIndex, } from 'lodash';
import { Typography, Box, Drawer, MenuItem } from "@mui/material";
import { makeStyles } from '@mui/styles';
import editIcon from 'assets/svg/editButton.svg';
import IconButton from 'components/IconButton';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import CurrencyInput from "components/CurrencyInput";
import TextEditor from 'components/TextEditor';
import Switch from "components/Switch";
import MuiSelect from "components/Select";
import starIcon from 'assets/svg/star.svg';
import BoringAvatar from "boring-avatars";
import CloseSVG from 'assets/svg/closeNew.svg'
import axiosHttp from 'api'
import { useDAO } from "context/dao";
import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";

import { beautifyHexToken } from "utils";
import { useSafeTokens } from "context/safeTokens";

import TASKSVG from 'assets/svg/task.svg'
import folder from 'assets/svg/folder.svg';
import { IoIosArrowBack } from 'react-icons/io'
import compensationStar from 'assets/svg/compensationStar.svg';
import editToken from 'assets/svg/editToken.svg';
import compensationIcon from 'assets/svg/compensation.svg';
import { assignTaskAction, rejectTaskMemberAction, rejectTaskSubmissionAction, setTaskAction } from "store/actions/task";
import theme from "theme";
import palette from "theme/palette";
import CreatableSelectTag from "components/CreatableSelectTag";
import { toast } from "react-hot-toast";
import SwitchChain from "components/SwitchChain";
import useGnosisSafeTransaction from "hooks/useGnosisSafeTransaction";
import useOffChainTransaction from "hooks/useOffChainTransaction";
import useSafe from "hooks/useSafe";
import { useWeb3Auth } from "context/web3Auth";
import useRole from "hooks/useRole";
import { setDAOAction } from "store/actions/dao";

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
        paddingTop: '27px !important',
    },
    modalTitle: {
        color: '#C94B32',
        fontSize: '30px !important',
        fontWeight: '400',
        lineHeight: '33px !important',
        marginTop: '20px !important',
        marginBottom: '8px !important'
    },
    controlBtn: {
        width: '50px',
        height: '40px',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'center !important',
        background: '#FFFFFF !important',
        border: 'none !important',
        boxShadow: '5px 5px 4px rgba(27, 43, 65, 0.05), 3px -3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '0px 20px 20px 0px !important',
        cursor: 'pointer'
    },
    linkBtn: {
        width: '400px',
        height: '40px',
        marginTop: '10px !important',
        background: '#FFFFFF !important',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '100px !important',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'center !important',
        border: 'none !important',
        color: '#C94B32 !important',
        fontSize: 16,
        cursor: 'pointer'
    },
    compensationBox: {
        width: '100%',
        background: '#FFFFFF !important',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '5px !important',
        padding: '0 22px !important',
        marginBottom: '22px !important'
    },
    optionalBox: {
        width: '110px',
        height: '25px',
        borderRadius: '100px !important',
        backgroundColor: 'rgba(118, 128, 141, 0.05) !important'
    },
    taskReviewCompensation: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 80
    },
    taskReviewCompensationMain: {
        marginTop: 16,
        padding: "16px",
        marginBottom: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1)',
        borderRadius: '5px',
        width: '100%'
    },
    taskReviewCompensationMainContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    }
}));

interface Props {
    open: boolean;
    hideBackdrop: boolean;
    closeModal(): void;
}

export default ({ open, hideBackdrop, closeModal }: Props) => {
    const classes = useStyles();
    const { DAO } = useDAO();
    const { account, chainId: currentChainId } = useWeb3Auth();
    const dispatch = useAppDispatch();
    // @ts-ignore
    const { Task, rejectTaskSubmissionLoading } = useAppSelector(store => store.task);
    // @ts-ignore
    const { user } = useAppSelector(store => store.session)
    const { safeTokens } = useSafeTokens();
    const [newCompensation, setNewCompensation] = useState<number>(0)
    const [activeSubmission, setActiveSubmission] = useState<any>(null);
    const [showModifyCompensation, setShowModifyCompensation] = useState<boolean>(false);
    const [showRejectSubmission, setShowRejectSubmission] = useState<boolean>(false);
    const [approveLoading, setApproveLoading] = useState<boolean>(false);
    const [safeAddress, setSafeAddress] = useState<string>('');
    const [amount, setAmount] = useState(0);
    const [currency, setCurrency] = useState<string>('');
    const [errorCurrency, setErrorCurrency] = useState<boolean>(false);
    const [errorTaskValue, setErrorTaskValue] = useState<boolean>(false);
    const { activeSafes } = useSafe();
    const [tag, setTag] = useState(null)
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [rejectUser, setRejectUser] = useState<any>(null);
    const [reopen, setReopen] = useState(false);
    const [rejectionNote, setRejectionNote] = useState('');
    const [rejectionNoteError, setRejectionNoteError] = useState('');
    const [networkError, setNetworkError]= useState<any>(null);

    const { isSafeOwner } = useRole(DAO, account, Task?.compensation?.safeAddress || _get(DAO, 'safes[0].address', null));
    const { loadSafe } = useSafe();
    const { createSafeTransaction } = useGnosisSafeTransaction();
    const { createSafeTransaction: createOffChainSafeTransaction } = useOffChainTransaction();


    useEffect(() => {
        if (Task)
            setNewCompensation(+_get(Task, 'compensation.amount', 0))
    }, [Task])

    const handleApproveTask = async () => {
        if(Task.isDummy) {
            const payload = {
                daoUrl: _get(DAO, 'url', undefined),
                compensationDelta: newCompensation - _get(Task, 'compensation.amount', 0),
                offChainPayload: undefined,
                onChainSafeTxHash: null,
                recipient: _get(activeSubmission, 'member._id', null)
            }
            return axiosHttp.post(`task/${Task._id}/approve?daoUrl=${DAO.url}`, payload)
                .then(async (res:any) => {
                    dispatch(setDAOAction(res.data.dao))
                    dispatch(setTaskAction(res.data.task))
                    closeModal()
                })
                .finally(() => setApproveLoading(false))
        } else {
            const safeAddress = Task?.compensation?.safeAddress || _get(DAO, 'safes[0].address', null)
            const safe = loadSafe(safeAddress);
            console.log("safeAddress", safeAddress)
            if(!safeAddress) return;
    
            try {
    
                if(_get(Task, 'compensation.currency', 'SWEAT') !== "SWEAT") {
                    if(currentChainId !== safe?.chainId) {
                        setApproveLoading(false);
                        return toast.custom(t => <SwitchChain t={t} nextChainId={safe?.chainId}/>)
                    }
                }
                setApproveLoading(true)
                const method = !isSafeOwner || _get(Task, 'compensation.currency', 'SWEAT') === "SWEAT" ? createOffChainSafeTransaction : createSafeTransaction
    
                let m = _get(activeSubmission, 'member.name', '') === '' ? _get(activeSubmission, 'member.wallet', '') : _get(activeSubmission, 'member.name', '')
    
                const txn: any = await method({
                    chainId: safe?.chainId,
                    safeAddress: safeAddress,
                    tokenAddress: _get(Task, 'compensation.currency', 'SWEAT'),
                    send: [{ recipient: activeSubmission.member.wallet, amount: newCompensation, label: `${beautifyHexToken(m)} | ${_get(Task, 'name', '')}` || undefined, tag, taskId: Task?._id }],
                    daoId: _get(DAO, '_id', null),
                    isSafeOwner: Boolean(isSafeOwner)
                })
    
                const payload = {
                    daoUrl: _get(DAO, 'url', undefined),
                    compensationDelta: newCompensation - _get(Task, 'compensation.amount', 0),
                    offChainPayload: undefined,
                    onChainSafeTxHash: txn?.safeTxHash,
                    recipient: _get(activeSubmission, 'member._id', null)
                }
        
                return axiosHttp.post(`task/${Task._id}/approve?daoUrl=${DAO.url}`, payload)
                    .then(async (res:any) => {
                        dispatch(setDAOAction(res.data.dao))
                        dispatch(setTaskAction(res.data.task))
                        closeModal()
                    })
                    .finally(() => setApproveLoading(false))
            } catch (e) {
                setApproveLoading(false);
                if(typeof e === 'string')
                    setNetworkError(e)
                setTimeout(() => setNetworkError(null), 3000)
                console.log(e)
            }
        }
    }

    const handleApproveTaskAsync = _debounce(handleApproveTask, 500)

    const taskSubmissions = useMemo(() => {
        if (Task)
            return _get(Task, 'members', []).filter((member: any) => member.submission && (member.status !== 'submission_accepted' && member.status !== 'submission_rejected'))
        return []
    }, [Task]);

    //runs after rejecting a task submission
    useEffect(() => {
        if (rejectTaskSubmissionLoading === false) {
            if (taskSubmissions.length > 0) {
                setShowRejectSubmission(false);
                const currIndex = _findIndex(taskSubmissions, (t: any) => t._id === activeSubmission._id)
                const nextSubmission = _get(taskSubmissions, `${currIndex + 1}`, undefined)
                const prevSubmission = _get(taskSubmissions, `${currIndex - 1}`, undefined)
                if (prevSubmission)
                    setActiveSubmission(prevSubmission)
                else if (nextSubmission)
                    setActiveSubmission(nextSubmission)
            }
            else {
                closeModal();
            }
        }
    }, [rejectTaskSubmissionLoading]);

    useEffect(() => {
        if (!activeSubmission && taskSubmissions.length > 0)
            setActiveSubmission(taskSubmissions[0])
    }, [taskSubmissions]);

    const assignedUser = useMemo(() => {
        let user = _find(_get(Task, 'members', []), m => m.status === 'approved')
        if (user)
            return user.member
        return null;
    }, [Task]);

    const eligibleContributors = useMemo(() => {
        if(user){
            return _get(DAO, 'members', []).filter((m: { member: any; }) => Task.reviewer !== m.member._id && m.member._id !== user._id &&
            (!assignedUser ||
                (assignedUser && m.member._id !==
                    assignedUser?._id))).map((item: any) => { return { label: item.member.name && item.member.name !== "" ? `${item.member.name}  (${beautifyHexToken(item.member.wallet)})` : beautifyHexToken(item.member.wallet), value: item.member._id } });
        } 
        return []
    }, [DAO, selectedUser, Task]);

    const handleSetApplicant = (value: any) => {
        let user = _find(DAO.members, m => m.member._id === value);
        setSelectedUser({ _id: user.member._id, address: user.wallet });
    }

    const handleBack = () => {
        if (activeSubmission) {
            const currIndex = _findIndex(taskSubmissions, (t: any) => t._id === activeSubmission._id)
            const prevSubmission = _get(taskSubmissions, `${currIndex - 1}`, undefined)
            if (prevSubmission)
                setActiveSubmission(prevSubmission)
        }
    }

    const handleNext = () => {
        if (activeSubmission) {
            const currIndex = _findIndex(taskSubmissions, (t: any) => t._id === activeSubmission._id)
            const nextSubmission = _get(taskSubmissions, `${currIndex + 1}`, undefined)
            if (nextSubmission)
                setActiveSubmission(nextSubmission)
        }
    }

    const handleChangeCompensationAmount = (e: any) => {
        setAmount(parseFloat(e));
        setErrorTaskValue(false);
    }

    const handleChangeCurrency = (e: any) => {
        setCurrency(e);
        setErrorCurrency(false);
    }

    const handleRejectTask = () => {
        dispatch(rejectTaskSubmissionAction({
            payload:
            {
                reopen,
                rejectionNote,
                contributionType: _get(Task, 'contributionType', ''),
                isSingleContributor: _get(Task, 'isSingleContributor', ''),
                newContributorId: selectedUser ? selectedUser._id : null,
                rejectUser
            },
            daoUrl: _get(DAO, 'url', ''),
            taskId: _get(Task, '_id', '')
        }));
    }

    const updateCompensation = () => {
        return (
            <Drawer
                PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
                anchor={'right'}
                sx={{ zIndex: theme?.zIndex?.appBar + 1 }}
                open={showModifyCompensation}
                hideBackdrop={false}
            >
                <Box className={classes.modalConatiner}>
                    <Box sx={{ width: '100%', padding: '0 27px' }} display="flex" alignItems="center" justifyContent={"space-between"}>
                        <Typography sx={{ fontSize: 14, color: '#76808D', fontStyle: 'italic' }}>{_get(Task, 'name', '')}</Typography>
                        <IconButton onClick={() => setShowModifyCompensation(false)}>
                            <img src={CloseSVG} />
                        </IconButton>
                    </Box>
                    <Box sx={{ width: '100%', height: '100%' }} display="flex" flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                        <img src={compensationIcon} />
                        <Typography sx={{ fontSize: 30, color: '#C94B32', margin: '35px 0' }}>Change compensation</Typography>
                        <Box sx={{ width: '300px', marginTop: '20px' }}>
                            <CurrencyInput
                                value={newCompensation}
                                onChange={(e:any) => setNewCompensation(e)}
                                options={_get(safeTokens, ( Task?.compensation?.safeAddress || _get(DAO, 'safes[0].address', '')), []).map((tkn:any)=>{ return { label: tkn?.token?.symbol, value: tkn?.tokenAddress } })}
                                dropDownvalue={_get(Task, 'compensation.currency', "SWEAT")}
                                disableSelect
                                onDropDownChange={(value: any) => {}}
                                variant="primary"
                                errorCurrency={errorCurrency}
                                errorProjectValue={errorTaskValue}
                            />
                        </Box>

                        {/* <Box sx={{ width: '400px' }} display="flex" alignItems={"center"} justifyContent={"space-between"}>
                            <Button variant="outlined" onClick={() => setShowModifyCompensation(false)}>CANCEL</Button>
                            <Button variant="contained">CHANGE</Button>
                        </Box> */}
                    <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px' , padding: "30px 0 20px" }}>
                        <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                            <Button sx={{ mr:1 }}  onClick={() => {
                                setShowModifyCompensation(false)
                                setNewCompensation(+_get(Task, 'compensation.amount', 0))
                            }} fullWidth variant='outlined' size="small">CANCEL</Button>
                            <Button onClick={() => {
                                setShowModifyCompensation(false)
                            }} sx={{ ml:1 }} fullWidth variant='contained' size="small">CHANGE</Button>
                        </Box>
                    </Box>

                    </Box>
                </Box>
            </Drawer>
        )
    }

    const renderRejectTask = () => {
        return (
            <Drawer
                PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
                anchor={'right'}
                sx={{ zIndex: theme?.zIndex?.appBar + 1 }}
                open={showRejectSubmission}
                hideBackdrop={false}
            >
                <Box className={classes.modalConatiner}>
                    <Box sx={{ width: '100%', padding: '0 27px' }} display="flex" alignItems="center" justifyContent={"space-between"}>
                        <Typography sx={{ fontSize: 14, color: '#76808D', fontStyle: 'italic' }}>{_get(Task, 'name', '')}</Typography>
                        <IconButton onClick={() => setShowModifyCompensation(false)}>
                            <img src={CloseSVG} />
                        </IconButton>
                    </Box>
                    <Box sx={{ width: '100%', height: '100%' }} display="flex" flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                        <img src={TASKSVG} />
                        <Typography sx={{ fontSize: 30, color: '#C94B32', margin: '35px 0' }}>Reject Submission</Typography>

                        <Box sx={{ width: '300px', margin: '35px 0' }}>
                            <TextEditor
                                fullWidth
                                height={75}
                                width={300}
                                placeholder="Why I reject this submission..."
                                label="Note"
                                value={rejectionNote}
                                onChange={(value: string) => { setRejectionNote(value); setRejectionNoteError('') }}
                                error={rejectionNoteError !== ''}
                                id={rejectionNoteError !== '' ? "outlined-error-helper-text" : ""}
                                helperText={rejectionNoteError}
                            />
                        </Box>

                        {
                            Task?.contributionType === 'open' && Task?.isSingleContributor &&
                            <Box sx={{ width: '300px', marginBottom: '45px' }} display={"flex"} alignItems={"flex-start"}>
                                <Switch checkedSVG="checkmark" onChange={() => setReopen(prev => !prev)} />
                                <Box sx={{ marginLeft: '15px' }}>
                                    <Typography sx={{ fontSize: '16px', color: '#76808D', marginBottom: '6px' }}>REOPEN TASK</Typography>
                                    <Typography sx={{ fontSize: '14px', color: '#76808D', opacity: '0.5' }}>{_get(assignedUser, 'name', '')} will be removed from the task</Typography>
                                </Box>
                            </Box>
                        }

                        {
                            Task?.contributionType === 'assign' &&
                            <Box sx={{ width: '300px', marginBottom: '45px' }}>
                                <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ marginBottom: '10px' }}>
                                    <Typography sx={{ color: '#76808D', fontWeight: '700', fontSize: '16px' }}>Change contributor</Typography>
                                    <Box className={classes.optionalBox} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                        <Typography sx={{ color: 'rgba(118, 128, 141, 0.5)', fontWeight: '700' }}>Optional</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ width: '100%' }}>
                                    <MuiSelect
                                        options={eligibleContributors}
                                        setSelectedValue={(value) => handleSetApplicant(value)}
                                    />
                                </Box>
                            </Box>
                        }


                        {/* <Box sx={{ width: '400px' }} display="flex" alignItems={"center"} justifyContent={"space-between"}>
                            <Button variant="outlined" onClick={() => setShowRejectSubmission(false)}>CANCEL</Button>
                            <Button variant="contained" loading={rejectTaskSubmissionLoading} onClick={() => handleRejectTask()}>VALIDATE</Button>
                        </Box> */}

                    <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px' , padding: "30px 0 20px" }}>
                        <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                            <Button onClick={() => setShowRejectSubmission(false)} sx={{ mr:1 }} fullWidth variant='outlined' size="small">Cancel</Button>
                            <Button sx={{ ml:1 }} loading={rejectTaskSubmissionLoading} onClick={() => handleRejectTask()} fullWidth variant='contained' size="small">Validate</Button>
                        </Box>
                    </Box>

                    </Box>
                </Box>
            </Drawer>
        )
    }

    const renderSingleSubmission = (submission: any) => {
        if (!submission) return null;
        return (
            <Box sx={{ width: '400px', height: '90vh', paddingBottom: 8 }} display="flex" flexDirection={"column"}>
                {  taskSubmissions.length > 1 ?
                    <Box sx={{ mt: 3 }} display="flex" flexDirection="column" alignItems="center">
                        <BoringAvatar
                            size={60}
                            name={submission?.member?.wallet}
                            variant="marble"
                            colors={["#E67C40", "#EDCD27", "#8ECC3E", "#2AB87C", "#188C8C"]}
                        />
                        <Typography className={classes.modalTitle}>{submission.member.name}</Typography>
                        <Typography>{ beautifyHexToken(submission?.member?.wallet) }</Typography>
                    </Box> : 
                    <Box sx={{ mt: 3 }} display="flex" flexDirection="column" alignItems="center">
                        <img src={TASKSVG} alt="project-resource" />
                        <Typography className={classes.modalTitle}>{submission.member.name} did the job!</Typography>
                    </Box>
                }

                <Box sx={{ minHeight: 200, width: '100%', height: '100%', maxHeight: '100%', overflow: 'hidden', overflowY: 'auto', margin: '35px 0' }}>
                    <Typography sx={{ fontSize: '16px', color: '#76808D', marginBottom: '14px', fontWeight: '700' }}>Note</Typography>
                    <Typography
                        dangerouslySetInnerHTML={{ __html: submission.submission.note }}
                    >
                        {/* Hi, its done ! ipsum dolor sit amet, consecteur adsipicing elit,sed diam. */}
                    </Typography>
                </Box>

                <Box sx={{ width: '100%' }}>
                    <Typography sx={{ fontSize: '16px', color: '#76808D', marginBottom: '14px', fontWeight: '700' }}>{ Task && _get(Task, 'submissionLink', []).length == 0 ? 'Links' : 'Check submission' }</Typography>
                    {
                        Task && _get(Task, 'submissionLink', []).length == 0
                            ?
                            <Box>
                                {submission.submission &&
                                    _get(submission, 'submission.submissionLink', []).map((item: any, index: number) => {
                                        return (
                                            <button className={classes.linkBtn} onClick={() => window.open(item.link, '_blank', 'noopener,noreferrer')}>{item.title}</button>
                                        )
                                    })
                                }
                            </Box>
                            :
                            <Button size="small" onClick={() => window.open(Task.submissionLink, '_blank', 'noopener,noreferrer')} startIcon={<img style={{ marginRight: 8 }} src={folder} />} variant="contained" style={{ color: palette.primary.main }} color="secondary">SUBMISSION LINK</Button>
                    }
                </Box>

                <Box className={classes.taskReviewCompensation}>
                    <Box className={classes.taskReviewCompensationMain}>
                        <Box style={{width:'100%',display:'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box className={classes.taskReviewCompensationMainContainer}>
                                <Typography style={{
                                    color: '#76808d',
                                    fontFamily: 'Inter,sans-serif',
                                    fontSize: '16px',
                                    fontStyle: 'normal',
                                    fontWeight: '400',
                                    letterSpacing: '-.011em',
                                    lineHeight: '18px',
                                    margin: '0 4px',
                                }}>Compensation</Typography>
                                <img style={{ margin: '0 8px' }} src={starIcon} />
                                <Typography style={{ fontWeight: 700, fontSize: 16 }}>{_get(Task, 'compensation.amount', 0)}</Typography>
                                {(newCompensation - +_get(Task, 'compensation.amount', 0)) !== 0 && <Typography color="error" style={{ fontSize: 16, margin: '0 8px', fontWeight: 700 }}>{`${(newCompensation - +_get(Task, 'compensation.amount', 0)) > 0 ? ' + ' : ''} ${(newCompensation - +_get(Task, 'compensation.amount', 0)).toFixed(3)}`}</Typography>}
                                <Typography style={{fontSize: 16, margin: '0 8px' }}>{_get(Task, 'compensation.symbol', "SWEAT")}</Typography>
                            </Box>
                            <IconButton onClick={() => { setShowModifyCompensation(true) }}>
                                <img src={editIcon} alt="edit-icon" />
                            </IconButton>
                        </Box>
                        <Box sx={{ my: 1 }} style={{width:'100%'}}>
                            <CreatableSelectTag onChangeOption={(e:any) => setTag(e)} />
                        </Box>
                    </Box>
                </Box>

                {/* <Box sx={{ width: '100%' }} display="flex" alignItems={"center"} justifyContent={"space-between"}>
                    <Button variant="outlined" onClick={() => { setRejectUser(submission.member._id); setShowRejectSubmission(true); }}>REJECT</Button>
                    <Button variant="contained">APPROVE</Button>
                </Box> */}

            </Box>
        )
    }

    const renderTaskApproval = () => {
        return (
            <Drawer
                PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
                anchor={'right'}
                open={open}
                sx={{ zIndex: theme?.zIndex?.appBar + 1 }}
                hideBackdrop={hideBackdrop}
            >
                <Box className={classes.modalConatiner}>
                    <Box sx={{ width: '100%', padding: '0 27px' }} display="flex" alignItems="center" justifyContent={"space-between"}>
                        <Typography sx={{ fontSize: 14, color: '#76808D', fontStyle: 'italic' }}>{_get(Task, 'name', '')}</Typography>
                        <IconButton onClick={closeModal}>
                            <img src={CloseSVG} />
                        </IconButton>
                    </Box>
                    <Box sx={{ width: '100%', height: '100%' }} display="flex" alignItems="center" justifyContent={"space-between"}>
                        <Box sx={{ height: '100%' }} display="flex" alignItems="center">
                            {
                                taskSubmissions.length > 1 &&
                                <button className={classes.controlBtn} onClick={handleBack}>
                                    <IoIosArrowBack size={20} color="#C94B32" />
                                </button>
                            }
                        </Box>
                        <Box sx={{ height: '100%' }}>
                            {renderSingleSubmission(activeSubmission)}
                        </Box>
                        <Box sx={{ height: '100%' }} display="flex" alignItems="center">
                            {
                                taskSubmissions.length > 1 &&
                                <button className={classes.controlBtn} style={{ transform: 'rotate(180deg)' }} onClick={handleNext}>
                                    <IoIosArrowBack size={20} color="#C94B32" />
                                </button>
                            }
                        </Box>
                    </Box>
                    <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px' , padding: "30px 0 20px" }}>
                        { networkError ? <Box sx={{ my:2 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography color="error">{ networkError }</Typography>
                        </Box> : null }
                        <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                            <Button disabled={approveLoading} onClick={() => { setRejectUser(activeSubmission?.member?._id); setShowRejectSubmission(true); }} sx={{ mr:1 }} fullWidth variant='outlined' size="small">Reject</Button>
                            <Button sx={{ ml:1 }} disabled={approveLoading} loading={approveLoading} onClick={() => handleApproveTaskAsync()} fullWidth variant='contained' size="small">Approve</Button>
                        </Box>
                    </Box>
                </Box>
            </Drawer>
        )
    }

    if (showModifyCompensation)
        return updateCompensation()

    if (showRejectSubmission)
        return renderRejectTask()

    return renderTaskApproval()
}