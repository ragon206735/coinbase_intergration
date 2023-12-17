import { Box, Chip, Container, Grid, IconButton, List, Tab, Tabs, Typography } from "@mui/material";
import { get as _get, groupBy as _groupBy, find as _find, orderBy as _orderBy } from 'lodash'
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
import { useAppSelector } from "helpers/useAppSelector";
import { useAppDispatch } from "helpers/useAppDispatch";
import { createAccountAction } from "store/actions/session";
import { useWeb3Auth } from "context/web3Auth";
import ProjectCard from "components/ProjectCard";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import useRole from "hooks/useRole";

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
        padding: 16,
        display: 'flex',
        flexDirection: 'row',
        //overflow: 'auto'
    },
}));

export default () => {
    const classes = useStyles();
    const location = useLocation();
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [initialCheck, setInitialCheck] = useState(false)
    const { account } = useWeb3Auth()
    const { DAO } = useDAO();
    const { user } = useAppSelector((store: any) => store?.session)
    const { transformWorkspace, transformTask: transformTaskLabel } = useTerminology(_get(DAO, 'terminologies', null))
    const [tab, setTab] = useState(0);
    const { myRole, can } = useRole(DAO, account, undefined)

    useEffect(() => {
        if (!user) {
            dispatch(createAccountAction({}))
        }
    }, [user])


    const notificationCount = (project: any) => {
        let count = [];
        let links = project.links.map((l: any) => {
            return { ...l, provider: new URL(l.link).hostname }
        })
        let grp = _groupBy(links, l => l.provider)
        for (let index = 0; index < Object.keys(grp).length; index++) {
            const provider = Object.keys(grp)[index];
            count.push({ provider, count: grp[provider].reduce((p, c) => (p + (+_get(c, 'notification', 0))), 0) })
        }
        console.log(count)
        return count
    }

    const myProjects = useMemo(() => {
        if (DAO?.url && user) {
            let myProjects = _get(DAO, 'projects', []).filter((project: any) => !project.deletedAt && !project.archivedAt && _find(project.members, (m: any) => m.wallet.toLowerCase() === account.toLowerCase()));
            myProjects = myProjects.map((p: any) => {
                let prj = { ...p, notification: 0 }
                if (notificationCount(prj).length > 0)
                    prj.notification = 1
                return prj;
            })
            return _orderBy(myProjects, ['notification', (p: any) => moment(p.createdAt).unix()], ['desc', 'desc'])
        }
        return []
    }, [DAO?.url, user])

    useEffect(() => {
        if (!initialCheck) {
            setInitialCheck(true);
            let activeTab = 0
            if (myProjects.length > 0)
                activeTab = 0
            else
                activeTab = 1

            if (location?.state?.active)
                setTab(location?.state?.active)
            else
                setTab(activeTab)
            setInitialCheck(false)
        }
    }, [myProjects, initialCheck, location?.state?.active]);

    const otherProjects = useMemo(() => {
        if (DAO?.url && user) {
            let otherProjects = _get(DAO, 'projects', []).filter((project: any) => !project.deletedAt && !project.archivedAt && !_find(project.members, (m: any) => m.wallet.toLowerCase() === account.toLowerCase()))
            otherProjects = otherProjects.map((p: any) => {
                let prj = { ...p, notification: 0 }
                if (notificationCount(prj).length > 0)
                    prj.notification = 1
                return prj;
            })
            return _orderBy(myProjects.concat(otherProjects), p => moment(p.createdAt).unix(), 'desc')
        }
        return []
    }, [DAO?.url, user, myProjects])

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
                                <Typography variant="h3">{transformWorkspace().labelPlural}</Typography>
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
                                            <Tab label={`My ${transformWorkspace().labelPlural}`} id={`simple-tab-${tab}`} aria-controls={`simple-tabpanel-${tab}`} />
                                            <Tab label={`All ${transformWorkspace().labelPlural}`} id={`simple-tab-${tab}`} aria-controls={`simple-tabpanel-${tab}`} />
                                        </Tabs>
                                    </Box>
                                    <Box display="flex" flexDirection="row" alignItems="center">
                                        <LomadsIconButton onClick={() => navigate(`/${DAO.url}/archivedProjects`)}>
                                            <img src={ArchiveIcon} />
                                        </LomadsIconButton>
                                        { can(myRole, 'project.create') &&
                                        <Button sx={{ ml: 2 }} size="small" variant="contained" color="secondary" onClick={() => navigate(`/${DAO.url}/project/create`)}>
                                            Create
                                        </Button>
                                        }
                                    </Box>
                                </Box>
                            </Container>
                        </Box>
                    </Box>
                    <Box className={classes.content} sx={{ paddingTop: '20px' }}>
                        {tab === 0 &&
                            <Box className={classes.contentWrapper}>
                                <Grid columnSpacing={2} container justifyContent="flex-start">
                                    {
                                        myProjects.map((taskItem: any) => {
                                            return (
                                                <Grid item xs={1} sm={2} md={3} mt={2}>
                                                    <ProjectCard tab={tab + 1} project={taskItem} daoUrl={DAO?.url} />
                                                </Grid>
                                            )
                                        })
                                    }
                                </Grid>
                            </Box>
                        }
                        {tab === 1 &&
                            <Box className={classes.contentWrapper}>
                                <Grid columnSpacing={2} container justifyContent="flex-start">
                                    {
                                        otherProjects.map((taskItem: any) => {
                                            return (
                                                <Grid item xs={1} sm={2} md={3} mt={2}>
                                                    <ProjectCard tab={tab + 1} project={taskItem} daoUrl={DAO?.url} />
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
        </Box>
    )
}