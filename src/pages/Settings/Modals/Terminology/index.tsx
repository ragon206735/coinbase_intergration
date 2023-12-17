import React, { useEffect, useMemo, useState } from "react"
import { get as _get, find as _find, pick as _pick } from 'lodash'
import { Drawer, Box, Grid, Typography, Stack, Avatar, List, ListItem, ListItemButton, MenuItem } from "@mui/material"
import IconButton from "components/IconButton"
import CloseSVG from 'assets/svg/close-new.svg'
import { makeStyles } from '@mui/styles';
import { useDAO } from "context/dao"
import { useNavigate } from "react-router-dom"
import { useWeb3Auth } from "context/web3Auth"
import OD from "assets/images/drawer-icons/Frameterminology.svg";
import { TASK_OPTIONS, WORKSPACE_OPTIONS, DEFAULT_ROLES } from 'constants/terminology';
import Button from "components/Button"
import TextInput from "components/TextInput"
import { useAppSelector } from "helpers/useAppSelector"

const useStyles = makeStyles((theme: any) => ({
    root: {

    },
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
    key: {
        fontFamily: 'Inter, sans-serif',
        color: '#76808d !important',
        fontSize: '16px !important',
        fontWeight: '700 !important'
    },
    value: {
        fontFamily: 'Inter, sans-serif',
        color: '#76808d !important',
        fontSize: '16px !important',
        fontStyle: 'italic',
        fontWeight: '400 !important',
        marginLeft: "16px !important"
    }
  }));


const TerminologyModal = ({ open, onClose }: any) => {
    const classes = useStyles();
    const { chainId } = useWeb3Auth()
    const navigate = useNavigate();
    const { DAO, updateDAO } = useDAO();
    const { updateDAOLoading } = useAppSelector((store:any) => store.dao)
    const [showEdit, setShowEdit] = useState(false);

	const [workspaceTerminology, setWorkspaceTerminology] = useState('WORKSPACE')
	const [taskTerminology, setTaskTerminology] = useState('TASK')
	const [roles, setRoles] = useState(DEFAULT_ROLES)

    useEffect(() => {
        console.log("updateDaoLoading", updateDAOLoading)
        if(updateDAOLoading === false) {
			setShowEdit(false);
        }
    }, [updateDAOLoading])

    useEffect(() => {
		if (DAO?.terminologies) {
			setWorkspaceTerminology(_get(DAO, 'terminologies.workspace.value'))
			setTaskTerminology(_get(DAO, 'terminologies.task.value'))
			setRoles(_get(DAO, 'terminologies.roles'))
		}
	}, [DAO?.terminologies])

	const handleChange = (e:any) => {
		setRoles((prev:any) => {
			return {
				...prev,
				[e.target.name]: {
					...prev[e.target.name],
					label: e.target.value && e.target.value !== '' ? e.target.value : ''
				}
			}
		})
	}

    const handleSubmit = () => {
		let r: any = {}
		Object.keys(roles).map(key => {
			const role: any = _get(roles, key, '')
			const rv = {
				...role,
				label: role.label && role.label !== '' ? (role.label).trim().replace(/ +(?= )/g, '') : _get(DEFAULT_ROLES, `${key}.label`, ''),
				value: role.label && role.label !== '' ? (role.label).trim().toUpperCase().split(' ').join('_').replace(/ +(?= )/g, '').replace(/[^a-zA-Z0-9_]/g, '') : _get(DEFAULT_ROLES, `${key}.label`, '')
			}
			r[key] = rv
		})
		const terminologies = {
			workspace: _find(WORKSPACE_OPTIONS, wo => wo.value === workspaceTerminology),
			task: _find(TASK_OPTIONS, to => to.value === taskTerminology),
			roles: _pick(r, ["role1", "role2", "role3", "role4"])
		}
		updateDAO({ url: _get(DAO, 'url', ''), payload: { terminologies } });
	}

    return (
        <Box sx={{ pb: 8, pt: 6 }} style={{ position: 'relative' }}>
            <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={onClose}>
                <img src={CloseSVG} />
            </IconButton>
            <Box sx={{ mt: 0 }} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <img src={OD} />
                    <Typography sx={{ mt: 4 }} className={classes.headerTitle}>Terminologies</Typography>
                    <Typography sx={{ mt: 2 }} className={classes.headerDescription}>Make it yours. Customize the terminology <br /> within your organization's dashboard.</Typography>
            </Box>
            { !showEdit ?
            <Box>
                <Box sx={{ mb: 6, mt: 4 }}>
                    <Box sx={{ my: 2 }} display="flex" flexDirection="row" alignItems="center">
                        <Typography className={classes.key}>Workspaces :</Typography>
                        <Typography className={classes.value}>{_find(WORKSPACE_OPTIONS, wo => wo.value === workspaceTerminology)?.labelPlural}</Typography>
                    </Box>
                    <Box sx={{ my: 2 }} display="flex" flexDirection="row" alignItems="center">
                        <Typography className={classes.key}>Tasks :</Typography>
                        <Typography className={classes.value}>{_find(TASK_OPTIONS, wo => wo.value === taskTerminology)?.labelPlural}</Typography>
                    </Box>
                </Box>
                <Box  style={{ margin: '0 auto', width: 210, border: '1px solid #c94b32' }} ></Box>
                <Box sx={{ mt: 6 }} style={{ width: '320px' }}>
                    {
                        Object.keys(roles).map(key => {
                            return (
                                <Box sx={{ my: 2 }} display="flex" flexDirection="row" alignItems="center">
                                    <Typography className={classes.key}>{key} :</Typography>
                                    <Typography className={classes.value}>{ _get(roles, `${key}.label`) }</Typography>
                                </Box>
                            )
                        })
                    }
                </Box>
                <Box sx={{ my: 6 }} display="flex" alignContent="center" justifyContent="center">
                    <Button onClick={() => setShowEdit(true)} style={{ margin: '0 auto' }} size="small" variant="outlined" color="primary">Edit</Button>
                </Box>
            </Box> : 
            <Box>
                <Box sx={{ mt: 8 }}>
                    <Box sx={{ my: 2 }} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                        <Typography  className={classes.key}>Workspaces</Typography>
                        <TextInput select style={{  minWidth: 200 }}  value={workspaceTerminology}
                            onChange={(e:any) => setWorkspaceTerminology(e.target.value)}>
                            {
                                WORKSPACE_OPTIONS?.map((_o:any) => {
                                    return (
                                        <MenuItem key={_o.value} value={_o.value}>{ _o.labelPlural }</MenuItem>
                                    )
                                })
                            }
                        </TextInput>
                    </Box>
                    <Box sx={{ my: 2 }} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                        <Typography  className={classes.key}>Tasks</Typography>
                        <TextInput select style={{  minWidth: 200 }} value={taskTerminology}
                            onChange={(e:any) => setTaskTerminology(e.target.value)}>
                            {
                                TASK_OPTIONS?.map((_o:any) => {
                                    return (
                                        <MenuItem key={_o.value} value={_o.value}>{ _o.labelPlural }</MenuItem>
                                    )
                                })
                            }
                        </TextInput>
                    </Box>
                    <Box sx={{ py: 3 }}>
                        <Box  style={{ margin: '0 auto', width: 210, border: '1px solid #c94b32' }} ></Box>
                    </Box>
                    <Box sx={{ my: 2 }} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                        <Typography  className={classes.key}>Role 1</Typography>
                        <TextInput style={{  minWidth: 200 }} name="role1" value={_get(roles, 'role1.label')} onChange={(e:any) => handleChange(e)} />
                    </Box>
                    <Box sx={{ my: 2 }} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                        <Typography  className={classes.key}>Role 2</Typography>
                        <TextInput style={{  minWidth: 200 }} name="role2" value={_get(roles, 'role2.label')} onChange={(e:any) => handleChange(e)} />
                    </Box>
                    <Box sx={{ my: 2 }} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                        <Typography  className={classes.key}>Role 3</Typography>
                        <TextInput style={{  minWidth: 200 }} name="role3" value={_get(roles, 'role3.label')} onChange={(e:any) => handleChange(e)} />
                    </Box>
                    <Box sx={{ my: 2 }} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                        <Typography  className={classes.key}>Role 4</Typography>
                        <TextInput style={{  minWidth: 200 }} name="role4" value={_get(roles, 'role4.label')} onChange={(e:any) => handleChange(e)} />
                    </Box>
                </Box>
                <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px' , padding: "30px 0 20px" }}>
                    <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                        <Button onClick={() => setShowEdit(false)} sx={{ mr:1 }} fullWidth variant='outlined' size="small">Cancel</Button>
                        <Button onClick={() => handleSubmit()} disabled={updateDAOLoading} loading={updateDAOLoading} sx={{ ml:1 }}  fullWidth variant='contained' size="small">Save</Button>
                    </Box>
                </Box>
            </Box>
            }
        </Box>
    )
}

export default TerminologyModal