import React, { useCallback, useEffect, useMemo, useState } from "react";
import { get as _get, find as _find, uniqBy as _uniqBy, sortBy as _sortBy } from 'lodash';
import { Typography, Box } from "@mui/material";
import { makeStyles } from '@mui/styles';
import axios from "axios";
import { SiNotion } from "react-icons/si";
import { BiLock } from "react-icons/bi";
import { BsDiscord, BsGoogle, BsGithub, BsTwitter, BsGlobe } from "react-icons/bs";
import axiosHttp from 'api'
import { useWeb3Auth } from "context/web3Auth";
import { useAppSelector } from "helpers/useAppSelector";
import useMintSBT from "hooks/useMintSBT.v2";
import { useDAO } from "context/dao";
import useDCAuth from "hooks/useDCAuth";
import { usePrevious } from "hooks/usePrevious";
import { useAppDispatch } from "helpers/useAppDispatch";
import useEncryptDecrypt from "hooks/useEncryptDecrypt";
import { updateCurrentUser } from "store/actions/session";
import { useParams } from "react-router-dom";
import { updateProjectLinkAction } from "store/actions/project";
import { toast } from "react-hot-toast";
import { LeapFrog } from "@uiball/loaders";
const { toChecksumAddress } = require('ethereum-checksum-address')

interface ProjectLinkCardProps {
    link: any,
    key: number,
}

const useStyles = makeStyles((theme: any) => ({
    linkChip: {
        width: 'fit-content !important',
        height: '40px',
        padding: '0 6px !important',
        borderRadius: '100px !important',
        marginRight: '10px !important',
        marginBottom: '10px !important',
        cursor: 'pointer !important',
        '&:hover': {
            boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1) !important'
        }
    },
    lockCircle: {
        height: '30px',
        width: '30px',
        borderRadius: '50% !important',
        background: '#B12F15',
        cursor: 'pointer !important'
    },
}));

export default ({ link, key }: ProjectLinkCardProps) => {
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const { account, chainId } = useWeb3Auth();
    const { projectId, daoURL } = useParams();
    const { decryptMessage } = useEncryptDecrypt()
    const { onOpen, onResetAuth, authorization, isAuthenticating } = useDCAuth("identify guilds")
    const [unlockLoading, setUnlockLoading] = useState<any>(null)
    const [hasClickedAuth, setHasClickedAuth]= useState<any>(null)
    const { DAO } = useDAO()
    const { balanceOf } = useMintSBT(DAO?.sbt?.address, DAO?.sbt?.version, +DAO?.sbt?.chainId)
    const { Project, updateProjectDetailsLoading } = useAppSelector((store:any) => store.project);

    const handleParseUrl = (url: string, accessControl: boolean, locked: any) => {
        try {
            const link = new URL(url);
            if (link.hostname.indexOf('notion.') > -1) {
                return <SiNotion color={accessControl && locked ? '#FFF' : '#B12F15'} size={20} />
            }
            else if (link.hostname.indexOf('discord.') > -1) {
                return <BsDiscord color={accessControl && locked ? '#FFF' : '#B12F15'} size={20} />
            }
            else if (link.hostname.indexOf('github.') > -1) {
                return <BsGithub color={accessControl && locked ? '#FFF' : '#B12F15'} size={20} />
            }
            else if (link.hostname.indexOf('google.') > -1) {
                return <BsGoogle color={accessControl && locked ? '#FFF' : '#B12F15'} size={20} />
            }
            else if (link.hostname.indexOf('twitter.') > -1) {
                return <BsTwitter color={accessControl && locked ? '#FFF' : '#B12F15'} size={20} />
            }
            else {
                return <span><BsGlobe color={accessControl ? '#FFF' : '#B12F15'} size={20} /></span>
            }
        }
        catch (e) {
            console.error(e);
            return null
        }
    }

    const prevAuth = usePrevious(authorization)
    useEffect(() => {
        console.log("prevAut", prevAuth, authorization, hasClickedAuth)
        if (((prevAuth == undefined && authorization) || (prevAuth && authorization && prevAuth !== authorization)) && hasClickedAuth) {
            console.log("prevAut", "unlock(hasClickedAuth)")
            unlock(hasClickedAuth)
        }
    }, [prevAuth, authorization, hasClickedAuth])

    const getPlatformMemberId = () => {
        return axios.get(`https://discord.com/api/users/@me`, { headers: { Authorization: authorization } })
            .then(res => res.data.id)
            .catch(e => {
                if (e.response.status === 401) {
                    console.log(e)
                    //setHasClickedAuth(true)
                    onResetAuth()
                    setTimeout(() => onOpen(), 1000)
                }
                return null;
            })
    }

    const getGuilds = () => {
        return axios.get(`https://discord.com/api/users/@me/guilds`, { headers: { Authorization: authorization } })
            .then(res => res.data)
    }

    const unlockLink = (link: any) => {
        dispatch(updateProjectLinkAction({
            projectId, daoUrl: _get(DAO, 'url', ''), payload: { id: link.id }
        }))
    }

    const addGuildRole = async (guildId: any, memberId: any, roleId: any) => {
        return axiosHttp.get(`discord/guild/${guildId}/member/${memberId}/role/${roleId}/add`)
    }

    const myMetadata = useMemo(() => {
        return _find(_get(DAO, 'sbt.metadata', []), m => {
            return _find(m.attributes, a => a.value === account)
        })
    }, [DAO?.sbt, account])

    const getPersonalDetails = useCallback((attr: any) => {
        if (DAO && DAO.sbt) {
            if (myMetadata && myMetadata.attributes) {
                for (let index = 0; index < myMetadata.attributes.length; index++) {
                    const attribute = myMetadata.attributes[index];
                    if (attr.toLowerCase() === attribute.trait_type.toLowerCase()) {
                        return attribute?.value;
                    }
                }
                return null
            }
        }
    }, [DAO?.sbt, myMetadata])

    const unlock = useCallback(async (link: any, update = true) => {
        //if (unlockLoading) return;
        setUnlockLoading(link?.id)
        console.log(_uniqBy(Project?.members, '_id'))
        let memberExists = _find(_uniqBy(Project?.members, '_id'), (member:any) => member?.wallet?.toLowerCase() === account?.toLowerCase())
        console.log("memberExists", memberExists)
        if (!memberExists)
            return setUnlockLoading(null);
        if (link.link.indexOf('discord.') > -1) {
            try {
                    const balanceStats: any = await balanceOf();
                    console.log("BALANCEOF:", parseInt(balanceStats._hex, 16))
                    console.log(parseInt(balanceStats._hex, 16))
                    if (parseInt(balanceStats._hex, 16) === 1) {
                        const url = new URL(link.link)
                        const dcserverid = url.pathname.split('/')[2]
                        const dcchannelid = url.pathname.split('/')[3]
                        setHasClickedAuth(link)
                        console.log("prevAut", "authorization", authorization)
                        if (!authorization)
                            return onOpen();
                        const discordMemberId = await getPlatformMemberId();
                        const guilds = await getGuilds();
                        const guildExists = _find(guilds, g => g.id === dcserverid)
                        if (guildExists) {
                            await addGuildRole(dcserverid, discordMemberId, link.roleId)
                            if (update)
                                unlockLink(link)
                            setUnlockLoading(null)
                            setHasClickedAuth(null)
                            window.open(`https://discord.com/channels/${dcserverid}/${dcchannelid}`, '_blank')
                        } else {
                            if (update)
                                unlockLink(link)
                            setUnlockLoading(null)
                            setHasClickedAuth(null)
                            const { code } = await axiosHttp.get(`/discord/guild/${dcserverid}/${dcchannelid}/invite-code`).then(res => res.data)
                            window.open(`https://discord.gg/${code}`, '_blank')
                        }
                    }
                
            } catch (e) {
                console.log(e)
                setUnlockLoading(null)
            }
        } else if (link.link.indexOf('notion.') > -1) {
            if (_get(DAO, 'sbt.contactDetail', []).indexOf('email') === -1) {
                return;
            }
            setUnlockLoading(link.id)
            try {
                axiosHttp.get(`/project/notion/space-admin-status?domain=${link.spaceDomain}`)
                    .then(async res => {
                        if (res.data) {
                            console.log(res.data)
                            const balanceStats: any = await balanceOf();
     
                            console.log("BALANCEOF:", parseInt(balanceStats._hex, 16))
                            console.log(parseInt(balanceStats._hex, 16))
                                if (parseInt(balanceStats._hex, 16) === 1) {
                                    const metadata = await axiosHttp.get(`/metadata/${_get(DAO, 'sbt._id', '')}`)
                                    console.log("metadata", metadata)
                                    if (metadata && metadata.data) {
                                        console.log(metadata.data)
                                        let notion_email = null
                                        if (getPersonalDetails("Personal Details")) {
                                            const data = await decryptMessage(getPersonalDetails("Personal Details"))
                                            if (data && data.email) {
                                                notion_email = data.email
                                            }
                                        } else {
                                            notion_email = _get(_find(myMetadata.attributes, attr => attr.trait_type === "Email"), 'value', null)
                                        }
                                        if (notion_email) {
                                            const notionUser = await axiosHttp.get(`project/notion/notion-user?email=${notion_email}`).then(res => res.data)
                                            console.log(notionUser)
                                            if (_get(notionUser, 'value.value.id', null)) {
                                                const notionUserId = _get(notionUser, 'value.value.id', null);
                                                dispatch(updateCurrentUser({ notionUserId }))
                                                axiosHttp.post(`project/notion/add-role`, { notionUserId, linkId: link.id, projectId, account })
                                                    .then(res => {
                                                        if (update)
                                                            unlockLink(link)
                                                        window.open(link.link, '_blank')
                                                    })
                                            }
                                        }
                                    }
                                }
                            
                        }
                    })
                    .catch(e => {
                        setUnlockLoading(null)
                        console.log(e)
                    })
                    .finally(() => setUnlockLoading(null))
            } catch (e) {
                console.log(e)
                setUnlockLoading(null)
            }
        }
    }, [ unlockLoading, Project, account, authorization])

    return (
        <Box
            key={key}
            className={classes.linkChip}
            display="flex"
            alignItems={"center"}
            justifyContent={"space-between"}
            sx={link.accessControl && !_find(_get(link, 'unlocked', []), (l:any) => toChecksumAddress(l) === account) ? { background: '#C94B32' } : { background: '#FFFFFF' }}
            onClick={() => {
                if(window.location.pathname.indexOf('preview') > -1) {
                    window.location.href = window.location.pathname.replace('/preview', '')
                    return;
                }
                if (!link.accessControl) {
                    window.open(link.link, '_blank')
                }
                else {
                    console.log("unlock link");
                    unlock(link);
                }
            }}
        >
            { account &&
            <Box sx={{ height: 30, width: 30 }} display="flex" alignItems={"center"} justifyContent={"center"}>
                {  handleParseUrl(link.link, link.accessControl, _get(link, 'unlocked', []).map((a: any) => a.toLowerCase()).indexOf(account.toLowerCase()) == -1)}
            </Box> }
            <Typography
                sx={link.accessControl && !_find(_get(link, 'unlocked', []), (l:any) => toChecksumAddress(l) === account) ? { margin: '0 15px', color: '#FFF' } : { margin: '0 15px', color: '#B12F15' }}
            >
                {link.title.length > 25 ? link.title.slice(0, 25) + "..." : link.title}
            </Typography>
            {  
                link.accessControl && !_find(_get(link, 'unlocked', []), (l:any) => toChecksumAddress(l) === account) && <Box display="flex" alignItems={"center"} justifyContent={"center"} className={classes.lockCircle}>
                    { unlockLoading === link.id  ?
                        <LeapFrog size={16} color={ _find(_get(link, 'unlocked', []), (l:any) => toChecksumAddress(l) === account) ? "#C84A32" : "#FFF"} /> :
                        <BiLock color="#FFF" />
                    }
                </Box>
            }
            {  
                unlockLoading === link.id && link.accessControl && _find(_get(link, 'unlocked', []), (l:any) => toChecksumAddress(l) === account) && <Box display="flex" alignItems={"center"} justifyContent={"center"}>
                    <LeapFrog size={16} color={ _find(_get(link, 'unlocked', []), (l:any) => toChecksumAddress(l) === account) ? "#C84A32" : "#FFF"} /> :
                </Box>
            }
        </Box>
    )
}