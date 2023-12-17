import React, { useMemo } from "react";
import { get as _get } from 'lodash'
import { Typography, Box, Card, CardContent } from "@mui/material";
import { makeStyles } from '@mui/styles';

import { FiCheck } from "react-icons/fi";
import { useAppSelector } from "helpers/useAppSelector";

interface MilestoneCardProps {
    index: number,
    milestone: any,
    editable: any,
    openModal(action1: any, action2: number): void,
}

const useStyles = makeStyles((theme: any) => ({
    milestoneCard: {
        width: '315px',
        height: '60px',
        padding: '0 !important',
        marginRight: '20px !important',
        marginBottom: '15px !important',
        borderRadius: '5px !important',
        display: 'flex !important'
    },
    milestoneContent: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        "&:last-child": {
            padding: '0 15px !important'
        }
    },
    milestoneText: {
        fontSize: '14px !important',
        fontWeight: '700 !important',
        color: '#76808D',
        textTransform: 'capitalize'
    },
}));

export default ({ index, milestone, editable = true, openModal }: MilestoneCardProps) => {
    const classes = useStyles();
    const { Project } = useAppSelector(store => store.project);

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

    if (milestone.complete) {
        return (
            <>
                <Card elevation={0} className={classes.milestoneCard} sx={{ background: 'rgba(24, 140, 124, 0.1)' }} key={index}>
                    <CardContent className={classes.milestoneContent}>
                        <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ width: '85%' }}>
                            <Box display={"flex"} alignItems={"center"}>
                                <Typography className={classes.milestoneText} sx={{ marginRight: '0.5rem', color: '#188C7C' }}>{index + 1}</Typography>
                                <Typography className={classes.milestoneText}>{milestone.name}</Typography>
                            </Box>
                            <Typography sx={{ color: '#76808D' }}>{milestone.deadline}</Typography>
                        </Box>
                        { editable && <Box onClick={() => openModal(milestone, index)} display={"flex"} alignItems={"center"} justifyContent={"center"} sx={{ height: 28, width: 28, borderRadius: 28, backgroundColor: '#188C7C', cursor: "pointer" }}>
                            <FiCheck size={20} color="#FFF" />
                        </Box> }
                    </CardContent>
                </Card>
            </>
        )
    }

    return (
        <>
            <Card
                className={classes.milestoneCard}
                sx={{
                    background: '#FFF',
                    boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1)',
                }}
                key={index}
            >
                <CardContent className={classes.milestoneContent}>
                    <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ width: '85%' }}>
                        <Box display={"flex"} alignItems={"center"}>
                            <Typography className={classes.milestoneText} sx={{ marginRight: '0.5rem' }}>{index + 1}</Typography>
                            <Typography className={classes.milestoneText}>{milestone.name}</Typography>
                        </Box>
                        <Typography sx={{ color: '#76808D' }}>{milestone.deadline}</Typography>
                    </Box>
                   { editable && <Box
                        onClick={() => {     
                            openModal(milestone, index) 
                        }}
                        display={"flex"} alignItems={"center"} justifyContent={"center"} sx={{ height: 28, width: 28, borderRadius: 28, border: '1px solid rgba(118, 128, 141, 0.5)', cursor: "pointer" }}
                    >
                        <FiCheck size={20} />
                    </Box> }
                </CardContent>
            </Card>
        </>
    )
}