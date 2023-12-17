import React, { useState, useEffect, useMemo } from "react";
import { get as _get, find as _find, orderBy as _orderBy, uniqBy as _uniqBy } from 'lodash';
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { makeStyles } from '@mui/styles';

import Button from "components/Button";
import IconButton from 'components/IconButton';
import AddIcon from '@mui/icons-material/Add';

import archiveIcon from 'assets/svg/archiveIcon.svg';
import expandIcon from 'assets/svg/expand.svg';
import CreateTaskModal from "modals/Tasks/CreateTaskModal";
import TaskCard from "components/TaskCard";
import { useDAO } from "context/dao";
import { useWeb3Auth } from "context/web3Auth";
import { useAppSelector } from "helpers/useAppSelector";
import { useAppDispatch } from "helpers/useAppDispatch";
import { useNavigate, useParams } from "react-router-dom";
import moment from 'moment';
import { getProjectAction } from "store/actions/project";
import useTasks from 'hooks/useTasks';
import useTerminology from "hooks/useTerminology";
import BootstrapTooltip from "components/BootstrapTooltip";
import useRole from "hooks/useRole";

const useStyles = makeStyles((theme: any) => ({
    createBtn: {
        width: '125px',
        height: '40px',
        color: '#C94B32 !important'
    },
    addMemberBtn: {
        width: '125px',
        height: '40px',
        background: '#FFFFFF !important',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), - 3px - 3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '5px !important',
        fontSize: '14px !important',
        color: '#C94B32 !important'
    },
    helpCard: {
        position: "absolute",
        top: "0",
        left: "0",
        borderRadius: "10px",
        display: "flex",
        alignItems: 'center',
        justifyContent: "center",
        color: "#FFFFFF",
        backgroundColor: "#76808D",
        zIndex: 99999,
        width: "100% !important",
        height: "100% !important",
        opacity: 0.8,
        textAlign: "center",
        cursor: "pointer",
        padding: "10px",
        minHeight: 50
    },
    helpCardContent: {
        position: 'absolute',
        fontFamily: "'Inter', sans-serif",
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: "18px",
        lineHeight: "22px",
    },
    showAllCard: {
        width: '315px',
        height: '110px',
        display: 'flex !important',
        alignItems: 'center !important',
        background: 'linear-gradient(180deg, #fbf4f2, #eef1f5) !important',
        borderRadius: '5px !important',
        cursor: 'pointer !important',
        justifyContent: 'center !important',
        marginBottom: '15px !important',
        marginRight: '20px !important',
        position: 'relative'
    },
    iconContainer: {
        height: '40px',
        width: '50px',
        padding: '0 10px !important',
        background: '#B12F15 !important',
        boxShadow: '3px 5px 20px rgba(27, 43, 65, 0.12), 0px 0px 20px rgba(201, 75, 50, 0.18) !important',
        borderRadius: '20px !important',
        marginLeft: '10px !important'
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

export default ({ isHelpIconOpen, onlyProjects, isPreview }: any) => {
    const classes = useStyles();
    const { projectId } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { DAO } = useDAO();
    const { account } = useWeb3Auth();
    //@ts-ignore
    const { user } = useAppSelector(store => store.session);
    const { transformTask } = useTerminology(_get(DAO, 'terminologies', null))
    // @ts-ignore
    const { Project } = useAppSelector(store => store.project);
    const { parsedTasks } = useTasks(onlyProjects ? _get(Project, 'tasks', []) : _get(DAO, 'tasks', []))
    const [value, setValue] = useState<number>(0);
    const [initialLoad, setInitialLoad] = useState<boolean>(true);
    const { myRole, can } = useRole(DAO, account, undefined)
    const [openCreateTask, setOpenCreateTask] = useState<boolean>(false);

    console.log("user : ", user)

    useEffect(() => {
        if (projectId && (!Project || (Project && Project._id !== projectId)))
            dispatch(getProjectAction(projectId));
    }, [projectId]);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    useEffect(() => {
        if(isPreview) {
            setValue(3)
        } else {
            if (initialLoad) {
                let activeTab: number = 0;
                if (parsedTasks) {
                    if ((parsedTasks?.myTask || []).length == 0) {
                        activeTab = 1
                        if ((parsedTasks?.manage || []).length == 0)
                            activeTab = 3
                    }
                }
                setValue(activeTab)
                setInitialLoad(false)
            }
        }
    }, [parsedTasks, initialLoad]);

    const applicationCount = useMemo(() => {
        let sum = 0;
        if (parsedTasks['manage'].length > 0) {
            for (let index = 0; index < parsedTasks['manage'].length; index++) {
                const task = parsedTasks['manage'][index];
                if (task.taskStatus === 'open' && task.isSingleContributor) {
                    let applications = _get(task, 'members', []).filter((m: any) => (m.status !== 'rejected' && m.status !== 'submission_accepted' && m.status !== 'submission_rejected'))
                    if (applications)
                        sum = sum + applications.length
                }
            }
            return sum
        }
        return 0;
    }, [parsedTasks['manage']]);

    const submissionCount = useMemo(() => {
        let sum = 0;
        if (parsedTasks['manage'].length > 0) {
            for (let index = 0; index < parsedTasks['manage'].length; index++) {
                const task = parsedTasks['manage'][index];
                if ((task.contributionType === 'open' && !task.isSingleContributor) || task.contributionType === 'assign') {
                    let submissions = _get(task, 'members', [])?.filter((m: any) => m.submission && (m.status !== 'submission_accepted' && m.status !== 'submission_rejected'))
                    if (submissions)
                        sum = sum + submissions.length
                }
            }
            return sum
        }
        return 0;
    }, [parsedTasks['manage']]);


    return (
        <Box sx={{ width: '100%', marginBottom: '20px', position: 'relative' }} display="flex" flexDirection={"column"}>
            <CreateTaskModal
                open={openCreateTask}
                closeModal={() => setOpenCreateTask(false)}
                selectedProject={onlyProjects ? Project : null}
            />
            <Box sx={{ width: '100%', background: '#FFF', height: '75px', paddingRight:'16px', borderRadius: '5px' }} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
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
                    { !isPreview && <Tab label={`My ${transformTask().labelPlural}`} {...a11yProps(0)} /> }
                    { (can(myRole, 'task.tabs.manage') && !isPreview) && 
                    <Tab
                        label="Manage"
                        {...a11yProps(1)}
                        iconPosition="end"
                        icon={
                            (applicationCount + submissionCount) > 0
                                ?
                                <Box
                                    sx={value === 1 ? { opacity: '1' } : { opacity: '0.5' }}
                                    className={classes.iconContainer}
                                    display={"flex"}
                                    alignItems={"center"}
                                    justifyContent={"center"}
                                >
                                    <Typography sx={{ fontSize: 14, color: '#FFF' }}>{(applicationCount + submissionCount)}</Typography>
                                </Box>
                                :
                                <></>
                        }
                    /> }
                    { (can(myRole, 'task.tabs.manage') && !isPreview) && 
                    <Tab
                        label="Drafts"
                        {...a11yProps(2)}
                        iconPosition="end"
                        icon={
                            parsedTasks['drafts'].length > 0
                                ?
                                <Box
                                    sx={value === 2 ? { opacity: '1' } : { opacity: '0.5' }}
                                    className={classes.iconContainer}
                                    display={"flex"}
                                    alignItems={"center"}
                                    justifyContent={"center"}
                                >
                                    <Typography sx={{ fontSize: 14, color: '#FFF' }}>{parsedTasks['drafts'].length}</Typography>
                                </Box>
                                :
                                <></>
                        }
                    />
                     }
                    {  (can(myRole, 'task.tabs.all') || isPreview) && <Tab label={`All ${transformTask().labelPlural}`} {...a11yProps(3)} /> }
                </Tabs>
                {
                 !isPreview &&
                <Box display={"flex"} alignItems={"center"}>
                <BootstrapTooltip arrow open={isHelpIconOpen}
                        placement="top-start"
                        title="Open">
                        <span>
                            <IconButton
                            style={{
                                ...( isHelpIconOpen ? { zIndex: 1400, boxShadow: '0px 0px 20px rgba(181, 28, 72, 0.6)' } : {}),
                            }}
                            onClick={() => navigate(`/${DAO.url}/tasks`, { state: { active: value } })} sx={{ marginRight: '20px' }}>
                                <img src={expandIcon} alt="archive-icon" />
                            </IconButton>
                        </span>
                    </BootstrapTooltip>
                    <BootstrapTooltip arrow open={isHelpIconOpen}
                        placement="bottom"
                        title="Archives">
                        <span>
                            <IconButton onClick={() => { onlyProjects ? navigate(`/${DAO.url}/archivedTasks/${Project._id}`) : navigate(`/${DAO.url}/archivedTasks`) }} sx={{
                                marginRight: '20px',
                                ...( isHelpIconOpen ? { zIndex: 1400, boxShadow: '0px 0px 20px rgba(181, 28, 72, 0.6)' } : {}),
                            }}>
                                <img src={archiveIcon} alt="archiveIcon" />
                            </IconButton>
                        </span>
                    </BootstrapTooltip>
                    { (can(myRole, 'task.create') || isPreview) &&
                    <BootstrapTooltip arrow open={isHelpIconOpen}
                        placement="top-start"
                        title="Create Task">
                            <span>
                                <Button
                                    style={{
                                        ...(isHelpIconOpen ? { zIndex: 1400, boxShadow: '0px 0px 20px rgba(181, 28, 72, 0.6)' } : {})
                                    }}
                                    size="small" variant="contained" className={classes.createBtn} color="secondary" onClick={() => { 
                                        setOpenCreateTask(true) 
                                    }}>
                                    <AddIcon sx={{ fontSize: 18 }} /> CREATE
                                </Button>
                            </span>
                     </BootstrapTooltip>
                    }
                     {/* <IconButton onClick={() => { onlyProjects ? navigate(`/${DAO.url}/tasks/${Project._id}`, { state: { active: value } }) : navigate(`/${DAO.url}/tasks`, { state: { active: value } }) }} sx={{ marginRight: '20px' }}>
                        <img src={expandIcon} alt="archive-icon" />
                    </IconButton>
                    <IconButton
                        sx={{ marginRight: '20px' }}
                        onClick={() => { onlyProjects ? navigate(`/${DAO.url}/archivedTasks/${Project._id}`) : navigate(`/${DAO.url}/archivedTasks`) }}
                        disabled={_get(DAO, 'tasks', []).filter((task: any) => !task.deletedAt && task.archivedAt).length > 0 ? false : true}
                    >
                        <img src={archiveIcon} alt="archiveIcon" />
                    </IconButton>
                    <Button size="small" variant="contained" color="secondary" className={classes.addMemberBtn} onClick={() => setOpenCreateTask(true)}>
                        <AddIcon sx={{ fontSize: 18 }} /> CREATE
                    </Button> */}
                    </Box>}
            </Box>
            <Box style={{ position: "relative" }}>
                <TabPanel value={value} index={0} style={{ marginTop: '0.2rem' }}>
                    <Box sx={{ width: '100%', background: '#FFF', padding: '26px 22px 26px 22px', borderRadius: '5px', maxHeight: '275px', overflow: 'hidden' }} display={"flex"} alignItems={"center"} flexWrap={"wrap"}>
                        {
                            isHelpIconOpen &&
                            <Box className={classes.helpCard}>
                                <Box className={classes.helpCardContent}>By creating tasks, you can <Typography component="span" sx={{ fontWeight: 700, fontSize: 16 }}> track progress, deadlines, </Typography> and <Typography component="span" sx={{ fontWeight: 700, fontSize: 16 }}> rewards on bounties, </Typography> and <Typography component="span" sx={{ fontWeight: 700, fontSize: 16 }}> assign contributors </Typography> to each task.</Box>
                            </Box>
                        }
                        {
                            parsedTasks['myTask'] && parsedTasks['myTask'].filter((item, index) => index < 6).map((item, index) => {
                                let currentDate = moment();
                                let tempDate = moment(item.deadline);
                                let diff = tempDate.diff(currentDate, 'days');

                                if (index <= 4) {
                                    if (diff > -1) {
                                        return (
                                            <Box key={index}>
                                                <TaskCard
                                                    task={item}
                                                    daoUrl={DAO?.url}
                                                />
                                            </Box>
                                        )
                                    }
                                    else {
                                        if (item.creator === user?._id || _find(_get(item, 'members', []), m => m.status === 'approved' || m.status === 'submission_accepted')?.member?.wallet === user?.wallet) {
                                            return (
                                                <Box key={index}>
                                                    <TaskCard
                                                        task={item}
                                                        daoUrl={DAO?.url}
                                                    />
                                                </Box>
                                            )
                                        }
                                        else return null;
                                    }
                                }
                                else {
                                    return (
                                        <Box
                                            key={index}
                                            className={classes.showAllCard}
                                            onClick={() => { navigate(`/${DAO.url}/tasks`, { state: { active: value } }) }}
                                        >
                                            <Typography sx={{ color: '#b12f15' }}>SHOW ALL</Typography>
                                        </Box>
                                    )
                                }
                            })
                        }
                    </Box>
                </TabPanel>

                {/* Tab panel for manage tasks */}
                <TabPanel value={value} index={1} style={{ marginTop: '0.2rem' }}>
                    <Box sx={{ width: '100%', background: '#FFF', padding: '26px 22px 26px 22px', borderRadius: '5px', maxHeight: '275px', overflow: 'hidden' }} display={"flex"} alignItems={"center"} flexWrap={"wrap"}>
                        {
                            isHelpIconOpen &&
                            <Box className={classes.helpCard}>
                                <Box className={classes.helpCardContent}>By creating tasks, you can <Typography component="span" sx={{ fontWeight: 700, fontSize: 16 }}> track progress, deadlines, </Typography> and <Typography component="span" sx={{ fontWeight: 700, fontSize: 16 }}> rewards on bounties, </Typography> and <Typography component="span" sx={{ fontWeight: 700, fontSize: 16 }}> assign contributors </Typography> to each task.</Box>
                            </Box>
                        }
                        {
                            parsedTasks['manage'] && parsedTasks['manage'].filter((item, index) => index < 6).map((item, index) => {
                                let currentDate = moment();
                                let tempDate = moment(item.deadline);
                                let diff = tempDate.diff(currentDate, 'days');
                                if (index <= 4) {
                                    if (diff > -1) {
                                        return (
                                            <Box key={index}>
                                                <TaskCard
                                                    task={item}
                                                    daoUrl={DAO?.url}
                                                />
                                            </Box>
                                        )
                                    }
                                    else {
                                        if (item.creator === user?._id || _find(_get(item, 'members', []), m => m.status === 'approved' || m.status === 'submission_accepted')?.member?.wallet === user?.wallet) {
                                            return (
                                                <Box key={index}>
                                                    <TaskCard
                                                        task={item}
                                                        daoUrl={DAO?.url}
                                                    />
                                                </Box>
                                            )
                                        }
                                        else return null;
                                    }
                                }
                                else {
                                    return (
                                        <Box
                                            key={index}
                                            className={classes.showAllCard}
                                            onClick={() => { navigate(`/${DAO.url}/tasks`, { state: { active: value } }) }}
                                        >
                                            <Typography sx={{ color: '#b12f15' }}>SHOW ALL</Typography>
                                        </Box>
                                    )
                                }
                            })
                        }
                    </Box>
                </TabPanel>

                {/* Tab panel for drafts tasks */}
                <TabPanel value={value} index={2} style={{ marginTop: '0.2rem' }}>
                <Box sx={{ width: '100%', background: '#FFF', padding: '26px 22px 26px 22px', borderRadius: '5px',overflow: 'auto' }}>
                        
                    <Box sx={{ width: '100%', background: '#FFF', borderRadius: '5px', maxHeight: '275px'}} display={"flex"} alignItems={"center"} flexWrap={"wrap"}>
                        {
                            isHelpIconOpen &&
                            <Box className={classes.helpCard}>
                                <Box className={classes.helpCardContent}>By creating tasks, you can <Typography component="span" sx={{ fontWeight: 700, fontSize: 16 }}> track progress, deadlines, </Typography> and <Typography component="span" sx={{ fontWeight: 700, fontSize: 16 }}> rewards on bounties, </Typography> and <Typography component="span" sx={{ fontWeight: 700, fontSize: 16 }}> assign contributors </Typography> to each task.</Box>
                            </Box>
                        }
                        {
                            parsedTasks['drafts'] && parsedTasks['drafts'].filter((item, index) => index < 6).map((item, index) => {
                                if (index <= 4) {
                                    return (
                                        <Box key={index}>
                                            <TaskCard
                                                task={item}
                                                daoUrl={DAO?.url}
                                            />
                                        </Box>
                                    )
                                }
                                else {
                                    return (
                                        <Box
                                            key={index}
                                            className={classes.showAllCard}
                                            onClick={() => { navigate(`/${DAO.url}/tasks`, { state: { active: value } }) }}
                                        >
                                            <Typography sx={{ color: '#b12f15' }}>SHOW ALL</Typography>
                                        </Box>
                                    )
                                }
                            })
                        }
                    </Box>
                    </Box>
                </TabPanel>

                {/* Tab panel for all tasks */}
                <TabPanel value={value} index={3} style={{ marginTop: '0.2rem' }}>
                    <Box sx={{ width: '100%', background: '#FFF', padding: '26px 22px 26px 22px', borderRadius: '5px', maxHeight: '275px', overflow: 'hidden' }} display={"flex"} alignItems={"center"} flexWrap={"wrap"}>
                        {
                            isHelpIconOpen &&
                            <Box className={classes.helpCard}>
                                <Box className={classes.helpCardContent}>By creating tasks, you can <Typography component="span" sx={{ fontWeight: 700, fontSize: 16 }}> track progress, deadlines, </Typography> and <Typography component="span" sx={{ fontWeight: 700, fontSize: 16 }}> rewards on bounties, </Typography> and <Typography component="span" sx={{ fontWeight: 700, fontSize: 16 }}> assign contributors </Typography> to each task.</Box>
                            </Box>
                        }
                        {
                            parsedTasks['allTasks'] && parsedTasks['allTasks'].filter((item, index) => index < 6).map((item, index) => {
                                let currentDate = moment();
                                let tempDate = moment(item.deadline);
                                let diff = tempDate.diff(currentDate, 'days');
                                if (index <= 4) {
                                    if (diff > -1) {
                                        return (
                                            <Box key={index}>
                                                <TaskCard
                                                    task={item}
                                                    daoUrl={DAO?.url}
                                                />
                                            </Box>
                                        )
                                    }
                                    else {
                                        if (item.creator === user?._id || _find(_get(item, 'members', []), m => m.status === 'approved' || m.status === 'submission_accepted')?.member?.wallet === user?.wallet) {
                                            return (
                                                <Box key={index}>
                                                    <TaskCard
                                                        task={item}
                                                        daoUrl={DAO?.url}
                                                    />
                                                </Box>
                                            )
                                        }
                                        else return null;
                                    }
                                }
                                else {
                                    return (
                                        <Box
                                            key={index}
                                            className={classes.showAllCard}
                                            onClick={() => { navigate(`/${DAO.url}/tasks`, { state: { active: value } }) }}
                                        >
                                            <Typography sx={{ color: '#b12f15' }}>SHOW ALL</Typography>
                                        </Box>
                                    )
                                }
                            })
                        }
                    </Box>
                </TabPanel>
            </Box>
        </Box>
    )
}