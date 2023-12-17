import React, { useState } from "react";
import { get as _get, find as _find, uniqBy as _uniqBy, sortBy as _sortBy } from 'lodash';
import { Typography, Box, Drawer } from "@mui/material";
import { makeStyles } from '@mui/styles';

import IconButton from 'components/IconButton';

import CloseSVG from 'assets/svg/closeNew.svg'
import settingSvg from 'assets/svg/settingXL.svg';
import editSvg from 'assets/svg/editToken.svg';
import Button from "components/Button";
import CloseProjectModal from "../CloseProjectModal";
import DeleteProjectModal from "../DeleteProjectModal";
import ResourcesModal from "../ResourcesModal";
import MilestonesModal from "../MilestonesModal";
import KraModal from "../KraModal";
import DetailsModal from "../DetailsModal";
import ProjectMembersModal from "../ProjectMembersModal";

import { useAppSelector } from "helpers/useAppSelector";
import theme from "theme";
import useTerminology from "hooks/useTerminology";
import { useDAO } from "context/dao";

const useStyles = makeStyles((theme: any) => ({
    root: {
        height: '100vh',
        overflowY: 'scroll',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        width: 575,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '36px 27px !important',
        background: 'linear-gradient(180deg, #fbf4f2, #eef1f5) !important'
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
    editCard: {
        width: '100%',
        height: '90px !important',
        background: '#FFF !important',
        borderRadius: '5px !important',
        boxShadow: '0px 3px 3px rgba(27, 43, 65, 0.1) !important',
        marginBottom: '20px !important',
        padding: '26px 22px !important'
    },
    editCloseCard: {
        width: '100%',
        background: '#FFF !important',
        borderRadius: '5px !important',
        boxShadow: '0px 3px 3px rgba(27, 43, 65, 0.1) !important',
        marginBottom: '20px !important',
        padding: '26px 22px !important'
    },
    cardTitle: {
        fontSize: '22px !important',
        lineHeight: '25px !important',
        color: '#76808D !important',
    }
}));

interface Props {
    open: boolean;
    closeModal(): any;
}

export default ({ open, closeModal }: Props) => {
    const classes = useStyles();
    const { DAO } = useDAO()
    // @ts-ignore
    const { Project } = useAppSelector(store => store.project);
    const [openCloseModal, setOpenCloseModal] = useState<boolean>(false);
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

    const [openMembers, setOpenMembers] = useState<boolean>(false);
    const [openDetails, setOpenDetails] = useState<boolean>(false);
    const [openResource, setOpenResource] = useState<boolean>(false);
    const [openMilestone, setOpenMilestone] = useState<boolean>(false);
    const [openKRA, setOpenKRA] = useState<boolean>(false);

    const { transformWorkspace } = useTerminology(_get(DAO, 'terminologies'));

    return (
        <Drawer
            PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
            sx={{ zIndex: theme.zIndex.appBar + 1 }}
            anchor={'right'}
            open={open}
        >
            <CloseProjectModal
                open={openCloseModal}
                closeModal={() => setOpenCloseModal(false)}
            />

            <DeleteProjectModal
                open={openDeleteModal}
                closeModal={() => setOpenDeleteModal(false)}
            />

            <DetailsModal
                open={openDetails}
                closeModal={() => setOpenDetails(false)}
            />

            <ProjectMembersModal
                open={openMembers}
                closeModal={() => setOpenMembers(false)}
            />

            <ResourcesModal
                open={openResource}
                closeModal={() => setOpenResource(false)}
                list={_get(Project, 'links', [])}
                getResources={(value) => console.log("TEST")}
                editResources={true}
                hideBackdrop={true}
            />

            <MilestonesModal
                open={openMilestone}
                closeModal={() => setOpenMilestone(false)}
                list={_get(Project, 'milestones', [])}
                getCompensation={(value) => console.log("TEST")}
                getMilestones={(value) => console.log("TEST")}
                editMilestones={true}
                hideBackdrop={true}
            />

{/*             <KraModal
                open={openKRA}
                closeModal={() => setOpenKRA(false)}
                list={_get(Project, 'kra.results', [])}
                freq={_get(Project, 'kra.frequency', '')}
                getResults={(value1: any[], value2: string) => console.log("TEST")}
                editKRA={true}
                hideBackdrop={true}
            /> */}

            <Box className={classes.modalContainer}>
                <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={closeModal}>
                    <img src={CloseSVG} />
                </IconButton>

                <Box sx={{ width: '100%', padding: '0 27px', marginTop: '60px' }} display={"flex"} flexDirection={"column"}>
                    <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginBottom: '35px' }}>
                        <img src={settingSvg} alt="project-resource" />
                        <Typography className={classes.modalTitle}>{ transformWorkspace().label } Settings</Typography>
                    </Box>

                    <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} className={classes.editCard}>
                        <Typography className={classes.cardTitle}>{ transformWorkspace().label } details</Typography>
                        <Box sx={{ cursor: 'pointer' }} onClick={() => setOpenDetails(true)}>
                            <img src={editSvg} alt="edit-svg" />
                        </Box>
                    </Box>

                    <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} className={classes.editCard}>
                        <Typography className={classes.cardTitle}>{ transformWorkspace().label } members</Typography>
                        <Box sx={{ cursor: 'pointer' }} onClick={() => setOpenMembers(true)}>
                            <img src={editSvg} alt="edit-svg" />
                        </Box>
                    </Box>

                    <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} className={classes.editCard}>
                        <Box>
                            <Typography className={classes.cardTitle}>{ transformWorkspace().label } resources</Typography>
                            <Typography sx={{ fontStyle: 'italic', fontSize: 14 }}>Add links for your team to access</Typography>
                        </Box>
                        <Box onClick={() => setOpenResource(true)} sx={{ cursor: 'pointer' }}>
                            <img src={editSvg} alt="edit-svg" />
                        </Box>
                    </Box>

                    <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} className={classes.editCard}>
                        <Box>
                            <Typography className={classes.cardTitle}>Milestones</Typography>
                            <Typography sx={{ fontStyle: 'italic', fontSize: 14 }}>Organise link payments to milestones</Typography>
                        </Box>
                        <Box onClick={() => setOpenMilestone(true)} sx={{ cursor: 'pointer' }}>
                            <img src={editSvg} alt="edit-svg" />
                        </Box>
                    </Box>

{/*                     <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} className={classes.editCard}>
                        <Box>
                            <Typography className={classes.cardTitle}>Key results</Typography>
                            <Typography sx={{ fontStyle: 'italic', fontSize: 14 }}>Set objective for your team</Typography>
                        </Box>
                        <Box onClick={() => setOpenKRA(true)} sx={{ cursor: 'pointer' }}>
                            <img src={editSvg} alt="edit-svg" />
                        </Box>
                    </Box> */}

                    <Box display={"flex"} flexDirection={"column"} className={classes.editCloseCard}>
                        <Box>
                            <Typography className={classes.cardTitle}>Close { transformWorkspace().label }</Typography>
                            <Typography sx={{ fontStyle: 'italic', fontSize: 14 }}>The { transformWorkspace().label } will appear in archives</Typography>
                        </Box>
                        <Button
                            fullWidth
                            variant='contained'
                            color="secondary"
                            sx={{ height: 40, color: '#C94B32', fontSize: 16, marginTop: '10px' }}
                            onClick={() => setOpenCloseModal(true)}
                        >
                            CLOSE { transformWorkspace().label.toUpperCase() }
                        </Button>
                    </Box>

                    <Box display={"flex"} flexDirection={"column"} className={classes.editCloseCard}>
                        <Box>
                            <Typography className={classes.cardTitle}>Delete Workspace</Typography>
                            <Typography sx={{ fontStyle: 'italic', fontSize: 14 }}>The { transformWorkspace().label } will not appear in archives</Typography>
                        </Box>
                        <Button
                            fullWidth
                            variant='contained'
                            color="secondary"
                            sx={{ height: 40, fontSize: 16, marginTop: '10px' }}
                            onClick={() => setOpenDeleteModal(true)}
                        >
                            DELETE { transformWorkspace().label.toUpperCase() }
                        </Button>
                    </Box>

                </Box>

            </Box>
        </Drawer>
    )
}