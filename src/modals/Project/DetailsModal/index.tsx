import React, { useState, useEffect } from "react";
import { get as _get, find as _find, uniqBy as _uniqBy, sortBy as _sortBy } from 'lodash';
import { Paper, Typography, Box, Drawer } from "@mui/material";
import { makeStyles } from '@mui/styles';

import IconButton from 'components/IconButton';
import TextInput from 'components/TextInput';
import Button from "components/Button";
import TextEditor from 'components/TextEditor'

import CloseSVG from 'assets/svg/closeNew.svg'
import createProjectSvg from 'assets/svg/createProject.svg';

import { useDAO } from "context/dao";
import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";
import { updateProjectDetailsAction } from "store/actions/project";
import theme from "theme";
import useTerminology from "hooks/useTerminology";

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
        padding: '27px !important',
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
    paperContainer: {
        borderRadius: 5,
        padding: '26px 22px',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1) !important'
    },
}));

interface Props {
    open: boolean;
    closeModal(): any;
}

export default ({ open, closeModal }: Props) => {
    const classes = useStyles();
    const dispatch = useAppDispatch();
    // @ts-ignore
    const { Project, updateProjectDetailsLoading } = useAppSelector(store => store.project);
    const { DAO } = useDAO();
    const [name, setName] = useState<string>(_get(Project, 'name', ''));
    const [desc, setDesc] = useState<string>(_get(Project, 'description', ''));


    const { transformWorkspace } = useTerminology(_get(DAO, 'terminologies'));

    // runs after updating a project
    useEffect(() => {
        if (updateProjectDetailsLoading === false) {
            closeModal();
        }
    }, [updateProjectDetailsLoading]);

    const handleSave = () => {
        // @ts-ignore
        dispatch(updateProjectDetailsAction({ projectId: _get(Project, '_id', ''), daoUrl: _get(DAO, 'url', ''), payload: { name, description: desc } }));
    }

    return (
        <Drawer
            PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
            anchor={'right'}
            open={open}
            sx={{ zIndex: theme?.zIndex?.appBar + 1 }}
            hideBackdrop={true}
        >
            <Box className={classes.modalConatiner}>
                <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={closeModal}>
                    <img src={CloseSVG} />
                </IconButton>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <img src={createProjectSvg} alt="project-resource" />
                    <Typography className={classes.modalTitle}>{ transformWorkspace().label } Details</Typography>
                </Box>
                <Box display="flex" flexDirection="column" alignItems={"center"} sx={{ width: '80%', marginTop: '35px' }}>
                    <Paper className={classes.paperContainer} sx={{ width: 394 }}>
                        <Box sx={{ marginBottom: '20px' }}>
                            <TextInput
                                label={`Name of the ${ transformWorkspace().label }`}
                                placeholder={ `Super ${ transformWorkspace().label }` }
                                fullWidth
                                value={name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            />
                        </Box>
                        <Box sx={{ marginBottom: '20px' }}>
                            <TextEditor
                                fullWidth
                                height={90}
                                width={350}
                                placeholder="Marketing BtoB"
                                label="Short description"
                                value={desc}
                                onChange={(value: string) => setDesc(value)}
                            />
                        </Box>
                        <Button
                            variant='contained'
                            disabled={name !== '' && desc !== '' ? false : true}
                            sx={{ width: 350 }}
                            onClick={handleSave}
                            loading={updateProjectDetailsLoading}
                        >
                            SAVE
                        </Button>
                    </Paper>
                </Box>
            </Box>
        </Drawer>
    )
}