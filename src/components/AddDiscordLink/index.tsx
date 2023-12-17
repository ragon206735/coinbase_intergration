import React, { useState, useEffect, useCallback } from "react";
import { find as _find, get as _get, debounce as _debounce } from 'lodash';
import { useWeb3Auth } from "context/web3Auth";
import { useDAO } from "context/dao";
import { getSigner } from 'utils'
import { isValidUrl } from 'utils';
import SimpleLoadButton from 'components/SimpleLoadButton';
import useDCAuth from 'hooks/useDCAuth';
import { toast } from "react-toastify";
import { AiOutlinePlus } from "react-icons/ai";
import usePopupWindow from 'hooks/usePopupWindow';
import axios from "axios";
import { LeapFrog } from "@uiball/loaders";
import { usePrevious } from 'hooks/usePrevious';
import useInterval from "hooks/useInterval";
import axiosHttp from 'api';
import { Box, IconButton } from "@mui/material";
import { Add } from "@mui/icons-material";
import StyledIconButton from "components/StyledIconButton";
import { makeStyles } from "@mui/styles";


const useStyles = makeStyles((theme: any) => ({
    addLinkBtn: {
        width: 50,
        height: 50,
        borderRadius: '5px',
        cursor: 'pointer',
        margin: '0 !important'
    }
}));

export default ({ title, desc, link, roleName, accessControl, okButton, onGuildCreateSuccess, renderButton = undefined, onLinkError, ...props }: any) => {
    const classes  = useStyles()
    const { provider, account, chainId } = useWeb3Auth();
    const { onOpen, onResetAuth, authorization, isAuthenticating } = useDCAuth("identify guilds")

    const { onOpen: openAddBotPopup, windowInstance: activeAddBotPopup } = usePopupWindow()

    const { DAO } = useDAO();

    const [server, setServer] = useState<any>(null);
    const [channels, setChannels] = useState<any>(null);
    const [poll, setPoll] = useState<any>(null);
    const [addLinkLoading, setAddLinkLoading] = useState<any>(null);
    const [hasClickedAuth, setHasClickedAuth] = useState<any>(false)

    const getDiscordServers = useCallback(async () => {
        return axios.get('https://discord.com/api/users/@me/guilds', { headers: { Authorization: authorization } })
            .then(res => res.data)
            .catch(e => {
                if (e.response.status === 401) {
                    setHasClickedAuth(true)
                    onResetAuth()
                    setTimeout(() => onOpen(), 1000)
                }
                return null;
            })
    }, [authorization, onOpen])

    const prevAuth = usePrevious(authorization)

    useEffect(() => {
        if (((prevAuth == undefined && authorization) || (prevAuth && authorization && prevAuth !== authorization)) && link && hasClickedAuth) {
            handleAddResource()
        }
    }, [prevAuth, authorization, hasClickedAuth])

    useInterval(async () => {
        axiosHttp.get(`discord/guild/${poll}`)
            .then(res => setChannels(res.data.channels))
    }, poll ? 5000 : null)

    const prevActiveAddBotPopup = usePrevious(activeAddBotPopup)
    const prevIsAuthenticating = usePrevious(isAuthenticating)

    useEffect(() => {
        if (!!prevActiveAddBotPopup && !activeAddBotPopup) {
            // onSelect(serverData.id)
            if (poll)
                setPoll(null)
        }
    }, [prevActiveAddBotPopup, activeAddBotPopup, poll])


    useEffect(() => {
        if (prevIsAuthenticating && !isAuthenticating)
            setAddLinkLoading(null);
    }, [prevIsAuthenticating, isAuthenticating])

    useEffect(() => {
        if (channels?.length > 0 && activeAddBotPopup) {
            setPoll(null)
            activeAddBotPopup.close()
            onGuildBotAddedDelayed(server)
        }
    }, [channels, activeAddBotPopup])

    const finish = (result:any) => {
        setChannels(null);
        setPoll(null);
        setHasClickedAuth(false)
        if (server) {
            axiosHttp.post(`discord/guild/${server.id}/sync-roles`, { daoId: _get(DAO, '_id') })
                .finally(() => {
                    setAddLinkLoading(null);
                    onGuildCreateSuccess(result)
                    setServer(null);
                })
        } else {
            setAddLinkLoading(null);
            onGuildCreateSuccess(result)
            setServer(null);
        }
    }

    const onGuildBotAdded = async (server:any) => {
        let attachRoleId = undefined;
        if (roleName) {
            attachRoleId = await axiosHttp.get(`discord/guild/${server.id}/roles`)
                .then(async res => {
                    if (res.data) {
                        let guildRole = _find(res.data, r => r.name.toLowerCase() === roleName.toLowerCase())
                        if (guildRole)
                            return guildRole.id
                        else {
                            guildRole = await axiosHttp.post(`discord/guild/${server.id}/role`, { name: roleName }).then(res => res.data)
                            return guildRole.id
                        }
                    }
                })
        }
        finish(attachRoleId ? attachRoleId : server.id)
    }
    const onGuildBotAddedDelayed = useCallback(_debounce(onGuildBotAdded, 1000), [onGuildBotAdded, link, server])

    const handleAddResource = async () => {
        if (title === '') {
            return toast.error("Please enter title");
        }
        else if (link === '') {
            return toast.error("Please enter link");
        }
        else if (!isValidUrl(link)) {
            return toast.error("Please enter a valid link");
        }
        else {
            if (accessControl) {
                setHasClickedAuth(true)
                try {
                    setAddLinkLoading(true);
                    if (!authorization)
                        return onOpen()
                    setHasClickedAuth(false)
                    const url = new URL(link)
                    const dcserverid = url.pathname.split('/')[2]
                    const dcServers = await getDiscordServers();
                    if (dcServers && dcServers.length) {
                        let validServer = _find(dcServers, s => s.id.toString() === dcserverid.toString() && s.owner)
                        if (validServer) {
                            const guildId = await axiosHttp.get(`project/discord-server-exists/${dcserverid}`).then(res => res.data);
                            if (guildId) {
                                // const guild = await axios.get(`https://api.guild.xyz/v1/guild/${guildId}`).then(res => res.data)
                                // if(guild) {

                                // } else {
                                setServer(validServer)
                                // check if bot already added 
                                //    const discordGuild = await axiosHttp.get(`discord/guild/${validServer.id}`).then(res => res.data);  
                                //    if(!discordGuild){
                                const redirectUri = typeof window !== "undefined" && `${window.location.href.split("/").slice(0, 3).join("/")}/dcauth`
                                setPoll(dcserverid)
                                openAddBotPopup(`https://discord.com/api/oauth2/authorize?client_id=${process.env.REACT_APP_DISCORD_APP_ID}&guild_id=${dcserverid}&permissions=8&scope=bot%20applications.commands&redirect_uri=${redirectUri}`)
                                //    } else {
                                //         onGuildBotAddedDelayed(validServer)
                                //    }
                                //}
                            } else {
                                setServer(validServer)
                                // check if bot already added 
                                const discordGuild = await axiosHttp.get(`discord/guild/${validServer.id}`).then(res => res.data).catch(e => null);
                                if (!discordGuild) {
                                    const redirectUri = typeof window !== "undefined" && `${window.location.href.split("/").slice(0, 3).join("/")}/dcauth`
                                    setPoll(dcserverid)
                                    openAddBotPopup(`https://discord.com/api/oauth2/authorize?client_id=${process.env.REACT_APP_DISCORD_APP_ID}&guild_id=${dcserverid}&permissions=8&scope=bot%20applications.commands&redirect_uri=${redirectUri}`)
                                } else {
                                    onGuildBotAddedDelayed(validServer)
                                }
                            }
                        } else {
                            onLinkError('You are not the owner')
                            // setHasClickedAuth(true)
                            // onResetAuth()
                            // return setTimeout(() => onOpen(), 2000) 
                        }
                    } else {
                        setAddLinkLoading(null);
                        //toast.error("Invalid discord server");
                    }
                } catch (e) {
                    setAddLinkLoading(null);
                }
            } else {
                finish(undefined)
            }
        }
    }

    if (renderButton) {
        return (
            <div onClick={() => {
                if (!(link === '' || title === '' || addLinkLoading))
                    handleAddResource()
            }}>
                {addLinkLoading ?
                    <button
                        style={{ background: link !== '' && title !== '' && !addLinkLoading ? '#C84A32' : 'rgba(27, 43, 65, 0)', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        disabled={link === '' || title === '' || addLinkLoading}
                    >
                        {addLinkLoading ? <LeapFrog size={20} color="#C84A32" /> : <AiOutlinePlus color="#FFF" size={25} />}
                    </button>
                    : renderButton}
            </div>
        )
    }

    return (
        <Box
            className={classes.addLinkBtn}
            sx={link !== '' && title !== '' ? { background: '#C84A32' } : { background: 'rgba(27, 43, 65, 0.2)', }}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            onClick={() => handleAddResource()}
        > { addLinkLoading ? <LeapFrog size={20} color="#FFF" /> :
            <AiOutlinePlus color="#FFF" size={25} /> }
        </Box>
    )

    // return (
    //     <>
    //         {
    //             okButton ?
    //                 // <SimpleLoadButton
    //                 //     condition={addLinkLoading}
    //                 //     disabled={addLinkLoading}
    //                 //     title="OK"
    //                 //     bgColor="#C94B32"
    //                 //     className="button"
    //                 //     fontsize={16}
    //                 //     fontweight={400}
    //                 //     height={40}
    //                 //     width={129}
    //                 //     onClick={() => handleAddResource()}
    //                 // />
    //                 <StyledIconButton variant="contained">
    //                     <Add/>
    //                 </StyledIconButton>
    //                 :
    //                 <>
    //                     {
    //                         <button
    //                             style={{ background: link !== '' && title !== '' && !addLinkLoading ? '#C84A32' : 'rgba(27, 43, 65, 0.2)', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    //                             disabled={link === '' || title === '' || addLinkLoading}
    //                             onClick={() => handleAddResource()}>
    //                             {addLinkLoading ? <LeapFrog size={20} color="#FFF" /> : <AiOutlinePlus color="#FFF" size={25} />}
    //                         </button>
    //                     }
    //                 </>
    //         }
    //     </>

    // )
}