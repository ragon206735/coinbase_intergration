import React, { useState, useEffect, useMemo } from "react";
import { find as _find, get as _get, debounce as _debounce } from 'lodash';
import { Typography, Box, Drawer } from "@mui/material";
import { makeStyles } from '@mui/styles';

import IconButton from 'components/IconButton';
import TextInput from 'components/TextInput';
import Button from "components/Button";

import CloseSVG from 'assets/svg/closeNew.svg'
import bin from 'assets/svg/bin.svg'
import ProjectResourceSVG from 'assets/svg/projectResource.svg'
import { AiOutlinePlus, AiFillQuestionCircle, AiOutlineLock } from "react-icons/ai";
import { IoCloseOutline } from 'react-icons/io5';
import { SiNotion } from "react-icons/si";
import { BsDiscord, BsGoogle, BsGithub, BsTwitter, BsGlobe } from "react-icons/bs";

import { isValidUrl } from 'utils';
import { nanoid } from 'nanoid';

import { useDAO } from "context/dao";
import AddDiscordLink from "components/AddDiscordLink";
import AddNotionLink from "components/AddNotionLink";
import Switch from "components/Switch";
import theme from "theme";
import { useAppSelector } from "helpers/useAppSelector";
import { useAppDispatch } from "helpers/useAppDispatch";
import { editProjectLinksAction } from "store/actions/project";
import useTerminology from "hooks/useTerminology";

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
    label: {
        fontSize: '16px !important',
        lineHeight: '18px !important',
        color: '#76808d',
        fontWeight: '700 !important',
    },
    addLinkBtn: {
        width: 50,
        height: 50,
        borderRadius: '5px',
        cursor: 'pointer',
        margin: '0 !important'
    },
    linkArea: {
        width: '100% !important',
        padding: '26px 22px !important',
        background: 'rgba(118, 128, 141, 0.05) !important',
        boxShadow: 'inset 1px 0px 4px rgba(27, 43, 65, 0.1) !important',
        borderRadius: '5px !important',
        marginTop: '20px !important'
    },
    linkRow: {
        width: '100% !important',
        height: '20px !important',
        marginBottom: '15px !important',
        '&:last-child': {
            marginBottom: '0px !important'
        }
    },
    linkName: {
        width: '40% !important',
    },
    linkAddress: {
        width: '60% !important',
    },
    resourceCard: {
        width: '100%', padding: '10px 20px 20px 20px !important',
        background: '#FFFFFF !important',
        boxShadow: '0px 3px 3px rgba(27, 43, 65, 0.1), -1px -2px 3px rgba(201, 75, 50, 0.05) !important',
        borderRadius: '5px !important',
        marginRight: '10px !important'
    }

}));

interface Props {
    open: boolean;
    hideBackdrop: boolean;
    closeModal(): void;
    list: any[];
    getResources(action: any): void;
    editResources: boolean;
}

export default ({ open, hideBackdrop, closeModal, list, getResources, editResources }: Props) => {
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const { DAO } = useDAO();
    const { Project } = useAppSelector((store:any) => store.project);
    const [title, setTitle] = useState<string>('');
    const [titleError, setTitleError] = useState<string>('');
    const [link, setLink] = useState<string>('');
    const [linkError, setLinkError] = useState<any>('');
    const [roleName, setRoleName] = useState<string>('');
    const [spaceDomain, setSpaceDomain] = useState<string>('');
    const [accessControl, setAccessControl] = useState(false);
    const [accessControlError, setAccessControlError] = useState<string>('');
    const [resourceList, setResourceList] = useState<any[]>(list);

    const { transformWorkspace } = useTerminology(_get(DAO, 'terminologies'));

    useEffect(() => {
        try {
            if (link && link.length > 8 && link.indexOf('notion.') > -1) {
                let lnk: any = new URL(link).pathname;
                lnk = lnk.split('/');
                if (lnk && lnk.length > 2)
                    setSpaceDomain(lnk[1]);
            }
        } catch (e) {
            console.log(e);
        }
    }, [link]);

    useEffect(() => {
        if (link && link.indexOf('notion.') > -1 && _get(DAO, 'sbt.contactDetail', []).indexOf('email') === -1) {
            setAccessControlError('Notion gated access not possible (No email in SBT)');
        } else {
            setAccessControlError('');
        }
    }, [link, DAO]);

    const linkHasDomain = useMemo(() => {
        try {
            if (link && link.indexOf('notion.') > -1)
                return (new URL(link).pathname).split('/').length > 2
            return false;
        } catch (e) {
            return false
        }
    }, [link]);

    const LinkBtn = (props: any): JSX.Element => {
        if (link && link.indexOf('discord.') > -1) {
            return (
                <Box>
                    <AddDiscordLink onLinkError={(e: React.SetStateAction<string>) => setLinkError(e)} {...props} />
                </Box>
            )
        }
        else {
            return (
                <Box>
                    <AddNotionLink {...props} />
                </Box>
            )
        }
    }

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

    const handleAddResource = async (status: any = undefined) => {
        setLinkError(null)
        if (title === '') {
            setTitleError('Enter title');
            return;
        }
        else if (link === '') {
            setLinkError("Enter link");
            return;
        }
        else if (!isValidUrl(link)) {
            setLinkError("Enter valid link");
            return;
        }
        else {
            let tempLink = link;
            if (tempLink.indexOf('https://') === -1 && tempLink.indexOf('http://') === -1) {
                tempLink = 'https://' + tempLink;
            }
            if (link.indexOf('discord.') > -1) {
                let resource: any = {};
                resource.id = nanoid(16);
                resource.title = title;
                resource.link = tempLink;
                resource.provider = new URL(tempLink).hostname;
                let dcserverid = undefined;
                if (status)
                    dcserverid = new URL(tempLink).pathname.split('/')[2]
                resource.platformId = dcserverid;
                resource.accessControl = accessControl;
                if (status)
                    resource.roleId = status;
                setResourceList([...resourceList, resource]);
                setAccessControl(false);
                setTitle('');
                setLink('');
                setRoleName('')
                setSpaceDomain('')
            }
            else if (link.indexOf('notion.') > -1) {
                if (status.status) {
                    let resource: any = {};
                    resource.id = nanoid(16);
                    resource.title = title;
                    resource.link = tempLink;
                    resource.provider = new URL(tempLink).hostname;
                    resource.spaceDomain = spaceDomain;
                    resource.accessControl = accessControl;
                    setResourceList([...resourceList, resource]);
                    setAccessControl(false);
                    setTitle('');
                    setLink('');
                    setRoleName('')
                    setSpaceDomain('')
                }
                else {
                    setLinkError(status.message || 'Something went wrong.')
                }
            }
            else {
                let resource: any = {};
                resource.id = nanoid(16);
                resource.title = title;
                resource.link = tempLink;
                resource.accessControl = false
                setResourceList([...resourceList, resource]);
                setAccessControl(false);
                setTitle('');
                setLink('');
                setRoleName('')
                setSpaceDomain('')
            }
        }
    }

    const handleRemoveResource = (position: number) => {
        setResourceList(resourceList.filter((_, index) => index !== position));
    }

    const handleSubmit = () => {
        if (editResources) {
            dispatch(editProjectLinksAction({ projectId: _get(Project, '_id', ''), daoUrl: _get(DAO, 'url', ''), payload: { resourceList } }));
            closeModal();
        }
        else {
            getResources(resourceList);
            closeModal();
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
                <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={closeModal}>
                    <img src={CloseSVG} />
                </IconButton>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <img src={ProjectResourceSVG} alt="project-resource" />
                    <Typography className={classes.modalTitle}>{ transformWorkspace().label } Resources</Typography>
                    <Typography className={classes.modalSubtitle}>Add links for online ressources </Typography>
                </Box>
                <Box display="flex"flexDirection="column" sx={{ width: '80%' }}>
                    <Typography className={classes.label}>Add links</Typography>
                    <Box  display="flex" justifyContent={"space-between"} sx={{ height: '80px', mt: 1  }}>
                        <TextInput
                            sx={{ width: 145 }}
                            placeholder="Ex Portfolio"
                            value={title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value); setTitleError(''); }}
                            error={titleError !== ''}
                            id={titleError !== '' ? "outlined-error-helper-text" : ""}
                            helperText={titleError}
                        />
                        <TextInput
                            sx={{ width: 195 }}
                            placeholder="link"
                            value={link}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setLink(e.target.value); setLinkError(''); }}
                            error={linkError !== ''}
                            id={linkError !== '' ? "outlined-error-helper-text" : ""}
                            helperText={linkError}
                        />

                        {
                            link && (link.indexOf('discord.') > -1 || link.indexOf('notion.') > -1) ?
                                <>
                                    <LinkBtn
                                        spaceDomain={spaceDomain}
                                        onNotionCheckStatus={handleAddResource}
                                        onGuildCreateSuccess={handleAddResource}
                                        title={title}
                                        link={link}
                                        roleName={roleName}
                                        accessControl={accessControl}
                                    />
                                </>
                                :
                                <Box
                                    className={classes.addLinkBtn}
                                    sx={link !== '' && title !== '' ? { background: '#C84A32' } : { background: 'rgba(27, 43, 65, 0.2)', }}
                                    display={"flex"}
                                    alignItems={"center"}
                                    justifyContent={"center"}
                                    onClick={() => handleAddResource()}
                                >
                                    <AiOutlinePlus color="#FFF" size={25} />
                                </Box>
                        }
                    </Box>

                    {
                        accessControl && link && link.indexOf('discord.') > -1 &&
                        <Box sx={{ mb: 2 }} style={{ width: '100%' }}>
                            <TextInput
                                sx={{ width: '100%' }}
                                type="text"
                                placeholder="Role name"
                                value={roleName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoleName(e.target.value)}
                            />
                        </Box>
                    }

                    {
                        accessControl && link && link.indexOf('notion.') > -1 && !linkHasDomain &&
                        <Box sx={{ mb: 2 }} style={{ width: '100%' }}>
                            <TextInput
                                sx={{ width: '100%' }}
                                type="text"
                                placeholder="Notion Domain"
                                value={spaceDomain}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpaceDomain(e.target.value)}
                            />
                        </Box>
                    }

                    {
                        DAO?.sbt &&
                        <Box sx={{ width: '100%' }} display={"flex"}>
                            {
                                (link && link.indexOf('notion.') > -1 && _get(DAO, 'sbt.contactDetail', '').indexOf('email') > -1) || (link && link.indexOf('discord.') > -1 && _get(DAO, 'sbt.contactDetail', '').indexOf('discord') > -1)
                                    ?
                                    <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                        <Switch checkedSVG="checkmark" onChange={() => setAccessControl(prev => !prev)} />
                                    </Box>
                                    :
                                    null
                            }
                            <Box style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ color: '#76808D', opacity: '0.6' }}>ACCESS CONTROL <AiFillQuestionCircle /></Typography>
                                <Typography sx={{ color: 'rgba(118, 128, 141, 0.5)', fontStyle: 'italic', fontSize: '14px' }}>Currently available for Notion and Discord only.</Typography>
                                <Typography sx={{ color: 'rgba(118, 128, 141, 0.5)', fontStyle: 'italic', fontSize: '14px' }}>Only members with a pass token and who belong to</Typography>
                                <Typography sx={{ color: 'rgba(118, 128, 141, 0.5)', fontStyle: 'italic', fontSize: '14px' }}>this workspace can access the content.</Typography>
                                {accessControlError && <div><span style={{ color: 'red' }}>{accessControlError}</span></div>}
                            </Box>
                        </Box>
                    }

                    {
                        accessControl && link && link.indexOf('notion.') > -1 &&
                        <Box
                            style={{ fontSize: 14, marginBottom: 16, padding: "5px 10px", backgroundColor: "#188C7C", borderRadius: 5, color: "#FFF" }}
                        >
                            Invite <span style={{ color: "#FFF", fontWeight: 'bold' }}>{process.env.REACT_APP_NOTION_ADMIN_EMAIL}</span> to be an Admin of your workspace
                        </Box>
                    }

                    {
                        resourceList.length > 0 &&
                        <Box className={classes.linkArea}>
                            {
                                resourceList.map((item, index) => {
                                    return (
                                        <Box className={classes.linkRow} display={"flex"} alignItems={"center"} justifyContent={"space-between"} key={index}>
                                            <Box className={classes.linkName} display={"flex"}>
                                                {handleParseUrl(item.link)}
                                                <Typography sx={{ marginLeft: '5px' }}>{item.title.length > 10 ? item.title.slice(0, 10) + "..." : item.title}</Typography>
                                            </Box>
                                            <Box className={classes.linkAddress} display={"flex"} alignItems={"center"}>
                                                <Typography>{item.link.length > 20 ? item.link.slice(0, 20) + "..." : item.link}</Typography>
                                                {item.accessControl && <AiOutlineLock color='#C94B32' />}
                                            </Box>
                                            <Box display={"flex"} alignItems={"center"} justifyContent={"center"}
                                                sx={{ width: 40, cursor: 'pointer' }}
                                                onClick={() => handleRemoveResource(index)}
                                            >
                                                <IoCloseOutline />
                                            </Box>
                                        </Box>
                                    )
                                })
                            }
                        </Box>
                    }

                    {/* {
                        resourceList.length > 0 && editResources &&
                        <Box display={"flex"} flexDirection={"column"} sx={{ width: '100%', marginTop: '20px' }}>
                            {
                                resourceList.map((item, index) => {
                                    return (
                                        <Box sx={{ width: '100%' }} display={"flex"} justifyContent={"space-between"} key={index}>
                                            <Box className={classes.resourceCard} display={"flex"}>
                                                <TextInput
                                                    sx={{ marginRight: '10px' }}
                                                    placeholder="Ex Portfolio"
                                                    value={item.title}
                                                />
                                                <TextInput
                                                    // sx={{ width: 195 }}
                                                    placeholder="link"
                                                    value={item.link}
                                                />
                                            </Box>
                                            <IconButton>
                                                <img src={bin} alt="bin" />
                                            </IconButton>
                                        </Box>
                                    )
                                })
                            }
                        </Box>
                    } */}

                    <Box display={"flex"} alignItems={"center"} justifyContent={"center"} style={{ width: '100%', marginTop: '20px' }}>
                        <Button variant="outlined" sx={{ marginRight: '20px', width: '169px' }} onClick={closeModal}>CANCEL</Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={resourceList.length === 0}
                            sx={{ width: '184px' }}
                        >
                            {
                                editResources
                                    ?
                                    'SAVE'
                                    :
                                    'ADD'
                            }
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Drawer>
    )
}