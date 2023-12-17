
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { get as _get, find as _find, uniqBy as _uniqBy, sortBy as _sortBy } from 'lodash';
import { Grid, Typography, Box, Tab, Tabs, Menu, MenuItem, Chip } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { BsCalendarCheck } from 'react-icons/bs';
import compensationStar from 'assets/svg/compensationStar.svg';
import { IoIosArrowBack } from 'react-icons/io';

import copyIcon from "assets/svg/copyIcon.svg";

import Avatar from "components/Avatar";

import {
    TelegramIcon,
    TwitterIcon,
    WhatsappIcon,
    TelegramShareButton,
    TwitterShareButton,
    WhatsappShareButton,
} from "react-share";

import settingIcon from 'assets/svg/settings.svg';
import shareIcon from 'assets/svg/share.svg';
import archiveIcon from 'assets/svg/archiveIcon.svg';
import createProjectSvg from 'assets/svg/createProject.svg';
import StepperProgress from "components/StepperProgress";
import MilestoneCard from "components/MilestoneCard";
import KraCard from "components/KraCard";
import IconButton from 'components/IconButton';
import ProjectLinkCard from "components/ProjectLinkCard";
import ProjectEditModal from "modals/Project/ProjectEditModal";
import AssignContributionModal from "modals/Project/AssignContributionModal";
import Button from "components/Button";
import KraReviewModal from "modals/Project/KraReviewModal";
import TaskSection from "sections/TaskSection";
import InviteMemberModal from "modals/Project/InviteMemberModal";

import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";
import useTerminology from 'hooks/useTerminology';
import useRole from "hooks/useRole";
import { useWeb3Auth } from "context/web3Auth";
import { useDAO } from "context/dao";

import { useNavigate, useParams } from "react-router-dom"
import { getProjectAction } from "store/actions/project";
import FullScreenLoader from "components/FullScreenLoader";
import MembersSection from "sections/MembersSection";

import membersGroup from 'assets/svg/membersGroup.svg'
import editSvg from 'assets/svg/editToken.svg';
import AddIcon from '@mui/icons-material/Add';

import moment from "moment";
import MilestoneDetailModal from "modals/Project/MilestoneDetailModal"

const useStyles = makeStyles((theme: any) => ({
    root: {
        // height: '100vh',
        // overflowY: 'scroll',
        // display: 'flex',
        // flexDirection: 'column',
        // justifyContent: 'center',
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
        fontSize: '30px !important',
        lineHeight: '33px !important',
        color: '#76808D'
    },
    iconContainer: {
        height: '40px',
        width: '40px',
        background: 'linear-gradient(180deg, #FBF4F2 0%, #EEF1F5 100%) !important',
        borderRadius: '5px !important',
        cursor: 'pointer !important'
    },
    descriptionContainer: {
        width: '100%',
        marginBottom: '20px !important',
        padding: '25px 30px !important',
        background: 'rgba(118, 128, 141, 0.05) !important',
        borderRadius: '5px !important',
    },
    addMemberBtn: {
        width: '125px',
        height: '40px',
        background: '#FFFFFF !important',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), - 3px - 3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '5px !important',
        fontSize: '14px !important',
        color: '#C94B32 !important',
        marginLeft: '20px !important'
    },
    lineSm: {
        border: '1px solid rgba(118, 128, 141, 0.5) !important',
        height: '19px',
        width: '0px'
    },
    rolePill: {
        height: '22px !important',
        display: "flex !important",
        alignItems: "center !important",
        justifyContent: "flex-start !important",
        margin: '0 10px 10px 0 !important'
    },
    roleCount: {
        padding: '4px !important',
        height: '22px !important',
        minWidth: '36px !important',
        marginBottom: '10px !important',
        background: '#FFFFFF !important',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '100px !important',
        cursor: 'pointer'
    }
}));

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    style?: any;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, style, ...other } = props;

    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            style={style}
            {...other}
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </Box>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default () => {
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const { projectId, daoURL } = useParams();
    const navigate = useNavigate();
    // @ts-ignore
    const { setProjectLoading, Project } = useAppSelector(store => store.project);
    console.log("Project : ", Project);
    const { DAO } = useDAO();
    const { provider, account, chainId } = useWeb3Auth();
    const { transformWorkspace, transformRole } = useTerminology(_get(DAO, 'terminologies'));
    const { myRole, can } = useRole(DAO, account, undefined)
    const [openInviteModal, setOpenInviteModal] = useState<boolean>(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [value, setValue] = useState<number>(0);
    const [showEdit, setShowEdit] = useState<boolean>(false);
    const [openAssignContribution, setOpenAssignContribution] = useState<boolean>(false);
    const [openMilestoneModal, setOpenMilestoneModal] = useState<boolean>(false);
    const [openKraReview, setOpenKraReview] = useState<boolean>(false);

    const [selectedMilestone, setSelectedMilestone] = useState<any>(null);

    // useEffect(() => {
    //     if (daoURL && (!DAO || (DAO && DAO.url !== daoURL)))
    //         dispatch(getDao(daoURL))
    // }, [DAO, daoURL])

    useEffect(() => {
        if (projectId && (!Project || (Project && Project._id !== projectId))) {
            dispatch(getProjectAction(projectId));
        }
    }, [projectId])

    const canMyrole = useCallback((permission: any) => {
        if (!Project) return false;
        let creator = _get(Project, 'creator', '').toLowerCase() === account?.toLowerCase();
        let inProject = _find(_uniqBy(Project?.members, '_id'), (m:any) => m.wallet.toLowerCase() === account?.toLowerCase())
        let p = permission;
        if (inProject)
            p = `${permission}.inproject`
        if (creator)
            p = `${permission}.creator`
        console.log("can(myRole, p) || can(myRole, permission)", can(myRole, p) || can(myRole, permission))
        return (can(myRole, p) || can(myRole, permission))
    }, [Project, myRole]);

    useEffect(() => {
        if (Project) {
            if (_get(Project, 'milestones', []).length > 0) {
                setValue(0);
            }
            else if (_get(Project, 'milestones', []).length === 0 && _get(Project, 'kra.results', []).length > 0) {
                setValue(1);
            }
        }
    }, [Project]);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const editableMilestone = useMemo(() => {
        if(_get(Project, 'milestones', []).length > 0) {
            for (let index = 0; index < _get(Project, 'milestones', []).length; index++) {
                const milestone = _get(Project, 'milestones', [])[index];
                if(!milestone.complete)
                    return index;
            }
        }
        return -1
    }, [Project])

    const selectMilestone = (item: any, index: number) => {
        if (index === 0) {
            let e = { ...item, pos: index };
            setSelectedMilestone(e);
            setTimeout(() => setOpenMilestoneModal(true), 500)
        }
        else if (index > 0) {
            let e = { ...item, pos: index };
            setSelectedMilestone(e);
            setTimeout(() => setOpenMilestoneModal(true), 500)
        }
    }

    const nextMilestone = useMemo(() => {
        if(Project && Project.milestones) {
            let mts = Project.milestones.filter((m:any) => !m.complete)
            if(mts && mts.length > 0)
                return mts[0]
        }
        return null
    }, [Project])

    const NameAndAvatar = (props: any) => {
        const [show, setShow] = useState(false);
        let roles: any = [];
        const discordOb = _get(DAO, 'discord', null);
        const userTemp = _find(_get(DAO, 'members', []), m => _get(m, 'member.wallet', '').toLowerCase() === props.address.toLowerCase() && m.deletedAt === null);
        console.log("address : ", props.address);
        console.log("user : ", userTemp);
        const index = props.index;

        if (userTemp?.discordId && discordOb) {
            Object.keys(discordOb).forEach(function (key, _index) {
                const discordChannel = discordOb[key];
                let person = _find(_get(discordChannel, 'members', []), m => _get(m, 'displayName', '').toLowerCase() === userTemp?.discordId?.toLowerCase());
                if (person) {
                    person.roles.forEach(function (item: any) {
                        _get(discordChannel, 'roles', []).map((i: any) => {
                            if (i.id === item && i.name !== '@everyone') {
                                roles.push({ name: i.name, roleColor: _get(i, 'roleColor', '#99aab5') })
                            }
                        })
                    })
                }
            });
        }

        if (userTemp) {
            return (
                <>
                    <Box sx={{ width: '100%', marginBottom: '25px' }} display={"flex"} alignItems={"center"} key={index}>
                        <Box sx={{ width: '250px' }} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                            <Avatar name={userTemp?.member.name} wallet={userTemp?.member.wallet} />
                            <Box className={classes.lineSm}></Box>
                        </Box>
                        <Box sx={{ width: '300px' }} display={"flex"} alignItems={"center"}>
                            <Box sx={{ width: '150px' }} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                                <Typography sx={{ marginLeft: '6px', fontSize: '14px', color: '#76808D' }}>{moment.utc(props.joined).local().format('MM/DD/YYYY')}</Typography>
                                <Box className={classes.lineSm}></Box>
                            </Box>
                            <Box sx={{ width: '150px', marginLeft: '10px' }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: '700', color: '#76808D' }}>
                                    {
                                        userTemp?.role === 'role1' ? userTemp?.creator ? `${transformRole(userTemp?.role).label} (Creator)` : transformRole(userTemp?.role).label : transformRole(userTemp?.role).label
                                    }
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ width: '400px' }} display={"flex"} alignItems={"center"} flexWrap={"wrap"}>
                            {
                                (show ? roles : roles.filter((_: any, i: any) => i < 5)).map((item: any, index: any) => {
                                    if (show || index <= 3) {
                                        return (
                                            <>
                                                <Chip
                                                    label={item.name}
                                                    className={classes.rolePill}
                                                    sx={{
                                                        '& .MuiChip-avatar': {
                                                            height: '14px !important',
                                                            width: '14px !important'
                                                        }
                                                    }}
                                                    avatar={
                                                        <Box style={{ backgroundColor: `${_get(item, "roleColor", '#99aab5')}`, borderRadius: '50%' }}></Box>
                                                    }
                                                    style={{ backgroundColor: `${_get(item, "roleColor", '#99aab5')}50` }}
                                                />
                                            </>
                                        )
                                    }
                                    return (
                                        <>
                                            <Box className={classes.roleCount} onClick={() => setShow(prev => !prev)} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                                <Typography>{show ? 'Hide' : `+${roles.length - 4}`}</Typography>
                                            </Box>
                                        </>
                                    )
                                })
                            }
                        </Box>
                    </Box>
                </>
            );
        }
        else return null;
    };

    const getDeadline = (deadline: any) => {
        if(moment(deadline, 'YYYY-MM-DD').isSame(moment(), 'day')) { 
            return { color: 'red', value: 'Today' }
        } else if(moment(deadline, 'YYYY-MM-DD').isBefore(moment().startOf('day'), 'days')) { 
            return { color: 'red', value: 'Passed' }
        } else if(moment(deadline, 'YYYY-MM-DD').diff(moment().startOf('day'), 'days') <= 2) { 
            return { color: 'red', value: `in ${moment(deadline, 'YYYY-MM-DD').diff(moment().startOf('day'), 'days')} day${moment(deadline, 'YYYY-MM-DD').diff(moment().startOf('day'), 'days') > 1 ? 's':''}` }
        } 
        return { color: '#4BA1DB', value:  moment(_get(nextMilestone, 'deadline', ''), 'YYYY-MM-DD').format('L') }
    }


    if (!Project || setProjectLoading || (projectId && (Project && Project._id !== projectId))) {
        return (
            <FullScreenLoader />
        )
    }

    return (
        <>
            <Grid container className={classes.root}>
                <Grid xs={12} item display="flex" flexDirection="column">

                    <ProjectEditModal
                        open={showEdit}
                        closeModal={() => setShowEdit(false)}
                    />

                    <MilestoneDetailModal
                        selectedMilestone={selectedMilestone}
                        editable={editableMilestone == selectedMilestone?.pos}
                        open={openMilestoneModal}
                        closeModal={() => setOpenMilestoneModal(false)}
                        openAssignContribution={() => setOpenAssignContribution(true)}
                    />

                    <AssignContributionModal
                        selectedMilestone={selectedMilestone}
                        open={openAssignContribution}
                        closeModal={() => setOpenAssignContribution(false)}
                    />
{/* 
                    <KraReviewModal
                        open={openKraReview}
                        closeModal={() => setOpenKraReview(false)}
                    /> */}

                    <InviteMemberModal
                        open={openInviteModal}
                        closeModal={() => setOpenInviteModal(false)}
                    />

                    {/* Name */}
                    <Box sx={{ width: '100%', marginBottom: '20px' }} display="flex" alignItems="center">
                        <Box onClick={() => navigate(-1)} className={classes.arrowContainer} display="flex" alignItems="center" justifyContent={"center"}>
                            <IoIosArrowBack size={20} color="#C94B32" />
                        </Box>
                        <Box className={classes.nameContainer} display="flex" alignItems="center" justifyContent={"space-between"}>
                            <Box display="flex" alignItems="center">
                                <img src={createProjectSvg} alt="project-icon" style={{ marginRight: '18px', width: 50, height: 40, objectFit: 'cover' }} />
                                <Typography className={classes.nameText}>{_get(Project, 'name', '')}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center">
                                { canMyrole('project.edit') &&
                                    <Box
                                    className={classes.iconContainer}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent={"center"}
                                    sx={{ marginRight: '12px' }}
                                    onClick={() => { setShowEdit(true) }}
                                >
                                    <img src={settingIcon} alt="setting-icon" />
                                </Box> }
                                { canMyrole('project.share') &&
                                <Box
                                    className={classes.iconContainer}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent={"center"}
                                    onClick={handleClick}
                                >
                                    <img src={shareIcon} alt="share-icon" style={{ width: 18, height: 18 }} />
                                </Box>
                                }
                                <Menu
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                >
                                    <MenuItem style={{ marginLeft: 0, height: 40 }}>
                                        <TwitterShareButton style={{ width: '100%' }} url={`${process.env.REACT_APP_URL}/share/${_get(DAO, 'url', '')}/project/${projectId}/preview`}>
                                            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <TwitterIcon size={32} />
                                                <div style={{ marginLeft: 16 }}>Twitter</div>
                                            </div>
                                        </TwitterShareButton>
                                    </MenuItem>
                                    <MenuItem style={{ marginLeft: 0, height: 40 }}>
                                        <TelegramShareButton style={{ width: '100%' }} url={`${process.env.REACT_APP_URL}/share/${_get(DAO, 'url', '')}/project/${projectId}/preview`}>
                                            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <TelegramIcon size={32} />
                                                <div style={{ marginLeft: 16 }}>Telegram</div>
                                            </div>
                                        </TelegramShareButton>
                                    </MenuItem>
                                    <MenuItem style={{ marginLeft: 0, height: 40 }}>
                                        <WhatsappShareButton style={{ width: '100%' }} url={`${process.env.REACT_APP_URL}/share/${_get(DAO, 'url', '')}/project/${projectId}/preview`}>
                                            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <WhatsappIcon size={32} />
                                                <div style={{ marginLeft: 16 }}>Whatsapp</div>
                                            </div>
                                        </WhatsappShareButton>
                                    </MenuItem>
                                    <MenuItem onClick={() => {
                                        navigator.clipboard.writeText(`${process.env.REACT_APP_URL}/share/${_get(DAO, 'url', '')}/project/${projectId}/preview`)
                                        handleClose()
                                    }} style={{ marginLeft: 0, height: 40 }}>
                                        <div style={{}}>
                                            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <img style={{ marginLeft: 8 }} src={copyIcon} />
                                                <div style={{ marginLeft: 24 }}>Copy to clipboard</div>
                                            </div>
                                        </div>
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    </Box>

                    {/* Description */}
                    <Box className={classes.descriptionContainer} display="flex" alignItems={"center"}>
                        <Box>
                            <Typography sx={{ fontSize: '22px', lineHeight: '25px', color: '#76808D' }}>Description</Typography>
                        </Box>
                        <Box sx={{ marginLeft: '50px' }}>
                            <Typography
                                dangerouslySetInnerHTML={{ __html: _get(Project, 'description', '') }}
                                sx={{ fontSize: '14px', color: '#1B2B41', margin: 0 }}></Typography>
                        </Box>
                    </Box>

                    {/* Links */}
                    {
                        canMyrole('project.links.view') && _get(Project, 'links', []).length > 0 &&
                        <Box display={"flex"} flexWrap={"wrap"} sx={{ width: '100%', marginBottom: '20px' }}>
                            {
                                _get(Project, 'links', []).map((item: any, index: number) => {
                                    return (
                                        <ProjectLinkCard key={index} link={item} />
                                    )
                                })
                            }
                        </Box>
                    }

                    {/* Milestones and KRA */}
                    {canMyrole('project.milestone.view') &&
                        (_get(Project, 'milestones', []).length > 0 || _get(Project, 'kra.results', []).length > 0) &&
                        <Box sx={{ width: '100%', marginBottom: '20px' }} display="flex" flexDirection={"column"}>
                            <Box sx={{ width: '100%', background: '#FFF', padding: '10px 22px', borderRadius: '5px' }} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                                <Tabs
                                    value={value}
                                    onChange={handleChange}
                                    aria-label="basic tabs example"
                                    TabIndicatorProps={{
                                        hidden: true
                                    }}
                                    sx={{
                                        '& button': { color: 'rgba(118, 128, 141,0.5)', marginRight: '10px', textTransform: 'capitalize', fontSize: '22px', fontWeight: '400' },
                                        '& button.Mui-selected': { color: 'rgba(118, 128, 141,1)' },
                                    }}
                                >
                                    {
                                        _get(Project, 'milestones', []).length > 0 && <Tab label="Milestones" {...a11yProps(0)} />
                                    }
                                    {
                                        _get(Project, 'kra.results', []).length > 0 && <Tab label="Key results" {...a11yProps(1)} />
                                    }
                                </Tabs>

                                {
                                    value === 0 &&
                                    <Box display={"flex"} alignItems={"center"}>
                                        <Box display="flex" flexDirection="row" alignItems="center">
                                            <Typography sx={{ color: '#76808D', fontSize: '16px' }}>Project value</Typography>
                                            <Box display="flex" alignItems="center" justifyContent={"center"} sx={{ width: '127px', height: '35px', }}>
                                                <img src={compensationStar} alt="compensation-star" style={{ marginRight: '7px' }} />
                                                <Typography>{_get(Project, 'compensation.amount', '')} {_get(Project, 'compensation.symbol', '')}</Typography>
                                            </Box>
                                        </Box>
                                       { nextMilestone && <Box display="flex" alignItems="center" style={{ borderLeft: '1px solid rgba(118, 128, 141, 0.5)', paddingLeft: '20px' }}>
                                            <Typography sx={{ color: getDeadline(nextMilestone?.deadline)?.color, marginRight: '10px', fontSize: '16px' }}>Deadline</Typography>
                                            <BsCalendarCheck color={getDeadline(nextMilestone?.deadline)?.color} />
                                            { 
                                                //@ts-ignore 
                                            }
                                            <Typography sx={{ fontWeight: '700', color: getDeadline(nextMilestone?.deadline)?.color, marginLeft: '6px', marginRight: '10px' }}>{ getDeadline(nextMilestone?.deadline)?.value }</Typography>
                                        </Box> }
                                        {/* <div style={{ width: '300px' }}>
                                            <StepperProgress variant="secondary" milestones={_get(Project, 'milestones', [])} />
                                        </div>
                                        {
                                            _get(Project, 'milestones', []).length > 0
                                                ?
                                                <Typography sx={{ marginLeft: '16px', fontWeight: 700, color: '#188C7C' }}>
                                                    {(((_get(Project, 'milestones', []).filter((item: any) => item.complete === true).length) / (_get(Project, 'milestones', []).length)) * 100).toFixed(2)}%
                                                </Typography>
                                                :
                                                <Typography sx={{ marginLeft: '16px', fontWeight: 700, color: '#188C7C' }}>0%</Typography>
                                        } */}

                                    </Box>
                                }

{/*                                 {
                                    value === 1 &&
                                    <Box display={"flex"} alignItems={"center"}>
                                        <Typography sx={{ marginLeft: '14px', fontWeight: 400, color: '#76808D', marginRight: '100px' }}>Review frequency : {_get(Project, 'kra.frequency', [])}</Typography>
                                        <IconButton disabled={!Project.kra.tracker || Project.kra.tracker.length == 0} sx={{ marginRight: '20px' }} onClick={() => navigate(`/${daoURL}/project/${projectId}/archivedKra`)}>
                                            <img src={archiveIcon} alt="archiveIcon" />
                                        </IconButton>
                                        { canMyrole('project.review') && <Button size="small" variant="contained" onClick={() => setOpenKraReview(true)}>
                                            REVIEW
                                        </Button> }
                                    </Box>
                                } */}
                            </Box>

                            {/* Tab panel for milestones */}
                            <TabPanel value={value} index={0} style={{ marginTop: '0.2rem' }}>
                                <Box sx={{ width: '100%', background: '#FFF', padding: '26px 22px 26px 22px', borderRadius: '5px' }} display={"flex"} alignItems={"center"} flexWrap={"wrap"}>
                                    {
                                        _get(Project, 'milestones', []).map((item: any, index: number) => {
                                            return (
                                                <MilestoneCard editable={canMyrole('project.milestone.update')} index={index} milestone={item} openModal={(value1: any, value2: number) => selectMilestone(value1, value2)} />
                                            )
                                        })
                                    }
                                </Box>
                            </TabPanel>
                            {/* Tab panel for KRA */}
{/*                             <TabPanel value={value} index={1} style={{ marginTop: '0.2rem' }}>
                                <Box sx={{ width: '100%', background: '#FFF', padding: '26px 22px 26px 22px', borderRadius: '5px' }} display={"flex"} alignItems={"center"} flexWrap={"wrap"}>
                                    {
                                        _get(Project, 'kra.results', []).map((item: any, index: number) => {
                                            return (
                                                <KraCard result={item} index={index} />
                                            )
                                        })
                                    }
                                </Box>
                            </TabPanel> */}
                        </Box>
                    }
                    {
                        canMyrole('project.task.view') &&
                        <TaskSection isHelpIconOpen={false} onlyProjects={true} />
                    }

                    { canMyrole('members.view') &&
                        <Box sx={{ width: '100%', marginBottom: '20px' }} display="flex" flexDirection={"column"}>

                            <Box sx={{ width: '100%', background: '#FFF', padding: '20px 22px', borderRadius: '5px' }} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                                <Typography sx={{ fontSize: '22px', fontWeight: '400', color: '#76808D' }}>Members</Typography>
                                <Box display={"flex"} alignItems={"center"}>
                                    <img src={membersGroup} alt="membersGroup" />
                                    <Typography sx={{ marginLeft: '15px', fontSize: '16px' }}>{Project?.members.length} {Project?.members.length > 1 ? 'members' : 'member'}</Typography>
                                   { canMyrole('project.member.add') && <Button size="small" variant="contained" color="secondary" className={classes.addMemberBtn}
                                        onClick={() => setOpenInviteModal(true)}
                                    >
                                        <AddIcon sx={{ fontSize: 18 }} /> MEMBER
                                    </Button> }
                                </Box>
                            </Box>

                            <Box sx={{ width: '100%', background: '#FFF', padding: '26px 22px', borderRadius: '5px', marginTop: '0.2rem' }} display={"flex"} flexDirection={"column"}>

                                <Box sx={{ width: '100%', marginBottom: '25px' }} display={"flex"} alignItems={"center"}>
                                    <Box sx={{ width: '250px' }}>
                                        <Typography sx={{ fontSize: '16px', color: '#76808D', opacity: '0.5' }}>Name</Typography>
                                    </Box>
                                    <Box sx={{ width: '250px' }}>
                                        <Typography sx={{ fontSize: '16px', color: '#76808D', opacity: '0.5', marginLeft: '22px' }}>Joined</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ width: '100%', maxHeight: '220px', overflow: 'auto' }}>
                                    {_sortBy(_uniqBy(Project?.members, (m: any) => m.wallet.toLowerCase()), (m: any) => _get(m, 'name', '').toLowerCase(), 'asc').map((result: any, index: any) => {
                                        return (
                                            <NameAndAvatar
                                                index={index}
                                                address={_get(result, 'wallet', '')}
                                                position={index}
                                            />
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Box> 
                    }
                </Grid>
            </Grid>
        </>
    )
}