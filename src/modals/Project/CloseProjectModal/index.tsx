import React, { useEffect } from "react";
import { get as _get, find as _find, uniqBy as _uniqBy, sortBy as _sortBy } from 'lodash';
import { Typography, Box, Modal } from "@mui/material";
import { makeStyles } from '@mui/styles';
import iconSvg from 'assets/svg/createProject.svg';
import Button from "components/Button";

import { useNavigate, useParams } from 'react-router-dom';

import { useDAO } from "context/dao";
import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";
import { archiveProjectAction } from "store/actions/project";

const useStyles = makeStyles((theme: any) => ({
    modalTitle: {
        fontSize: '30px !important',
        lineHeight: '33px !important',
        textAlign: 'center',
        color: '#C94B32',
        margin: '20px 0 !important',
    },
    modalSubtitle: {
        color: '#76808d !important',
        fontSize: '14px !important',
        fontWeight: '400 !important',
        lineHeight: '16px !important',
        textAlign: 'center',
    }
}));

interface Props {
    open: boolean;
    closeModal(): any;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 573,
    bgcolor: 'background.paper',
    padding: '40px 22px',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
};

export default ({ open, closeModal }: Props) => {
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    // @ts-ignore
    const { Project, archiveProjectLoading } = useAppSelector(store => store.project);
    const { DAO } = useDAO();

    // runs after archiving a project
    useEffect(() => {
        if (archiveProjectLoading === false) {
            closeModal();
            navigate(-1);
        }
    }, [archiveProjectLoading]);

    const handleCloseProject = () => {
        dispatch(archiveProjectAction({ projectId: _get(Project, '_id', ''), daoUrl: _get(DAO, 'url', '') }));
    }

    return (
        <Modal
            open={open}
            onClose={closeModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style} display={"flex"} flexDirection={"column"} alignItems={"center"}>
                <img src={iconSvg} alt="icon-svg" style={{ width: '75px', height: '60px', objectFit: 'cover' }} />
                <Typography className={classes.modalTitle}>Close {_get(Project, 'name', '')}</Typography>
                <Typography className={classes.modalSubtitle}>This action is irreversible for now.</Typography>
                <Typography className={classes.modalSubtitle}>You will find closed projects in the archives.</Typography>
                <Box display={"flex"} alignItems={"center"} justifyContent={"center"} style={{ width: '100%', marginTop: '20px' }}>
                    <Button variant="outlined" sx={{ marginRight: '20px' }} onClick={closeModal}>NO</Button>
                    <Button variant="contained" onClick={handleCloseProject} loading={archiveProjectLoading}>YES</Button>
                </Box>
            </Box>
        </Modal>
    )
}