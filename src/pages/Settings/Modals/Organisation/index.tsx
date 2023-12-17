import { Box, Chip, FormControl, FormLabel, IconButton as MuiIconButton, Typography } from "@mui/material";
import { get as _get } from 'lodash';
import React, { useEffect, useState } from "react";
import LomadsIconButton from "components/IconButton";
import CloseSVG from 'assets/svg/close-new.svg'
import { makeStyles } from '@mui/styles';
import OrganisationSVG from 'assets/images/drawer-icons/OD.svg'
import Button from "components/Button";
import { useDAO } from "context/dao";
import TextInput from "components/TextInput";
import Switch from "components/Switch";
import Dropzone from "components/Dropzone";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import palette from "theme/palette";
import { isValidUrl } from 'utils'
import { useAppSelector } from "helpers/useAppSelector";

const useStyles = makeStyles((theme: any) => ({
    headerTitle: {
        fontFamily: 'Inter, sans-serif',
        fontStyle: 'normal',
        fontWeight: '400 !important',
        fontSize: '28px !important',
        lineHeight: '38px',
        color:'#C94B32'
    },
    headerDescription: {
        fontFamily: 'Inter, sans-serif',
        fontStyle: 'normal',
        textAlign: 'center',
        fontWeight: '400 !important',
        fontSize: '14px !important',
        lineHeight: '19px !important',
        color: '#76808d',
        "& span": {
            fontWeight: '600 !important', 
        }
    },
    label: {
        fontFamily: 'Inter,sans-serif',
        fontStyle: 'normal',
        fontWeight: '700 !important',
        fontSize: '16px !important',
        letterSpacing: '-0.011em',
        color: '#76808D'
    },
    infoText: {
        fontSize: '14px !important',
        fontStyle: 'italic !important',
        fontWeight: '400 !important',
        lineHeight: '18px !important',
        marginTop: '10px !important'
    },
    chip: {
        backgroundColor: 'rgba(118, 128, 141, 0.05) !important',
        width: 110,
        height: 25,
        alignSelf: "flex-end",
        padding: "4px 20px",
        '& .MuiChip-label': {
            fontStyle: 'normal',
            fontWeight: 700,
            fontSize: '14px',
            color: 'rgba(118, 128, 141, 0.5)'
        }
    },
    iconButton: {
        cursor: 'pointer',
        background: `${theme.palette.primary.main} !important`,
        width: '50px !important',
        height: '50px !important',
        borderRadius: '5px !important',
        '&:hover': {
          backgroundColor: `${theme.palette.primary.dark} !important`,
        },
    },
    iconButtonDisabled: {
        backgroundColor: `#f4f4f4 !important`,
    },
    linkContainer: {
        backgroundColor: "rgb(237, 242, 247)",
        color: 'rgb(113, 128, 150)',
        borderRadius: '5px',
        marginTop: '9px',
        padding: '9px 16px'
    },
    linkTitle: {
        width: '150px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    link: {
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
  }));


const Organisation = ({ open, onClose }: any) => {
    const classes = useStyles()
    const { DAO, updateDAO } = useDAO()
    const { updateDAOLoading } = useAppSelector((store:any) => store.dao)
    const [error, setError] = useState<any>({})
    const [linkPlaceholder, setLinkPlaceholder] = useState<any>({ name: "", link: "" })
    const [state, setState] = useState<any>({})

    useEffect(() => {
        if(DAO?.url) {
            setState((prev:any) => {
                return {
                    ...prev,
                    name: _get(DAO, 'name', null),
                    description: _get(DAO, 'description', null),
                    links: _get(DAO, 'links', null),
                    image: _get(DAO, 'image', null),
                }
            })
        }
    }, [DAO?.url])

    const handleAddLink = () => {
        setError({})
        let err = {}
        if(!linkPlaceholder.name || linkPlaceholder.name === "")
            err = { ...err, linkName: "Enter valid name" }
        if(!linkPlaceholder.link || linkPlaceholder.link === "" || !isValidUrl(linkPlaceholder?.link || ''))
            err = { ...err, link: "Enter valid link" }
        if(Object.keys(err).length > 0)
            return setError(err)
        setState((prev: any) => {
            return {
                ...prev, 
                links: [...prev.links, { title: linkPlaceholder?.name, link: linkPlaceholder?.link.indexOf('http') === -1 ? `https://${linkPlaceholder?.link}` : linkPlaceholder?.link }]
            }
        })
        setLinkPlaceholder({ name: "", link: "" })
    }

    const handleSave = () => {
        setError({})
        let err = {}
        if(!state?.name || state?.name === "")
            err = { ...err, name: "Enter valid name" }
        if(Object.keys(err).length > 0)
            return setError(err)
        updateDAO({ url: DAO?.url, payload: { ...state } })
    }

    return (
        <Box sx={{ pb: 8, pt: 6 }} style={{ position: 'relative' }}>
            <LomadsIconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={onClose}>
                <img src={CloseSVG} />
            </LomadsIconButton>
            <Box sx={{ mt: 0, mb: 6 }} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <img style={{ marginBottom: 6, width: 90, height: 90 }} src={OrganisationSVG} />
                <Typography sx={{ mt: 2 }} className={classes.headerTitle}>Organisation Details</Typography>
            </Box>
            <Box>
                <Box sx={{ my: 2 }}>
                    <TextInput value={state?.name}
                        inputProps={{ maxLength: 50 }}
                        error={error?.name}
                        helperText={error?.name}
                        onChange={(evt: any) => setState((prev: any) => { return { ...prev, name: evt.target.value } })}
                        placeholder="Fashion Fusion" fullWidth label="Name" />
                </Box>
                <Box sx={{ my: 2 }}>
                    <TextInput value={state?.description}
                        inputProps={{ maxLength: 250 }}
                        onChange={(evt: any) => setState((prev: any) => { return { ...prev, description: evt.target.value } })}
                        multiline
                        rows={4}
                        placeholder="DAO Description" fullWidth label="Description" />
                </Box>
                <Box sx={{ my: 2 }}>
                    <TextInput value={process.env.REACT_APP_URL + "/" + _get(DAO, 'url', '')}
                        disabled fullWidth label="Organisation’s URL" />
                </Box>
                {/* To be done */}
                {/* <Box sx={{ mt: 3 }}>
                    <Typography className={classes.label}>Member visibility</Typography>
                    <Typography className={classes.infoText}>If checked, all organization members can view workspace membership. If unchecked, only project members can see their collaborators.</Typography>
                    <Box my={2}>
                        <Switch />
                    </Box>
                </Box> */}
                <Box mt={4}>
                    <FormControl fullWidth>
                        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                            <FormLabel>Import Thumbnail</FormLabel>
                            <Chip sx={{ mr: 1 }} className={classes.chip} size="small" label="Optional" />
                        </Box>
                        <Typography variant="subtitle2" className={classes.infoText}>Suggested dimensions and format : 800x800, .svg or .png</Typography>
                    </FormControl>
                    <Box>
                        <Dropzone
                            value={state?.image}
                            onUpload={(url: string) => {
                                setState((prev: any) => { return { ...prev, image: url } })
                            }}
                        />
                    </Box>
                </Box>
                <Box sx={{ py: 4 }}>
                    <Box style={{ width: 300, margin: '0 auto', border: `1px solid ${palette.primary.main}` }}></Box>
                </Box>
                <Box>
                    <Typography className={classes.label}>Links</Typography>
                    <Box sx={{ mt: 1 }} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                        <TextInput error={error?.linkName} value={linkPlaceholder?.name} onChange={(e: any) => { setLinkPlaceholder((prev: any) => { return { ...prev, name: e.target.value } }) }} placeholder="Ex-portfolio" style={{ marginRight: '6px' }}/>
                        <TextInput error={error?.link} value={linkPlaceholder?.link} onChange={(e: any) => { setLinkPlaceholder((prev: any) => { return { ...prev, link: e.target.value } }) }} placeholder="Link" style={{ marginRight: '6px' }} fullWidth />
                        <MuiIconButton onClick={() => handleAddLink()} color="secondary" className={classes.iconButton} classes={{ disabled: classes.iconButtonDisabled }}>
                            <AddIcon/>
                        </MuiIconButton>
                    </Box>
                    { state?.links?.filter((link:any) => !link.noPreview).length > 0 && <Box className={classes.linkContainer}>
                        {
                            state?.links?.filter((link:any) => !link.noPreview).map((link: any, _i: number) => {
                                return (
                                    <Box key={link.title + link.link} sx={{ my: 1 }} display="flex" flexDirection="row" alignItems="center">
                                        <Typography className={classes.linkTitle}>{ link.title }</Typography>
                                        <Typography className={classes.link}>{ link.link }</Typography>
                                        <MuiIconButton onClick={() => {
                                            setState((prev: any) => {
                                                return {
                                                    ...prev,
                                                    links: prev?.links?.filter((l:any, _j:number) => _i !== _j)
                                                }
                                            })
                                        }} size="small"><CloseIcon style={{ fontSize: 16 }}/></MuiIconButton>
                                    </Box>
                                )
                            })
                        }
                    </Box> }
                </Box>
            </Box>
            <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px' , padding: "30px 0 20px" }}>
                    <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                        <Button onClick={() => onClose()} sx={{ mr:1 }} fullWidth variant='outlined' size="small">Cancel</Button>
                        <Button onClick={() => handleSave()} sx={{ ml:1 }} disabled={updateDAOLoading} loading={updateDAOLoading} fullWidth variant='contained' size="small">Save</Button>
                    </Box>
                </Box>
        </Box>
    )
}

export default Organisation