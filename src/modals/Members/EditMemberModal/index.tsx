import React, { useState, useEffect, useMemo } from "react";
import { get as _get, find as _find, uniqBy as _uniqBy, sortBy as _sortBy } from 'lodash';
import { Paper, Typography, Box, Drawer } from "@mui/material";
import { makeStyles } from '@mui/styles';

import IconButton from 'components/IconButton';
import TextInput from 'components/TextInput';
import Button from "components/Button";
import MuiSelect from "components/Select";

import CloseSVG from 'assets/svg/closeNew.svg'

import { useDAO } from "context/dao";
import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";
import theme from "theme";
import useRole from 'hooks/useRole';
import { useWeb3Auth } from 'context/web3Auth';
import AvatarComponent from "components/Avatar";
import binRed from 'assets/svg/bin-red.svg';
import binWhite from 'assets/svg/bin-white.svg';
import { DEFAULT_ROLES } from "constants/terminology";
import useTerminology from 'hooks/useTerminology';
import Avatar from "boring-avatars";
import { editDaoMemberAction, updateDaoMembersAction } from "store/actions/dao";
import { updateCurrentUser } from "store/actions/session";

const useStyles = makeStyles((theme: any) => ({
    root: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalConatiner: {
        width: 768,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '65px 65px 0 !important',
        position: 'relative',
        overflow: 'hidden !important'
    },
    rowOvercast: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.5) !important',
        position: 'absolute',
        zIndex: '998 !important'
    },
    deleteBtn: {
        width: '50px',
        height: '50px',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'center !important',
        borderRadius: ' 3px !important',
        zIndex: '999 !important',
        border: 'none !important',
        cursor: 'pointer !important',
    },
}));

interface Props {
    open: boolean;
    closeModal(): any;
}

export default ({ open, closeModal }: Props) => {
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const { DAO } = useDAO();
    const { account } = useWeb3Auth();
    // @ts-ignore
    const { updateDaoMembersLoading } = useAppSelector(store => store.dao);
    // @ts-ignore
    const { user } = useAppSelector(store => store?.session);

    console.log("user : ", user)

    const { myRole, can } = useRole(DAO, account, undefined)
    const { transformRole } = useTerminology(_get(DAO, 'terminologies'))

    const [deleteMembers, setDeleteMembers] = useState<any[]>([]);
    const [updateMembers, setUpdateMembers] = useState<any[]>([]);
    const [editableName, setEditableName] = useState('');

    useEffect(() => {
        if (updateDaoMembersLoading === false) {
            setDeleteMembers([]);
            setUpdateMembers([]);
            setEditableName('');
            closeModal();
        }
    }, [updateDaoMembersLoading]);

    useEffect(() => {
        let user = _find(_get(DAO, 'members', []), m => _get(m, 'member.wallet', '').toLowerCase() === account?.toLowerCase())
        if (user)
            setEditableName(user.member.name)
    }, [DAO]);

    const amIAdmin = useMemo(() => {
        if (DAO) {
            let user = _find(_get(DAO, 'members', []), m => _get(m, 'member.wallet', '').toLowerCase() === account?.toLowerCase() && m.role === 'role1')
            if (user)
                return true
            return false
        }
        return false;
    }, [account, DAO])

    const handleChangeName = (e: any) => {
        setEditableName(e.target.value);
    }

    const editableMembers = useMemo(() => {
        let members = []
        if (myRole === 'role1') {
            members = _get(DAO, 'members', []).filter((m: any) => m.role !== 'role1' && m.deletedAt === null)
        }
        let user = _find(_get(DAO, 'members', []), m => _get(m, 'member.wallet', '').toLowerCase() === account?.toLowerCase() && m.deletedAt === null)
        if (user)
            members.push(user)
        return members
    }, [DAO])

    const eligibleRoles = useMemo(() => {
        return Object.keys(_get(DAO, 'terminologies.roles', DEFAULT_ROLES)).filter((i: any) => i !== 'role1').map((item: any) => { return { label: _get(transformRole(item), 'label'), value: item } });
    }, [DAO]);

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            const member = { name: editableName };
            dispatch(editDaoMemberAction({ url: DAO?.url, payload: member }))
        }
    }

    const handleDeleteMembers = (userId: any) => {
        if (deleteMembers.includes(userId)) {
            setDeleteMembers(deleteMembers.filter((m) => m !== userId));
        }
        else {
            setDeleteMembers([...deleteMembers, userId]);
        }
    }

    const handleChangeRoles = (userId: any, role: any) => {
        let temp = updateMembers;
        const index = temp.map((object: any) => object.id).indexOf(userId);
        if (index === -1) {
            setUpdateMembers([...updateMembers, { id: userId, role }])
        }
        else {
            temp[index] = { id: userId, role }
            setUpdateMembers(temp);
        }
    }

    const handleSubmit = () => {
        if (editableName && editableName.length > 0)
            dispatch(updateCurrentUser({ name: editableName }))
        if (deleteMembers.length > 0 || updateMembers.length > 0) {
            dispatch(updateDaoMembersAction({ url: DAO?.url, payload: { deleteList: deleteMembers, updateList: updateMembers } }));
        }
        else {
            closeModal();
        }
    }

    return (
        <Drawer
            PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
            anchor={'right'}
            open={open}
            hideBackdrop={true}
            sx={{ zIndex: theme.zIndex.appBar + 1 }}
        >
            <Box className={classes.modalConatiner}>
                <Box sx={{ width: '100%', marginBottom: '45px' }} display="flex" alignItems="center" justifyContent={"space-between"}>
                    <Typography sx={{ fontSize: 14, color: '#76808D' }}>Manage members</Typography>
                    <IconButton onClick={closeModal}>
                        <img src={CloseSVG} />
                    </IconButton>
                </Box>

                <Box sx={{ width: '100%', height: '100%', overflowY: 'scroll', marginBottom: '100px' }}>
                    {
                        editableMembers.map((item: any, index: number) => {
                            if (!item.member) return;
                            return (
                                <Box sx={{ width: '100%', marginBottom: '20px', position: 'relative' }} key={index} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                                    {
                                        deleteMembers.includes(item.member._id)
                                            ?
                                            <Box className={classes.rowOvercast}></Box>
                                            :
                                            null
                                    }
                                    <Box display={"flex"} alignItems={"center"}>
                                        {
                                            item.member?.wallet?.toLowerCase() === account?.toLowerCase()
                                                ?
                                                <Box display={"flex"} alignItems={"center"} sx={{ width: '200px' }}>
                                                    <Avatar
                                                        key={`${item?.member?.name}-${item?.member?.wallet}`}
                                                        size={32}
                                                        name={item?.member?.wallet}
                                                        variant="marble"
                                                        colors={["#E67C40", "#EDCD27", "#8ECC3E", "#2AB87C", "#188C8C"]}
                                                    />
                                                    <Box sx={{ width: '150px', marginLeft: '10px' }}>
                                                        <TextInput
                                                            placeholder="Name"
                                                            fullWidth
                                                            value={editableName}
                                                            name="name"
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeName(e)}
                                                            onKeyDown={(e: any) => handleKeyDown(e)}
                                                        />
                                                    </Box>
                                                </Box>
                                                :
                                                <Box display={"flex"} alignItems={"center"} sx={{ width: '200px' }}>
                                                    <AvatarComponent
                                                        name={item?.member?.name}
                                                        hideDetails={item.member?.wallet?.toLowerCase() === account?.toLowerCase()}
                                                        wallet={item?.member?.wallet}
                                                    />
                                                </Box>
                                        }
                                    </Box>
                                    <Box sx={{ width: '180px' }}>
                                        <MuiSelect
                                            selected={item.role}
                                            options={item.member?.wallet?.toLowerCase() === account?.toLowerCase() ? Object.keys(_get(DAO, 'terminologies.roles', DEFAULT_ROLES)).map((item: any) => { return { label: _get(transformRole(item), 'label'), value: item } }) : eligibleRoles}
                                            setSelectedValue={(value) => handleChangeRoles(item._id, value)}
                                            disabled={!amIAdmin || item.role === "role1"}
                                        />
                                    </Box>
                                    {
                                        can(myRole, 'members.delete') && _get(item, 'member.wallet', '').toLowerCase() !== account?.toLowerCase()
                                            ?
                                            <>
                                                {
                                                    deleteMembers.includes(item.member._id)
                                                        ?
                                                        <button style={{ background: '#B12F15' }} className={classes.deleteBtn} onClick={() => handleDeleteMembers(item.member._id)}>
                                                            <img src={binWhite} alt="bin-white" />
                                                        </button>
                                                        :
                                                        <button style={{ background: 'linear-gradient(180deg, #FBF4F2 0%, #EEF1F5 100%)' }} className={classes.deleteBtn} onClick={() => handleDeleteMembers(item.member._id)}>
                                                            <img src={binRed} alt="bin-red" />
                                                        </button>
                                                }
                                            </>
                                            :
                                            <button style={{ background: 'grey' }} className={classes.deleteBtn}>
                                                <img src={binWhite} alt="bin-red" />
                                            </button>
                                    }
                                </Box>
                            )
                        })
                    }
                </Box>

                <Box display={"flex"} alignItems={"center"} justifyContent={"center"} style={{ width: '100%', height: '100px', position: 'absolute', bottom: '0', right: '0' }}>
                    <Button variant="outlined" sx={{ marginRight: '20px' }} onClick={closeModal}>CANCEL</Button>
                    <Button variant="contained" onClick={handleSubmit} loading={updateDaoMembersLoading}>SAVE CHANGES</Button>
                </Box>
            </Box>
        </Drawer>
    )
}