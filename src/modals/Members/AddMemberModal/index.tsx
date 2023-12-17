import React, { useEffect, useState, useMemo } from "react";
import _ from "lodash";
import { Typography, Box, Modal } from "@mui/material";
import { makeStyles } from '@mui/styles';
import TextInput from 'components/TextInput';
import MuiSelect from "components/Select";
import Button from "components/Button";
import Uploader from 'components/XlsxUploader';
import { LeapFrog } from "@uiball/loaders";

import { useNavigate } from 'react-router-dom';
import { ethers } from "ethers";
import { SupportedChainId } from "constants/chains";
import { useDAO } from "context/dao";
import { useWeb3Auth } from "context/web3Auth";
import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";

import { DEFAULT_ROLES } from "constants/terminology";
import useTerminology from 'hooks/useTerminology';
import useEns from 'hooks/useENS';

import createProjectSvg from 'assets/svg/createProject.svg';
import Avatar from "boring-avatars";

import binRed from 'assets/svg/bin-red.svg';
import binWhite from 'assets/svg/bin-white.svg';
import { addMultiMemberAction, addSingleMemberAction } from "store/actions/dao";

const useStyles = makeStyles((theme: any) => ({
    modalTitle: {
        fontSize: '30px !important',
        lineHeight: '33px !important',
        textAlign: 'center',
        color: '#C94B32',
        margin: '20px 0 !important',
    },
    modalSubtitle: {
        color: '#76808d !important',
        fontSize: '14px !important',
        fontWeight: '400 !important',
        lineHeight: '16px !important',
        textAlign: 'center',
    },
    deleteBtn: {
        width: '50px',
        height: '50px',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'center !important',
        borderRadius: ' 3px !important',
        zIndex: '999 !important',
        border: 'none !important',
        cursor: 'pointer !important',
    },
    rowOvercast: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.5) !important',
        position: 'absolute',
        zIndex: '998 !important'
    }
}));

interface Props {
    open: boolean;
    closeModal(): any;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'fit-content',
    bgcolor: 'background.paper',
    padding: '22px',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
};

export default ({ open, closeModal }: Props) => {
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { DAO } = useDAO();
    const { provider, chainId } = useWeb3Auth();
    const { transformRole } = useTerminology(_.get(DAO, 'terminologies'))
    // @ts-ignore
    const { addSingleMemberLoading, addMultiMemberLoading } = useAppSelector(store => store.dao);

    const [ownerName, setOwnerName] = useState<string>("");
    const [errorName, setErrorName] = useState('');
    const [ownerAddress, setOwnerAddress] = useState<string>("");
    const [errorAddress, setErrorAddress] = useState('');
    const [ownerRole, setOwnerRole] = useState<string>("role4");
    const [errorRole, setErrorRole] = useState('');
    const [uploadLoading, setUploadLoading] = useState<boolean>(false);
    const [deleteMembers, setDeleteMembers] = useState<string[]>([]);
    const [validMembers, setValidMembers] = useState<{ address: string; name: string, role: string }[]>([]);
    const [showModal, setShowModal] = useState(false);
    const { getENSAddress, getENSName } = useEns();

    useEffect(() => {
        isAddressValid(ownerAddress);
    }, [ownerAddress]);

    useEffect(() => {
        isPresent(ownerAddress);
    }, [ownerAddress]);

    useEffect(() => {
        if (addSingleMemberLoading === false) {
            setOwnerName("");
            setOwnerAddress("");
            closeModal();
        }
    }, [addSingleMemberLoading])

    useEffect(() => {
        if (addMultiMemberLoading === false) {
            setShowModal(false);
            closeModal();
        }
    }, [addMultiMemberLoading])

    const eligibleRoles = useMemo(() => {
        return Object.keys(_.get(DAO, 'terminologies.roles', DEFAULT_ROLES)).filter((i: any) => i !== 'role1').map((item: any) => { return { label: _.get(transformRole(item), 'label'), value: item } });
    }, [DAO]);

    const isAddressValid = (holderAddress: string) => {
        const ENSdomain = holderAddress.slice(-4);
        if (ENSdomain === ".eth") {
            return true;
        } else {
            const isValid: boolean = ethers.utils.isAddress(holderAddress);
            return isValid;
        }
    };

    const isRightAddress = (holderAddress: string) => {
        const isValid: boolean = ethers.utils.isAddress(holderAddress);
        return isValid;
    };

    const isPresent = (_address: string) => {
        const check = _.get(DAO, 'members', []).some((mem: any) => mem.member.wallet.toLowerCase() === _address.toLowerCase());
        return check;
    };

    const handleInsertWallets = async (data: Array<{ name: string, address: string }>) => {
        try {
            setUploadLoading(true)
            let validMembers = [];
            let mem: any = {}
            if (data.length > 0) {
                const noHeader = _.find(Object.keys(data[0]), key => isAddressValid(key))
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
                    if (member.address && isAddressValid(member.address) && !isPresent(member.address)) {
                        if (member.address.slice(-4) === ".eth") {
                            const resolver = await provider?.getResolver(member.address);
                            const EnsAddress = await resolver?.getAddress();
                            if (EnsAddress) {
                                member.name = member.name ? member.name : member.address;
                                member.address = EnsAddress as string;
                            }
                        } else {
                            let ENSname = null;
                            if (chainId !== SupportedChainId.POLYGON)
                                ENSname = await provider?.lookupAddress(member.address);
                            if (ENSname)
                                member.name = member.name ? member.name : ENSname
                        }
                        if (!_.find(validMembers, m => m.address.toLowerCase() === member.address.toLowerCase())
                        ) {
                            validMembers.push({ ...member, role: 'role4' });
                        }
                    }
                }

                setValidMembers(validMembers);
                setUploadLoading(false)
                setShowModal(true);
            }
        } catch (e) {
            setUploadLoading(false)
        }
    };

    const addMember = async (_ownerName: string, _ownerAddress: string, _ownerRole: string) => {
        const member = { name: _ownerName, address: _ownerAddress, role: _ownerRole };
        if (_ownerAddress.slice(-4) === ".eth") {
            const EnsAddress = await getENSAddress(_ownerAddress);
            if (EnsAddress !== undefined) {
                member.address = EnsAddress as string;
                member.name = _ownerName !== '' ? _ownerName : _ownerAddress;
                const present = isPresent(member.address);
                present && setErrorAddress(" * address already exists.");
            }
            else {
                setErrorAddress(" * address is not correct.");
                member.address = _ownerAddress;
            }
        }
        else {
            let ENSname = null;
            ENSname = await getENSName(_ownerAddress)
            if (ENSname) {
                member.name = _ownerName !== '' ? _ownerName : ENSname;
            }
            else {
                member.name = _ownerName;
            }
        }
        if (!isPresent(member.address) && isRightAddress(member.address)) {
            dispatch(addSingleMemberAction({ url: DAO?.url, payload: member }));
            // if (props.addToList) {
            //     props.addToList([member.address]);
            // }
        }
    };

    const handleClick = (_ownerName: string, _ownerAddress: string, _ownerRole: string) => {
        if (!isAddressValid(ownerAddress)) {
            setErrorAddress(" * address is not correct.");
            return;
        }
        else if (isPresent(ownerAddress)) {
            setErrorAddress(" * address already exists.");
            return;
        }
        else {
            addMember(_ownerName, _ownerAddress, _ownerRole);
        }
    };

    const handleChangeState = (e: any, index: any) => {
        const newArray = validMembers.map((item, i) => {
            if (index === i) {
                return { ...item, [e.target.name]: e.target.value };
            }
            else {
                return item;
            }
        });
        setValidMembers(newArray);
    }

    const handleChangeRole = (value: any, index: any) => {
        const newArray = validMembers.map((item, i) => {
            if (index === i) {
                return { ...item, role: value };
            }
            else {
                return item;
            }
        });
        setValidMembers(newArray);
    }

    const handleDeleteUser = (address: any) => {
        if (deleteMembers.includes(address)) {
            setDeleteMembers(deleteMembers.filter((m: any) => m !== address));
        }
        else {
            setDeleteMembers([...deleteMembers, address]);
        }
    }

    const handleCloseModal = () => {
        setValidMembers([]);
        setDeleteMembers([]);
        setShowModal(false);
    }

    const handleAddMembers = () => {
        try {
            let tempArray = [];
            let newArray = [];
            for (var i = 0; i < validMembers.length; i++) {
                if (deleteMembers.includes(validMembers[i].address) === false) {
                    tempArray.push(validMembers[i]);
                    newArray.push(validMembers[i].address);
                }
            }
            dispatch(addMultiMemberAction({ url: DAO?.url, payload: { list: tempArray } }));
            // if (props.addToList) {
            //     props.addToList(newArray);
            // }
        }
        catch (e) {
            console.log(e)
            setShowModal(false);
            closeModal();
        }
    }

    return (
        <Modal
            open={open}
            onClose={closeModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            {
                showModal
                    ?
                    <Box sx={style} style={{ padding: '22px 60px', maxHeight: '768px' }} display={"flex"} flexDirection={"column"} alignItems={"center"}>
                        <Box sx={{ width: '100%', marginBottom: '20px' }} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                            <img src={createProjectSvg} alt="create-project-svg" />
                            <Typography sx={{ color: '#c94b32', marginTop: '20px', fontSize: '30px' }}>Add Members</Typography>
                        </Box>

                        <Box sx={{ width: '100%', overflowY: 'scroll' }} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                            {
                                validMembers.length > 0
                                    ?
                                    <>
                                        {
                                            validMembers.map((item, index) => (
                                                <Box sx={{ width: '100%', marginBottom: '20px', position: 'relative' }} key={index} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                                                    {
                                                        deleteMembers.includes(item.address)
                                                            ?
                                                            <Box className={classes.rowOvercast}></Box>
                                                            :
                                                            null
                                                    }
                                                    <Box display={"flex"} alignItems={"center"}>
                                                        <Avatar
                                                            key={`${item.name}-${item.address}`}
                                                            size={50}
                                                            name={item.address}
                                                            variant="marble"
                                                            colors={["#E67C40", "#EDCD27", "#8ECC3E", "#2AB87C", "#188C8C"]}
                                                        />
                                                        <Box sx={{ width: '150px', marginLeft: '10px' }}>
                                                            <TextInput
                                                                placeholder="Name"
                                                                fullWidth
                                                                value={item.name}
                                                                name="name"
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeState(e, index)}
                                                            />
                                                        </Box>
                                                    </Box>
                                                    <Typography sx={{ color: '#76808D', margin: '0 50px', fontStyle: 'italic' }}>{item.address.slice(0, 6) + "..." + item.address.slice(-4)}</Typography>
                                                    <Box sx={{ width: '150px', marginRight: '50px' }}>
                                                        <MuiSelect
                                                            selected={item.role}
                                                            options={eligibleRoles}
                                                            setSelectedValue={(value) => handleChangeRole(value, index)}
                                                        />
                                                    </Box>
                                                    {
                                                        deleteMembers.includes(item.address)
                                                            ?
                                                            <button style={{ background: '#B12F15' }} className={classes.deleteBtn} onClick={() => handleDeleteUser(item.address)}>
                                                                <img src={binWhite} alt="bin-white" />
                                                            </button>
                                                            :
                                                            <button style={{ background: 'linear-gradient(180deg, #FBF4F2 0%, #EEF1F5 100%)' }} className={classes.deleteBtn} onClick={() => handleDeleteUser(item.address)}>
                                                                <img src={binRed} alt="bin-red" />
                                                            </button>
                                                    }
                                                </Box>
                                            ))
                                        }
                                    </>
                                    :
                                    <Typography>All the users have been already added</Typography>
                            }
                        </Box>

                        <Box display={"flex"} alignItems={"center"} justifyContent={"center"} style={{ width: '100%', marginTop: '20px' }}>
                            <Button variant="outlined" sx={{ marginRight: '20px' }} onClick={handleCloseModal}>CANCEL</Button>
                            {
                                validMembers.length > 0 &&
                                <Button variant="contained" onClick={handleAddMembers} loading={addMultiMemberLoading}>ADD MEMBERS</Button>
                            }
                        </Box>

                    </Box>
                    :
                    <Box sx={style} display={"flex"} flexDirection={"column"} alignItems={"center"}>
                        <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} style={{ width: '100%', marginBottom: '20px' }}>
                            <Typography sx={{ color: '#76808D', fontWeight: '700', fontSize: '16px' }}>Add member</Typography>
                            {uploadLoading ? <LeapFrog size={24} color="#C94B32" /> : <Uploader onComplete={handleInsertWallets} />}
                        </Box>
                        <Box display={"flex"} alignItems={"center"}>
                            <Box sx={{ width: '150px', marginRight: '10px' }}>
                                <TextInput
                                    placeholder="Name"
                                    fullWidth
                                    value={ownerName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOwnerName(e.target.value); setErrorName('') }}
                                    error={errorName !== ''}
                                    id={errorName !== '' ? "outlined-error-helper-text" : ""}
                                    helperText={errorName}
                                />
                            </Box>
                            <Box sx={{ width: '250px', marginRight: '10px' }}>
                                <TextInput
                                    placeholder="ENS Domain and Wallet Address"
                                    fullWidth
                                    value={ownerAddress}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOwnerAddress(e.target.value); setErrorAddress('') }}
                                    error={errorAddress !== ''}
                                    id={errorAddress !== '' ? "outlined-error-helper-text" : ""}
                                    helperText={errorAddress}
                                />
                            </Box>
                            <Box sx={{ width: '150px', transform: 'translateY(0px)' }}>
                                <MuiSelect
                                    selected={ownerRole}
                                    options={eligibleRoles}
                                    setSelectedValue={(value) => { setOwnerRole(value); setErrorRole('') }}
                                />
                            </Box>
                        </Box>
                        <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} style={{ width: '100%', marginTop: '20px' }}>
                            <Button variant="outlined" sx={{ marginRight: '20px' }} onClick={closeModal}>CANCEL</Button>
                            <Button
                                variant="contained"
                                loading={addSingleMemberLoading}
                                onClick={() => {
                                    handleClick(ownerName, ownerAddress, ownerRole);
                                }}>ADD</Button>
                        </Box>
                    </Box>
            }
        </Modal>
    )
}