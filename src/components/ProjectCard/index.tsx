import React, { useMemo } from "react";
import { get as _get, find as _find, groupBy as _groupBy, orderBy as _orderBy } from 'lodash';
import { Typography, Box, Card, CardContent, Chip } from "@mui/material";
import { makeStyles } from '@mui/styles';

import { BsDiscord } from 'react-icons/bs';
import { FaTrello, FaGithub } from 'react-icons/fa';

import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";
import { useNavigate } from "react-router-dom"
import StepperProgress from "components/StepperProgress";
import { deleteProjectAction, updateProjectViewAction } from "store/actions/project";
import { useDAO } from "context/dao";

const useStyles = makeStyles((theme: any) => ({
    taskCard: {
        position: 'relative',
        width: '315px',
        height: '110px',
        padding: '0px !important',
        marginRight: '20px !important',
        marginBottom: '15px !important',
        borderRadius: '5px !important',
        display: 'flex !important',
        cursor: 'pointer',
        zIndex: '999 !important'
    },
    taskContent: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    taskText: {
        fontSize: '22px !important',
        color: '#B12F15 !important',
        marginBottom: '10px !important',
        lineHeight: '25px !important',
    },
    iconContainer: {
        width: '100%',
        height: '40px',
        padding: '0 10px !important',
        position: 'absolute',
        top: '-20px !important',
        right: '0 !important',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'flex-end !important',
    },
    iconPill: {
        height: '40px',
        width: '30%',
        padding: '0 10px !important',
        background: '#B12F15 !important',
        boxShadow: '3px 5px 20px rgba(27, 43, 65, 0.12), 0px 0px 20px rgba(201, 75, 50, 0.18) !important',
        borderRadius: '20px !important',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'center!important',
        marginLeft: '10px !important'
    },
}));

interface CardProps {
    project: any;
    daoUrl: string,
    tab?: number
}

export default ({ project, daoUrl, tab }: CardProps) => {
    const classes = useStyles();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { DAO } = useDAO();

    // @ts-ignore
    const { user } = useAppSelector(store => store.session);

    const notifications = useMemo(() => {
        let count = [];
        // @ts-ignore
        let links = project.links.map(l => {
            return { ...l, provider: new URL(l.link).hostname }
        })
        let grp = _groupBy(links, l => l.provider)
        for (let index = 0; index < Object.keys(grp).length; index++) {
            const provider = Object.keys(grp)[index];
            count.push({ provider, count: grp[provider].reduce((p, c) => (p + (+_get(c, 'notification', 0))), 0) })
        }
        return count
    }, [project]);

    const handleCardClick = () => {
        dispatch(updateProjectViewAction({ projectId: project._id, daoUrl: _get(DAO, 'url', '') }));
        navigate(`/${daoUrl}/project/${project._id}`, { state: { project } })
    }

    const handleDeleteProject = () => {
        dispatch(deleteProjectAction({ projectId: _get(project, '_id', ''), daoUrl: _get(DAO, 'url', '') }));
    }

    return (
        <>
            <Card
                className={classes.taskCard}
                sx={{
                    background: '#FFF',
                    overflow: 'inherit',
                    boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1)',
                }}
                onClick={handleCardClick}

            >
                { project?.isDummy ? <Chip style={{ position: 'absolute', top: 8, right: 8 }} clickable onClick={e => {
                    e.stopPropagation();
                    handleDeleteProject()
                }} sx={{ color: 'rgba(118, 128, 141, 0.5)', fontWeight: '700' }} size="small" label="Dismiss" /> : null }
                {
                    project.links.length > 0 && tab === 0
                        ?
                        <Box className={classes.iconContainer}>
                            {
                                notifications.map((notification: any, index: number) => {
                                    if (notification.provider.indexOf('discord') > -1 && notification.count) {
                                        return (
                                            <Box className={classes.iconPill} key={index}>
                                                <BsDiscord color='#FFF' size={20} />
                                                <p>+{notification.count}</p>
                                            </Box>
                                        )
                                    }
                                    return null
                                })
                            }
                        </Box>
                        :
                        <>
                            {
                                project.provider === 'Trello' && !project.viewers.includes(_get(user, '_id', ''))
                                    ?
                                    <Box className={classes.iconContainer}>
                                        <Box className={classes.iconPill}>
                                            <FaTrello color='#FFF' size={20} />
                                        </Box>
                                    </Box>
                                    :
                                    null
                            }
                            {
                                project.provider === 'Github' && !project.viewers.includes(_get(user, '_id', ''))
                                    ?
                                    <Box className={classes.iconContainer}>
                                        <Box className={classes.iconPill}>
                                            <FaGithub color='#FFF' size={20} />
                                        </Box>
                                    </Box>
                                    :
                                    null
                            }
                        </>
                }

                <CardContent className={classes.taskContent}>
                    <Typography className={classes.taskText}>{_get(project, 'name', '').length > 20 ? _get(project, 'name', '').substring(0, 20) + '...' : _get(project, 'name', '')}</Typography>

                    {
                        _get(project, 'milestones', []).length > 0 &&
                        <Box sx={{ width: '100%' }} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                            <Box sx={{ width: '195px' }}>
                                <StepperProgress variant="primary" milestones={_get(project, 'milestones', [])} />
                            </Box>
                            <Typography sx={{ fontSize: '14px', color: '#76808D' }}>
                                {
                                    (((_get(project, 'milestones', []).filter((item: any) => item.complete === true).length) / (_get(project, 'milestones', []).length)) * 100).toFixed(1)
                                }%
                            </Typography>
                        </Box>
                    }
                </CardContent>
            </Card>
        </>
    )
}