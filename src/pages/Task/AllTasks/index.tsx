import { Box, Chip, Container, Grid, IconButton, List, Tab, Tabs, Typography } from "@mui/material";
import { get as _get, groupBy as _groupBy, uniq as _uniq, find as _find } from 'lodash'
import { makeStyles } from "@mui/styles";
import React, { useEffect, useMemo, useState } from "react";
import LomadsIconButton from 'components/IconButton'
import ArchiveIcon from 'assets/svg/archiveIcon.svg'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import useTerminology from "hooks/useTerminology";
import TaskCard from "components/TaskCard";
import { useDAO } from "context/dao";
import Button from "components/Button";
import useTasks from "hooks/useTasks";
import useTask from "hooks/useTask";

import AssignSvg from 'assets/svg/assign.svg'
import SubmittedSvg from 'assets/svg/submitted.svg'
import OpenSvg from 'assets/svg/open.svg'
import AppliedSvg from 'assets/svg/applied.svg'
import RejectedSvg from 'assets/svg/rejected.svg'
import ApprovedSvg from 'assets/svg/approved.svg'
import PaidSvg from 'assets/svg/paid.svg'
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CreateTaskModal from "modals/Tasks/CreateTaskModal";
import useRole from "hooks/useRole";
import { useWeb3Auth } from "context/web3Auth";

const useStyles = makeStyles((theme: any) => ({
    root: {
        position: 'absolute',
        width: '100% !important',
        height: 'calc(100vh - 80px) !important',
    },
    mainContainer: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        overflow: 'auto',
        border: '',
        boxSizing: 'border-box',
    },
    contentContainer: {
        order: 1,
        flexGrow: 1,
        flexBasis: '65%',
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    headerContainer: {
        boxSizing: 'border-box',
        flexShrink: 0,
        '-webkit-user-select': 'none',
        '-ms-user-select': 'none',
        'user-select': 'none',
        backgroundColor: '#FFF',
    },
    header: {
        height: 107,
        paddingLeft: 116,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    headerTab: {
        padding: '8px 0px 8px 0px'
    },
    content: {
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        minHeight: '1.25em',
        overflowY: 'auto',
        overflowX: 'auto',
        position: 'relative',
    },
    contentWrapper: {
        padding: `16px 16px 16px 16px`,
        display: 'flex',
        flexDirection: 'row',
        //overflow: 'auto'
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

const TASK_STATUS: any = [
    { label: "Assigned to me", color: "#0ec1b0", icon: AssignSvg },
    { label: "Under review", color: "#6b99f7", icon: SubmittedSvg },
    { label: "Open", color: "#4ba1db", icon: OpenSvg },
    { label: "Applied", color: "#ffb600", icon: AppliedSvg },
    { label: "Rejected", color: "#e23b53", icon: RejectedSvg },
    { label: "Approved", color: "#27c46e", icon: ApprovedSvg },
    { label: "Paid", color: "#74d415", icon: PaidSvg },
]

const MANAGE_TASK_STATUS: any = [
    { label: "Open", color: "#4ba1db", icon: OpenSvg },
    { label: "Submitted", color: "#6b99f7", icon: SubmittedSvg },
    { label: "Assigned", color: "#0ec1b0", icon: AssignSvg },
    { label: "Approved", color: "#27c46e", icon: ApprovedSvg },
    { label: "Paid", color: "#74d415", icon: PaidSvg },
]

export default () => {
    const classes = useStyles();
    const navigate = useNavigate()
    const location = useLocation()
    const { account } = useWeb3Auth()
    const { DAO } = useDAO();
    const { projectId } = useParams();
    const { transformTask } = useTask()
    const [openCreateTask, setOpenCreateTask] = useState(false);
    const { transformWorkspace, transformTask: transformTaskLabel } = useTerminology(_get(DAO, 'terminologies', null))
    const [tab, setTab] = useState(0);
    const [initialLoad, setInitialLoad] = useState(true);
    const { parsedTasks } = useTasks(_get(DAO, 'tasks', []))
    const { myRole, can } = useRole(DAO, account, undefined)

    const myTasks = useMemo(() => {
        let arr: any[] = [];
        if (projectId) {
            arr = parsedTasks['myTask'].filter(task => (task.project?._id === projectId))
        }
        else {
            arr = parsedTasks['myTask'];
        }
        arr = arr.map((a: any) => transformTask(a))
        return _groupBy(arr, (a: any) => a?.visual?.status)
    }, [parsedTasks])

    const manageTasks = useMemo(() => {
        let arr: any[] = [];
        if (projectId) {
            arr = parsedTasks['manage'].filter(task => (task.project?._id === projectId))
        }
        else {
            arr = parsedTasks['manage'];
        }
        arr = arr.map((a: any) => transformTask(a))
        console.log("FILTERED", _find(arr, (ar: any) => ar?._id === "64834a13f8d25c69be221248"))
        console.log("FILTERED", _find(arr, (ar: any) => ar?.visual?.group.indexOf('Submitted') > -1))
        let groups: Array<string> = _uniq(arr.reduce((a: any, b: any) => a.concat(b?.visual?.group), []))
        let op: any = {}
        for (let index = 0; index < groups.length; index++) {
            const group: string = groups[index];
            console.log(group)
            let tsks = []
            for (let index = 0; index < arr.length; index++) {
                const tsk = arr[index];
                if (tsk?.visual?.group.indexOf(group) > -1)
                    tsks.push(tsk)
            }
            op[group] = tsks;
        }
        return op
    }, [parsedTasks])

    const drafts = useMemo(() => {
        let arr: any[] = [];
        if (projectId) {
            arr = parsedTasks['drafts'].filter(task => (task.project?._id === projectId))
        }
        else {
            arr = parsedTasks['drafts'];
        }
        return arr.map((a: any) => transformTask(a))
    }, [parsedTasks])

    const allTasks = useMemo(() => {
        let arr: any[] = [];
        if (projectId) {
            arr = parsedTasks['allTasks'].filter(task => (task.project?._id === projectId))
        }
        else {
            arr = parsedTasks['allTasks'];
        }
        return arr.map((a: any) => transformTask(a))
    }, [parsedTasks])

    useEffect(() => {
        if (initialLoad) {
            let activeTab: number = 0;
            if (parsedTasks) {
                if ((parsedTasks?.myTask || []).length == 0) {
                    activeTab = 1
                    if ((parsedTasks?.manage || []).length == 0)
                        activeTab = 3
                }
            }
            if (location?.state?.active)
                setTab(location?.state?.active)
            else
                setTab(activeTab)
            setInitialLoad(false)
        }
    }, [parsedTasks, initialLoad, location?.state?.active])

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
        <Box className={classes.root}>
            <Box className={classes.mainContainer}>
                <Box className={classes.contentContainer}>
                    <Box className={classes.headerContainer}>
                        <Box className={classes.header}>
                            <Box sx={{ pl: 6 }} display="flex" flexDirection="row" alignItems="center">
                                <IconButton disableRipple onClick={() => navigate(-1)} size="small" color="primary">
                                    <ArrowBackIosIcon />
                                </IconButton>
                                <Typography variant="h3">{transformTaskLabel().labelPlural}</Typography>
                            </Box>
                        </Box>
                        <Box className={classes.headerTab}>
                            <Container maxWidth="lg">
                                <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Tabs
                                            value={tab}
                                            onChange={(event: React.SyntheticEvent, newValue: number) => setTab(newValue)}
                                            aria-label="basic tabs example"
                                            TabIndicatorProps={{ hidden: true }}
                                            sx={{
                                                '& button': { color: 'rgba(118, 128, 141,0.5)', marginRight: '10px', textTransform: 'capitalize', fontSize: '22px', fontWeight: '400' },
                                                '& button.Mui-selected': { color: 'rgba(118, 128, 141,1)' },
                                            }}
                                        >
                                            <Tab label={`My ${transformTaskLabel().labelPlural}`} id={`simple-tab-${tab}`} aria-controls={`simple-tabpanel-${tab}`} />
                                            {/* <Tab label={`Manage`} id={`simple-tab-${tab}`} aria-controls={`simple-tabpanel-${tab}`} />
                                                <Tab label={`Drafts`} id={`simple-tab-${tab}`} aria-controls={`simple-tabpanel-${tab}`} /> */}
                                            <Tab
                                                label="Manage"
                                                id={`simple-tab-${tab}`} aria-controls={`simple-tabpanel-${tab}`}
                                                iconPosition="end"
                                                icon={
                                                    (applicationCount + submissionCount) > 0
                                                        ?
                                                        <Box
                                                            sx={tab === 1 ? { opacity: '1' } : { opacity: '0.5' }}
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
                                            />
                                            <Tab
                                                label="Drafts"
                                                id={`simple-tab-${tab}`} aria-controls={`simple-tabpanel-${tab}`}
                                                iconPosition="end"
                                                icon={
                                                    drafts.length > 0
                                                        ?
                                                        <Box
                                                            sx={tab === 2 ? { opacity: '1' } : { opacity: '0.5' }}
                                                            className={classes.iconContainer}
                                                            display={"flex"}
                                                            alignItems={"center"}
                                                            justifyContent={"center"}
                                                        >
                                                            <Typography sx={{ fontSize: 14, color: '#FFF' }}>{drafts.length}</Typography>
                                                        </Box>
                                                        :
                                                        <></>
                                                }
                                            />
                                            <Tab label={`All ${transformTaskLabel().labelPlural}`} id={`simple-tab-${tab}`} aria-controls={`simple-tabpanel-${tab}`} />
                                        </Tabs>
                                    </Box>
                                    <Box display="flex" flexDirection="row" alignItems="center">
                                        <LomadsIconButton onClick={() => { navigate(`/${DAO.url}/archivedTasks`) }}>
                                            <img src={ArchiveIcon} />
                                        </LomadsIconButton>
                                        {  can(myRole, 'task.create') &&
                                        <Button onClick={() => setOpenCreateTask(true)} sx={{ ml: 2 }} size="small" variant="contained" color="secondary">
                                            Create
                                        </Button>
                                        }
                                    </Box>
                                </Box>
                            </Container>
                        </Box>
                    </Box>
                    <Box className={classes.content}>
                        {tab === 0 &&
                            <Box className={classes.contentWrapper}>
                                {
                                    TASK_STATUS.map((taskStatus: any, _index: number) => {
                                        return (
                                            <Box key={taskStatus?.label} style={{
                                                minWidth: 340,
                                                marginRight: '20px',
                                                padding: '10px 0 0'
                                            }}>
                                                <Box>
                                                    <Chip avatar={<img style={{ width: 16, height: 16 }} src={taskStatus?.icon} />} size="small" sx={{ minWidth: 80, fontWeight: 700, color: taskStatus?.color, backgroundColor: `${taskStatus?.color}20` }} label={taskStatus?.label} />
                                                </Box>
                                                <List style={{ minHeight: '100%', marginTop: 8, borderRight: '1px solid hsla(214,9%,51%,.25)' }}>
                                                    {
                                                        _get(myTasks, taskStatus?.label, []).map((taskItem: any) => {
                                                            return (
                                                                <Box pt={2}>
                                                                    <TaskCard task={taskItem} daoUrl={DAO?.url} />
                                                                </Box>
                                                            )
                                                        })
                                                    }
                                                </List>
                                            </Box>
                                        )
                                    })
                                }
                            </Box>
                        }
                        {tab === 1 &&
                            <Box className={classes.contentWrapper}>
                                {
                                    MANAGE_TASK_STATUS.map((taskStatus: any, _index: number) => {
                                        return (
                                            <Box key={taskStatus?.label} style={{
                                                minWidth: 340,
                                                marginRight: '20px',
                                                padding: '10px 0 0'
                                            }}>
                                                <Box>
                                                    <Chip avatar={<img style={{ width: 16, height: 16 }} src={taskStatus?.icon} />} size="small" sx={{ minWidth: 80, fontWeight: 700, color: taskStatus?.color, backgroundColor: `${taskStatus?.color}20` }} label={taskStatus?.label} />
                                                </Box>
                                                <List style={{ minHeight: '100%', marginTop: 8, borderRight: '1px solid hsla(214,9%,51%,.25)' }}>
                                                    {
                                                        _get(manageTasks, taskStatus?.label, []).map((taskItem: any) => {
                                                            return (
                                                                <Box pt={2}>
                                                                    <TaskCard task={taskItem} daoUrl={DAO?.url} />
                                                                </Box>
                                                            )
                                                        })
                                                    }
                                                </List>
                                            </Box>
                                        )
                                    })
                                }
                            </Box>
                        }
                        {tab === 2 &&
                            <Box className={classes.contentWrapper}>
                                <Grid container justifyContent="flex-start">
                                    {
                                        drafts.map((taskItem: any) => {
                                            return (
                                                <Grid item sm={3}>
                                                    <TaskCard task={taskItem} daoUrl={DAO?.url} />
                                                </Grid>
                                            )
                                        })
                                    }
                                </Grid>
                            </Box>
                        }
                        {tab === 3 &&
                            <Box className={classes.contentWrapper}>
                                <Grid container justifyContent="flex-start">
                                    {
                                        allTasks.map((taskItem: any) => {
                                            return (
                                                <Grid pt={2} item sm={3}>
                                                    <TaskCard task={taskItem} daoUrl={DAO?.url} />
                                                </Grid>
                                            )
                                        })
                                    }
                                </Grid>
                            </Box>
                        }
                    </Box>
                </Box>
            </Box>
            <CreateTaskModal
                open={openCreateTask}
                closeModal={() => setOpenCreateTask(false)}
                selectedProject={null}
            />
        </Box>
    )
}