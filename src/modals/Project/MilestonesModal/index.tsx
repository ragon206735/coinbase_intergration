import React, { useState, useEffect } from "react";
import { Paper, Typography, Box, Drawer, MenuItem } from "@mui/material";
import { makeStyles } from '@mui/styles';

import IconButton from 'components/IconButton';
import TextInput from 'components/TextInput';
import Button from "components/Button";

import CloseSVG from 'assets/svg/closeNew.svg'
import MilestoneSVG from 'assets/svg/milestone.svg'
import CurrencyInput from "components/CurrencyInput";
import Dropdown from "components/Dropdown";
import TextEditor from "components/TextEditor";

import { find as _find, get as _get, debounce as _debounce } from 'lodash';
import { useDAO } from "context/dao";
import { useSafeTokens } from "context/safeTokens";
import { CHAIN_INFO } from 'constants/chainInfo';
import { useWeb3Auth } from "context/web3Auth";

import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";

import useTerminology from 'hooks/useTerminology';
import { editProjectMilestonesAction } from "store/actions/project";
import { beautifyHexToken } from "utils";
import theme from "theme";
import AmountInput from "components/AmountInput";
import moment from "moment";
import useSafe from "hooks/useSafe";

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
        padding: '27px 27px 80px 27px !important',
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
        marginBottom: '8px !important'
    },
    dropdown: {
        background: 'linear-gradient(180deg, #FBF4F2 0 %, #EEF1F5 100 %) !important',
        borderRadius: '10px',
    },
    divider: {
        width: 210,
        border: '2px solid #C94B32',
        margin: '35px 0 !important'
    },
    mileStonePaper: {
        width: 340,
        padding: '20px 22px !important',
        background: '#FFF !important',
        boxShadow: '0px 3px 3px rgba(27, 43, 65, 0.1), -1px -2px 3px rgba(201, 75, 50, 0.05) !important',
        borderRadius: '5px !important',
        marginBottom: '35px !important'
    },
    paperTitle: {
        fontSize: '16px !important',
        fontWeight: '700 !important',
        lineHeight: '18px !important',
        color: '#B12F15',
        marginBottom: '20px !important'
    }
}));

interface Props {
    hideBackdrop?: boolean;
    open: boolean;
    closeModal(): any;
    list: any[];
    getMilestones(action: any): void;
    getCompensation(action: any): void;
    editMilestones: boolean;
}

export default ({ hideBackdrop, open, closeModal, list, getMilestones, editMilestones, getCompensation }: Props) => {
    const classes = useStyles();
    const { DAO } = useDAO();
    const dispatch = useAppDispatch();
    // @ts-ignore
    const { Project, editProjectMilestonesLoading } = useAppSelector(store => store.project);
    const { safeTokens } = useSafeTokens();
    const { chainId } = useWeb3Auth();
    const { transformWorkspace } = useTerminology(_get(DAO, 'terminologies'))
    const { activeSafes } = useSafe()
    const [milestones, setMilestones] = useState<any[]>(list.length > 0 ? list : [{ name: '', amount: '0', deadline: '', deliverables: '', complete: false }]);
    const [milestoneCount, setMilestoneCount] = useState<number>(list.length > 0 ? list.length : 1);
    const [amount, setAmount] = useState(editMilestones ? _get(Project, 'compensation.amount', '') : 0);
    const [currency, setCurrency] = useState<string>(editMilestones ? _get(Project, 'compensation.currency', '') : '');
    const [safeAddress, setSafeAddress] = useState<string>('');

    const [errorNames, setErrorNames] = useState<number[]>([]);
    const [errorAmount, setErrorAmount] = useState<number[]>([]);
    const [errorDeadline, setErrorDeadline] = useState<number[]>([]);
    const [errorCurrency, setErrorCurrency] = useState<any>(false);
    const [errorProjectValue, setErrorProjectValue] = useState<boolean>(false);

    useEffect(() => {
        if(editMilestones && Project && Project?._id) {
            const safeAddress = Project?.compensation?.safeAddress || _get(DAO, 'safes[0].address', '')
            setSafeAddress(safeAddress)
            setCurrency(Project?.compensation?.currency)
        }
    }, [editMilestones && Project?._id])

    useEffect(() => {
            const safeAddress = _get(DAO, 'safes[0].address', '')
            let options = _get(safeTokens, safeAddress, []).map((tok: any) => { return { label: tok?.token?.symbol, value: tok?.tokenAddress } })
            setSafeAddress(safeAddress)
            setCurrency(options[0]?.value)
    }, [open, DAO.url])

    useEffect(() => {
        if (editProjectMilestonesLoading === false) {
            closeModal();
        }
    }, [editProjectMilestonesLoading]);

    useEffect(() => {
        var date = new Date();
        var tdate: any = date.getDate();
        var month: any = date.getMonth() + 1;
        if (tdate < 10) {
            tdate = "0" + tdate;
        }
        if (month < 10) {
            month = "0" + month
        }
        var year = date.getUTCFullYear();
        var minDate = year + "-" + month + "-" + tdate;

        let element = document.getElementById("datepicker");
        if (element) {
            element.setAttribute("min", minDate);
        }
    }, [])

    const onChangeNumberOfMilestones = (e: number) => {
        let n = e;
        setMilestoneCount(n);
        let array = [...milestones];

        if (array.length === 0) {
            for (var i = 0; i < n; i++) {
                array.push({ name: '', amount: '0', deadline: '', deliverables: '', complete: false });
            }
        }
        else if (n > array.length) {
            let count = n - array.length;
            for (var i = 0; i < count; i++) {
                array.push({ name: '', amount: '0', deadline: '', deliverables: '', complete: false });
            }
        }
        else if (n < array.length) {
            let count = array.length - n;
            for (var i = 0; i < count; i++) {
                array.pop();
            }
        }

        for (var i = 0; i < milestones.length; i++) {
            var el = document.getElementById(`inputBox${i}`);
            if (el) {
                el.style.background = '';
            }
        }

        setMilestones(array);
    };

    const handleChangeName = (e: string, index: number) => {
        if (errorNames.includes(index)) {
            setErrorNames(errorNames.filter((i) => i !== index));
        }
        const newArray = milestones.map((item, i) => {
            if (i === index) {
                return { ...item, name: e };
            } else {
                return item;
            }
        });
        setMilestones(newArray);
    }

    const handleChangeAmount = (e: string, index: number) => {
        var x = document.getElementById(`amount${milestones.length - 1}`);
        if (x) {
            x.innerHTML = '';
        }
        let amt: number = parseInt(e);
        if (errorAmount.includes(index)) {
            setErrorAmount(errorAmount.filter((i) => i !== index));
        }
        if (amt <= 100) {
            const newArray = milestones.map((item, i) => {
                if (i === index) {
                    return { ...item, amount: amt };
                } else {
                    return item;
                }
            });
            setMilestones(newArray);
        }
    }

    const handleChangeDeadline = (e: any, index: number) => {
        if (errorDeadline.includes(index)) {
            setErrorDeadline(errorDeadline.filter((i) => i !== index));
        }
        const newArray = milestones.map((item, i) => {
            if (i === index) {
                return { ...item, deadline: e };
            } else {
                return item;
            }
        });
        setMilestones(newArray);
    }

    const handleChangeDeliverables = (e: any, index: number) => {
        let element = document.getElementById(`deliverables${index}`);
        if (element) {
            element.innerHTML = "";
        }
        const newArray = milestones.map((item, i) => {
            if (i === index) {
                return { ...item, deliverables: e };
            } else {
                return item;
            }
        });
        setMilestones(newArray);
    }

    const handleChangeCompensationAmount = (e: any) => {
        setAmount(e);
        setErrorCurrency(null);
    }

    const handleChangeCurrency = (e: any) => {
        setCurrency(e);
        setErrorCurrency(null);
    }

    const handleSubmit = () => {
        console.log(currency, amount)
        let flag = 0;
        let total = 0;
        if (currency === '') {
            setErrorCurrency(`Enter valid ${transformWorkspace().label} value`);
            let e = document.getElementById('currency-amt');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
                return;
            }
        }
        if (!amount || amount === 0) {
            setErrorCurrency(`Enter valid ${transformWorkspace().label} value`);
            let symbol = _find(safeTokens[safeAddress], tkn => tkn.tokenAddress.toLowerCase() === currency.toLowerCase());
            symbol = _get(symbol, 'token.symbol', null);
            if (!symbol)
                symbol = currency === process.env.REACT_APP_NATIVE_TOKEN_ADDRESS ? CHAIN_INFO[chainId]?.nativeCurrency?.symbol : 'SWEAT'
            let e = document.getElementById('currency-amt');
            if (e) {
                e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
            }
            return;
        }
        for (let i = 0; i < milestones.length; i++) {
            let ob = milestones[i];
            total += parseFloat(ob.amount);
            if (ob.name === '') {
                flag = -1;
                if (!errorNames.includes(i)) {
                    setErrorNames([...errorNames, i])
                }
                let e = document.getElementById(`paper${i}`);
                if (e) {
                    e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
                }
                return;
            }
            else if (ob.amount === '' || ob.amount === 0) {
                flag = -1;
                if (!errorAmount.includes(i)) {
                    setErrorAmount([...errorAmount, i])
                }
                let e = document.getElementById(`paper${i}`);
                if (e) {
                    e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
                }
                return;
            }
            else if (ob.deadline === '') {
                flag = -1;
                if (!errorDeadline.includes(i)) {
                    setErrorDeadline([...errorDeadline, i])
                }
                let e = document.getElementById(`paper${i}`);
                if (e) {
                    e.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
                }
                return;
            }
        }
        if (total !== 100) {
            var x = document.getElementById(`amount${milestones.length - 1}`);
            if (x) {
                x.innerHTML = 'Total Project Value should be 100 %';
            }
            // for (var i = 0; i < milestones.length; i++) {
            //     if (!milestones[i].complete) {
            //         var el = document.getElementById(`inputBox${i}`);
            //         if (el) {
            //             el.style.background = 'rgba(217, 83, 79, 0.75)';
            //         }
            //     }
            // }
            return;
        }
        if (flag !== -1) {

            let safeToken = _find(safeTokens[safeAddress], tkn => tkn.tokenAddress === currency);
            let symbol = _get(safeToken, 'token.symbol', 'SWEAT');

            if (editMilestones) {
                dispatch(editProjectMilestonesAction({ projectId: _get(Project, '_id', ''), daoUrl: _get(DAO, 'url', ''), payload: { milestones, compensation: { currency, amount, symbol, safeAddress } } }));
            }
            else {
                getCompensation({ currency: currency, amount, symbol, tokenAddress: safeToken?.tokenAddress,  safeAddress })
                getMilestones(milestones);
                closeModal();
            }
        }
    }

    return (
        <Drawer
            PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
            sx={{ zIndex: theme.zIndex.appBar + 1 }}
            anchor={'right'}
            open={open}
            hideBackdrop={hideBackdrop}
        >
            <Box className={classes.modalConatiner}>
                <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={closeModal}>
                    <img src={CloseSVG} />
                </IconButton>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <img src={MilestoneSVG} alt="project-resource" />
                    <Typography className={classes.modalTitle}>{transformWorkspace().label} Milestones</Typography>
                    <Typography className={classes.modalSubtitle}>Organise and link payments to milestones</Typography>
                </Box>
                <Box display="flex" flexDirection="column" alignItems={"center"} sx={{ width: '80%' }}>

                    <Box display="flex" flexDirection="column" sx={{ width: 310, marginBottom: '25px' }}>
                        <Box
                            component="form"
                            noValidate
                            autoComplete="off"
                        >
                            <TextInput
                                id="outlined-select-currency"
                                select
                                disabled={DAO?.safes.length < 2}
                                fullWidth
                                label="Treasury"
                                value={safeAddress}
                                onChange={(e: any) => { 
                                    setSafeAddress(e.target.value) 
                                    handleChangeCurrency(_get(_get(safeTokens, e.target.value, []), '[0].tokenAddress'))
                                }}
                            >
                                {
                                    DAO?.safes?.map((safe: any) => {
                                        return (
                                            <MenuItem disabled={!safe?.enabled} key={safe?.address} value={safe?.address}>{(safe?.name || "Multi-sig wallet") + " (" + beautifyHexToken(safe?.address) + ")"}</MenuItem>
                                        )
                                    })
                                }
                            </TextInput>
                        </Box>
                    </Box>

                    <Box display="flex" flexDirection="column" sx={{ width: 310, marginBottom: '25px' }} id="currency-amt">
                        <Typography className={classes.label}>Total {transformWorkspace().label} Value</Typography>
                        <CurrencyInput
                            value={amount}
                            onChange={(value: any) => handleChangeCompensationAmount(value)}
                            options={_get(safeTokens, safeAddress, []).map((tok: any) => { return { label: tok?.token?.symbol, value: tok?.tokenAddress } })}
                            dropDownvalue={currency}
                            onDropDownChange={(value: any) => {
                                handleChangeCurrency(value)
                            }}
                            variant="primary"
                            error={errorCurrency}
                        />
                    </Box>

                    <Box display="flex" flexDirection="column" sx={{ width: 310 }}>
                        <Typography className={classes.label}>Milestones</Typography>
                        <Dropdown
                            options={[1, 2, 3, 4, 5]}
                            defaultValue={milestoneCount}
                            onChange={(value) => onChangeNumberOfMilestones(value)}
                        />
                    </Box>

                    {milestones.length > 0 && <Box className={classes.divider}></Box>}

                    {
                        milestones && milestones.map((item, index) => {
                            return (
                                <Paper className={classes.mileStonePaper} sx={{ display: 'flex', flexDirection: 'column' }} key={index} id={`paper${index}`}>
                                    <Typography className={classes.paperTitle}>Milestone {index + 1}</Typography>

                                    {/* Milestone Name */}
                                    <Box>
                                        <TextInput
                                            label="Name"
                                            placeholder="Milestone Name"
                                            fullWidth
                                            value={item.name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeName(e.target.value, index)}
                                            disabled={item.complete}
                                            error={errorNames.includes(index)}
                                            id={errorNames.includes(index) ? "outlined-error-helper-text" : ""}
                                            helperText={errorNames.includes(index) ? "Please enter name" : ""}
                                        />
                                    </Box>

                                    {/* Milestone amount % */}
                                    <Box display={"flex"} flexDirection={"column"} sx={{ mt: 2, marginBottom: '20px' }}>
                                        <Box display={"flex"} alignItems={'center'}>
                                            <AmountInput height={50} onChange={(e: any) => handleChangeAmount(e, index)} value={item.amount} />
                                            <Typography sx={{ fontWeight: '700', fontSize: 16, color: '#76808D', marginLeft: '13.5px' }}>% of {transformWorkspace().label} value</Typography>
                                        </Box>
                                        <Typography id={`amount${index}`} style={{ fontSize: '13px', color: '#C84A32', fontStyle: 'normal' }}></Typography>
                                    </Box>


                                    {/* Milestone deadline */}
                                    <Box sx={{ marginBottom: '20px' }}>
                                        {
                                            errorDeadline.includes(index)
                                                ?
                                                <TextInput
                                                    sx={{ width: 172 }}
                                                    label="Due date"
                                                    date
                                                    value={ moment(item.deadline, 'YYYY-MM-DD') || undefined}
                                                    onChange={(e: any) => handleChangeDeadline(moment(e).format('YYYY-MM-DD'), index)}
                                                    disabled={item.complete}
                                                    error
                                                    minDate={moment()}
                                                    id="outlined-error-helper-text"
                                                    helperText="Please enter deadline"
                                                />
                                                :
                                                <TextInput
                                                    sx={{ width: 172 }}
                                                    label="Due date"
                                                    date
                                                    minDate={moment()}
                                                    value={ moment(item.deadline, 'YYYY-MM-DD') || undefined}
                                                    onChange={(e: any) => handleChangeDeadline(moment(e).format('YYYY-MM-DD'), index)}
                                                    disabled={item.complete}
                                                />
                                        }
                                    </Box>

                                    <Box>
                                        <TextEditor
                                            fullWidth
                                            height={90}
                                            width={296}
                                            placeholder=""
                                            label="Deliverables"
                                            value={item.deliverables}
                                            onChange={(value: string) => handleChangeDeliverables(value, index)}
                                            disabled={item.complete}
                                        />
                                    </Box>
                                </Paper>
                            )
                        })
                    }


                    <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px' , padding: "30px 0 20px" }}>
                            <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                                <Button sx={{ mr:1 }} onClick={() => closeModal()} fullWidth variant='outlined' size="small">Cancel</Button>
                                <Button sx={{ ml:1 }} onClick={() => handleSubmit()} disabled={editProjectMilestonesLoading} loading={editProjectMilestonesLoading} fullWidth variant='contained' size="small">{ editMilestones? 'SAVE' : 'ADD' }</Button>
                            </Box>
                    </Box>

                    {/* <Box display={"flex"} alignItems={"center"} justifyContent={"center"} style={{ width: '100%' }}>
                        <Button variant="outlined" sx={{ marginRight: '20px', width: '169px' }} onClick={closeModal}>CANCEL</Button>
                        <Button variant="contained" onClick={handleSubmit} sx={{ width: '184px' }} loading={editProjectMilestonesLoading}>
                            {
                                editMilestones
                                    ?
                                    'SAVE'
                                    :
                                    'ADD'
                            }
                        </Button>
                    </Box> */}

                </Box>
            </Box>
        </Drawer>
    )
}