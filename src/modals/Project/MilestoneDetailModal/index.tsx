import React from "react";
import { uniqBy as _uniqBy, get as _get, find as _find } from 'lodash'
import { Typography, Box, Drawer, } from "@mui/material";
import { makeStyles } from '@mui/styles';
import IconButton from 'components/IconButton';
import Button from 'components/Button';
import { FiCheck } from "react-icons/fi";

import CloseSVG from 'assets/svg/closeNew.svg'
import MilestoneSVG from 'assets/svg/milestone.svg'
import theme from "theme";
import moment from "moment";

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
        justifyContent: 'center',
        padding: '27px 27px 100px 27px !important',
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
    modalText: {
        color: '#76808D',
        fontSize: '16px !important',
        fontWeight: '700 !important',
        lineHeight: '18px !important',
    },
    specialButton: {
        width: '100% !important',
        fontSize: '15px !important',
        backgroundColor: "#188C7C !important",
        color: '#FFF !important',
    },
    specialButtonDisabled: {
        width: '100% !important',
        fontSize: '15px !important',
        backgroundColor: "grey !important",
    }
}));

interface Props {
    open: boolean,
    editable?: boolean,
    selectedMilestone: any,
    closeModal(): any;
    openAssignContribution(): any;
}

export default ({ open, editable = true, selectedMilestone, closeModal, openAssignContribution }: Props) => {

    const classes = useStyles();

    console.log("selectedMilestone : ", selectedMilestone);

    return (
        <Drawer
            PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
            sx={{ zIndex: theme.zIndex.appBar + 1 }}
            anchor={'right'}
            open={open}
        >
            <Box className={classes.modalConatiner}>
                <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={closeModal}>
                    <img src={CloseSVG} />
                </IconButton>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <img src={MilestoneSVG} alt="project-resource" />
                    <Typography className={classes.modalTitle}>{selectedMilestone?.name}</Typography>
                </Box>
                {
                    selectedMilestone?.complete
                        ?
                        <Box display="flex" flexDirection="column" sx={{ width: '340px', marginTop: '35px', padding: '20px', background: '#E8F4F2', borderRadius: '5px' }}>
                            <Box display="flex" alignItems='center' justifyContent="flex-end" sx={{ marginBottom: '10px' }}>
                                <Typography sx={{ color: '#188C7C', fontSize: '14px', marginRight: '10px' }}>Completed</Typography>
                                <Box display={"flex"} alignItems={"center"} justifyContent={"center"} sx={{ height: 30, width: 30, borderRadius: 30, border: '1.5px solid #188C7C', marginRight: '13px' }}>
                                    <FiCheck size={20} color="#188C7C" />
                                </Box>
                            </Box>
                            <Typography className={classes.modalText} sx={{ marginBottom: '20px' }}>{selectedMilestone?.amount}% of the project value</Typography>
                            <Typography className={classes.modalText} sx={{ marginBottom: '20px' }}>Due date : {moment(selectedMilestone?.deadline).format('L')}</Typography>
                            {
                                selectedMilestone?.deliverables !== '' &&
                                <Box>
                                    <Typography className={classes.modalText} sx={{ marginBottom: '8px' }}>Deliverables</Typography>
                                    <Typography dangerouslySetInnerHTML={{ __html: selectedMilestone?.deliverables }}></Typography>
                                </Box>
                            }
                        </Box>
                        :
                        <Box display="flex" flexDirection="column" sx={{ width: '300px', marginTop: '55px' }}>
                            <Typography className={classes.modalText} sx={{ marginBottom: '20px' }}>{selectedMilestone?.amount}% of the project value</Typography>
                            <Typography className={classes.modalText} sx={{ marginBottom: '20px' }}>Due date : {moment(selectedMilestone?.deadline).format('L')}</Typography>
                            {
                                selectedMilestone?.deliverables !== '' &&
                                <Box>
                                    <Typography className={classes.modalText} sx={{ marginBottom: '8px' }}>Deliverables</Typography>
                                    <Typography dangerouslySetInnerHTML={{ __html: selectedMilestone?.deliverables }}></Typography>
                                </Box>
                            }
                            {/* <button disabled={!editable} onClick={() => { console.log(selectedMilestone); openAssignContribution(); closeModal() }} style={{ width: '100%', height: '50px', borderRadius: '5px', marginTop: '50px', border: 'none', backgroundColor: '#188C7C', boxShadow: '2px 1px 8px rgba(27, 43, 65, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px', color: '#FFF' }}>
                                <Box display={"flex"} alignItems={"center"} justifyContent={"center"} sx={{ height: 30, width: 30, borderRadius: 30, border: '1.5px solid #FFF', marginRight: '13px' }}>
                                    <FiCheck size={20} color="#FFF" />
                                </Box>
                                MARK AS COMPLETE
                            </button> */}
                            <Button onClick={() => { console.log(selectedMilestone); openAssignContribution(); closeModal() }} startIcon={<FiCheck size={20} color="#FFF" />} disabled={!editable} className={editable ? classes.specialButton : classes.specialButtonDisabled}>
                                MARK AS COMPLETE
                            </Button>
                        </Box>
                }
            </Box>
        </Drawer>
    )
}