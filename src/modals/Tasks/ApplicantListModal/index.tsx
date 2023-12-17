import React, { useState, useEffect, useMemo } from "react";
import { find as _find, get as _get, debounce as _debounce } from 'lodash';
import { Typography, Box, Drawer } from "@mui/material";
import { makeStyles } from '@mui/styles';

import IconButton from 'components/IconButton';
import Button from 'components/Button';

import CloseSVG from 'assets/svg/closeNew.svg'
import { IoIosArrowBack } from 'react-icons/io'

import { useDAO } from "context/dao";
import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";

import Avatar from "boring-avatars";
import { assignTaskAction, rejectTaskMemberAction } from "store/actions/task";
import theme from "theme";

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
    dots: {
        height: '10px',
        width: '10px',
        borderRadius: '5px !important',
        marginRight: '10px !important',
    },
    linkBtn: {
        width: '300px',
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
    const dispatch = useAppDispatch();
    // @ts-ignore
    const { Task, assignTaskLoading, rejectTaskMemberLoading } = useAppSelector(store => store.task);

    const [pos, setPos] = useState(0);

    const taskMembers = useMemo(() => {
        return _get(Task, 'members', []).filter((m: any) => (m.status !== 'rejected' && m.status !== 'submission_rejected'));
    }, [Task, rejectTaskMemberLoading, assignTaskLoading]);

    useEffect(() => {
        if (assignTaskLoading === false) {
            closeModal();
        }
    }, [assignTaskLoading]);

    useEffect(() => {
        if (rejectTaskMemberLoading === false) {
            if (taskMembers.length == 0) {
                closeModal();
            } else {
                setPos(0)
            }
        }
    }, [rejectTaskMemberLoading, taskMembers])

    const handleNext = () => {
        if (pos < taskMembers.length - 1) {
            setPos(pos + 1);
        }
        else {
            setPos(0);
        }
    }

    const handleBack = () => {
        if (pos > 0) {
            setPos(pos - 1);
        }
        else {
            setPos(taskMembers.length - 1);
        }
    }

    const RenderApplicantCard = ({ applicant }: any) => {
        if (!applicant) return null;
        return (
            <Box sx={{ width: '100%', height: '100%' }} display="flex" flexDirection={"column"} alignItems={"center"} justifyContent={"space-between"}>
                <Box sx={{ width: '100%', height: '90%', paddingTop: '27px' }} display="flex" flexDirection={"column"} alignItems={"center"}>
                    <Avatar
                        size={60}
                        name={_get(applicant, 'member.wallet', '')}
                        variant="marble"
                        colors={["#E67C40", "#EDCD27", "#8ECC3E", "#2AB87C", "#188C8C"]}
                    />
                    <Typography sx={{ fontSize: 20, color: '#c94B32', marginTop: '20px', marginBottom: '8px' }}>{_get(applicant, 'member.name', '')}</Typography>
                    <Typography sx={{ fontSize: 14, color: '#76808D', fontStyle: 'italic' }}>{_get(applicant, 'member.wallet', '').slice(0, 6) + "..." + _get(applicant, 'member.wallet', '').slice(-4)}</Typography>

                    <Box sx={{ width: '300px', margin: '35px 0' }}>
                        <Typography sx={{ fontSize: '16px', color: '#76808D', marginBottom: '14px', fontWeight: '700' }}>Note</Typography>
                        <Typography
                            dangerouslySetInnerHTML={{ __html: _get(applicant, 'note', '') }}
                        >
                        </Typography>
                    </Box>

                    <Box sx={{ width: '300px' }}>
                        <Typography sx={{ fontSize: '16px', color: '#76808D', marginBottom: '20px', fontWeight: '700' }}>Links</Typography>
                        {
                            applicant.links.map((item: any, index: number) => {
                                return (
                                    <button className={classes.linkBtn} onClick={() => window.open(item.link, '_blank', 'noopener,noreferrer')}>{item.title}</button>
                                )
                            })
                        }
                    </Box>

                </Box>
                <Box sx={{ width: '100%', height: '10%' }} display="flex" alignItems={"center"} justifyContent={"center"}>
                    {
                        applicant.status === 'pending' &&
                        <>
                            <Button disabled={rejectTaskMemberLoading || assignTaskLoading} variant="outlined" sx={{ marginRight: '20px' }} loading={rejectTaskMemberLoading} onClick={() => handleRejectMember(applicant)}>REJECT</Button>
                            <Button disabled={rejectTaskMemberLoading || assignTaskLoading} variant="contained" loading={assignTaskLoading} onClick={() => handleAssignTask(applicant)}>ASSIGN</Button>
                        </>
                    }
                </Box>
            </Box>
        )
    }

    const handleAssignTask = (applicant: any) => {
        dispatch(assignTaskAction({ taskId: _get(Task, '_id', ''), daoUrl: _get(DAO, 'url', ''), payload: { memberId: applicant.member._id } }));
    }

    const handleRejectMember = (applicant: any) => {
        dispatch(rejectTaskMemberAction({ taskId: _get(Task, '_id', ''), daoUrl: _get(DAO, 'url', ''), payload: { memberId: applicant.member._id } }));
    }

    return (
        <Drawer
            PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
            anchor={'right'}
            open={open}
            sx={{ zIndex: theme.zIndex.appBar + 1  }}
            hideBackdrop={hideBackdrop}
        >
            <Box className={classes.modalConatiner}>
                <Box sx={{ width: '100%', padding: '0 27px' }} display="flex" alignItems="center" justifyContent={"space-between"}>
                    <Typography sx={{ fontSize: 14, color: '#76808D', fontStyle: 'italic' }}>{_get(Task, 'name', '')}</Typography>
                    <IconButton onClick={closeModal}>
                        <img src={CloseSVG} />
                    </IconButton>
                </Box>
                <Box sx={{ width: '100%', height: '85%' }} display="flex" alignItems="center" justifyContent={"space-between"}>
                    <Box sx={{ height: '100%' }} display="flex" alignItems="center">
                        <button className={classes.controlBtn} onClick={handleBack}>
                            <IoIosArrowBack size={20} color="#C94B32" />
                        </button>
                    </Box>
                    <Box sx={{ height: '100%' }}>
                        <RenderApplicantCard applicant={taskMembers[pos]} />
                    </Box>
                    <Box sx={{ height: '100%' }} display="flex" alignItems="center">
                        <button className={classes.controlBtn} style={{ transform: 'rotate(180deg)' }} onClick={handleNext}>
                            <IoIosArrowBack size={20} color="#C94B32" />
                        </button>
                    </Box>
                </Box>

                <Box sx={{ width: '100%', height: '10%' }} display="flex" alignItems="center" justifyContent={"center"}>
                    {
                        taskMembers.map((item: any, index: number) => {
                            return (
                                <Box className={classes.dots} key={index} style={pos === index ? { backgroundColor: '#C94B32' } : { backgroundColor: '#f0f0f0' }}></Box>
                            )
                        })
                    }
                </Box>
            </Box>
        </Drawer>
    )
}