import React, { useState, useMemo, useEffect } from "react";
import { get as _get, find as _find, uniqBy as _uniqBy, sortBy as _sortBy } from 'lodash';
import { Box, Typography, Chip } from "@mui/material";
import { makeStyles } from '@mui/styles';

import membersGroup from 'assets/svg/membersGroup.svg'

import Button from "components/Button";
import AddIcon from '@mui/icons-material/Add';
import Avatar from "components/Avatar";

import moment from "moment";
import { useDAO } from "context/dao";
import useTerminology from 'hooks/useTerminology';

import editSvg from 'assets/svg/editToken.svg';
import AddMemberModal from "modals/Members/AddMemberModal";
import EditMemberModal from "modals/Members/EditMemberModal";
import { useAppDispatch } from "helpers/useAppDispatch";
import { loadRecurringPaymentsAction } from "store/actions/treasury";
import { useAppSelector } from "helpers/useAppSelector";
import useSafe from "hooks/useSafe";
import { useWeb3Auth } from "context/web3Auth";
import useRole from "hooks/useRole";

const useStyles = makeStyles((theme: any) => ({
    line: {
        border: '1px solid rgba(118, 128, 141, 0.5) !important',
        transform: 'rotate(90deg) !important',
        width: '35px',
        height: '0px',
        marginRight: '28px !important'
    },
    lineSm: {
        border: '1px solid rgba(118, 128, 141, 0.5) !important',
        height: '19px',
        width: '0px'
    },
    addMemberBtn: {
        width: '125px',
        height: '40px',
        background: '#FFFFFF !important',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), - 3px - 3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '5px !important',
        fontSize: '14px !important',
        color: '#C94B32 !important'
    },
    rolePill: {
        height: '22px !important',
        display: "flex !important",
        alignItems: "center !important",
        justifyContent: "flex-start !important",
        margin: '0 10px 10px 0 !important'
    },
    roleCount: {
        padding: '4px !important',
        height: '22px !important',
        minWidth: '36px !important',
        marginBottom: '10px !important',
        background: '#FFFFFF !important',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '100px !important',
        cursor: 'pointer'
    },
    helpCard: {
        position: "absolute",
        top: "0",
        left: "0",
        borderRadius: "10px",
        display: "flex",
        alignItems: 'center',
        justifyContent: "center",
        color: "#FFFFFF",
        backgroundColor: "#76808D",
        zIndex: 1200,
        width: "100% !important",
        height: "100% !important",
        opacity: 0.8,
        textAlign: "center",
        cursor: "pointer",
        padding: "10px",
        minHeight: 50
    },
    helpCardContent: {
        fontFamily: "'Inter', sans-serif",
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: "18px",
        lineHeight: "22px",
    }
}));

export default ({ showProjects, list, isHelpIconOpen, highlightMembers }: any) => {
    const classes = useStyles();
    const dispatch = useAppDispatch()
    const { account } = useWeb3Auth()
    const { DAO } = useDAO();
    const { myRole, can } = useRole(DAO, account, undefined)
    const { transformRole } = useTerminology(_get(DAO, 'terminologies'))

    const { adminSafes } = useSafe()

    const [showAddMember, setShowAddMember] = useState(false);
    const [showEditMember, setShowEditMember] = useState(false);

    const eligibleMembers = useMemo(() => {
        return _sortBy(_uniqBy(list, (m: any) => m.member.wallet.toLowerCase()), (m: any) => _get(m, 'member.name', '').toLowerCase(), 'asc').filter((m: any) => m.deletedAt === null)
    }, [DAO]);

    useEffect(() => {
        if(DAO?.url) {
            if(myRole === 'role1') {
                const safes = DAO?.safes?.map((safe:any) => safe?.address)
                dispatch(loadRecurringPaymentsAction({ safes }))
            }
        }
    }, [DAO?.url, myRole])

    const NameAndAvatar = (props: any) => {
        const [show, setShow] = useState(false);
        let roles: any = [];
        const discordOb = _get(DAO, 'discord', null);
        const user = props.user;
        const index = props.index;
        if (user.discordId && discordOb) {
            Object.keys(discordOb).forEach(function (key, _index) {
                const discordChannel = discordOb[key];
                let person = _find(_get(discordChannel, 'members', []), m => _get(m, 'displayName', '').toLowerCase() === user.discordId.toLowerCase());
                if (person) {
                    person.roles.forEach(function (item: any) {
                        _get(discordChannel, 'roles', []).map((i: any) => {
                            if (i.id === item && i.name !== '@everyone') {
                                roles.push({ name: i.name, roleColor: _get(i, 'roleColor', '#99aab5') })
                            }
                        })
                    })
                }
            });
        }

        return (
            <>
                <Box sx={{ width: '100%', marginBottom: '25px', zIndex: props.highlightMembers ? 1400 : 0 }} display={"flex"} alignItems={"center"} key={index} id="members">
                    <Box sx={{ width: '250px' }} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                        <Avatar recurringPayment name={props.name} wallet={props.address} />
                        <Box className={classes.lineSm}></Box>
                    </Box>
                    <Box sx={{ width: '300px' }} display={"flex"} alignItems={"center"}>
                        <Box sx={{ width: '150px' }} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                            <Typography sx={{ marginLeft: '6px', fontSize: '14px', color: '#76808D' }}>{moment.utc(props.joined).local().format('MM/DD/YYYY')}</Typography>
                            <Box className={classes.lineSm}></Box>
                        </Box>
                        <Box sx={{ width: '150px', marginLeft: '10px' }}>
                            <Typography sx={{ fontSize: '14px', fontWeight: '700', color: '#76808D' }}>
                                {
                                    props.role === 'role1' ? props.creator ? `${transformRole(props.role).label} (Creator)` : transformRole(props.role).label : transformRole(props.role).label
                                }
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ width: '400px' }} display={"flex"} alignItems={"center"} flexWrap={"wrap"}>
                        {
                            (show ? roles : roles.filter((_: any, i: any) => i < 5)).map((item: any, index: any) => {
                                if (show || index <= 3) {
                                    return (
                                        <>
                                            <Chip
                                                label={item.name}
                                                className={classes.rolePill}
                                                sx={{
                                                    '& .MuiChip-avatar': {
                                                        height: '14px !important',
                                                        width: '14px !important'
                                                    }
                                                }}
                                                avatar={
                                                    <Box style={{ backgroundColor: `${_get(item, "roleColor", '#99aab5')}`, borderRadius: '50%' }}></Box>
                                                }
                                                style={{ backgroundColor: `${_get(item, "roleColor", '#99aab5')}50` }}
                                            />
                                        </>
                                    )
                                }
                                return (
                                    <>
                                        <Box className={classes.roleCount} onClick={() => setShow(prev => !prev)} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                            <Typography>{show ? 'Hide' : `+${roles.length - 4}`}</Typography>
                                        </Box>
                                    </>
                                )
                            })
                        }
                    </Box>
                </Box>
            </>
        );
    };

    return (
        <Box sx={{ width: '100%', marginBottom: '20px', zIndex: highlightMembers ? 1400 : 0 }} display="flex" flexDirection={"column"}>
            <AddMemberModal
                open={showAddMember}
                closeModal={() => setShowAddMember(false)}
            />

            <EditMemberModal
                open={showEditMember}
                closeModal={() => setShowEditMember(false)}
            />

            <Box sx={{ width: '100%', background: '#FFF', padding: '20px 22px', borderRadius: '5px' }} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                <Typography sx={{ fontSize: '22px', fontWeight: '400', color: '#76808D' }}>Members</Typography>
                <Box display={"flex"} alignItems={"center"}>
                    <img src={membersGroup} alt="membersGroup" />
                    <Typography sx={{ marginLeft: '15px', fontSize: '16px' }}>{eligibleMembers?.length} {eligibleMembers?.length > 1 ? 'members' : 'member'}</Typography>
                    { can(myRole, 'members.edit') && <Box sx={{ cursor: 'pointer', margin: '0 20px' }} onClick={() => setShowEditMember(true)}>
                        <img src={editSvg} alt="edit-svg" style={{ height: '40px', width: '40px' }} />
                    </Box> }
                    { can(myRole, 'members.add') && <Button size="small" variant="contained" color="secondary" className={classes.addMemberBtn} onClick={() => setShowAddMember(true)}>
                        <AddIcon sx={{ fontSize: 18 }} /> MEMBER
                    </Button> }
                </Box>
            </Box>

            <Box sx={{ position: 'relative', width: '100%', background: '#FFF', padding: '26px 22px', borderRadius: '5px', marginTop: '0.2rem' }} display={"flex"} flexDirection={"column"}>
                {isHelpIconOpen && <Box className={classes.helpCard} sx={{ width: '100%', height: '100%' }}>
                    <Box className={classes.helpCardContent}>This allows you to add new members and manage details and roles of existing members.</Box>
                </Box>}
                <Box sx={{ width: '100%', marginBottom: '25px' }} display={"flex"} alignItems={"center"}>
{/*                     <Box sx={{ width: '250px' }}>
                        <Typography sx={{ fontSize: '16px', color: '#76808D', opacity: '0.5' }}>Name</Typography>
                    </Box>
                    <Box sx={{ width: '250px' }}>
                        <Typography sx={{ fontSize: '16px', color: '#76808D', opacity: '0.5', marginLeft: '22px' }}>Joined</Typography>
                    </Box>
                    <Box sx={{ width: '250px' }}>
                        <Typography sx={{ fontSize: '16px', color: '#76808D', opacity: '0.5' }}>Lomads Roles</Typography>
                    </Box>
                    <Box sx={{ width: '250px' }}>
                        <Typography sx={{ fontSize: '16px', color: '#76808D', opacity: '0.5', marginLeft: '22px' }}>Discord Roles</Typography>
                    </Box> */}
                    <div className="grid grid-cols-12 w-full" > 
                                    <div className="col-span-2 text-lg " style={{fontSize:'16px', fontWeight:'normal', opacity:'0.5'}}>Name</div>
                                    <div className="col-span-2 text-lg " style={{fontSize:'16px', fontWeight:'normal', opacity:'0.5',paddingLeft:'60px'}}>Joined</div>
                                    <div className="col-span-2 text-lg " style={{fontSize:'16px', fontWeight:'normal', opacity:'0.5',paddingLeft:'25px'}}>Lomads Role</div>
                                    <div className="col-span-2 text-lg " style={{fontSize:'16px', fontWeight:'normal', opacity:'0.5'}}>Discord Roles</div>
                                </div>
                </Box>

                <Box sx={{ width: '100%', maxHeight: '220px', overflow: 'auto', paddingTop: 2 }}>
                    {eligibleMembers?.map((result: any, index: any) => {
                        return (
                            <NameAndAvatar
                                index={index}
                                user={result}
                                name={_get(result, 'member.name', '')}
                                position={index}
                                joined={_get(result, 'joined')}
                                creator={_get(result, 'creator', false)}
                                role={_get(result, 'role', 'role4')}
                                address={_get(result, 'member.wallet', '')}
                            />
                        );
                    })}
                </Box>
            </Box>
        </Box>
    )
}