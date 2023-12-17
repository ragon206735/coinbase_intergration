import React, { useState, useMemo } from "react";
import { find as _find, get as _get, debounce as _debounce } from 'lodash';
import { Typography, Box, Drawer, Chip } from "@mui/material";
import { makeStyles } from '@mui/styles';

import { useDAO } from "context/dao";
import { DEFAULT_ROLES } from "constants/terminology";

import useTerminology from 'hooks/useTerminology';

import Checkbox from "components/Checkbox";
import Button from "components/Button";
import theme from "theme";

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
        padding: '27px !important',
    },
    modalTitle: {
        color: '#76808D',
        fontSize: '24px !important',
        fontWeight: '700 !important',
        marginBottom: '20px !important'
    },
    rolePill: {
        width: 200,
        display: "flex !important",
        alignItems: "center !important",
        justifyContent: "flex-start !important"
    }
}));

interface Props {
    open: boolean;
    closeModal(): any;
    hideBackdrop: boolean;
    validRoles: any,
    roleType: any;
    handleValidRoles(action: any): void;
}

export default ({ open, closeModal, hideBackdrop, validRoles, roleType, handleValidRoles }: Props) => {
    const classes = useStyles();
    const { DAO } = useDAO();
    const { transformRole } = useTerminology(_get(DAO, 'terminologies'));

    const [roles, setRoles] = useState(validRoles);

    console.log("valid roles : ", validRoles);

    const all_roles = useMemo(() => {
        let roles: any[] = [];
        Object.keys(_get(DAO, 'discord', {})).map((server) => {
            const r = DAO.discord[server].roles
            roles = roles.concat(r);
        })
        return roles.filter(r => r.name !== "@everyone" && r.name !== 'Lomads' && r.name !== 'LomadsTestBot');
    }, [DAO.discord]);

    const handleAddRoles = (role: any) => {
        if (roles.includes(role)) {
            setRoles(roles.filter((i: any) => i !== role))
        }
        else {
            setRoles([...roles, role]);
        }
    }

    return (
        <Drawer
            PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
            anchor={'right'}
            open={open}
            sx={{ zIndex: theme.zIndex.appBar + 1 }}
            hideBackdrop={hideBackdrop}
        >
            <Box className={classes.modalConatiner}>

                {
                    roleType === 'Lomads' &&
                    <Box display="flex" flexDirection="column" sx={{ width: '100%', marginBottom: '20px' }}>
                        <Typography sx={{ color: '#76808D', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Organisation Roles</Typography>
                        {
                            (_get(DAO, 'terminologies') ? Object.keys(_get(DAO, 'terminologies.roles', {})) : Object.keys(DEFAULT_ROLES)).map((key, index) => {
                                return (
                                    <>
                                        <Box display={"flex"} alignItems={"center"} key={index} onClick={() => handleAddRoles(key)}>
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
                                            <Checkbox checked={!(roles.some((m: any) => m.toLowerCase() === key.toLowerCase()) === false)} />
                                        </Box>
                                    </>
                                )
                            })
                        }
                    </Box>
                }

                {
                    roleType === 'Discord' && all_roles && all_roles.length > 0 &&
                    <>
                        <Box display="flex" flexDirection="column" sx={{ width: '100%' }}>
                            <Typography sx={{ color: '#76808D', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Discord Roles</Typography>
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
                                                <Checkbox checked={!(roles.some((m: any) => m.toLowerCase() === discord_value.id.toLowerCase()) === false)} />
                                            </Box>
                                        </>
                                    )
                                })
                            }
                        </Box>
                    </>
                }

                <Box style={{ margin: "0 auto", background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 500, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px', padding: "30px 0 20px" }}>
                    <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                        <Button sx={{ mr: 1 }} onClick={closeModal} fullWidth variant='outlined' size="small">CANCEL</Button>
                        <Button sx={{ ml: 1 }} onClick={() => { handleValidRoles(roles); closeModal(); }} fullWidth variant='contained' size="small">SELECT</Button>
                    </Box>
                </Box>

                {/* <Box display={"flex"} alignItems={"center"} justifyContent={"center"} style={{ width: '100%', marginTop: '20px' }}>
                    <Button variant="outlined" sx={{ marginRight: '20px', width: '169px' }} onClick={closeModal}>CANCEL</Button>
                    <Button
                        variant="contained"
                        onClick={() => { handleValidRoles(roles); closeModal(); }}
                        sx={{ width: '184px' }}
                    >
                        SELECT
                    </Button>
                </Box> */}

            </Box>
        </Drawer>
    )
}