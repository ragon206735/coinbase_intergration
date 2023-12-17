import React, { useState, useEffect, useMemo } from "react";
import { find as _find, get as _get, debounce as _debounce, uniqBy as _uniqBy, sortBy as _sortBy } from 'lodash';

import { Grid, Paper, Typography, Box, Chip, List, ListItem, ListItemButton } from "@mui/material";
import { makeStyles } from '@mui/styles';
import AddIcon from '@mui/icons-material/Add';
import { IoIosClose } from 'react-icons/io'
import InviteMemberModal from "modals/Tasks/InviteMemberModal";
import RolesListModal from "modals/Tasks/RolesListModal";

import createProjectSvg from 'assets/svg/createProject.svg';
import TextInput from 'components/TextInput'
import TextEditor from 'components/TextEditor'
import Button from "components/Button";
import Switch from "components/Switch";

import editToken from 'assets/svg/editToken.svg'
import Checkbox from "components/Checkbox";
import Avatar from "components/Avatar";
import ResourcesModal from "modals/Project/ResourcesModal";
import MilestonesModal from "modals/Project/MilestonesModal";
import Dropdown from "components/Dropdown";
import KraModal from "modals/Project/KraModal";

import { useDAO } from "context/dao";
import { useWeb3Auth } from "context/web3Auth";

import useTerminology from 'hooks/useTerminology';

import { SiNotion } from "react-icons/si";
import { BsDiscord, BsGoogle, BsGithub, BsTwitter, BsGlobe } from "react-icons/bs";

import moment from 'moment';

import { DEFAULT_ROLES } from "constants/terminology";

import { useAppDispatch } from "helpers/useAppDispatch";
import { createProjectAction } from "store/actions/project";
import { useAppSelector } from "helpers/useAppSelector";
import { useNavigate } from "react-router-dom";

const { toChecksumAddress } = require('ethereum-checksum-address')

const useStyles = makeStyles((theme: any) => ({
    root: {
        // height: '100vh',
        // overflowY: 'scroll',
        paddingBottom: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heading: {
        fontSize: "32px !important",
        margin: "20px 0 35px 0 !important"
    },
    paperContainer: {
        borderRadius: 5,
        padding: '26px 22px',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1) !important'
    },
    descriptionCard: {
        width: 404,
        backgroundColor: '#FFF',
        borderRadius: '5px !important',
        display: 'flex',
        justifyContent: 'space-between',
        padding: 22
    },
    inviteCard: {
        width: 404,
        background: '#FFF',
        borderRadius: '5px !important',
        padding: 22
    },
    projectName: {
        fontWeight: '400 !important',
        fontSize: '22px !important',
        lineHeight: '25px !important',
        letterSpacing: '-0.011em !important',
        color: '#76808d',
        marginBottom: '9px !important'
    },
    projectDesc: {
        fontWeight: '400 !important',
        fontSize: '14px !important',
        lineHeight: '16px !important',
        color: '#1b2b41 !important',
    },
    divider: {
        width: 210,
        border: '2px solid #C94B32',
        margin: '35px 0 !important'
    },
    dropdown: {
        background: 'linear-gradient(180deg, #FBF4F2 0 %, #EEF1F5 100 %) !important',
        borderRadius: '10px',
    },
    addMemberBtn: {
        width: '209px',
        hieght: '40px',
        background: '#FFFFFF !important',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), - 3px - 3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '5px !important',
        color: '#76808D !important',
        fontSize: '14px !important'
    },
    arrayRow: {
        height: '50px',
        width: '100%',
        background: 'rgba(118, 128, 141, 0.05) !important',
        boxShadow: 'inset 1px 0px 4px rgba(27, 43, 65, 0.1) !important',
        borderRadius: '5px !important',
        marginBottom: '8px !important',
        padding: '0 15px !important',
        '&:last-child': {
            marginBottom: '0 !important'
        }
    },
    linkName: {
        width: '40% !important',
    },
    linkAddress: {
        width: '60% !important',
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

export default () => {
    const classes = useStyles();

    const { DAO } = useDAO();
    const { account } = useWeb3Auth();
    const { transformWorkspace, transformRole } = useTerminology(_get(DAO, 'terminologies'));
    console.log("DAO in createProject : ", DAO);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    // @ts-ignore
    const { createProjectLoading } = useAppSelector(store => store.project);

    const [name, setName] = useState<string>('');
    const [desc, setDesc] = useState<string>('');
    const [next, setNext] = useState<boolean>(false);

    const [showAddMember, setShowAddMember] = useState(false);
    const [roleType, setRoleType] = useState('');
    const [memberList, setMemberList] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
    const [resourceList, setResourceList] = useState<any[]>([]);
    const [showMore, setShowMore] = useState<boolean>(false);
    const [success, setSuccess] = useState(false);
    const [newAddress, setNewAddress] = useState<any[]>([]);

    const [toggle, setToggle] = useState<boolean>(false);
    const [selectType, setSelectType] = useState<string>('Invitation');

    const [roles, setRoles] = useState<any[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<any[]>([]);

    const [openResource, setOpenResource] = useState<boolean>(false);
    const [openMilestone, setOpenMilestone] = useState<boolean>(false);
    const [openKRA, setOpenKRA] = useState<boolean>(false);

    const [milestones, setMilestones] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [frequency, setFrequency] = useState('');

    const [compensation, setCompensation] = useState(null);

    const [openRolesList, setOpenRolesList] = useState(false);
    const [openInviteMember, setOpenInviteMember] = useState(false);

    useEffect(() => {
        if (DAO)
            setMemberList(_get(DAO, 'members', []).filter((m: any) => m.deletedAt === null))
    }, [DAO])

    useEffect(() => {
        if (createProjectLoading === false) {
            setSuccess(true);
            setTimeout(() => {
                navigate(-1);
            }, 2000);
        }
    }, [createProjectLoading])

    useEffect(() => {
        const rolesArr = _get(DAO, 'terminologies.roles', DEFAULT_ROLES);
        const discordOb = _get(DAO, 'discord', {});
        let temp: any[] = [];
        if (rolesArr) {
            Object.keys(rolesArr).forEach(function (key, _index) {
                temp.push({
                    lastRole: _index === 3, title: key, value: rolesArr[key].label,
                    roleColor: _index == 0 ? '#92e1a8' :
                        _index == 1 ? '#89b3e5' :
                            _index == 2 ? '#e96447' : '#92e1a8'
                });
            });
        }
        if (discordOb) {
            Object.keys(discordOb).forEach(function (key, _index) {
                const discordChannel = discordOb[key];
                discordChannel.roles.forEach((item: any) => {
                    if (item.name !== '@everyone' && item.name !== 'LomadsTestBot' && item.name !== 'Lomads' && (temp.some((m) => m.title.toLowerCase() === item.id.toLowerCase()) === false)) {
                        temp.push({ title: item.id, value: item.name, roleColor: item?.roleColor });
                    }
                })
            });
        }
        setRoles(temp);
    }, [DAO]);

    const all_roles = useMemo(() => {
        let roles: any[] = [];
        Object.keys(_get(DAO, 'discord', {})).map((server) => {
            const r = DAO.discord[server].roles
            roles = roles.concat(r);
        })
        return roles.filter(r => r.name !== "@everyone" && r.name !== 'Lomads' && r.name !== 'LomadsTestBot');
    }, [DAO.discord])

    useEffect(() => {
        const memberList = DAO?.members;
        if (memberList.length > 0 && selectedMembers.length === 0) {
            let currentUser = _find(_get(DAO, 'members', []), m => m?.member?.wallet?.toLowerCase() === account?.toLowerCase())
            let memberOb: any = {};
            memberOb.name = currentUser.member.name;
            memberOb.address = currentUser.member.wallet;
            setSelectedMembers([...selectedMembers, memberOb]);
        }
    }, [DAO]);

    useEffect(() => {
        if (newAddress.length > 0) {
            newAddress.map((value) => {
                const user = _find(_get(DAO, 'members', []), m => _get(m, 'member.wallet', '').toLowerCase() === value.toLowerCase());
                let memberOb: any = {};
                memberOb.name = user.member.name;
                memberOb.address = user.member.wallet;
                setSelectedMembers((oldValue) => [...oldValue, memberOb]);
            })
        }
    }, [DAO]);

    const handleParseUrl = (url: string) => {
        try {
            const link = new URL(url);
            if (link.hostname.indexOf('notion.') > -1) {
                return <SiNotion color='#76808D' size={20} />
            }
            else if (link.hostname.indexOf('discord.') > -1) {
                return <BsDiscord color='#76808D' size={20} />
            }
            else if (link.hostname.indexOf('github.') > -1) {
                return <BsGithub color='#76808D' size={20} />
            }
            else if (link.hostname.indexOf('google.') > -1) {
                return <BsGoogle color='#76808D' size={20} />
            }
            else if (link.hostname.indexOf('twitter.') > -1) {
                return <BsTwitter color='#76808D' size={20} />
            }
            else {
                return <span><BsGlobe color="#76808D" size={20} /></span>
            }
        }
        catch (e) {
            console.error(e);
            return;
        }
    }

    const handleAddMember = (member: any) => {
        const memberExists = _find(selectedMembers, m => m.address.toLowerCase() === member.wallet.toLowerCase())
        if (memberExists)
            setSelectedMembers(prev => prev.filter((item) => item.address.toLowerCase() !== member.wallet.toLowerCase()));
        else {
            let memberOb: any = {};
            memberOb.name = member.name;
            memberOb.address = member.wallet;
            setSelectedMembers(prev => [...prev, memberOb]);
        }
    }

    const handleAddRoles = (role: any) => {
        const roleExists = _find(selectedRoles, m => m.toLowerCase() === role.toLowerCase())
        if (roleExists)
            setSelectedRoles(prev => prev.filter((item) => item.toLowerCase() !== role.toLowerCase()));
        else {
            setSelectedRoles([...selectedRoles, role]);
        }
    }

    const handleRemoveRole = (role: any) => {
        let newRoles = selectedRoles.filter((item) => item !== role)
        setSelectedRoles(newRoles);
    }

    const handleCreateProject = () => {
        let project: any = {};
        project['name'] = name;
        project['description'] = desc;
        project['links'] = resourceList;
        project['milestones'] = milestones;
        project['compensation'] = compensation;
        if(frequency !== '') {
            project['kra'] = {
                frequency,
                results
            };
        }
        project['daoId'] = DAO?._id;
        project['members'] = [];
        project['validRoles'] = [];

        if (!toggle) {
            let arr = [];
            for (let i = 0; i < DAO.members.length; i++) {
                let user = DAO.members[i];
                if (user.deletedAt === null) {
                    arr.push({ name: user.member.name, address: user.member.wallet })
                }
            }
            project['members'] = arr;

            project['inviteType'] = 'Open';
        }

        // if (toggle && selectType === 'Invitation') {
        //     project['members'] = _uniqBy(selectedMembers, m => m.address);
        //     project['validRoles'] = [];
        //     project['inviteType'] = 'Invitation';
        // }
        if (toggle && selectedMembers.length > 0) {
            let temp: any[] = [...project['members'], ..._uniqBy(selectedMembers, m => m.address)]
            project['members'] = [..._uniqBy(temp, m => m.address)];
            project['inviteType'] = 'Invitation';
            project['invitations'] = selectedMembers;
        }

        // if (toggle && selectType === 'Roles') {
        //     let arr = [];
        //     for (let i = 0; i < DAO.members.length; i++) {
        //         let user = DAO.members[i];
        //         if (user.deletedAt === null) {
        //             if (user.discordRoles) {
        //                 let myDiscordRoles: any[] = [];
        //                 Object.keys(user.discordRoles).forEach(function (key, index) {
        //                     myDiscordRoles = [...myDiscordRoles, ...user.discordRoles[key]]
        //                 })
        //                 let index = selectedRoles.findIndex(item => item.toLowerCase() === user.role.toLowerCase() || myDiscordRoles.indexOf(item) > -1);

        //                 if (index > -1) {
        //                     arr.push({ name: user.member.name, address: user.member.wallet })
        //                 }
        //             }
        //             else {
        //                 if (selectedRoles.includes(user.role)) {
        //                     arr.push({ name: user.member.name, address: user.member.wallet })
        //                 }
        //             }
        //         }
        //     }
        //     project['members'] = _uniqBy(arr, m => m.address);
        //     project['validRoles'] = selectedRoles;
        //     project['inviteType'] = 'Roles';
        // }

        if (toggle && selectedRoles.length > 0) {
            let arr: any[] = [...project['members']];
            for (let i = 0; i < DAO.members.length; i++) {
                let user = DAO.members[i];
                if (user.deletedAt === null) {
                    if (user.discordRoles) {
                        let myDiscordRoles: any[] = [];
                        Object.keys(user.discordRoles).forEach(function (key, index) {
                            myDiscordRoles = [...myDiscordRoles, ...user.discordRoles[key]]
                        })
                        let index = selectedRoles.findIndex(item => item.toLowerCase() === user.role.toLowerCase() || myDiscordRoles.indexOf(item) > -1);

                        if (index > -1) {
                            arr.push({ name: user.member.name, address: user.member.wallet })
                        }
                    }
                    else {
                        if (selectedRoles.includes(user.role)) {
                            arr.push({ name: user.member.name, address: user.member.wallet })
                        }
                    }
                }
            }
            project['members'] = [..._uniqBy(arr, m => m.address)];
            project['validRoles'] = selectedRoles;
            project['inviteType'] = 'Roles';
        }

        console.log(project)

        dispatch(createProjectAction(project));
    }

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

    const handleRemoveInvitation = (invite: any) => {
        let newInvites = selectedMembers.filter((item: any) => item.address !== invite.address)
        setSelectedMembers(newInvites)
    }

    const handleRenderMemberList = () => {
        return (
            <Paper className={classes.paperContainer} sx={{ width: 480 }}>
                <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ marginBottom: '22px' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#76808D' }}>Invite members</Typography>
                    <Button variant="contained" color="secondary" className={classes.addMemberBtn}>ADD NEW MEMBER</Button>
                </Box>
                <List style={{ maxHeight: 300, overflow: 'hidden', overflowY: 'auto' }}>
                    {
                        _sortBy(memberList, m => _get(m, 'member.name', '').toLowerCase(), 'asc').filter((member: any) => toChecksumAddress(member?.member.wallet) !== account).map((item: any, index: number) => {
                            const labelId = `checkbox-list-label-${item.member.wallet}`;
                            return (
                                <ListItem disablePadding key={item.member.wallet}>
                                    <Box width={"100%"} display={"flex"} alignItems={"center"} justifyContent={"space-between"} onClick={() => handleAddMember(item.member)}>
                                        <Avatar name={_get(item.member, 'name', '')} wallet={_get(item.member, 'wallet', '')} />
                                        <Checkbox
                                            edge="center"
                                            tabIndex={-1}
                                            inputProps={{ 'aria-labelledby': labelId }}
                                        />
                                    </Box>
                                </ListItem>
                            )
                        })
                    }
                </List>
            </Paper>
        )
    }

    const handleRenderRolesList = () => {
        return (
            <Paper className={classes.paperContainer} sx={{ width: 480 }}>
                <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ marginBottom: '22px' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#76808D' }}>Organisation Roles</Typography>
                </Box>
                {
                    Object.keys(_get(DAO, 'terminologies.roles', {})).map((key, index) => {
                        return (
                            <>
                                <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} key={index} onClick={() => handleAddRoles(key)}>
                                    <Chip
                                        label={_get(transformRole(key), 'label')}
                                        className={classes.rolePill}
                                        avatar={
                                            <Box sx={
                                                index === 0 ? { background: 'rgba(146, 225, 168, 1)', borderRadius: '50% !important', } :
                                                    index === 1 ? { background: 'rgba(137,179,229,1)', borderRadius: '50% !important', } :
                                                        index === 2 ? { background: 'rgba(234,100,71,1)', borderRadius: '50% !important', } : { background: 'rgba(146, 225, 168, 1)', borderRadius: '50% !important', }

                                            }></Box>
                                        }
                                        sx={
                                            index === 0 ? { background: 'rgba(146, 225, 168, 0.3)' } :
                                                index === 1 ? { background: 'rgba(137,179,229,0.3)' } :
                                                    index === 2 ? { background: 'rgba(234,100,71,0.3)' } : { background: 'rgba(146, 225, 168, 0.3)' }
                                        }
                                    />
                                    <Checkbox />
                                </Box>
                            </>
                        )
                    })
                }

                {
                    all_roles && all_roles.length > 0 &&
                    <>
                        <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ margin: '22px 0' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#76808D' }}>Discord Roles</Typography>
                        </Box>
                        {
                            all_roles.map((discord_value, index) => {
                                return (
                                    <>
                                        <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} key={index} onClick={() => handleAddRoles(discord_value.id)}>
                                            <Chip
                                                label={discord_value.name}
                                                className={classes.rolePill}
                                                avatar={<Box sx={{ background: _get(discord_value, 'roleColor', '#99aab5'), borderRadius: '50%' }}></Box>}
                                                sx={{ background: `${_get(discord_value, 'roleColor', '#99aab5')}50` }}
                                            />
                                            <Checkbox />
                                        </Box>
                                    </>
                                )
                            })
                        }
                    </>
                }
            </Paper>
        )
    }

    const _renderCreateProject = () => {
        return (
            <Grid container className={classes.root}>

                <Grid xs={12} item display="flex" flexDirection="column" alignItems="center">
                    <img src={createProjectSvg} alt="frame-icon" />
                    <Typography color="primary" variant="subtitle1" className={classes.heading}>Create New {transformWorkspace().label}</Typography>
                    {
                        next
                            ?
                            <Grid container>
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
                                    roleType={roleType}
                                    hideBackdrop={true}
                                    validRoles={selectedRoles}
                                    handleValidRoles={(value: any) => setSelectedRoles(value)}
                                />
                                <Grid item xs={12} display={"flex"} flexDirection={"column"} alignItems={"center"}>
                                    <Paper className={classes.descriptionCard} elevation={0}>
                                        <Box>
                                            <Typography className={classes.projectName}>{transformWorkspace().label} Name</Typography>
                                            <Typography className={classes.projectDesc} dangerouslySetInnerHTML={{ __html: desc.length > 50 ? desc.substring(0, 50) + "..." : desc }}></Typography>
                                        </Box>
                                        <Box>
                                            <Box sx={{ cursor: 'pointer' }} onClick={() => setNext(false)}>
                                                <img src={editToken} alt="hk-logo" />
                                            </Box>
                                        </Box>
                                    </Paper>
                                    <Box className={classes.divider}></Box>
                                </Grid>

                                <Grid item xs={12} display={"flex"} flexDirection={"column"} alignItems={"center"}>
                                    <Box className={classes.inviteCard} display={"flex"} flexDirection={"column"}>
                                        <Box sx={{ marginBottom: '20px' }}><Typography sx={{ color: '#76808D', fontWeight: '700', fontSize: '16px' }}>CONTRIBUTORS:</Typography></Box>
                                        <Box display={"flex"} alignItems={"center"} sx={{ marginBottom: '1rem' }}>
                                            <Box sx={{ marginRight: '11px' }}><Typography sx={{ color: !toggle ? '#C94B32' : '#76808D' }}>OPEN FOR ALL</Typography></Box>
                                            <Box><Switch unidirectional={false} checkedSVG="none" onChange={() => setToggle(!toggle)} /></Box>
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
                                                                    selectedRoles && selectedRoles.map((item, index) => {
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
                                                                            { account !== item.address && <Box sx={{ cursor: 'pointer', marginLeft: '1rem' }} onClick={() => handleRemoveInvitation(item)}>
                                                                                <IoIosClose color="#76808D" size={24} />
                                                                            </Box> }
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
                                        {/* {
                                            !toggle &&
                                            <Typography sx={{ marginTop: '35px', fontSize: 14, fontStyle: 'italic', fontWeight: 400 }}>Any member can see this {transformWorkspace().label}</Typography>
                                        } */}
                                        {/* {
                                            toggle &&
                                            <Box sx={{ width: 300, margin: '35px 0' }}>
                                                <Dropdown
                                                    options={['Invitation', 'Roles']}
                                                    defaultValue={'Invitation'}
                                                    onChange={(value: any) => setSelectType(value)}
                                                />
                                            </Box>
                                        } */}

                                        {/* {
                                            toggle && selectType === 'Invitation' && handleRenderMemberList()
                                        }

                                        {
                                            toggle && selectType === 'Roles' && handleRenderRolesList()
                                        } */}
                                    </Box>
                                </Grid>

                                <Grid item xs={12} display={"flex"} alignItems={"center"} justifyContent={"center"} sx={{ marginTop: '35px' }}>
                                    <Button
                                        variant='contained'
                                        color="secondary"
                                        disableElevation
                                        sx={{ width: 255, height: 50, fontSize: 16, color: '#C94B32', marginRight: '35px' }}
                                        onClick={() => setShowMore(true)}
                                    >
                                        ADD MORE DETAIL
                                    </Button>
                                    <Button
                                        loading={createProjectLoading}
                                        variant='contained'
                                        disableElevation
                                        sx={{ width: 255, height: 50, fontSize: 16 }}
                                        onClick={handleCreateProject}
                                    >
                                        CREATE {transformWorkspace().label.toUpperCase()}
                                    </Button>
                                </Grid>
                            </Grid>
                            :
                            <Paper className={classes.paperContainer} sx={{ width: 394 }}>
                                <Box sx={{ marginBottom: '20px' }}>
                                    <TextInput
                                        label={`Name of the ${transformWorkspace().label}`}
                                        placeholder="Super project"
                                        fullWidth
                                        value={name}
                                        inputProps={{ maxLength: 50 }}
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
                                    onClick={() => setNext(true)}
                                >
                                    NEXT
                                </Button>
                            </Paper>
                    }
                </Grid>
            </Grid>
        )
    }

    const _renderAddProjectDetails = () => {
        return (
            <Grid container className={classes.root}>
                <ResourcesModal
                    open={openResource}
                    closeModal={() => setOpenResource(false)}
                    list={resourceList}
                    getResources={(value) => setResourceList(value)}
                    editResources={false}
                    hideBackdrop={false}
                />
                <MilestonesModal
                    open={openMilestone}
                    closeModal={() => setOpenMilestone(false)}
                    list={milestones}
                    getCompensation={(value) => setCompensation(value)}
                    getMilestones={(value) => setMilestones(value)}
                    editMilestones={false}
                    hideBackdrop={false}
                />
{/*                 <KraModal
                    open={openKRA}
                    closeModal={() => setOpenKRA(false)}
                    list={results}
                    freq={frequency}
                    getResults={(value1: any[], value2: string) => { setResults(value1); setFrequency(value2) }}
                    editKRA={false}
                    hideBackdrop={false}
                /> */}
                <Grid xs={12} item display="flex" flexDirection="column" alignItems="center">
                    <img src={createProjectSvg} alt="frame-icon" />
                    <Typography color="primary" variant="subtitle1" className={classes.heading}>{transformWorkspace().label} Details</Typography>

                    <Paper className={classes.paperContainer} sx={{ width: 453, display: 'flex', flexDirection: 'column' }}>
                        <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                            <Box>
                                <Typography sx={{ fontSize: 22, lineHeight: '25px', marginBottom: '9px' }}>{transformWorkspace().label} resources</Typography>
                                <Typography sx={{ fontSize: 14, lineHeight: '18px', fontStyle: 'italic' }}>Add links for your team to access </Typography>
                            </Box>
                            {
                                resourceList.length > 0
                                    ?
                                    <img src={editToken} alt="hk-logo" onClick={() => setOpenResource(true)} style={{ cursor: 'pointer' }} />
                                    :
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{ width: 125, height: 40, fontSize: 16, color: '#C94B32' }}
                                        onClick={() => setOpenResource(true)}
                                    >
                                        <AddIcon sx={{ fontSize: 18 }} /> ADD
                                    </Button>
                            }
                        </Box>
                        {/* Map all the resources */}
                        {
                            resourceList.length > 0 &&
                            <Box>
                                {
                                    resourceList.map((item, index) => {
                                        return (
                                            <Box key={index} className={classes.arrayRow} display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ marginTop: '20px' }}>
                                                <Box className={classes.linkName} display={"flex"}>
                                                    {handleParseUrl(item.link)}
                                                    <Typography sx={{ marginLeft: '5px' }}>{item.title.length > 10 ? item.title.slice(0, 10) + "..." : item.title}</Typography>
                                                </Box>
                                                <Box className={classes.linkAddress}>
                                                    <Typography>{item.link.length > 20 ? item.link.slice(0, 20) + "..." : item.link}</Typography>
                                                </Box>
                                            </Box>
                                        )
                                    })
                                }
                            </Box>
                        }
                    </Paper>

                    <Box className={classes.divider}></Box>

                    <Paper className={classes.paperContainer} sx={{ width: 453, display: 'flex', flexDirection: 'column' }}>
                        <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                            <Box>
                                <Typography sx={{ fontSize: 22, lineHeight: '25px', marginBottom: '9px' }}>Milestones</Typography>
                                <Typography sx={{ fontSize: 14, lineHeight: '18px', fontStyle: 'italic' }}>Organise and link payments to milestones</Typography>
                            </Box>
                            {
                                milestones.length > 0
                                    ?
                                    <img src={editToken} alt="hk-logo" onClick={() => setOpenMilestone(true)} style={{ cursor: 'pointer' }} />
                                    :
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{ width: 125, height: 40, fontSize: 16, color: '#C94B32' }}
                                        onClick={() => setOpenMilestone(true)}
                                    >
                                        <AddIcon sx={{ fontSize: 18 }} /> ADD
                                    </Button>
                            }
                        </Box>
                        {/* Map all the milestones */}
                        {
                            milestones.length > 0 &&
                            <Box>
                                {
                                    milestones.map((item, index) => {
                                        return (
                                            <Box key={index} className={classes.arrayRow} display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ marginTop: '20px' }}>
                                                <Box display={"flex"} alignItems={"center"}>
                                                    <Typography sx={{ fontWeight: '700', fontSize: '14px', color: '#C94B32' }}>{index + 1}</Typography>
                                                    <Typography sx={{ fontWeight: '700', fontSize: '14px', color: '#76808D', marginLeft: '5px' }}>{item.name}</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontWeight: '700', fontSize: '14px', color: '#76808D' }}>{moment(item.deadline).format('L')}</Typography>
                                                </Box>
                                            </Box>
                                        )
                                    })
                                }
                            </Box>
                        }
                    </Paper>

                    <Box className={classes.divider}></Box>

                    {/*<Paper className={classes.paperContainer} sx={{ width: 453, display: 'flex', flexDirection: 'column' }}>
                         <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                            <Box>
                                <Typography sx={{ fontSize: 22, lineHeight: '25px', marginBottom: '9px' }}>Key results</Typography>
                                <Typography sx={{ fontSize: 14, lineHeight: '18px', fontStyle: 'italic' }}>Set objective for your team</Typography>
                            </Box>
                            {
                                results.length > 0
                                    ?
                                    <img src={editToken} alt="hk-logo" onClick={() => setOpenKRA(true)} style={{ cursor: 'pointer' }} />
                                    :
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{ width: 125, height: 40, fontSize: 16, color: '#C94B32' }}
                                        onClick={() => setOpenKRA(true)}
                                    >
                                        <AddIcon sx={{ fontSize: 18 }} /> ADD
                                    </Button>
                            }
                        </Box> 
                       
                        {
                            results.length > 0 &&
                            <Box>
                                {
                                    results.map((item, index) => {
                                        return (
                                            <Box key={index} className={classes.arrayRow} display={"flex"} alignItems={"center"} justifyContent={"space-between"} sx={{ marginTop: '20px' }}>
                                                <Box display={"flex"} alignItems={"center"}>
                                                    <Typography sx={{ fontWeight: '700', fontSize: '14px', color: '#76808D' }}>{item.name}</Typography>
                                                </Box>
                                            </Box>
                                        )
                                    })
                                }
                            </Box>
                        }
                    </Paper> */}
                    <Button
                        loading={createProjectLoading}
                        variant='contained'
                        disableElevation
                        sx={{ width: 255, height: 50, fontSize: 16, marginTop: '35px' }}
                        onClick={handleCreateProject}
                    >
                        CREATE {transformWorkspace().label.toUpperCase()}
                    </Button>
                </Grid>
            </Grid>
        )
    }

    const _renderSuccess = () => {
        return (
            <Grid container className={classes.root}>
                <Grid xs={12} item display="flex" flexDirection="column" alignItems="center" justifyContent={"center"} sx={{ margin: '10vh 0' }}>
                    <img src={createProjectSvg} alt="frame-icon" />
                    <Typography color="primary" variant="subtitle1" className={classes.heading}>Success!</Typography>
                    <Typography style={{ textAlign: 'center', fontStyle: 'italic', color: ' #76808D' }}>The new project is created. <br /> You will be redirected in a few seconds.</Typography>
                </Grid>
            </Grid>
        )
    }

    if (showMore) {
        return _renderAddProjectDetails();
    }

    if (success) {
        return _renderSuccess();
    }

    return _renderCreateProject();
}