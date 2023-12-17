import React, { useEffect, useState, useMemo } from "react";
import { get as _get, find as _find, uniqBy as _uniqBy, sortBy as _sortBy } from 'lodash';
import { makeStyles } from '@mui/styles';
import { Grid, Box, Typography, Menu, MenuItem } from "@mui/material";

import { IoIosArrowBack } from 'react-icons/io';
import { BsCalendarCheck } from 'react-icons/bs';
import compensationStar from 'assets/svg/compensationStar.svg';
import editToken from 'assets/svg/editToken.svg';
import deleteIcon from 'assets/svg/deleteIcon.svg';
import Button from "components/Button";
import FullScreenLoader from "components/FullScreenLoader";
import { SiNotion } from "react-icons/si";
import { BsDiscord, BsGoogle, BsGithub, BsLink, BsTwitter, BsGlobe } from "react-icons/bs";
import folder from 'assets/svg/folder.svg'

import { useWeb3Auth } from 'context/web3Auth';
import { useDAO } from "context/dao";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";
import { getTaskAction } from "store/actions/task";

import {
    TelegramIcon,
    TwitterIcon,
    WhatsappIcon,
    TelegramShareButton,
    TwitterShareButton,
    WhatsappShareButton,
} from "react-share";

import copyIcon from "assets/svg/copyIcon.svg";
import shareIcon from 'assets/svg/share.svg';
import applicants from 'assets/svg/applicants.svg'
import moment from "moment";
import Avatar from "components/Avatar";
import CloseTaskModal from "modals/Tasks/CloseTaskModal";
import DeleteTaskModal from "modals/Tasks/DeleteTaskModal";
import ApplyTaskModal from "modals/Tasks/ApplyTaskModal";
import SubmitTaskModal from "modals/Tasks/SubmitTaskModal";
import ApplicantListModal from "modals/Tasks/ApplicantListModal";
import ReviewModal from "modals/Tasks/ReviewModal";
import useTask from "hooks/useTask";
import useRole from "hooks/useRole";
import EditTaskModal from "modals/Tasks/EditTaskModal";
import useTerminology from "hooks/useTerminology";

const useStyles = makeStyles((theme: any) => ({
    root: {
        // height: '100vh',
        // overflowY: 'scroll',
        // display: 'flex',
        // flexDirection: 'column',
    },
    arrowContainer: {
        width: '5% !important',
        height: '100% !important',
        borderRadius: '5px !important',
        marginRight: '0.2rem !important',
        background: '#FFF !important',
        cursor: 'pointer !important'
    },
    nameContainer: {
        width: '95% !important',
        height: '100% !important',
        borderRadius: '5px !important',
        background: '#FFF !important',
        padding: '22px !important'
    },
    nameText: {
        fontSize: '22px !important',
        lineHeight: '25px !important',
        color: '#76808D'
    },
    secondContainer: {
        width: '100%',
        height: 74,
        marginBottom: '0.2rem',
        background: '#FFF',
        borderRadius: '5px',
        padding: '0 22px !important'
    },
    thirdContainer: {
        width: '100%',
        height: 415,
    },
    fourthContainer: {
        width: '100%',
        marginTop: '23.5px !important',
        marginBottom: "64px"
    },
    descContainer: {
        width: '30%',
        height: '100%',
        background: '#FFF',
        borderRadius: '5px',
        padding: '30px 28px !important',
        marginRight: '0.2rem',
        overflow: 'hidden',
        overflowY: 'auto'
    },
    detailsContainer: {
        width: '70%',
        height: '100%',
        background: 'linear-gradient(178.31deg, #C94B32 0.74%, #A54536 63.87%)',
        borderRadius: '5px',
        padding: '0 22px !important',
    },
    closeBtn: {
        width: '190px',
        height: '40px',
        background: '#FFFFFF !important',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), - 3px - 3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '5px !important',
        fontSize: '14px !important',
        color: '#C94B32 !important',
        marginLeft: '22px !important'
    },
    iconContainer: {
        height: '40px',
        width: '40px',
        background: 'linear-gradient(180deg, #FBF4F2 0%, #EEF1F5 100%) !important',
        borderRadius: '5px !important',
        cursor: 'pointer !important',
        marginLeft: '22px !important'
    },
    otherBtn: {
        background: '#FFFFFF !important',
        height: '40px !important',
        padding: '0 20px !important',
        borderRadius: '100px !important',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'center !important',
        filter: 'drop-shadow(3px 5px 4px rgba(27, 43, 65, 0.05)) drop-shadow(-3px -3px 8px rgba(201, 75, 50, 0.1)) !important',
        marginRight: '25px !important',
        color: '#B12F15 !important',
        border: 'none'
    }
}));

export default () => {
    const classes = useStyles();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { account } = useWeb3Auth();
    const { DAO } = useDAO();
    const { taskId, daoURL } = useParams();
    // @ts-ignore
    const { setTaskLoading, Task: storeTask } = useAppSelector(store => store.task);
    const { transformTask } = useTask();

    const { transformTask: transaformLabel } = useTerminology(_get(DAO, 'terminologies'))

    const { myRole, can } = useRole(DAO, account, undefined);

    const Task = useMemo(() => {
        if (storeTask)
            return transformTask(storeTask)
    }, [storeTask])

    console.log("Task : ", Task);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [openCloseModal, setOpenCloseModal] = useState<boolean>(false);
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
    const [openApplyModal, setOpenApplyModal] = useState<boolean>(false);
    const [openSubmitModal, setOpenSubmitModal] = useState<boolean>(false);
    const [openApplicantsModal, setOpenApplicantsModal] = useState<boolean>(false);
    const [openReviewModal, setOpenReviewModal] = useState<boolean>(false);
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);

    useEffect(() => {
        if (DAO && taskId && (!Task || (Task && Task._id !== taskId)))
            dispatch(getTaskAction(taskId));
    }, [taskId, DAO]);

    const assignedUser = useMemo(() => {
        let user = _find(_get(Task, 'members', []), m => m.status === 'approved' || m.status === 'submission_accepted')
        if (user)
            return user.member
    }, [Task]);

    const amICreator = useMemo(() => {
        if (DAO && Task) {
            let user = _find(_get(DAO, 'members', []), m => _get(m, 'member.wallet', '').toLowerCase() === account?.toLowerCase())
            if (user && Task.reviewer) {
                if (user.member._id === Task.reviewer._id) {
                    return true;
                }
                else {
                    return false;
                }
            }
            return false;
        }
        return false;
    }, [account, DAO, Task])

    const applicationCount = useMemo(() => {
        if (Task) {
            let applications = _get(Task, 'members', []).filter((m: any) => (m.status !== 'rejected' && m.status !== 'submission_accepted' && m.status !== 'submission_rejected'))
            if (applications)
                return applications.length
            return 0
        }
        return 0;
    }, [Task]);

    const submissionCount = useMemo(() => {
        if (Task) {
            let submissions = _get(Task, 'members', [])?.filter((m: any) => m.submission && (m.status !== 'submission_accepted' && m.status !== 'submission_rejected'))
            if (submissions)
                return submissions.length
            return 0
        }
        return 0;
    }, [Task]);

    const taskMembers = useMemo(() => {
        return _get(Task, 'members', []).filter((m: any) => m.status !== 'rejected');
    }, [Task])

    const handleOpenApplicantsSlider = () => {
        if (taskMembers.length > 0) {
            setOpenApplicantsModal(true);
        }
    }

    const handleRenderRejectionNote = useMemo(() => {
        if (Task) {
            let user = _find(_get(Task, 'members', []), m => _get(m, 'member.wallet', '').toLowerCase() === account?.toLowerCase() && m.status === 'submission_rejected')
            if (user)
                return user.rejectionNote;
        }
        return ''
    }, [account, Task]);

    const handleParseUrl = (url: string) => {
        try {
            const link = new URL(url);
            console.log("lnk", link)
            if (link.hostname.indexOf('notion.') > -1) {
                return <SiNotion color='#B12F15' size={20} style={{ marginRight: '5px' }} />
            }
            else if (link.hostname.indexOf('discord.') > -1) {
                return <BsDiscord color='#B12F15' size={20} style={{ marginRight: '5px' }} />
            }
            else if (link.hostname.indexOf('github.') > -1) {
                return <BsGithub color='#B12F15' size={20} style={{ marginRight: '5px' }} />
            }
            else if (link.hostname.indexOf('google.') > -1) {
                return <BsGoogle color='#B12F15' size={20} style={{ marginRight: '5px' }} />
            }
            else if (link.hostname.indexOf('twitter.') > -1) {
                return <BsTwitter color='#B12F15' size={20} style={{ marginRight: '5px' }} />
            }
            else {
                return <span><BsGlobe size={20} style={{ marginRight: '5px' }} /></span>
            }
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    if (!Task || setTaskLoading || (taskId && (Task && Task._id !== taskId))) {
        return (
            <FullScreenLoader />
        )
    }

    const showSubmissions = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Box display={"flex"} alignItems={"center"}>
                    <img style={{ marginRight: '10px' }} src={applicants} />
                    <Typography sx={{ fontSize: 30, color: '#FFF' }}>{submissionCount}</Typography>
                </Box>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0' }}>{submissionCount > 1 ? 'Submissions' : 'Submission'}</Typography>
                {
                    !Task.draftedAt &&
                    <Button sx={{ color: '#C94B32' }} size="small" variant="contained" color="secondary" onClick={() => { submissionCount > 0 && setOpenReviewModal(true) }}>CHECK</Button>
                }
            </Box>
        )
    }

    const showApplicants = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Box display={"flex"} alignItems={"center"}>
                    <img style={{ marginRight: '10px' }} src={applicants} />
                    <Typography sx={{ fontSize: 30, color: '#FFF' }}>{applicationCount}</Typography>
                </Box>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0' }}>{applicationCount > 1 ? 'Applicants' : 'Applicant'}</Typography>
                {
                    !Task.draftedAt &&
                    <Button sx={{ color: '#C94B32' }} size="small" variant="contained" color="secondary" onClick={handleOpenApplicantsSlider}>CHECK</Button>
                }
            </Box>
        )
    }

    const showRejected = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>Your submission was rejected</Typography>
                <Typography dangerouslySetInnerHTML={{ __html: handleRenderRejectionNote }}></Typography>
            </Box>
        )
    }

    const showWellDone = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>Well Done!</Typography>
            </Box>
        )
    }

    const showWaitingValidation = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>Waiting<br />for validation</Typography>
            </Box>
        )
    }

    const showReviewerCheckingApplication = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>The reviewer is<br />looking at your<br />application.</Typography>
            </Box>
        )
    }

    const showFitRoleApply = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>This task<br />fit your role.</Typography>
                {
                    moment(Task.deadline).isBefore(moment(), "day") && !Task.draftedAt && !Task.isDummy
                        ?
                        null
                        :
                        <Button sx={{ color: '#C94B32' }} size="small" variant="contained" color="secondary" onClick={() => setOpenApplyModal(true)}>APPLY</Button>
                }
            </Box>
        )
    }

    const showFitRoleSubmit = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>This task<br />fit your role.</Typography>
                {
                    !Task.draftedAt && <Button sx={{ color: '#C94B32' }} size="small" variant="contained" color="secondary" onClick={() => setOpenSubmitModal(true)}>SUBMIT WORK</Button>
                }
            </Box>
        )
    }

    const showDoesNotFitRole = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>This task does not<br />fit your role.</Typography>
            </Box>
        )
    }

    const showInviteApply = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>This task<br />fit your role.</Typography>
                {
                    moment(Task.deadline).isBefore(moment(), "day") && !Task.draftedAt && !Task.isDummy
                        ?
                        null
                        :
                        <Button sx={{ color: '#C94B32' }} size="small" variant="contained" color="secondary" onClick={() => setOpenApplyModal(true)}>APPLY</Button>
                }
            </Box>
        )
    }

    const showInviteSubmit = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>This task<br />fit your role.</Typography>
                {
                    !Task.draftedAt && <Button sx={{ color: '#C94B32' }} size="small" variant="contained" color="secondary" onClick={() => setOpenSubmitModal(true)}>SUBMIT WORK</Button>
                }
            </Box>
        )
    }

    const showNotInvited = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>This task does not<br />fit your role.</Typography>
            </Box>
        )
    }

    const showNeedContributor = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>This task needs a<br />contributor.</Typography>
                {
                    moment(Task.deadline).isBefore(moment(), "day") && !Task.draftedAt && !Task.isDummy
                        ?
                        null
                        :
                        <Button sx={{ color: '#C94B32' }} size="small" variant="contained" color="secondary" onClick={() => setOpenApplyModal(true)}>APPLY</Button>
                }
            </Box>
        )
    }

    const showOpenForAll = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>Open for all.</Typography>
                {
                    !Task.draftedAt && <Button sx={{ color: '#C94B32' }} size="small" variant="contained" color="secondary" onClick={() => setOpenSubmitModal(true)}>SUBMIT WORK</Button>
                }
            </Box>
        )
    }

    const showYouAreAssigned = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>You are assigned.</Typography>
                {
                    !Task.draftedAt && <Button sx={{ color: '#C94B32' }} size="small" variant="contained" color="secondary" onClick={() => setOpenSubmitModal(true)}>SUBMIT WORK</Button>
                }
            </Box>
        )
    }

    const showUserAssigned = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>{assignedUser?.name} is assigned</Typography>
            </Box>
        )
    }

    const showTaskSubmitted = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>Task is submitted</Typography>
                {
                    amICreator && !Task.draftedAt && <Button sx={{ color: '#C94B32' }} size="small" variant="contained" color="secondary" onClick={() => setOpenReviewModal(true)}>CHECK</Button>
                }
            </Box>
        )
    }

    const showTaskStatus = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>Task has been<br />{Task.taskStatus}</Typography>
            </Box>
        )
    }

    const showRejectedSubmitAgain = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>Your submission has been rejected</Typography>
                <Typography dangerouslySetInnerHTML={{ __html: handleRenderRejectionNote }}></Typography>
                <Button sx={{ color: '#C94B32' }} size="small" variant="contained" color="secondary" onClick={() => setOpenSubmitModal(true)}>SUBMIT AGAIN</Button>
            </Box>
        )
    }

    const showSubmissionStatus = () => {
        return (
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <Typography sx={{ fontSize: 30, color: '#FFF', margin: '15px 0', lineHeight: '33px', textAlign: 'center' }}>Submission has been<br /> {Task.taskStatus}</Typography>
            </Box>
        )
    }

    const renderBody = (body: string) => {
        console.log("SHOW_SUBMISSIONS", body)
        switch (body) {
            case 'SHOW_SUBMISSIONS':
                return showSubmissions();

            case 'SHOW_APPLICATIONS':
                return showApplicants();

            case 'SUBMISSION_REJECTED':
                return showRejected();

            case 'WELL_DONE':
                return showWellDone();

            case 'WAITING_FOR_VALIDATION':
                return showWaitingValidation();

            case 'REVIEWER_LOOKING_AT_APPLICATION':
                return showReviewerCheckingApplication();

            case 'FITS_YOUR_ROLE_APPLY':
                return showFitRoleApply();

            case 'FITS_YOUR_ROLE_SUBMIT':
                return showFitRoleSubmit();




            case 'INVITE_APPLY':
                return showInviteApply();

            case 'INVITE_SUBMIT':
                return showInviteSubmit();

            case 'NOT_INVITED':
                return showNotInvited();




            case 'DOES_NOT_FIT_YOUR_ROLE':
                return showDoesNotFitRole();

            case 'TASK_NEEDS_CONTRIBUTOR':
                return showNeedContributor();

            case 'OPEN_FOR_ALL':
                return showOpenForAll();

            case 'YOU_ARE_ASSIGNED':
                return showYouAreAssigned();

            case 'USER_ASSIGNED':
                return showUserAssigned();

            case 'TASK_SUBMITTED':
                return showTaskSubmitted();

            case 'TASK_STATUS':
                return showTaskStatus();

            case 'SUBMISSION_REJECTED_SUBMIT_AGAIN':
                return showRejectedSubmitAgain();

            case 'SUBMISSION_STATUS':
                return showSubmissionStatus();

            default:
                return null;
        }
    }

    return (
        <Grid container className={classes.root}>

            <CloseTaskModal
                open={openCloseModal}
                closeModal={() => setOpenCloseModal(false)}
            />

            <DeleteTaskModal
                open={openDeleteModal}
                closeModal={() => setOpenDeleteModal(false)}
            />

            <ApplyTaskModal
                open={openApplyModal}
                closeModal={() => setOpenApplyModal(false)}
                hideBackdrop={false}
            />

            <SubmitTaskModal
                open={openSubmitModal}
                closeModal={() => setOpenSubmitModal(false)}
                hideBackdrop={false}
            />

            <ApplicantListModal
                open={openApplicantsModal}
                closeModal={() => setOpenApplicantsModal(false)}
                hideBackdrop={false}
            />

            <ReviewModal
                open={openReviewModal}
                closeModal={() => setOpenReviewModal(false)}
                hideBackdrop={false}
            />

            <EditTaskModal
                open={openEditModal}
                closeModal={() => setOpenEditModal(false)}
                task={Task}
            />

            <Grid xs={10} item display="flex" flexDirection="column">

                <Box sx={{ width: '100%', height: '32px' }}>
                    <Typography>{_get(Task, 'project.name', '')}</Typography>
                </Box>

                <Box sx={{ width: '100%', marginBottom: '0.2rem' }} display="flex" alignItems="center">
                    <Box className={classes.arrowContainer} display="flex" alignItems="center" justifyContent={"center"} onClick={() => navigate(-1)}>
                        <IoIosArrowBack size={20} color="#C94B32" />
                    </Box>
                    <Box className={classes.nameContainer} display="flex" alignItems="center" justifyContent={"space-between"}>
                        <Box display="flex" alignItems="center">
                            <Typography className={classes.nameText}>{_get(Task, 'name', '')}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                            {
                                Task?.draftedAt
                                    ?
                                    <Box style={{ border: '1px solid #C94B32', borderRadius: 16, padding: '4px 16px' }}>
                                        <Typography style={{ color: '#C94B32' }}>Draft</Typography>
                                    </Box>
                                    :
                                    <Box display="flex" alignItems="center">
                                        <img src={Task?.visual?.icon} alt="submitted-icon" />
                                        <Typography sx={{ fontSize: '14px', marginLeft: '5px', textWrap: 'nowrap', color: Task?.visual?.color }}>{Task?.visual?.status}</Typography>
                                    </Box>
                            }
                            {
                                amICreator || can(myRole, 'task.edit') || can(myRole, 'task.delete') || can(myRole, 'task.close')
                                    ?
                                    <>
                                        {
                                            (amICreator || can(myRole, 'task.edit')) && (Task.isDummy === false) &&
                                            <Box sx={{ marginLeft: '22px', cursor: 'pointer' }} onClick={() => setOpenEditModal(true)}>
                                                <img src={editToken} alt="edit-icon" />
                                            </Box>
                                        }
                                        {
                                            (amICreator || can(myRole, 'task.delete')) &&
                                            <Box sx={{ marginLeft: '22px', cursor: 'pointer' }} onClick={() => setOpenDeleteModal(true)}>
                                                <img src={deleteIcon} alt="delete-icon" />
                                            </Box>
                                        }
                                        {
                                            Task?.archivedAt === null && (amICreator || can(myRole, 'task.close')) &&
                                            <Button size="small" variant="contained" color="secondary" className={classes.closeBtn} onClick={() => setOpenCloseModal(true)}>
                                                { `CLOSE ${ transaformLabel().label.toUpperCase() }` }
                                            </Button>
                                        }
                                    </>
                                    :
                                    null
                            }
                            {
                                (amICreator || can(myRole, 'task.share')) && (Task.isDummy === false) &&
                                <>
                                    <Box
                                        className={classes.iconContainer}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent={"center"}
                                        onClick={handleClick}
                                    >
                                        <img src={shareIcon} alt="share-icon" style={{ width: 18, height: 18 }} />
                                    </Box>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={open}
                                        onClose={handleClose}
                                    >
                                        <MenuItem style={{ marginLeft: 0, height: 40 }}>
                                            <TwitterShareButton style={{ width: '100%' }} url={`${process.env.REACT_APP_URL}/share/${_get(DAO, 'url', '')}/task/${taskId}/preview`}>
                                                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                    <TwitterIcon size={32} />
                                                    <div style={{ marginLeft: 16 }}>Twitter</div>
                                                </div>
                                            </TwitterShareButton>
                                        </MenuItem>
                                        <MenuItem style={{ marginLeft: 0, height: 40 }}>
                                            <TelegramShareButton style={{ width: '100%' }} url={`${process.env.REACT_APP_URL}/share/${_get(DAO, 'url', '')}/task/${taskId}/preview`}>
                                                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                    <TelegramIcon size={32} />
                                                    <div style={{ marginLeft: 16 }}>Telegram</div>
                                                </div>
                                            </TelegramShareButton>
                                        </MenuItem>
                                        <MenuItem style={{ marginLeft: 0, height: 40 }}>
                                            <WhatsappShareButton style={{ width: '100%' }} url={`${process.env.REACT_APP_URL}/share/${_get(DAO, 'url', '')}/task/${taskId}/preview`}>
                                                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                    <WhatsappIcon size={32} />
                                                    <div style={{ marginLeft: 16 }}>Whatsapp</div>
                                                </div>
                                            </WhatsappShareButton>
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                            handleClose()
                                            navigator.clipboard.writeText(`${process.env.REACT_APP_URL}/share/${_get(DAO, 'url', '')}/task/${taskId}/preview`)
                                        }} style={{ marginLeft: 0, height: 40 }}>
                                            <div style={{}}>
                                                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                    <img style={{ marginLeft: 8 }} src={copyIcon} />
                                                    <div style={{ marginLeft: 24 }}>Copy to clipboard</div>
                                                </div>
                                            </div>
                                        </MenuItem>
                                    </Menu>
                                </>
                            }

                        </Box>
                    </Box>
                </Box>

                <Box className={classes.secondContainer} display="flex" alignItems="center" justifyContent={"space-between"}>
                    <Box display="flex" alignItems="center">
                        {
                            Task.discussionChannel && Task.discussionChannel !== ''
                                ?
                                <button className={classes.otherBtn} onClick={() => window.open(Task.discussionChannel, '_blank', 'noopener,noreferrer')}>
                                    {handleParseUrl(Task.discussionChannel)}
                                    CHAT
                                </button>
                                :
                                null
                        }
                        {
                            Task.submissionLink && Task.submissionLink.length > 0
                                ?
                                <button className={classes.otherBtn} onClick={() => window.open(Task.submissionLink, '_blank', 'noopener,noreferrer')}>
                                    <img src={folder} />
                                </button>
                                :
                                null
                        }
                    </Box>
                    <Box display="flex" alignItems="center">
                        {
                            _get(Task, 'compensation', null) !== null &&
                            <>
                                <Typography sx={{ color: '#76808D', fontSize: '16px' }}>Compensation</Typography>
                                <Box display="flex" alignItems="center" justifyContent={"center"} sx={{ width: '127px', height: '35px', }}>
                                    <img src={compensationStar} alt="compensation-star" style={{ marginRight: '7px' }} />
                                    <Typography>{_get(Task, 'compensation.amount', '')} {_get(Task, 'compensation.symbol', '')}</Typography>
                                </Box>
                            </>
                        }
                        {
                            _get(Task, 'deadline', null) &&
                            <Box display="flex" alignItems="center" style={{ borderLeft: '1px solid rgba(118, 128, 141, 0.5)', paddingLeft: '20px' }}>
                                <Typography sx={{ color: '#4BA1DB', marginRight: '10px', fontSize: '16px' }}>Deadline</Typography>
                                <BsCalendarCheck color="#4BA1DB" />
                                <Typography sx={{ fontWeight: '700', color: '#4BA1DB', marginLeft: '6px', marginRight: '10px' }}>{moment(_get(Task, 'deadline', '')).format('L')}</Typography>
                            </Box>
                        }
                    </Box>
                </Box>

                <Box className={classes.thirdContainer} display="flex" alignItems="center">
                    <Box className={classes.descContainer}>
                        <Typography sx={{ fontSize: 16, color: '#76808D' }}>Description</Typography>
                        <Typography
                            dangerouslySetInnerHTML={{ __html: _get(Task, 'description', '') }}
                            sx={{ paddingTop: '16px', fontSize: '14px', color: '#1B2B41' }}></Typography>
                    </Box>
                    <Box className={classes.detailsContainer} display="flex" flexWrap={"wrap"} alignItems="center" justifyContent={"center"}>
                        {renderBody(Task?.visual?.renderBody)}
                    </Box>
                </Box>

                <Box className={classes.fourthContainer} display="flex" alignItems="center" justifyContent={"space-between"}>
                    {
                        _get(Task, 'reviewer', '') &&
                        <Box display="flex" alignItems="center">
                            <Typography sx={{ fontSize: 16, opacity: '0.5', marginRight: '10px' }}>Reviewer</Typography>
                            <Avatar name={_get(Task, 'reviewer.name', '')} wallet={_get(Task, 'reviewer.wallet', '')} />
                        </Box>
                    }

                    {
                        assignedUser &&
                        <Box display="flex" alignItems="center">
                            <Typography sx={{ fontSize: 16, opacity: '0.5', marginRight: '10px' }}>Assigned</Typography>
                            <Avatar name={_get(assignedUser, 'name', '')} wallet={_get(assignedUser, 'wallet', '')} />
                        </Box>
                    }

                    {/* {
                        Task.taskStatus !== 'open' && Task.contributionType === 'open' && Task.isSingleContributor &&
                        <Box display="flex" alignItems="center">
                            <Typography sx={{ fontSize: 16, opacity: '0.5', cursor: 'pointer' }}>SEE PREVIOUS APPLICANTS</Typography>
                        </Box>
                    } */}

                    <Box display="flex" alignItems="center">
                        <Typography sx={{ fontSize: 16, opacity: '0.5' }}>Created on {moment(Task.createdAt).format('L')} {moment(Task.createdAt).format('LT')}</Typography>
                    </Box>
                </Box>

            </Grid>
        </Grid>
    )
}