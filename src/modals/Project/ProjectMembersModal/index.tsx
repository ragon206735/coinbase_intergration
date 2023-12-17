import React, { useState, useEffect, useMemo } from "react";
import { get as _get, find as _find, uniqBy as _uniqBy, sortBy as _sortBy } from 'lodash';
import { Paper, Typography, Box, Chip, Drawer } from "@mui/material";
import { makeStyles } from '@mui/styles';

import IconButton from 'components/IconButton';
import Switch from "components/Switch";
import Dropdown from "components/Dropdown";
import Checkbox from "components/Checkbox";
import Button from "components/Button";
import Avatar from "components/Avatar";

import CloseSVG from 'assets/svg/closeNew.svg'
import createProjectSvg from 'assets/svg/createProject.svg';

import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";
import { useDAO } from "context/dao";

import useTerminology from 'hooks/useTerminology';
import { updateProjectMembersAction } from "store/actions/project";
import theme from "theme";

import { IoIosClose } from 'react-icons/io';
import AddIcon from '@mui/icons-material/Add';

import InviteMemberModal from "modals/Tasks/InviteMemberModal";
import RolesListModal from "modals/Tasks/RolesListModal";

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
        padding: '0 22px',
    },
    addMemberBtn: {
        width: '209px',
        hieght: '40px',
        background: '#FFFFFF !important',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), - 3px - 3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '5px !important',
        fontSize: '14px !important',
        color: '#C94B32 !important'
    },
    divider: {
        width: 210,
        border: '2px solid #C94B32',
        margin: '35px 0 !important'
    },
    rolePill: {
        width: 107,
        height: 22,
        borderRadius: '100px !important',
        display: "flex !important",
        alignItems: "center !important",
        justifyContent: "space-between !important",
        marginRight: '5px !important',
        marginBottom: '5px !important',
        padding: '0 5px !important'
    },
    inviteCard: {
        width: 404,
        background: '#FFF',
        borderRadius: '5px !important',
        padding: 22
    },
    roleAvatar: {
        height: 14,
        width: 14,
        borderRadius: '50% !important',
        marginRight: '5px !important'
    },
    createBtn: {
        width: '115px',
        height: '40px',
        color: '#C94B32 !important',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'space-around !important'
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
    const { Project, updateProjectMembersLoading } = useAppSelector(store => store.project);
    const { DAO } = useDAO();
    const { transformWorkspace, transformRole } = useTerminology(_get(DAO, 'terminologies'));
    const [updateMembers, setUpdateMembers] = useState(_get(Project, 'members', []).map((_item: any) => { return _item._id }));
    const [toggle, setToggle] = useState(_get(Project, 'inviteType', '') === 'Open' ? false : true);
    const [selectType, setSelectType] = useState(_get(Project, 'inviteType', ''));

    const [selectedRoles, setSelectedRoles] = useState(_get(Project, 'validRoles', []));

    const [selectedMembers, setSelectedMembers] = useState<any[]>(_get(Project, 'invitations', []));

    const [roleType, setRoleType] = useState('');
    const [openRolesList, setOpenRolesList] = useState(false);
    const [openInviteMember, setOpenInviteMember] = useState(false);

    // runs after updating members
    useEffect(() => {
        if (updateProjectMembersLoading === false) {
            closeModal();
        }
    }, [updateProjectMembersLoading]);

    // const all_roles = useMemo(() => {
    //     let roles: any[] = [];
    //     Object.keys(_get(DAO, 'discord', {})).map((server) => {
    //         const r = DAO.discord[server].roles
    //         roles = roles.concat(r);
    //     })
    //     return roles.filter(r => r.name !== "@everyone" && r.name !== 'Lomads' && r.name !== 'LomadsTestBot');
    // }, [DAO.discord]);

    // const handleAddMemberDelete = (userId: any) => {
    //     if (updateMembers.includes(userId)) {
    //         setUpdateMembers(updateMembers.filter((m: any) => m !== userId));
    //     }
    //     else {
    //         setUpdateMembers([...updateMembers, userId]);
    //     }
    // }

    // const handleAddRoles = (role: any) => {
    //     const roleExists = _find(selectedRoles, m => m.toLowerCase() === role.toLowerCase())
    //     if (roleExists)
    //         setSelectedRoles((prev: any) => prev.filter((item: any) => item.toLowerCase() !== role.toLowerCase()));
    //     else {
    //         setSelectedRoles([...selectedRoles, role]);
    //     }
    // }

    // const handleRenderMemberList = () => {
    //     return (
    //         <Paper elevation={0} className={classes.paperContainer} sx={{ width: 480 }}>
    //             {
    //                 _sortBy(_get(DAO, 'members', []), m => _get(m, 'member.name', '').toLowerCase(), 'asc').filter((m) => m.deletedAt === null).map((item: any, index: number) => {
    //                     return (
    //                         <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} key={index} onClick={() => handleAddMemberDelete(item.member._id)}>
    //                             <Avatar name={item.member.name} wallet={item.member.wallet} />
    //                             <Checkbox checked={!(updateMembers.some((m: any) => m === item.member._id) === false)} />
    //                         </Box>
    //                     )
    //                 })
    //             }
    //         </Paper>
    //     )
    // }

    // const handleRenderRolesList = () => {
    //     return (
    //         <Paper elevation={0} className={classes.paperContainer} sx={{ width: 480 }}>
    //             <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ marginBottom: '22px' }}>
    //                 <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#76808D' }}>Organisation Roles</Typography>
    //             </Box>

    //             {
    //                 Object.keys(_get(DAO, 'terminologies.roles', {})).map((key, index) => {
    //                     return (
    //                         <>
    //                             <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} key={index} onClick={() => handleAddRoles(key)}>
    //                                 <Chip
    //                                     label={_get(transformRole(key), 'label')}
    //                                     className={classes.rolePill}
    //                                     avatar={
    //                                         <Box sx={
    //                                             index === 0 ? { background: 'rgba(146, 225, 168, 1)', borderRadius: '50% !important', } :
    //                                                 index === 1 ? { background: 'rgba(137,179,229,1)', borderRadius: '50% !important', } :
    //                                                     index === 2 ? { background: 'rgba(234,100,71,1)', borderRadius: '50% !important', } : { background: 'rgba(146, 225, 168, 1)', borderRadius: '50% !important', }

    //                                         }></Box>
    //                                     }
    //                                     sx={
    //                                         index === 0 ? { background: 'rgba(146, 225, 168, 0.3)' } :
    //                                             index === 1 ? { background: 'rgba(137,179,229,0.3)' } :
    //                                                 index === 2 ? { background: 'rgba(234,100,71,0.3)' } : { background: 'rgba(146, 225, 168, 0.3)' }
    //                                     }
    //                                 />
    //                                 <Checkbox checked={!(selectedRoles.some((m: any) => m.toLowerCase() === key.toLowerCase()) === false)} />
    //                             </Box>
    //                         </>
    //                     )
    //                 })
    //             }
    //             {
    //                 all_roles && all_roles.length > 0 &&
    //                 <>
    //                     <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ margin: '22px 0' }}>
    //                         <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#76808D' }}>Discord Roles</Typography>
    //                     </Box>
    //                     {
    //                         all_roles.map((discord_value, index) => {
    //                             return (
    //                                 <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} key={index} onClick={() => handleAddRoles(discord_value.id)}>
    //                                     <Chip
    //                                         label={discord_value.name}
    //                                         className={classes.rolePill}
    //                                         avatar={<Box sx={{ background: _get(discord_value, 'roleColor', '#99aab5'), borderRadius: '50%' }}></Box>}
    //                                         sx={{ background: `${_get(discord_value, 'roleColor', '#99aab5')}50` }}
    //                                     />
    //                                     <Checkbox checked={!(selectedRoles.some((m: any) => m.toLowerCase() === discord_value.id.toLowerCase()) === false)} />
    //                                 </Box>
    //                             )
    //                         })
    //                     }
    //                 </>
    //             }
    //         </Paper>
    //     )
    // }

    const getroleColor = (roleId: any) => {

        if (roleId == "role1" || roleId == "role2" || roleId == "role3" || roleId == "role4") {
            if (roleId === 'role1')
                return { pill: 'rgba(146, 225, 168, 0.3)', circle: 'rgba(146, 225, 168, 1)' };
            else if (roleId === 'role2')
                return { pill: 'rgba(137,179,229,0.3)', circle: 'rgba(137,179,229,1)' };
            else if (roleId === 'role3')
                return { pill: 'rgba(234,100,71,0.3)', circle: 'rgba(234,100,71,1)' };
            else if (roleId === 'role4')
                return { pill: 'rgba(146, 225, 168, 0.3)', circle: 'rgba(146, 225, 168, 1)' };
        }
        for (let index = 0; index < Object.keys(_get(DAO, 'discord', {})).length; index++) {
            const element = Object.keys(_get(DAO, 'discord', {}))[index];
            const rolename_discord = _find(DAO.discord[element].roles, r => r.id === roleId)
            if (rolename_discord) {
                return { pill: `${_get(rolename_discord, 'roleColor', '#99aab5')}50`, circle: _get(rolename_discord, 'roleColor', '#99aab5') }
            }
        }
        return { pill: '#99aab550', circle: '#99aab5' };
    };

    const getrolename = (roleId: any) => {

        for (let index = 0; index < Object.keys(_get(DAO, 'discord', {})).length; index++) {
            const element = Object.keys(_get(DAO, 'discord', {}))[index];
            const rolename_discord = _find(DAO.discord[element].roles, r => r.id === roleId)
            if (rolename_discord) {
                return rolename_discord.name
            }
        }
        return "";
    };

    const handleRemoveRole = (role: any) => {
        let newRoles = selectedRoles.filter((item: any) => item !== role)
        setSelectedRoles(newRoles);
    }

    const handleRemoveInvitation = (invite: any) => {
        let newInvites = selectedMembers.filter((item: any) => item.address !== invite.address)
        setSelectedMembers([...newInvites])
    }

    const handleEditMembers = () => {

        if (!toggle) {
            console.log("open")
            let arr = [];
            for (let i = 0; i < DAO.members.length; i++) {
                let user = DAO.members[i];
                arr.push(user.member._id)
            }
            dispatch(updateProjectMembersAction({ projectId: _get(Project, '_id', ''), payload: { daoId: _get(DAO, '_id', null), memberList: arr, inviteType: 'Open', validRoles: [], invitations: [] } }));
        }

        else {
            let arr = [];
            for (let i = 0; i < DAO.members.length; i++) {
                let user = DAO.members[i];
                if (user.deletedAt === null) {
                    if (selectedRoles.length > 0) {

                        if (user.discordRoles) {
                            let myDiscordRoles: any[] = [];
                            Object.keys(user.discordRoles).forEach(function (key, index) {
                                myDiscordRoles = [...myDiscordRoles, ...user.discordRoles[key]]
                            })
                            let index = selectedRoles.findIndex((item: any) => item.toLowerCase() === user.role.toLowerCase() || myDiscordRoles.indexOf(item) > -1);

                            if (index > -1) {
                                if (arr.includes(user.member._id) === false) {
                                    arr.push(user.member._id)
                                }
                            }
                        }
                        else {
                            if (selectedRoles.includes(user.role)) {
                                if (arr.includes(user.member._id) === false) {
                                    arr.push(user.member._id)
                                }
                            }
                        }

                    }

                    if (selectedMembers.length > 0 && !(selectedMembers.some((m: any) => m.address.toLowerCase() === user.member.wallet.toLowerCase()) === false)) {
                        console.log("inviting user...")
                        if (arr.includes(user.member._id) === false) {
                            arr.push(user.member._id)
                        }
                    }
                }
                console.log("arr  : ", arr)
            }

            console.log("final list : ", arr)
            console.log("roles list : ", selectedRoles);

            dispatch(updateProjectMembersAction({ projectId: _get(Project, '_id', ''), payload: { daoId: _get(DAO, '_id', null), memberList: arr, inviteType: 'Roles', validRoles: selectedRoles, invitations: selectedMembers } }))
        }

        // else if (toggle && selectType === 'Invitation') {
        //     dispatch(updateProjectMembersAction({ projectId: _get(Project, '_id', ''), payload: { daoId: _get(DAO, '_id', null), memberList: updateMembers, inviteType: 'Invitation', validRoles: [] } }));
        // }

        // if (toggle && selectType === 'Roles') {
        //     let arr = [];
        //     for (let i = 0; i < DAO.members.length; i++) {
        //         let user = DAO.members[i];
        //         if (user.discordRoles) {
        //             let myDiscordRoles: any[] = []
        //             Object.keys(user.discordRoles).forEach(function (key, index) {
        //                 myDiscordRoles = [...myDiscordRoles, ...user.discordRoles[key]]
        //             })
        //             let index = selectedRoles.findIndex((item: any) => item.toLowerCase() === user.role.toLowerCase() || myDiscordRoles.indexOf(item) > -1);

        //             if (index > -1) {
        //                 arr.push(user.member._id)
        //             }
        //         }
        //         else {
        //             if (selectedRoles.includes(user.role)) {
        //                 arr.push(user.member._id)
        //             }
        //         }
        //     }
        //     dispatch(updateProjectMembersAction({ projectId: _get(Project, '_id', ''), payload: { daoId: _get(DAO, '_id', null), memberList: arr, inviteType: 'Roles', validRoles: selectedRoles } }))
        // }

    }

    console.log("selected members : ", selectedMembers);

    return (
        <Drawer
            PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
            anchor={'right'}
            sx={{ zIndex: theme.zIndex.appBar + 1 }}
            open={open}
            hideBackdrop={true}
        >
            <InviteMemberModal
                open={openInviteMember}
                closeModal={() => setOpenInviteMember(false)}
                hideBackdrop={true}
                selectedApplicants={selectedMembers}
                handleInvitations={(value: any) => setSelectedMembers(value)}
            />
            <RolesListModal
                open={openRolesList}
                closeModal={() => setOpenRolesList(false)}
                hideBackdrop={true}
                validRoles={selectedRoles}
                roleType={roleType}
                handleValidRoles={(value) => setSelectedRoles(value)}
            />
            <Box className={classes.modalConatiner}>
                <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={closeModal}>
                    <img src={CloseSVG} />
                </IconButton>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <img src={createProjectSvg} alt="project-resource" />
                    <Typography className={classes.modalTitle}>{transformWorkspace().label} Members</Typography>
                    <Typography className={classes.modalSubtitle}>Invite the best team or set this {transformWorkspace().label} open so anyone can participate.</Typography>
                </Box>
                <Box display="flex" flexDirection="column" alignItems={"center"} sx={{ width: '80%' }}>

                    {/* <Box display={"flex"} alignItems={"center"}>
                        <Box sx={{ marginRight: '11px' }}><Typography sx={{ color: !toggle ? '#C94B32' : '#76808D' }}>OPEN FOR ALL</Typography></Box>
                        <Box><Switch checked={toggle} checkedSVG="lock" onChange={() => setToggle(!toggle)} /></Box>
                        <Box sx={{ marginLeft: '3px' }}><Typography sx={{ color: toggle ? '#C94B32' : '#76808D' }}>FILTER BY</Typography></Box>
                    </Box> */}

                    <Box className={classes.inviteCard} display={"flex"} flexDirection={"column"}>
                        <Box sx={{ marginBottom: '20px' }}><Typography sx={{ color: '#76808D', fontWeight: '700', fontSize: '16px' }}>CONTRIBUTORS:</Typography></Box>
                        <Box display={"flex"} alignItems={"center"} sx={{ marginBottom: '1rem' }}>
                            <Box sx={{ marginRight: '11px' }}><Typography sx={{ color: !toggle ? '#C94B32' : '#76808D' }}>OPEN FOR ALL</Typography></Box>
                            <Box><Switch checked={toggle} unidirectional={false} checkedSVG="lock" onChange={() => setToggle(!toggle)} /></Box>
                            <Box sx={{ marginLeft: '3px' }}><Typography sx={{ color: toggle ? '#C94B32' : '#76808D' }}>FILTER BY</Typography></Box>
                        </Box>
                        {
                            toggle &&
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ marginBottom: '1rem' }} display={"flex"} alignItems={"flex-start"} justifyContent={"space-between"}>
                                    <Box display={"flex"} flexDirection={"column"}>
                                        <Typography sx={{ color: '#76808D', fontSize: '16px', fontWeight: '700', opacity: '0.3' }}>Lomads Roles</Typography>
                                        <Box display={"flex"} flexWrap={"wrap"} sx={{ marginTop: '5px' }}>

                                            {
                                                selectedRoles.length > 0 && selectedRoles.map((item: any, index: number) => {
                                                    if (item == "role1" || item == "role2" || item == "role3" || item == "role4") {
                                                        return (
                                                            <Box className={classes.rolePill} sx={{ background: getroleColor(item).pill }} key={index}>
                                                                <Box display={"flex"} alignItems={"center"}>
                                                                    <Box className={classes.roleAvatar} sx={{ background: getroleColor(item).circle }}></Box>
                                                                    <Typography sx={{ fontSize: 12, color: '#76808D' }}>{transformRole(item).label.length > 5 ? transformRole(item).label.substring(0, 5) + '...' : transformRole(item).label}</Typography>
                                                                </Box>
                                                                <Box sx={{ cursor: 'pointer' }} display={"flex"} alignItems={"center"} justifyContent={"center"} onClick={() => handleRemoveRole(item)}>
                                                                    <IoIosClose color="#76808D" size={24} />
                                                                </Box>
                                                            </Box>
                                                        )
                                                    }
                                                    else return null
                                                })
                                            }

                                        </Box>
                                    </Box>
                                    <Button
                                        size="small" variant="contained" className={classes.createBtn} color="secondary" onClick={() => { setRoleType('Lomads'); setOpenRolesList(true) }}>
                                        <AddIcon sx={{ fontSize: 18 }} /> ADD
                                    </Button>
                                </Box>
                                {
                                    _get(DAO, 'discord', null) &&
                                    <Box sx={{ marginBottom: '1rem' }} display={"flex"} alignItems={"flex-start"} justifyContent={"space-between"}>
                                        <Box display={"flex"} flexDirection={"column"}>
                                            <Typography sx={{ color: '#76808D', fontSize: '16px', fontWeight: '700', opacity: '0.3' }}>Discord Roles</Typography>
                                            <Box display={"flex"} flexWrap={"wrap"} sx={{ marginTop: '5px' }}>

                                                {
                                                    selectedRoles && selectedRoles.map((item: any, index: number) => {
                                                        if (item !== "role1" && item !== "role2" && item !== "role3" && item !== "role4") {
                                                            return (
                                                                <Box className={classes.rolePill} sx={{ background: getroleColor(item).pill }} key={index}>
                                                                    <Box display={"flex"} alignItems={"center"}>
                                                                        <Box className={classes.roleAvatar} sx={{ background: getroleColor(item).circle }}></Box>
                                                                        <Typography sx={{ fontSize: 14, color: '#76808D' }}>{getrolename(item).length > 5 ? getrolename(item).substring(0, 5) + '...' : getrolename(item)}</Typography>
                                                                    </Box>
                                                                    <Box sx={{ cursor: 'pointer' }} display={"flex"} alignItems={"center"} justifyContent={"center"} onClick={() => handleRemoveRole(item)}>
                                                                        <IoIosClose color="#76808D" size={24} />
                                                                    </Box>
                                                                </Box>
                                                            )
                                                        }
                                                        else return null
                                                    })
                                                }

                                            </Box>
                                        </Box>
                                        <Button
                                            size="small" variant="contained" className={classes.createBtn} color="secondary" onClick={() => { setRoleType('Discord'); setOpenRolesList(true) }}>
                                            <AddIcon sx={{ fontSize: 18 }} /> ADD
                                        </Button>
                                    </Box>
                                }

                                <Box sx={{ marginBottom: '1rem' }} display={"flex"} alignItems={"flex-start"} justifyContent={"space-between"}>
                                    <Box display={"flex"} flexDirection={"column"}>
                                        <Typography sx={{ color: '#76808D', fontSize: '16px', fontWeight: '700', opacity: '0.3' }}>Invitation</Typography>
                                        <Box display={"flex"} flexDirection={'column'} sx={{ marginTop: '1rem' }}>

                                            {
                                                selectedMembers.length > 0 && selectedMembers.map((item: any, index: number) => {
                                                    return (
                                                        <Box display={"flex"} sx={{ marginBottom: '0.5rem' }} key={index}>
                                                            <Avatar name={item.name} wallet={item.address} />
                                                            <Box sx={{ cursor: 'pointer', marginLeft: '1rem' }} onClick={() => handleRemoveInvitation(item)}>
                                                                <IoIosClose color="#76808D" size={24} />
                                                            </Box>
                                                        </Box>

                                                    )
                                                })
                                            }
                                        </Box>
                                    </Box>
                                    <Button
                                        size="small" variant="contained" className={classes.createBtn} color="secondary" onClick={() => setOpenInviteMember(prev => !prev)}>
                                        <AddIcon sx={{ fontSize: 18 }} /> INVITE
                                    </Button>
                                </Box>
                            </Box>
                        }
                    </Box>

                    {/* {
                        !toggle &&
                        <Typography sx={{ marginTop: '35px', fontSize: 14, fontStyle: 'italic', fontWeight: 400 }}>Any member can see this workplace</Typography>
                    }

                    {
                        toggle &&
                        <Box sx={{ width: 300, marginTop: '15px' }}>
                            <Dropdown
                                options={['Invitation', 'Roles']}
                                defaultValue={selectType}
                                onChange={(value: any) => setSelectType(value)}
                            />
                        </Box>
                    }

                    {toggle && <Box className={classes.divider}></Box>}

                    {
                        toggle && selectType === 'Invitation' && handleRenderMemberList()
                    }

                    {
                        toggle && selectType === 'Roles' && handleRenderRolesList()
                    } */}

                    <Box display={"flex"} alignItems={"center"} justifyContent={"center"} style={{ width: '100%', marginTop: '20px' }}>
                        <Button variant="outlined" sx={{ marginRight: '20px', width: '193px' }} onClick={closeModal}>CANCEL</Button>
                        <Button
                            variant="contained"
                            onClick={handleEditMembers}
                            sx={{ width: '184px' }}
                            loading={updateProjectMembersLoading}
                        >
                            ADD
                        </Button>
                    </Box>

                </Box>
            </Box>
        </Drawer>
    )
}