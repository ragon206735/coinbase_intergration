import React, { useEffect, useState } from "react";
import { get as _get, find as _find, uniqBy as _uniqBy, sortBy as _sortBy } from 'lodash';
import { Typography, Box, Modal } from "@mui/material";
import { makeStyles } from '@mui/styles';
import Button from "components/Button";

import { useNavigate } from 'react-router-dom';

import { useDAO } from "context/dao";
import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";
import { inviteProjectMembersAction } from "store/actions/project";
import Avatar from "components/Avatar";
import Checkbox from "components/Checkbox";

const useStyles = makeStyles((theme: any) => ({
    modalTitle: {
        fontSize: '16px !important',
        lineHeight: '18px !important',
        color: '#76808D',
        fontWeight: '700 !important',
        marginBottom: '1.5rem !important',
    },
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
    const { Project, inviteProjectMembersLoading } = useAppSelector(store => store.project);
    const { DAO } = useDAO();

    const [extraMembers, setExtraMembers] = useState<any[]>([]);

    useEffect(() => {
        if (inviteProjectMembersLoading === false) {
            closeModal();
            // navigate(-1);
        }
    }, [inviteProjectMembersLoading]);

    const handleSubmit = () => {
        dispatch(inviteProjectMembersAction({ projectId: _get(Project, '_id', ''), payload: { daoId: _get(DAO, '_id', null), memberList: extraMembers } }));
    }

    const handleAddMember = (user: any) => {
        if (extraMembers.includes(user.member._id)) {
            setExtraMembers(extraMembers.filter((m: any) => m !== user.member._id));
        }
        else {
            setExtraMembers([...extraMembers, user.member._id]);
        }
    }

    const handleUsers = (item: any, index: number) => {
        if (_uniqBy(Project?.members, '_id').some((m: any) => m.wallet === item.member.wallet) === false) {
            return (
                <Box
                    onClick={() => handleAddMember(item)}
                    sx={{ width: '100%', marginBottom: '10px' }}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    key={index}
                >
                    <Avatar name={item.member.name} wallet={item.member.wallet} />
                    <Checkbox checked={!(extraMembers.some((m) => m === item.member._id) === false)} />
                </Box>
            )
        }
        return null
    }

    return (
        <Modal
            open={open}
            onClose={closeModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style} display={"flex"} flexDirection={"column"}>
                <Typography className={classes.modalTitle}>Invite members</Typography>
                <Box sx={{ width: '100%', maxHeight: 300, overflow: 'hidden', overflowY: 'auto' }}>
                    {
                        _get(DAO, 'members', []).filter((m: any) => m.deletedAt === null).map((item: any, index: number) => handleUsers(item, index))
                    }
                </Box>
                <Box display={"flex"} alignItems={"center"} justifyContent={"center"} style={{ width: '100%', marginTop: '20px' }}>
                    <Button variant="outlined" sx={{ marginRight: '20px' }} onClick={closeModal}>CANCEL</Button>
                    <Button variant="contained" onClick={handleSubmit} loading={inviteProjectMembersLoading}>ADD</Button>
                </Box>
            </Box>
        </Modal>
    )
}