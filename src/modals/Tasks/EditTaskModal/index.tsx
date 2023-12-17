import React, { useState, useMemo, useEffect } from "react";
import { find as _find, get as _get, debounce as _debounce, isEqual as _isEqual, } from 'lodash';
import { Typography, Box, Drawer, Chip, Menu, MenuItem } from "@mui/material";
import { makeStyles } from '@mui/styles';

import IconButton from 'components/IconButton';
import TextInput from 'components/TextInput';
import Button from "components/Button";
import CurrencyInput from "components/CurrencyInput";
import TextEditor from 'components/TextEditor'

import { HiOutlinePlus } from 'react-icons/hi';
import { CgClose } from 'react-icons/cg'

import CloseSVG from 'assets/svg/closeNew.svg'
import createTaskSvg from 'assets/svg/task.svg';
import AddIcon from '@mui/icons-material/Add';

import { IoIosClose } from 'react-icons/io'
import Avatar from "components/Avatar";

import { useSafeTokens } from "context/safeTokens";
import { useDAO } from "context/dao";
import { useWeb3Auth } from "context/web3Auth";
import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";
import MuiSelect from "components/Select";
import { beautifyHexToken } from "utils";
import Switch from "components/Switch";
import RolesListModal from "../RolesListModal";
import useTerminology from 'hooks/useTerminology';
import { isValidUrl } from 'utils';
import { CHAIN_INFO } from 'constants/chainInfo';
import { editDraftTaskAction, editTaskAction, convertDraftTaskAction } from "store/actions/task";
import useSafe from "hooks/useSafe";
import theme from "theme";
import moment from "moment";
import InviteMemberModal from "../InviteMemberModal";


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
        padding: ' 27px 27px 80px 27px !important',
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
    modalRow: {
        width: '400px',
        marginBottom: '35px !important'
    },
    optionalBox: {
        width: '110px',
        height: '25px',
        borderRadius: '100px !important',
        backgroundColor: 'rgba(118, 128, 141, 0.05) !important'
    },
    divider: {
        width: 210,
        border: '2px solid #C94B32',
        margin: '35px 0 !important'
    },
    tabBtn: {
        background: '#FFFFFF !important',
        color: '#C94B32 !important',
        opacity: '0.6 !important',
        boxShadow: '1px 2px 5px rgba(27, 43, 65, 0.12), 0px 0px 5px rgba(201, 75, 50, 0.18) !important',
        borderRadius: '5px !important',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'center !important',
        cursor: 'pointer',
        '&.active': {
            opacity: '1 !important',
            boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1) !important',
        }
    },
    rolesBox: {
        background: 'hsla(214, 9%, 51%, .05) !important',
        borderRadius: '5px !important',
        boxShadow: 'inset 1px 0 4px rgba(27, 43, 65, .1) !important',
        marginBottom: '20px !important',
        marginTop: '20px !important',
        padding: '16px !important',
        width: '100%',
    },
    addRoleBtn: {
        height: '40px !important',
        width: '40px !important',
    },
    rolePill: {
        width: 107,
        height: 22,
        borderRadius: '100px !important',
        display: "flex !important",
        alignItems: "center !important",
        justifyContent: "space-between !important",
        marginRight: '5px !important',
        marginBottom: '5px !important',
        padding: '0 5px !important'
    },
    roleAvatar: {
        height: 14,
        width: 14,
        borderRadius: '50% !important',
        marginRight: '5px !important'
    },
    deleteBtn: {
        height: '20px !important',
        width: '20px !important',
        borderRadius: '5px !important',
        background: 'rgba(27, 43, 65, 0.2) !important',
        marginleft: '18px !important',
        cursor: 'pointer !important',
        marginLeft: '18px !important'
    },
    heading: {
        fontSize: "32px !important",
        margin: "20px 0 35px 0 !important"
    },
    createBtn: {
        width: '125px',
        height: '40px',
        color: '#C94B32 !important',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'space-around !important'
    },
}));

interface Props {
    open: boolean;
    closeModal(): any;
    task: any;
}

export default ({ open, closeModal, task }: Props) => {
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const { DAO } = useDAO();
    // @ts-ignore
    const { user } = useAppSelector(store => store.session);
    // @ts-ignore
    const { editTaskLoading, editDraftTaskLoading, convertDraftTaskLoading } = useAppSelector(store => store.task);
    const { safeTokens } = useSafeTokens();
    const { activeSafes } = useSafe();
    const { account, chainId } = useWeb3Auth();
    const { transformTask, transformWorkspace, transformRole } = useTerminology(_get(DAO, 'terminologies', null));

    // const [contributionType, setContributionType] = useState(task.contributionType);
    const [contributionType, setContributionType] = useState((task.validRoles.length > 0 || task.invitations.length) > 0 ? true : false);
    const [isSingleContributor, setIsSingleContributor] = useState(task.isSingleContributor);
    const [isFilterRoles, setIsFilterRoles] = useState(task.isFilterRoles);
    const [openRolesList, setOpenRolesList] = useState(false);
    const [roleType, setRoleType] = useState('');
    const [validRoles, setValidRoles] = useState(task.validRoles);
    const [selectedUser, setSelectedUser] = useState<any>(_find(_get(task, 'members', []), m => m?.status === 'approved')?.member?._id || null);
    const [name, setName] = useState<string>(task.name);
    const [desc, setDesc] = useState<string>(task.description);
    const [dchannel, setDChannel] = useState(task.discussionChannel);
    const [deadline, setDeadline] = useState(task.deadline ? moment(task.deadline, 'YYYY-MM-DD') : moment());
    const [projectId, setProjectId] = useState(task.project ? task.project._id : null);
    const [subLink, setSubLink] = useState(task.submissionLink);
    const [reviewer, setReviewer] = useState(task.reviewer ? task.reviewer._id : null);
    const [amount, setAmount] = useState(task.compensation?.amount || 0);
    const [currency, setCurrency] = useState<string>(task.compensation?.currency || '');
    const [safeAddress, setSafeAddress] = useState<string>(task.compensation?.safeAddress || _get(DAO, 'safes[0].address', null));
    const [showSuccess, setShowSuccess] = useState(false);

    const [errorName, setErrorName] = useState('');
    const [errorDesc, setErrorDesc] = useState('');
    const [errorDchannel, setErrorDchannel] = useState('');
    const [errorSublink, setErrorSublink] = useState('');
    const [errorDeadline, setErrorDeadline] = useState('');
    const [errorApplicant, setErrorApplicant] = useState('');
    const [errorReviewer, setErrorReviewer] = useState('');
    const [errorCurrency, setErrorCurrency] = useState<boolean>(false);
    const [errorTaskValue, setErrorTaskValue] = useState<boolean>(false);

    const [editType, setEditType] = useState('');

    const [invitations, setInvitations] = useState(task.invitations);
    const [openInviteMember, setOpenInviteMember] = useState(false);

    const getrolename = (roleId: any) => {

        for (let index = 0; index < Object.keys(_get(DAO, 'discord', {})).length; index++) {
            const element = Object.keys(_get(DAO, 'discord', {}))[index];
            const rolename_discord = _find(DAO.discord[element].roles, r => r.id === roleId)
            if (rolename_discord) {
                return rolename_discord.name
            }
        }
        return "";
    };

    const getroleColor = (roleId: any) => {

        if (roleId == "role1" || roleId == "role2" || roleId == "role3" || roleId == "role4") {
            if (roleId === 'role1')
                return { pill: 'rgba(146, 225, 168, 0.3)', circle: 'rgba(146, 225, 168, 1)' };
            else if (roleId === 'role2')
                return { pill: 'rgba(137,179,229,0.3)', circle: 'rgba(137,179,229,1)' };
            else if (roleId === 'role3')
                return { pill: 'rgba(234,100,71,0.3)', circle: 'rgba(234,100,71,1)' };
            else if (roleId === 'role4')
                return { pill: 'rgba(146, 225, 168, 0.3)', circle: 'rgba(146, 225, 168, 1)' };
        }
        for (let index = 0; index < Object.keys(_get(DAO, 'discord', {})).length; index++) {
            const element = Object.keys(_get(DAO, 'discord', {}))[index];
            const rolename_discord = _find(DAO.discord[element].roles, r => r.id === roleId)
            if (rolename_discord) {
                return { pill: `${_get(rolename_discord, 'roleColor', '#99aab5')}50`, circle: _get(rolename_discord, 'roleColor', '#99aab5') }
            }
        }
        return { pill: '#99aab550', circle: '#99aab5' };
    };

    useEffect(() => { setReviewer(task.reviewer ? task?.reviewer?._id : null) }, [task])

    useEffect(() => {
        if (editTaskLoading === false) {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                closeModal();
            }, 3000);
        }
    }, [editTaskLoading]);

    useEffect(() => {
        if (editDraftTaskLoading === false) {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                closeModal();
            }, 3000);
        }
    }, [editDraftTaskLoading]);

    useEffect(() => {
        if (convertDraftTaskLoading === false) {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                closeModal();
            }, 3000);
        }
    }, [convertDraftTaskLoading]);

    const eligibleContributors = useMemo(() => {
        return _get(DAO, 'members', []).filter((m: any) => (reviewer || "").toLowerCase() !== m.member._id)
            .map((item: any) => { return { label: item.member.name && item.member.name !== "" ? `${item.member.name}  (${beautifyHexToken(item.member.wallet)})` : beautifyHexToken(item.member.wallet), value: item.member._id } });
    }, [DAO, selectedUser, reviewer]);


    const eligibleReviewers = useMemo(() => {
        return _get(DAO, 'members', []).filter((m: any) => _get(selectedUser, "_id", "").toLowerCase() !== m.member._id.toLowerCase() && (m.role === 'role1' || m.role === 'role2') && m.deletedAt === null)
            .map((item: any) => { return { label: { name: item.member.name, wallet: item.member.wallet }, value: item.member._id } });

    }, [DAO, reviewer, selectedUser]);

    const eligibleProjects = useMemo(() => {
        if(user) {
            return _get(DAO, 'projects', []).filter((p: any) => _find(p.members, m => m._id === user._id)).map((item: any) => { return { label: item.name, value: item._id } })
        }
        return []
    }, [DAO, reviewer, selectedUser]);

    const handleChangeCompensationAmount = (e: any) => {
        setAmount(e);
        setErrorTaskValue(false);
    }

    const handleChangeCurrency = (e: any) => {
        setCurrency(e);
        setErrorCurrency(false);
    }

    const handleSetApplicant = (value: string) => {
        let user = _find(DAO.members, m => m.member._id === value);
        setSelectedUser({ _id: user.member._id, address: user.wallet });
    }

    const handleRemoveRole = (role: any) => {
        let newRoles = validRoles.filter((item: any) => item !== role)
        setValidRoles(newRoles)
    }

    const handleRemoveInvitation = (invite: any) => {
        let newInvites = invitations.filter((item: any) => item.address !== invite.address)
        setInvitations(newInvites)
    }

    const handleEditTask = () => {
        if (name === '') {
            setErrorName('Enter name');
            let e = document.getElementById('error-name');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else if (desc === '') {
            let e = document.getElementById('error-desc');
            setErrorDesc('Enter description');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else if (dchannel && !isValidUrl(dchannel)) {
            setErrorDchannel('Enter a valid link');
            let e = document.getElementById('error-dchannel');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else if (deadline === null) {
            setErrorDeadline('Enter deadline')
            let e = document.getElementById('error-deadline');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else if (subLink && !isValidUrl(subLink)) {
            setErrorSublink('Enter a valid link');
            let e = document.getElementById('error-sublink');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        // else if (contributionType === 'assign' && selectedUser === null) {
        //     setErrorApplicant('Select an applicant');
        //     let e = document.getElementById('error-applicant');
        //     if (e) {
        //         e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
        //     }
        //     return;
        // }
        else if (currency === '') {
            setErrorCurrency(true);
            let e = document.getElementById('error-currency-amt');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else if (amount === 0) {
            setErrorTaskValue(true);
            let e = document.getElementById('error-currency-amt');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else if (reviewer === null) {
            setErrorReviewer('Select a reviewer');
            let e = document.getElementById('error-reviewer');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else {
            setEditType('Edit');
            let tempLink, tempSub = null;
            if (dchannel && dchannel !== '') {
                tempLink = dchannel;
                if (tempLink.indexOf('https://') === -1 && tempLink.indexOf('http://') === -1) {
                    tempLink = 'https://' + tempLink;
                }
            }
            if (subLink && subLink !== '') {
                tempSub = subLink;
                if (tempSub !== '' && tempSub.indexOf('https://') === -1 && tempSub.indexOf('http://') === -1) {
                    tempSub = 'https://' + tempSub;
                }
            }

            let symbol = _find(safeTokens[safeAddress], tkn => tkn.tokenAddress === currency)
            symbol = _get(symbol, 'token.symbol', 'SWEAT')

            let members = _get(task, 'members', [])

            if (
                (task.isSingleContributor !== isSingleContributor) ||
                (task.isFilterRoles !== isFilterRoles) ||
                !_isEqual(task.validRoles, validRoles)
            ) {
                members = []
            }

            // members = contributionType === 'assign' && selectedUser ? [{ member: selectedUser._id, status: 'approved' }] : members;

            let taskOb: any = {};
            taskOb.name = name;
            taskOb.description = desc;
            taskOb.project = projectId;
            taskOb.discussionChannel = tempLink;
            taskOb.deadline = moment(deadline).format('YYYY-MM-DD');
            taskOb.submissionLink = tempSub ? tempSub : '';
            taskOb.compensation = { currency: currency, amount, symbol, safeAddress: safeAddress };
            // taskOb.contributionType = contributionType;
            taskOb.contributionType = 'open';
            taskOb.isSingleContributor = isSingleContributor;
            taskOb.isFilterRoles = isFilterRoles;
            taskOb.validRoles = isFilterRoles ? validRoles : [];
            taskOb.reviewer = reviewer;
            taskOb.invitations = invitations;
            taskOb.members = members;
            console.log("finalk invitations : ", invitations)
            dispatch(editTaskAction({ payload: taskOb, daoUrl: _get(DAO, 'url', ''), taskId: task._id }))
        }
    }

    const handleEditDraftTask = () => {
        let tempLink, tempSub = null;
        if (name === '') {
            setErrorName('Enter name');
            let e = document.getElementById('error-name');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        if (dchannel && dchannel !== '') {
            tempLink = dchannel;
            if (tempLink.indexOf('https://') === -1 && tempLink.indexOf('http://') === -1) {
                tempLink = 'https://' + tempLink;
            }
        }
        if (subLink && subLink !== '') {
            tempSub = subLink;
            if (tempSub !== '' && tempSub.indexOf('https://') === -1 && tempSub.indexOf('http://') === -1) {
                tempSub = 'https://' + tempSub;
            }
        }
        let symbol = _find(safeTokens[safeAddress], tkn => tkn.tokenAddress === currency)
        symbol = _get(symbol, 'token.symbol', 'SWEAT');

        setEditType('Edit');

        let tsk: any = {};
        tsk.name = name;
        tsk.description = desc;
        tsk.applicant = selectedUser;
        tsk.projectId = projectId;
        tsk.discussionChannel = tempLink;
        tsk.deadline = deadline;
        tsk.submissionLink = tempSub ? tempSub : '';
        tsk.compensation = { currency: currency, amount, symbol, safeAddress: safeAddress };
        tsk.reviewer = reviewer;
        // tsk.contributionType = contributionType;
        tsk.contributionType = 'open';
        tsk.isSingleContributor = isSingleContributor;
        tsk.isFilterRoles = isFilterRoles;
        tsk.validRoles = validRoles;
        tsk.invitations = invitations;

        dispatch(editDraftTaskAction({ payload: tsk, daoUrl: _get(DAO, 'url', ''), taskId: _get(task, '_id', '') }))
    }

    const handleConvertDraftTask = () => {
        if (name === '') {
            setErrorName('Enter name');
            let e = document.getElementById('error-name');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else if (desc === '') {
            let e = document.getElementById('error-desc');
            setErrorDesc('Enter description');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else if (dchannel && !isValidUrl(dchannel)) {
            setErrorDchannel('Enter a valid link');
            let e = document.getElementById('error-dchannel');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else if (deadline === null) {
            setErrorDeadline('Enter deadline')
            let e = document.getElementById('error-deadline');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else if (subLink && !isValidUrl(subLink)) {
            setErrorSublink('Enter a valid link');
            let e = document.getElementById('error-sublink');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        // else if (contributionType === 'assign' && selectedUser === null) {
        //     setErrorApplicant('Select an applicant');
        //     let e = document.getElementById('error-applicant');
        //     if (e) {
        //         e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
        //     }
        //     return;
        // }
        else if (currency === '') {
            setErrorCurrency(true);
            let e = document.getElementById('error-currency-amt');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else if (amount === 0) {
            setErrorTaskValue(true);
            let e = document.getElementById('error-currency-amt');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else if (reviewer === null) {
            setErrorReviewer('Select a reviewer');
            let e = document.getElementById('error-reviewer');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        else {
            setEditType('Convert');
            let tempLink, tempSub = null;
            if (dchannel && dchannel !== '') {
                tempLink = dchannel;
                if (tempLink.indexOf('https://') === -1 && tempLink.indexOf('http://') === -1) {
                    tempLink = 'https://' + tempLink;
                }
            }
            if (subLink && subLink !== '') {
                tempSub = subLink;
                if (tempSub !== '' && tempSub.indexOf('https://') === -1 && tempSub.indexOf('http://') === -1) {
                    tempSub = 'https://' + tempSub;
                }
            }
            let symbol = _find(safeTokens[safeAddress], tkn => tkn.tokenAddress === currency)
            symbol = _get(symbol, 'token.symbol', 'SWEAT')

            let taskOb: any = {};
            taskOb.daoId = DAO?._id;
            taskOb.name = name;
            taskOb.description = desc;
            taskOb.applicant = selectedUser;
            taskOb.projectId = projectId;
            taskOb.discussionChannel = tempLink;
            taskOb.deadline = moment(deadline).format('YYYY-MM-DD');
            taskOb.submissionLink = tempSub ? tempSub : '';
            taskOb.compensation = { currency: currency, amount, symbol, safeAddress: safeAddress };
            taskOb.reviewer = reviewer;
            // taskOb.contributionType = contributionType;
            taskOb.contributionType = 'open';
            taskOb.isSingleContributor = isSingleContributor;
            taskOb.isFilterRoles = isFilterRoles;
            taskOb.validRoles = isFilterRoles ? validRoles : [];
            taskOb.invitations = invitations;
            dispatch(convertDraftTaskAction({ payload: taskOb, daoUrl: _get(DAO, 'url', ''), taskId: _get(task, '_id', '') }))
        }
    }

    const handleChangeContributionType = () => {
        // if (contributionType === 'open') {
        //     setContributionType('assign');
        //     setIsFilterRoles(true);
        //     setValidRoles([]);
        //     setInvitations([]);
        // }
        // else {
        //     setContributionType('open')
        // }

        if (contributionType === true) {
            setContributionType(false);
            setIsFilterRoles(true);
            setValidRoles([]);
            setInvitations([]);
        }
        else {
            setContributionType(true)
        }
    }

    return (
        <Drawer
            PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
            anchor={'right'}
            open={open}
            sx={{ zIndex: theme.zIndex.appBar + 1 }}
        >
            {
                showSuccess
                    ?
                    <Box className={classes.modalConatiner}>
                        <Box sx={{ width: '100%', height: '100%' }} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                            <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={closeModal}>
                                <img src={CloseSVG} />
                            </IconButton>
                            <img src={createTaskSvg} alt="frame-icon" />
                            <Typography color="primary" variant="subtitle1" className={classes.heading}>Task {editType === 'Edit' ? 'edited!' : 'converted!'}</Typography>
                            <Typography style={{ textAlign: 'center', fontStyle: 'italic', color: ' #76808D' }}>The Task has been {editType === 'Edit' ? 'edited' : 'converted'} successfully.<br />You will be redirected in a few seconds.</Typography>
                        </Box>
                    </Box>
                    :
                    <>
                        <InviteMemberModal
                            open={openInviteMember}
                            closeModal={() => setOpenInviteMember(false)}
                            hideBackdrop={true}
                            selectedApplicants={invitations}
                            reviewer={reviewer}
                            handleInvitations={(value: any) => setInvitations(value)}
                        />
                        <RolesListModal
                            open={openRolesList}
                            closeModal={() => setOpenRolesList(false)}
                            hideBackdrop={true}
                            validRoles={validRoles}
                            roleType={roleType}
                            handleValidRoles={(value) => setValidRoles(value)}
                        />
                        <Box className={classes.modalConatiner}>
                            <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={closeModal}>
                                <img src={CloseSVG} />
                            </IconButton>

                            <Box display="flex" flexDirection="column" alignItems="center" className={classes.modalRow}>
                                <img src={createTaskSvg} alt="project-resource" />
                                <Typography className={classes.modalTitle}>Edit Task</Typography>
                            </Box>

                            <Box className={classes.modalRow} id="error-name">
                                <TextInput
                                    label="Name of the task"
                                    placeholder="Super task"
                                    fullWidth
                                    value={name}
                                    inputProps={{ maxLength: 150 }}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setName(e.target.value); setErrorName('') }}
                                    error={errorName !== ''}
                                    id={errorName !== '' ? "outlined-error-helper-text" : ""}
                                    helperText={errorName}
                                />
                            </Box>

                            <Box className={classes.modalRow} id="error-desc">
                                <TextEditor
                                    fullWidth
                                    height={130}
                                    width={400}
                                    placeholder="Marketing BtoB"
                                    label="Short description"
                                    value={desc}
                                    onChange={(value: string) => { setDesc(value); setErrorDesc('') }}
                                    error={errorDesc !== ''}
                                    id={errorDesc !== '' ? "outlined-error-helper-text" : ""}
                                    helperText={errorDesc}
                                />
                            </Box>

                            <Box className={classes.modalRow} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                                <Box sx={{ width: 218 }} id="error-dchannel">
                                    <TextInput
                                        label="Discussion channel"
                                        placeholder="Super project"
                                        fullWidth
                                        value={dchannel}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDChannel(e.target.value); setErrorDchannel('') }}
                                        error={errorDchannel !== ''}
                                        id={errorDchannel !== '' ? "outlined-error-helper-text" : ""}
                                        helperText={errorDchannel}
                                    />
                                </Box>
                                <Box sx={{ width: 160 }} id="error-deadline">
                                    <TextInput
                                        label="Deadline"
                                        fullWidth
                                        date
                                        minDate={moment()}
                                        value={deadline || undefined}
                                        onChange={(e: any) => { setDeadline(e); setErrorDeadline('') }}
                                        error={errorDeadline !== ''}
                                        id={errorDeadline !== '' ? "outlined-error-helper-text" : ""}
                                        helperText={errorDeadline}
                                    />
                                </Box>
                            </Box>

                            <Box className={classes.modalRow} sx={{ margin: '0px !important' }}>
                                <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ marginBottom: '10px' }}>
                                    <Typography sx={{ color: '#76808D', fontWeight: '700', fontSize: '16px' }}>In project</Typography>
                                    <Box className={classes.optionalBox} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                        <Typography sx={{ color: 'rgba(118, 128, 141, 0.5)', fontWeight: '700' }}>Optional</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ width: '100%' }}>
                                    <MuiSelect
                                        options={eligibleProjects}
                                        selected={projectId}
                                        setSelectedValue={(value) => setProjectId(value)}
                                    />
                                </Box>
                            </Box>

                            <Box className={classes.divider}></Box>

                            <Box className={classes.modalRow} id="error-reviewer">
                                <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ marginBottom: '10px' }}>
                                    <Typography sx={{ color: '#76808D', fontWeight: '700', fontSize: '16px' }}>Reviewer</Typography>
                                </Box>
                                <Box sx={{ width: '100%' }}>
                                    <MuiSelect
                                        options={eligibleReviewers}
                                        type={"members"}
                                        selected={reviewer}
                                        setSelectedValue={(value) => { setReviewer(value); setErrorReviewer('') }}
                                        errorSelect={errorReviewer}
                                    />
                                </Box>
                            </Box>

                            {/* <Box className={classes.modalRow}>
                            <Box sx={{ marginBottom: '10px' }}><Typography sx={{ color: '#76808D', fontWeight: '700', fontSize: '16px' }}>Contribution</Typography></Box>
                            <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                                <Box
                                    className={contributionType === 'assign' ? `${classes.tabBtn} active` : `${classes.tabBtn}`}
                                    sx={{ width: '204px', height: '50px' }}
                                    onClick={() => { setContributionType('assign'); setIsFilterRoles(false); setValidRoles([]); setIsSingleContributor(false); }}
                                >
                                    <Typography sx={{ fontSize: '20px' }}>ASSIGN MEMBER</Typography>
                                </Box>
                                <Box
                                    className={contributionType === 'open' ? `${classes.tabBtn} active` : `${classes.tabBtn}`}
                                    sx={{ width: '176px', height: '50px' }}
                                    onClick={() => { setContributionType('open'); setSelectedUser(null); }}
                                >
                                    <Typography sx={{ fontSize: '20px' }}>OPEN</Typography>
                                </Box>
                            </Box>

                            {
                                contributionType === 'assign' &&
                                <>
                                    <Box sx={{ margin: '18px 0 9px 0' }}>
                                        <Typography sx={{ fontSize: '14px', color: 'rgba(118, 128, 141, 0.5)' }}>This member will be in charge of completing this task</Typography>
                                    </Box>
                                    <Box sx={{ width: '100%' }} id="error-applicant">
                                        <MuiSelect
                                            options={eligibleContributors}
                                            selected={selectedUser}
                                            setSelectedValue={(value) => { handleSetApplicant(value); setErrorApplicant('') }}
                                            errorSelect={errorApplicant}
                                        />
                                    </Box>
                                </>
                            }

                            {
                                contributionType === 'open' &&
                                <Box sx={{ width: '100%', marginTop: '18px' }} display={"flex"} flexDirection={"column"}>
                                    <Box sx={{ width: '100%', marginBottom: '20px' }} display={"flex"} alignItems={"flex-start"}>
                                        <Switch checkedSVG="checkmark" onChange={() => setIsSingleContributor((prev: boolean) => !prev)} />
                                        <Box>
                                            <Typography sx={{ fontSize: '16px', color: '#76808D', marginBottom: '6px' }}>SINGLE CONTRIBUTOR</Typography>
                                            <Typography sx={{ fontSize: '14px', color: '#76808D', opacity: '0.5' }}>The reviewer will pick a contributor from the applicants (if unchecked, everyone can contribute)</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ width: '100%' }} display={"flex"} alignItems={"center"}>
                                        <Switch checkedSVG="checkmark" onChange={() => setIsFilterRoles((prev: boolean) => !prev)} />
                                        <Box>
                                            <Typography sx={{ fontSize: '16px', color: '#76808D', marginBottom: '6px' }}>FILTER BY ROLES (DISCORD)</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            }

                            {
                                isFilterRoles && validRoles &&
                                <Box className={classes.rolesBox} display={"flex"} justifyContent={"space-between"} alignItems={"flex-start"}>
                                    <Box display={"flex"} flexDirection={"column"}>
                                        {
                                            validRoles.map((item: any, index: number) => {
                                                return (
                                                    <Box display={"flex"} alignItems={"center"} sx={index === validRoles.length - 1 ? { marginBottom: '0px' } : { marginBottom: '10px' }} key={index}>
                                                        <Chip
                                                            label={item == "role1" || item == "role2" || item == "role3" || item == "role4" ? transformRole(item).label : getrolename(item)}
                                                            className={classes.rolePill}
                                                            avatar={<Box sx={{ background: getroleColor(item).circle, borderRadius: '50%' }}></Box>}
                                                            sx={{ background: getroleColor(item).pill }}
                                                        />
                                                        <Box className={classes.deleteBtn} onClick={() => handleRemoveRole(item)} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                                            <CgClose color='#FFF' />
                                                        </Box>
                                                    </Box>
                                                )
                                            })
                                        }
                                    </Box>
                                    <Button variant="contained" color="secondary" className={classes.addRoleBtn} onClick={() => setOpenRolesList(true)}>
                                        <HiOutlinePlus size={24} color='#C94B32' />
                                    </Button>
                                </Box>
                            }
                        </Box> */}

                            <Box className={classes.modalRow}>
                                <Box sx={{ marginBottom: '10px' }}><Typography sx={{ color: '#76808D', fontWeight: '700', fontSize: '16px' }}>Contributors</Typography></Box>
                                <Box sx={{ margin: '1rem 0' }} display={"flex"} alignItems={"center"}>
                                    <Box sx={{ marginRight: '11px' }}><Typography sx={{ color: validRoles.length === 0 && invitations.length === 0 ? '#C94B32' : '#76808D' }}>OPEN FOR ALL</Typography></Box>
                                    <Box><Switch checked={contributionType} unidirectional={false} checkedSVG="lock" onChange={handleChangeContributionType} /></Box>
                                    <Box sx={{ marginLeft: '3px' }}><Typography sx={{ color: (validRoles.length > 0 || invitations.length > 0) ? '#C94B32' : '#76808D' }}>FILTER BY</Typography></Box>
                                </Box>

                                {
                                    contributionType === true &&
                                    <Box sx={{ width: '100%' }}>
                                        <Box sx={{ marginBottom: '1rem' }} display={"flex"} alignItems={"flex-start"} justifyContent={"space-between"}>
                                            <Box display={"flex"} flexDirection={"column"}>
                                                <Typography sx={{ color: '#76808D', fontSize: '16px', fontWeight: '700', opacity: '0.3' }}>Lomads Roles</Typography>
                                                <Box display={"flex"} flexWrap={"wrap"} sx={{ marginTop: '5px' }}>

                                                    {
                                                        validRoles && validRoles.map((item: any, index: number) => {
                                                            if (item == "role1" || item == "role2" || item == "role3" || item == "role4") {
                                                                return (
                                                                    <Box className={classes.rolePill} sx={{ background: getroleColor(item).pill }} key={index}>
                                                                        <Box display={"flex"} alignItems={"center"}>
                                                                            <Box className={classes.roleAvatar} sx={{ background: getroleColor(item).circle }}></Box>
                                                                            <Typography sx={{ fontSize: 12, color: '#76808D' }}>{transformRole(item).label.length > 5 ? transformRole(item).label.substring(0, 5) + '...' : transformRole(item).label}</Typography>
                                                                        </Box>
                                                                        <Box sx={{ cursor: 'pointer' }} display={"flex"} alignItems={"center"} justifyContent={"center"} onClick={() => handleRemoveRole(item)}>
                                                                            <IoIosClose color="#76808D" size={24} />
                                                                        </Box>
                                                                    </Box>
                                                                )
                                                            }
                                                            else return null
                                                        })
                                                    }

                                                </Box>
                                            </Box>
                                            <Button
                                                size="small" variant="contained" className={classes.createBtn} color="secondary" onClick={() => { setRoleType('Lomads'); setOpenRolesList(true) }}>
                                                <AddIcon sx={{ fontSize: 18 }} /> ADD
                                            </Button>
                                        </Box>
                                        {
                                            _get(DAO, 'discord', null) &&
                                            <Box sx={{ marginBottom: '1rem' }} display={"flex"} alignItems={"flex-start"} justifyContent={"space-between"}>
                                                <Box display={"flex"} flexDirection={"column"}>
                                                    <Typography sx={{ color: '#76808D', fontSize: '16px', fontWeight: '700', opacity: '0.3' }}>Discord Roles</Typography>
                                                    <Box display={"flex"} flexWrap={"wrap"} sx={{ marginTop: '5px' }}>

                                                        {
                                                            validRoles && validRoles.map((item: any, index: number) => {
                                                                if (item !== "role1" && item !== "role2" && item !== "role3" && item !== "role4") {
                                                                    return (
                                                                        <Box className={classes.rolePill} sx={{ background: getroleColor(item).pill }} key={index}>
                                                                            <Box display={"flex"} alignItems={"center"}>
                                                                                <Box className={classes.roleAvatar} sx={{ background: getroleColor(item).circle }}></Box>
                                                                                <Typography sx={{ fontSize: 14, color: '#76808D' }}>{getrolename(item).length > 5 ? getrolename(item).substring(0, 5) + '...' : getrolename(item)}</Typography>
                                                                            </Box>
                                                                            <Box sx={{ cursor: 'pointer' }} display={"flex"} alignItems={"center"} justifyContent={"center"} onClick={() => handleRemoveRole(item)}>
                                                                                <IoIosClose color="#76808D" size={24} />
                                                                            </Box>
                                                                        </Box>
                                                                    )
                                                                }
                                                                else return null
                                                            })
                                                        }

                                                    </Box>
                                                </Box>
                                                <Button
                                                    size="small" variant="contained" className={classes.createBtn} color="secondary" onClick={() => { setRoleType('Discord'); setOpenRolesList(true) }}>
                                                    <AddIcon sx={{ fontSize: 18 }} /> ADD
                                                </Button>
                                            </Box>
                                        }

                                        <Box sx={{ marginBottom: '1rem' }} display={"flex"} alignItems={"flex-start"} justifyContent={"space-between"}>
                                            <Box display={"flex"} flexDirection={"column"}>
                                                <Typography sx={{ color: '#76808D', fontSize: '16px', fontWeight: '700', opacity: '0.3' }}>Invitation</Typography>
                                                <Box display={"flex"} flexDirection={'column'} sx={{ marginTop: '1rem' }}>

                                                    {
                                                        invitations.length > 0 && invitations.map((item: any, index: number) => {
                                                            return (
                                                                <Box display={"flex"} sx={{ marginBottom: '0.5rem' }} key={index}>
                                                                    <Avatar name={item.name} wallet={item.address} />
                                                                    <Box sx={{ cursor: 'pointer', marginLeft: '1rem' }} onClick={() => handleRemoveInvitation(item)}>
                                                                        <IoIosClose color="#76808D" size={24} />
                                                                    </Box>
                                                                </Box>

                                                            )
                                                        })
                                                    }
                                                </Box>
                                            </Box>
                                            <Button
                                                size="small" variant="contained" className={classes.createBtn} color="secondary" onClick={() => setOpenInviteMember(prev => !prev)}>
                                                <AddIcon sx={{ fontSize: 18 }} /> INVITE
                                            </Button>
                                        </Box>
                                    </Box>
                                }
                            </Box>

                            <Box className={classes.modalRow}>
                                <Box sx={{ marginBottom: '10px' }}><Typography sx={{ color: '#76808D', fontWeight: '700', fontSize: '16px' }}>Task Performance</Typography></Box>
                                <Box sx={{ margin: '1rem 0' }} display={"flex"} alignItems={"center"}>
                                    <Box sx={{ marginRight: '11px' }}><Typography sx={{ color: !isSingleContributor ? '#C94B32' : '#76808D' }}>INVITE SUBMISSION</Typography></Box>
                                    <Box><Switch checked={isSingleContributor} unidirectional={false} checkedSVG="lock" onChange={() => setIsSingleContributor((prev: boolean) => !prev)} /></Box>
                                    <Box sx={{ marginLeft: '3px' }}><Typography sx={{ color: isSingleContributor ? '#C94B32' : '#76808D' }}>APPLICATION FIRST,<br /><span style={{ fontSize: '12px' }}>THEN INVITE SUBMISSION</span></Typography></Box>
                                </Box>
                            </Box>

                            <Box className={classes.modalRow} sx={{ margin: '0px !important' }} id="error-sublink">
                                <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ marginBottom: '10px' }}>
                                    <Typography sx={{ color: '#76808D', fontWeight: '700', fontSize: '16px' }}>Submission Link</Typography>
                                    <Box className={classes.optionalBox} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                        <Typography sx={{ color: 'rgba(118, 128, 141, 0.5)', fontWeight: '700' }}>Optional</Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '14px', color: 'rgba(118, 128, 141, 0.5)' }}>Provide a link here only if the submissions will<br />come from trusted contributors</Typography>
                                </Box>
                                <TextInput
                                    placeholder="Google driver folder, Notion page, Github..."
                                    fullWidth
                                    value={subLink}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSubLink(e.target.value); setErrorSublink('') }}
                                    error={errorSublink !== ''}
                                    id={errorSublink !== '' ? "outlined-error-helper-text" : ""}
                                    helperText={errorSublink}
                                />
                            </Box>

                            <Box className={classes.divider}></Box>

                            <Box className={classes.modalRow} id="error-reviewer">
                                <Box
                                    component="form"
                                    // sx={{
                                    //     '& .MuiTextField-root': { m: 1, width: '350px' },
                                    // }}
                                    noValidate
                                    autoComplete="off"
                                >
                                    <TextInput
                                        id="outlined-select-currency"
                                        select
                                        fullWidth
                                        label="Treasury"
                                        disabled={DAO?.safes.length < 2}
                                        value={safeAddress}
                                        onChange={(e: any) => {
                                            setSafeAddress(e.target.value)
                                            handleChangeCurrency(_get(_get(safeTokens, e.target.value, []), '[0].tokenAddress', 'SWEAT'))
                                        }}
                                    >
                                        {
                                            DAO?.safes?.map((safe: any) => {
                                                return (
                                                    <MenuItem key={safe?.address} value={safe?.address}>{(safe?.name || "Multi-sig wallet") + " (" + beautifyHexToken(safe?.address) + ")"}</MenuItem>
                                                )
                                            })
                                        }
                                    </TextInput>
                                </Box>
                            </Box>

                            <Box className={classes.modalRow} id="error-currency-amt">
                                <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ marginBottom: '10px' }}>
                                    <Typography sx={{ color: '#76808D', fontWeight: '700', fontSize: '16px' }}>Compensation</Typography>
                                </Box>
                                <CurrencyInput
                                    value={amount}
                                    onChange={(value: any) => handleChangeCompensationAmount(value)}
                                    options={_get(safeTokens, safeAddress, []).map((token: any) => { return { label: token?.token?.symbol, value: token?.tokenAddress } })}
                                    dropDownvalue={currency}
                                    onDropDownChange={(value: any) => {
                                        handleChangeCurrency(value)
                                    }}
                                    variant="primary"
                                    errorCurrency={errorCurrency}
                                    errorProjectValue={errorTaskValue}
                                />
                            </Box>

                            {
                                task.draftedAt
                                    ?
                                    <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px', padding: "30px 0 20px" }}>
                                        <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                                            <Button sx={{ mr: 1 }} onClick={() => handleEditDraftTask()} loading={editDraftTaskLoading} disabled={editDraftTaskLoading} fullWidth variant='outlined' size="small">SAVE DRAFT</Button>
                                            <Button sx={{ ml: 1 }} onClick={() => handleConvertDraftTask()} loading={convertDraftTaskLoading} disabled={convertDraftTaskLoading} fullWidth variant='contained' size="small">CREATE</Button>
                                        </Box>
                                    </Box>
                                    :
                                    <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px', padding: "30px 0 20px" }}>
                                        <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                                            <Button sx={{ mr: 1 }} onClick={() => closeModal()} fullWidth variant='outlined' size="small">CANCEL</Button>
                                            <Button sx={{ ml: 1 }} onClick={() => handleEditTask()} loading={editTaskLoading} disabled={editTaskLoading} fullWidth variant='contained' size="small">SAVE</Button>
                                        </Box>
                                    </Box>
                            }

                        </Box>
                    </>

            }
        </Drawer>
    )
}