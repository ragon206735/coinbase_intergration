import React, { useMemo } from "react"
import { Grid, Box, Typography, Paper, Chip, FormControl, FormLabel, MenuItem, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import clsx from "clsx"
import { get as _get, find as _find } from 'lodash'
import SBT_SVG from 'assets/svg/sbt.svg'
import EDIT_SVG from 'assets/svg/edit.svg'
import { makeStyles } from '@mui/styles';
import TextInput from 'components/TextInput';
import Select from 'components/Select';
import Switch from "components/Switch";
import Button from "components/Button";
import Dropzone from "components/Dropzone";
import { useEffect, useState } from "react";
import IconButton from "components/IconButton";
import useContractDeployer, { SBTParams } from "hooks/useContractDeployer"
import { SUPPORTED_CHAIN_IDS, SupportedChainId } from "constants/chains"
import axiosHttp from 'api'
import CurrencyInput from "components/CurrencyInput"
import XlsxUpload from "components/XlsxUpload"
import toast from 'react-hot-toast';
import { ethers } from "ethers"
import { beautifyHexToken } from "utils"
import { CHAIN_INFO } from "constants/chainInfo"
import { SBT_DEPLOYER_ADDRESSES } from "constants/addresses"
import { useWeb3Auth } from "context/web3Auth"
import { Add } from "@mui/icons-material"
import { useDAO } from "context/dao"
import { USDC } from "constants/tokens"
import SwitchChain from "components/SwitchChain"
import useStripeRedirect from "hooks/useStripeRedirect"
import useDeployer from "hooks/useDeployer"

///   0xD123b939B5022608241b08c41ece044059bE00f5

const useStyles = makeStyles((theme: any) => ({
    root: {
        paddingBottom: 60
    },
    title: {
        fontFamily: 'Inter, sans-serif',
        fontStyle: 'normal',
        fontWeight: '400',
        fontSize: '30px !important',
        lineHeight: '33px !important',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        color: '#FFF'
    },
    paper: {
        width: 400,
        marginTop: 20,
        background: '#FFFFFF',
        padding: '26px 22px 30px !important',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '5px'
    },
    paperDetails: {
        width: 479,
        height: 108,
        marginTop: 20,
        background: '#FFFFFF',
        padding: '26px 22px 30px !important',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    paperDetailsSocial: {
        width: 393,
        background: '#FFFFFF',
        padding: '26px 22px 30px !important',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1) !important',
        borderRadius: '5px'
    },
    description: {
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: "14px",
        maxWidth: 200,
        lineHeight: "18px",
        letterSpacing: "-0.011em",
        color: "rgba(118, 128, 141, 0.5) !important"
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
    tokenName: {
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '22px !important',
        lineHeight: '25px !important',
        marginLeft: '16px !important',
        color: '#76808D !important'
    },
    tokenSupply: {
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '16px !important',
        lineHeight: '25px !important',
        marginLeft: '16px !important',
        color: '#76808D !important'
    },
    verLine: {
        border: '1px solid rgba(118, 128, 141, 0.5)',
        height: '35px',
        width: '1px',
        margin: '0 16px'
    },
    horLine: {
        border: "2px solid #EA6447 !important",
        width: 200,
        margin: '32px 0'
    },
    socialText: {
        fontStyle: 'italic',
        fontWeight: 400,
        marginTop: '8px !important',
        fontSize: '14px !important',
        lineHeight: '16px !important',
        color: 'rgba(118, 128, 141, 0.5) !important',
    },
    createBtn: {
        height: '40px !important',
        width: '250px !important',
        background: '#C94B32 !important',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff !important',
        fontSize: '14px !important',
        marginTop: '24px !important'
    },
    otherBtn: {
        height: '40px !important',
        width: '100% !important',
        background: '#FFFFFF',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px !important',
        filter: 'drop-shadow(3px 5px 4px rgba(27, 43, 65, 0.05))',
        // boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05)',
        border: "none",
        cursor: 'pointer',
        color: '#C94B32',
        textTransform: 'uppercase'
    },
    addBtn: {
        height: '50px',
        width: '50px !important',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px !important',
        filter: 'drop-shadow(3px 5px 4px rgba(27, 43, 65, 0.05))',
        border: "none",
        cursor: 'pointer',
        textTransform: 'uppercase'
    },
}));


export default () => {
    const classes = useStyles()
    const { DAO, updateDAO } = useDAO()
    const { chainId, account, provider } = useWeb3Auth()
    const { onOpen, addedStripeAccount } = useStripeRedirect()

    const [deployContractLoading, setDeployContractLoading] = useState(false)

    const [editMode, setEditMode] = useState(true)

    const [stripeAccounts, setStripeAccounts] = useState<any>(null)

    const [errors, setErrors] = useState<any>({})

    const [networkError, setNetworkError] = useState<any>(null)

    const [tokens, setTokens] = useState<any>([])

    const [addOthers, setAddOthers] = useState<boolean>(false)

    const [otherText, setOtherText] = useState<string>('')

    const [tempContact, setTempContact] = useState<string[]>([])

    const [members, setMembers] = useState<string[]>([])

    const [membersImportLoading, setMembersImportLoading] = useState<boolean>(false)

    const [stateX, setStateX] = useState<any>({
        selectedChainId: null,
        logo: null,
        symbol: null,
        redirectUrl: null,
        supply: null,
        whitelisted: false,
        whitelist: {
            members: [],
            discounts: [],
            inviteCodes: []
        },
        contact: [],
        priced: false,
        treasury: "0x0000000000000000000000000000000000000000",
        price: {
            token: "0x0000000000000000000000000000000000000000",
            value: 0
        }
    })

    const [state, setState] = useState<any>({})
    const [error, setError] = useState<any>({})

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

    const handleSave = () => {
        updateDAO({ url: DAO?.url, payload: { ...state } })
    }
    const handleAddLink = (address:any) => {
        console.log(stateX)
        setError({})
        let err = {}
        if(!stateX?.symbol || stateX?.symbol === "")
            err = { ...err, linkName: "Enter valid name" }
        if(Object.keys(err).length > 0)
            return setError(err)
        setState((prev: any) => {
            return {
                ...prev, 
                links: [...prev.links, { title: `Mint ${stateX?.symbol}`, link:`${process.env.REACT_APP_URL}/${DAO?.url}/mint/${address}`,tag:'SBT' }]
            }
        })
    }
    useEffect(() => {
        handleSave()
      }, [state])



    useEffect(() => {
        if (!stateX?.priced) {
            setStateX((prev: any)=> { return { ...prev, price : { ...prev.price, value: 0 } } })
            setStateX((prev: any)=> { return { ...prev, price : { ...prev.price, token: "0x0000000000000000000000000000000000000000" } } }) 
          
        }
      }, [stateX?.priced]);

    useEffect(() => {
        if(DAO)
            setStateX((prev: any) => { return { ...prev, price: { ...prev.price, token: _get(USDC, `[${+(_get(DAO, 'activeSafes[0].chainId', _get(DAO, 'chainId', chainId)))}].address`) }, selectedChainId: +(_get(DAO, 'activeSafes[0].chainId', _get(DAO, 'chainId', chainId))) } })
    }, [DAO])

    useEffect(() => {
        
    }, [stateX.selectedChainId])

    useEffect(() => {
        if(stateX?.stripeAccount) {
            setStateX((prev: any) => {
                return {
                    ...prev,
                    contact: prev?.contact.indexOf('email') > -1 ? prev.contact : [...prev?.contact, 'email']
                }
            })
        }
    }, [stateX?.stripeAccount])

    useEffect(() => {
        if(addedStripeAccount) {
            setStripeAccounts((prev:any) => {
                if(prev && _find(prev, (p:any) => p._id === addedStripeAccount?._id)) {
                    return prev?.map((acc:any) => {
                        if(acc._id === addedStripeAccount?._id)
                            return addedStripeAccount
                        return acc
                    })
                } else {
                    if(prev && prev.length > 0)
                        return [...prev, addedStripeAccount]
                    return [addedStripeAccount]
                }
            })
            setStateX((prev: any) => { return { ...prev, stripeAccount: addedStripeAccount?._id } })
        }
    }, [addedStripeAccount])

    useEffect(() => {
        if(stateX?.selectedChainId) {
            setTokens([
                // {
                //     label: CHAIN_INFO[stateX?.selectedChainId]?.nativeCurrency?.symbol,
                //     value: process.env.REACT_APP_NATIVE_TOKEN_ADDRESS,
                //     decimals: CHAIN_INFO[stateX?.selectedChainId]?.nativeCurrency?.decimals
                // },
                {
                    label: _get(USDC, `[${stateX?.selectedChainId}].symbol`),
                    value: _get(USDC, `[${stateX?.selectedChainId}].address`),
                    decimals: _get(USDC, `[${stateX?.selectedChainId}].decimals`),
                }
            ])
            setStateX((prev: any) => {
                return {
                    ...prev,
                    price: {
                        ...prev.price,
                        token: _get(USDC, `[${stateX?.selectedChainId}].address`)
                    }
                }
            })
        }
    }, [stateX?.selectedChainId])

    //const { deploy,  deployLoading } = useContractDeployer(SBT_DEPLOYER_ADDRESSES[stateX?.selectedChainId])
    const { deploy, deployLoading } = useDeployer();


    const handleContactChange = (key: string) => {
        setStateX((prev: any) => {
            return {
                ...prev,
                contact: prev?.contact.indexOf(key) > -1 ? prev.contact.filter((c: string) => c !== key) : [...prev?.contact, key]
            }
        })
    }

    const isValidUrl = (urlString: string)=> {
        const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/gm;
        var urlPattern = new RegExp(regex)
        return !!urlPattern.test(urlString);
    }

    const handleSetPreview = () => {
        let err: any = {}
        setErrors(err)
        if(!stateX?.selectedChainId || stateX?.selectedChainId === '')
            err['chain'] = "Select valid chain"
        if (!stateX?.symbol || stateX?.symbol === '')
            err['symbol'] = "Enter valid symbol"
        if (!stateX?.logo || stateX?.logo === '')
            err['logo'] = "Please upload image"
        
        if(stateX.priced) {
            if(stateX?.treasury !== 'other') {
                if (!stateX?.treasury || stateX?.treasury === '')
                    err['treasury'] = "Enter valid treasury"
            } else {
                if (!stateX?.treasuryOther || stateX?.treasuryOther === '')
                    err['treasuryOther'] = "Enter valid treasury"
            }
        }

        if (Object.keys(err).length > 0)
            return setErrors(err)
        console.log(stateX)
        setEditMode(false)
    }

    useEffect(() => {
        const load = async () => {
            const { data } = await axiosHttp.get(`payment/stripe-accounts`)
            setStripeAccounts(data)
        }
        load();
    }, [])

    const deployContract = async () => {
        if(chainId !== stateX?.selectedChainId) {
            toast.custom(t => <SwitchChain t={t} nextChainId={stateX?.selectedChainId}/>)
        } else {
            try {
                setDeployContractLoading(true)
                setNetworkError("Please wait while we deploy pass token, it can take several minutes")
                const params: SBTParams = {
                    chainId: stateX?.selectedChainId,
                    name: `${stateX?.symbol} SBT`,
                    symbol: stateX?.symbol,
                    mintPrice: `${stateX?.price?.value}`,
                    mintToken: stateX?.price?.token,
                    treasury: stateX?.treasury && stateX?.treasury === 'other' ? stateX?.treasuryOther : stateX?.treasury,
                    whitelisted: stateX?.whitelisted ? 1 : 0,
                }
    
                const contractAddr = await deploy(params)
    
                if(contractAddr) {
                    const contractJSON = {
                        chainId: stateX?.selectedChainId,
                        name: `${stateX?.symbol} SBT`,
                        token: stateX.symbol,
                        image: stateX?.logo,
                        address: contractAddr,
                        admin: account,
                        version: 3,
                        stripeAccount: stateX.stripeAccount,
                        master: _get(SBT_DEPLOYER_ADDRESSES, chainId, null),
                        treasury: stateX?.treasury && stateX?.treasury === 'other' ? stateX?.treasuryOther : stateX?.treasury,
                        mintPrice: `${stateX?.price?.value}`,
                        mintPriceToken: `${stateX?.price?.token}`,
                        whitelisted: stateX?.whitelisted,
                        contactDetail: stateX?.contact,
                        metadata: [],
                        membersList: stateX?.whitelisted ? _get(DAO, 'members', []).map((m:any) => { return { name: m.member.name, address: m.member.wallet }}) : [],
                        daoId: _get(DAO, '_id', null)
                    }
                    setNetworkError(null)
                    axiosHttp.post('contract', contractJSON)
                    .then(res => {
                        handleAddLink(contractAddr)
                        setTimeout(() => { window.location.href = `/${_get(DAO, 'url', '')}` }, 500)
                    })
                    .finally(() =>  { 
                        setDeployContractLoading(false) 
                    })
                }
            }
            catch(e) {
                setNetworkError(e)
                setTimeout(() => setNetworkError(null), 3000)
                setDeployContractLoading(false)
            }
        }
    }

    const isAddressValid = (holderAddress: string) => {
		const ENSdomain = holderAddress.slice(-4);
		if (ENSdomain === ".eth") {
			return true;
		} else {
			const isValid: boolean = ethers.utils.isAddress(holderAddress);
			return isValid;
		}
	};

	const handleInsertWallets = async (data: Array<{ name: string, address: string }>) => {
        setMembersImportLoading(true)
		try {
			let validMembers = [];
			let mem: any = {}
			if (data.length > 0) {
				const noHeader = _find(Object.keys(data[0]), key => isAddressValid(key))
				if (noHeader) {
					Object.keys(data[0]).map((key: any) => {
						if (isAddressValid(key))
							mem.address = key
						else
							mem.name = key
					})
				}
				let newData = data;
				if (Object.keys(mem).length > 0)
					newData = [...newData, mem]
				for (let index = 0; index < newData.length; index++) {
					let preParseMember: any = newData[index];
					let member: any = {}
					Object.keys(preParseMember).map((key: any) => {
						if (isAddressValid(preParseMember[key]))
							member.address = preParseMember[key]
						else
							member.name = preParseMember[key]
					})
                    validMembers.push({ ...member, role: 'role2' });
					// if (member.address && isAddressValid(member.address)) {
					// 	if (member.address.slice(-4) === ".eth") {
					// 		const EnsAddress = await getENSAddress(member.address);
					// 		if (EnsAddress) {
					// 			member.name = member.name ? member.name : member.address;
					// 			member.address = EnsAddress as string;
					// 		}
					// 	} else {
					// 		let ENSname = null;
					// 		ENSname = await getENSName(member.address)
					// 		if (ENSname)
					// 			member.name = member.name ? member.name : ENSname
					// 	}
					// 	validMembers.push({ ...member, role: 'role2' });
					// }
				}
			}
            console.log("validMembers", validMembers)
            setMembersImportLoading(false)
            setMembers(validMembers)
		} catch (e) {
            setMembersImportLoading(false)
		}
	}

    const handleSetTempArray = () => {
        if (!tempContact.includes(otherText.toLowerCase())) {
            setTempContact(arr => [...arr, otherText]);
            setStateX((prev: any) => {
                return {
                    ...prev,
                    contact: prev?.contact.indexOf(otherText) > -1 ? prev.contact.filter((c: string) => c !== otherText) : [...prev?.contact, otherText]
                }
            })
        }
    }

    const handleLinkStripeAccount = (accountId?: any) => {
        axiosHttp.get(`payment/onboard${accountId ? '?accountId=' + accountId : ''}`)
        .then(res => {
            let accs = null
            if(stripeAccounts && _find(stripeAccounts, (p:any) => p._id === res?.data?.stripeAcc?._id)) {
                accs = stripeAccounts?.map((acc:any) => {
                    if(acc._id === res?.data?.stripeAcc?._id)
                        return res?.data?.stripeAcc
                    return acc
                })
            } else {
                if(stripeAccounts && stripeAccounts.length > 0)
                    accs = [...stripeAccounts, res?.data?.stripeAcc]
                else {
                    accs = [res?.data?.stripeAcc]
                }
            }
            setStripeAccounts(accs)
            onOpen(res?.data?.url)
        })
    }

    const availableSafes = useMemo(() => {
        if(DAO?.safes) {
            return DAO?.safes?.filter((safe:any) => safe?.chainId === stateX?.selectedChainId)
        }
        return []
    }, [DAO?.safes, stateX?.selectedChainId])

    useEffect(() => {
        if(stateX.priced){
            if(availableSafes && availableSafes.length > 0)
                setStateX((prev: any) => { return { ...prev, treasury: availableSafes[0].address } })
            else 
                setStateX((prev: any) => { return { ...prev, treasury: 'other'} })
        }
    }, [availableSafes, stateX.priced])

    return (
        <Grid container className={classes.root}>
            <Grid item sm={12} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Box mt={2} display="flex" alignItems="center" justifyContent="center">
                    <img src={SBT_SVG} />
                </Box>
                <Typography sx={{ mt: 2 }} className={classes.title}>Create new Pass Token</Typography>
                {
                    editMode
                        ?
                        <Paper className={classes.paper}>
                            <Box mb={4}>
                                <FormLabel style={{ marginBottom: 8 }}>Chain</FormLabel>
                                <Box mt={2}>
                                    <Select
                                        selected={stateX?.selectedChainId}
                                        options={ SUPPORTED_CHAIN_IDS.map((item : any) => ({ label: CHAIN_INFO[item].label, value: item }))}
                                        setSelectedValue={(value) => {
                                            setStateX((prev: any) => { return {
                                                ...prev, 
                                                selectedChainId: +value
                                            }})
                                        }}
                                    />
                                </Box>
                            </Box>
                            <TextInput value={stateX?.symbol}
                                error={errors['symbol']}
                                helperText={errors['symbol']}
                                inputProps={{ maxLength: 50 }}
                                onChange={(e: any) => {
                                    setErrors({})
                                    setStateX((prev: any) => { return { ...prev, symbol: e.target.value } })
                                }}
                                sx={{ my: 1 }} placeholder="LMDS" fullWidth label="Symbol of the Pass Token"
                            />

                            <Box mt={4}>
                                <FormControl fullWidth>
                                    <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                                        <FormLabel sx={{ color: errors['logo'] ? '#e53935' : null }}>Pass Token Icon</FormLabel>
                                        {/* <Chip sx={{ mr: 1 }} className={classes.chip} size="small" label="Optional" /> */}
                                    </Box>
                                    <Typography variant="subtitle2" className={classes.description}>Suggested dimensions and format : 800x800, .svg or .png</Typography>
                                </FormControl>
                                <Box>
                                    <Dropzone
                                        value={stateX?.logo}
                                        onUpload={(url: string) => {
                                            setStateX((prev: any) => { return { ...prev, logo: url } })
                                        }}
                                    />
                                    {
                                        errors['logo'] &&
                                        <Typography mt={-2} sx={{ color: '#e53935', fontSize: '11px', marginLeft: '14px' }}>{errors['logo']}</Typography>
                                    }
                                </Box>
                            </Box>

                            {/* <TextInput value={stateX?.supply} type="number"
                        error={errors['supply']}
                        helperText={errors['supply']}
                        onChange={(e: any) => {
                            setErrors({})
                            setStateX((prev: any) => { return { ...prev, supply: e.target.value } } ) 
                        }}
                        placeholder="Number of existing tokens" sx={{ my: 1 }} fullWidth label="Supply" labelChip={<Chip sx={{ m:1 }} className={classes.chip} label="Optional" size="small" />} /> */}


                            <Box my={3} display="flex" flexDirection="row" justifyContent="space-between" mx={1}>
                                <Switch onChange={(e: any) => {
                                    setStateX((prev: any) => {
                                        return {
                                            ...prev,
                                            whitelisted: !prev.whitelisted,
                                            whitelist: { members: [], discounts: [], inviteCodes: [] }
                                        }
                                    })
                                }} checked={stateX?.whitelisted} label={`Whitelisted ${members.length > 0 ? "(" + members.length + " members)" : ''}`} />
                                { false && stateX?.whitelisted && <XlsxUpload onComplete={handleInsertWallets} />}
                            </Box>
                            {/* {
                                members.length > 0 &&
                                <Box>
                                    <TableContainer component={Box}>
                                        <Table aria-label="simple table">
                                            <TableBody>
                                                {
                                                    members.map((m: any, _i: number) => {
                                                        return (
                                                            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                                <TableCell width={40}>{m?.name}</TableCell>
                                                                <TableCell width={100}>{beautifyHexToken(m?.address)}</TableCell>
                                                            </TableRow>
                                                        )
                                                    })
                                                }
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            } */}
                            <Box my={3} mx={1}>
                                <Switch onChange={(e: any) => {
                                    setStateX((prev: any) => {
                                        return {
                                            ...prev,
                                            priced: !prev.priced,
                                            treasury: prev.priced ? "0x0000000000000000000000000000000000000000" : ''
                                        }
                                    })
                                }} checked={stateX?.priced} label="Priced" />
                            </Box>
                            {
                                stateX['priced'] ?
                                    <Box my={3}>
                                        <CurrencyInput
                                            value={_get(stateX, 'price.value')}
                                            onChange={(value: any) => {
                                                setStateX((prev: any) => { return { ...prev, price: { ...prev.price, value: value } } })
                                            }}
                                            options={tokens}
                                            dropDownvalue={_get(stateX, 'price.token')}
                                            onDropDownChange={(value: string) => {
                                                setStateX((prev: any) => { return { ...prev, price: { ...prev.price, token: value } } })
                                            }}
                                        />
                                    </Box> : null
                            }
                            {stateX['priced'] &&
                            <Box>
                                { availableSafes && availableSafes.length > 0 ? <TextInput fullWidth label="Multi-sig Wallet" select style={{  minWidth: 200 }} value={stateX?.treasury}
                                    onChange={(e:any) => setStateX((prev: any) => { return { ...prev, treasury: e.target.value } })}>
                                    {
                                        availableSafes?.map((_o:any) => {
                                            return (
                                                <MenuItem key={_o.address} value={_o.address}>{ `${_o?.name || 'Multi-sig wallet'}(${beautifyHexToken(_o?.address)})` }</MenuItem>
                                            )
                                        })
                                    }
                                    <MenuItem key='other' value='other'>Other</MenuItem>
                                </TextInput> : null }
                                { stateX?.treasury && stateX?.treasury === 'other' && <TextInput value={stateX?.treasuryOther}
                                    error={errors['treasuryOther']}
                                    helperText={errors['treasuryOther']}
                                    label={availableSafes.length == 0 ? 'Multi-sig Wallet' : undefined}
                                    onChange={(e: any) => {
                                        setErrors({})
                                        setStateX((prev: any) => { return { ...prev, treasuryOther: e.target.value } })
                                    }}
                                    placeholder="Multi-sig Wallet address" sx={{ my: 1 }} fullWidth /> }
                            </Box>
                            }
                            {/* {
                              stateX['priced'] &&
                              <Box sx={{ my: 2 }}>
                                    <FormLabel>Stripe account</FormLabel>
                                    <Button style={{ marginTop: 16 }} fullWidth size="small" variant="outlined" color="primary" onClick={() => handleLinkStripeAccount()}>Link new stripe account</Button> 
                                    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                                    { stripeAccounts.map((value: any) => {
                                        const labelId = `checkbox-list-label-${value._id}`;

                                        return (
                                        <ListItem
                                            key={value}
                                            secondaryAction={
                                                !(value?.account.details_submitted && _get(value?.account, 'capabilities.card_payments', 'inactive') === 'active' && _get(value?.account, 'capabilities.transfers', 'inactive') === 'active') ?
                                                <Typography onClick={() => handleLinkStripeAccount(value?.account?.id)} style={{ cursor: 'pointer' }} color="primary">RESUME</Typography> : null
                                            }
                                            disablePadding
                                        >
                                            <ListItemButton onClick={() => setStateX((prev: any) => { return { ...prev, stripeAccount: value._id } })} disabled={!(value?.account.details_submitted && _get(value?.account, 'capabilities.card_payments', 'inactive') === 'active' && _get(value?.account, 'capabilities.transfers', 'inactive') === 'active')} role={undefined}  dense>
                                            <ListItemIcon>
                                                <Checkbox
                                                edge="start"
                                                checked={stateX?.stripeAccount === value._id}
                                                tabIndex={-1}
                                                disableRipple
                                                inputProps={{ 'aria-labelledby': labelId }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText secondaryTypographyProps={{ style: { color: 'red', fontSize: 12, fontWeight: 400 } }} primaryTypographyProps={{ style: { fontSize: 14, fontWeight: 500 } }} id={labelId} secondary={!(value?.account.details_submitted && _get(value?.account, 'capabilities.card_payments', 'inactive') === 'active' && _get(value?.account, 'capabilities.transfers', 'inactive') === 'active') ? 'Onboarding pending' : ''} primary={value?.account?.business_profile?.name || value?.account?.business_profile?.url || value?.account?.id } />
                                            </ListItemButton>
                                        </ListItem>
                                        );
                                    })}
                                    </List>
                              </Box>
                            } */}
                            <Button sx={{ mt: 2 }} onClick={() => handleSetPreview()} fullWidth size="small" variant='contained'>Next</Button>
                        </Paper>
                        :
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Paper className={classes.paperDetails}>
                                <Box display="flex" flexDirection="row" alignItems="center">
                                    {stateX?.logo ?
                                        <img style={{ width: 40, borderRadius: 10, height: 40, objectFit: 'cover' }} src={stateX?.logo} /> :
                                        stateX?.symbol && stateX?.symbol !== "" ?
                                            <Box style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 10,
                                                textTransform: 'uppercase',
                                                width: 40, height: 40,
                                                border: '1px solid #76808D',
                                                transform: 'matrix(0.71, -0.71, 0.71, 0.71, 0, 0)'
                                            }}>
                                                <div style={{ fontSize: 20, fontWeight: 700, transform: 'rotate(45deg)' }}>{stateX?.symbol[0]}</div>
                                            </Box> : null
                                    }
                                    <Typography className={classes.tokenName}>{stateX?.symbol}</Typography>
                                </Box>
                                <Box display="flex" flexDirection="row" alignItems="center">
                                    {stateX?.supply && <Typography className={classes.tokenSupply}>{`X ${stateX?.supply}`}</Typography>}
                                    <div className={classes.verLine}></div>
                                    <IconButton onClick={() => setEditMode(true)}>
                                        <img src={EDIT_SVG} />
                                    </IconButton>
                                </Box>
                            </Paper>
                            <Box className={classes.horLine}></Box>
                            <Paper className={classes.paperDetailsSocial}>
                                <Box>
                                    <Typography variant="h6">Contact details</Typography>
                                    <Typography variant="body2" className={clsx(classes.socialText, { fontStyle: 'normal !important' })}>Get certain member details could be useful for the smooth functioning of your organisation</Typography>
                                    <Box my={3} mx={1}>
                                        <Switch
                                            disabled={stateX?.stripeAccount}
                                            checked={stateX?.contact.indexOf('email') > -1}
                                            onChange={() => handleContactChange('email')}
                                            label="Email" />
                                        <Typography variant="body2" className={classes.socialText}>Please select if you intend to use services such as Notion, Google Workspace and Github</Typography>
                                    </Box>
                                    <Box my={3} mx={1}>
                                        <Switch
                                            onChange={() => handleContactChange('discord')}
                                            checked={stateX?.contact.indexOf('discord') > -1}
                                            label="Discord user-id" />
                                        <Typography variant="body2" className={classes.socialText}>Please select if you intend to use access-controlled channels in Discord.</Typography>
                                    </Box>
                                    <Box my={3} mx={1}>
                                        <Switch
                                            onChange={() => handleContactChange('telegram')}
                                            checked={stateX?.contact.indexOf('telegram') > -1}
                                            label="Telegram user-id" />
                                        <Typography variant="body2" className={classes.socialText}>Please select if you intend to use access-controlled Telegram groups.</Typography>
                                    </Box>
                                    <Box my={3} mx={1}>
                                        <Switch
                                            onChange={() => handleContactChange('github')}
                                            checked={stateX?.contact.indexOf('github') > -1}
                                            label="Github user-id" />
                                        <Typography variant="body2" className={classes.socialText}>Please select if you intend to use access-controlled github.</Typography>
                                    </Box>
                                    {
                                        tempContact.length > 0 &&
                                        tempContact.map((item, index) => (
                                            <Box my={3} mx={1} key={index}>
                                                <Switch
                                                    onChange={() => handleContactChange(item)}
                                                    checked={stateX?.contact.indexOf(item) > -1}
                                                    label={`${item}`}
                                                />
                                                <Typography variant="body2" className={classes.socialText}>{`Please select if you intend to use access-controlled ${item}`}</Typography>
                                            </Box>
                                        ))
                                    }
                                    <Box>
                                        {
                                            addOthers
                                                ?
                                                <Box sx={{ width: '100%' }} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                                                    <TextInput
                                                        value={otherText}
                                                        onChange={(e: any) => {
                                                            setOtherText(e.target.value);
                                                        }}
                                                        sx={{ width: '290px' }}
                                                        placeholder="Other tools"
                                                    />
                                                    <button
                                                        className={classes.addBtn}
                                                        style={otherText !== '' ? { backgroundColor: '#C84A32' } : { backgroundColor: "rgba(27, 43, 65, 0.2)" }}
                                                        onClick={handleSetTempArray}
                                                    >
                                                        <Add style={{ color: "#FFF" }}/>
                                                    </button>
                                                </Box>
                                                :
                                                <Box>
                                                    <button className={classes.otherBtn} onClick={() => setAddOthers(true)}>
                                                        <Add/>
                                                        <Typography sx={{ marginLeft: '5px' }}>others</Typography>
                                                    </button>
                                                </Box>
                                        }
                                    </Box>
                                </Box>
                            </Paper>
                            {/* <Paper className={classes.paperDetailsSocial} sx={{ marginTop: '32px' }}>
                                <Box>
                                    <FormControl fullWidth>
                                        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                                            <FormLabel>Redirect URL</FormLabel>
                                            <Chip sx={{ mr: 1 }} className={classes.chip} size="small" label="Optional" />
                                        </Box>
                                    </FormControl>
                                    <TextInput
                                        error={errors['redirectUrl']}
                                        helperText={errors['redirectUrl']}
                                        value={stateX?.redirectUrl}
                                        onChange={(e: any) => {
                                            setErrors({})
                                            setStateX((prev: any) => { return { ...prev, redirectUrl: e.target.value } })
                                        }}
                                        sx={{ my: 1 }}
                                        placeholder="url"
                                        fullWidth
                                        label=""
                                    />
                                </Box>
                            </Paper> */}
                            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                                <Button
                                    onClick={() => deployContract()}
                                    disabled={deployContractLoading}
                                    loading={deployContractLoading}
                                    className={classes.createBtn}
                                >
                                    Create pass token
                                </Button>
                                {networkError && <Typography my={2} style={{ color: '#FFF', opacity: 0.7}} textAlign="center" color="error" variant="body2">{networkError}</Typography>}
                            </Box>
                        </Box>
                }
            </Grid>
        </Grid>
    )
}