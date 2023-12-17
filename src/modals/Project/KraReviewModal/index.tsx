import React, { useState, useEffect, useMemo } from "react";
import { get as _get, find as _find, uniqBy as _uniqBy, sortBy as _sortBy } from 'lodash';
import { Typography, Box, Drawer, Paper } from "@mui/material";
import { makeStyles } from '@mui/styles';

import IconButton from 'components/IconButton';
import Button from "components/Button";

import CloseSVG from 'assets/svg/closeNew.svg'
import KRASVG from 'assets/svg/kra.svg'
import RangeSlider from "components/RangeSlider";
import moment from 'moment';

import { useDAO } from "context/dao";
import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";
import { updateProjectKraAction } from "store/actions/project";
import theme from "theme";

const useStyles = makeStyles((theme: any) => ({
    root: {
        // height: '100vh',
        // overflowY: 'scroll',
        // display: 'flex',
        // flexDirection: 'column',
        // alignItems: 'center',
        // justifyContent: 'center',
    },
    modalConatiner: {
        width: 575,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '27px 27px 90px 27px !important',
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
    paperContainer: {
        margin: '4px 0',
        borderRadius: 5,
        padding: '26px 22px',
        boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1) !important'
    },
    progressText: {
        fontSize: '16px !important',
        fontWeight: '700 !important'
    }
}));

interface Props {
    open: boolean;
    closeModal(): any;
}

export default ({ open, closeModal }: Props) => {
    const classes = useStyles();
    const dispatch = useAppDispatch();
    // @ts-ignore
    const { Project, updateProjectKraLoading } = useAppSelector(store => store.project);
    const { DAO } = useDAO();

    const [list, setList] = useState(_get(Project, 'kra.results', []));
    const [currentSlot, setCurrentSlot] = useState(null);

    const getSlots = useMemo(() => {
        let slots = []
        let freq = Project.kra.frequency === 'daily' ? 'day' : Project.kra.frequency === 'weekly' ? 'week' : Project.kra.frequency === 'monthly' ? 'month' : 'month';

        let start = moment(Project.createdAt).startOf('day').unix();
        // @ts-ignore
        let end = freq === 'day' ? moment.unix(start).endOf('day').unix() : moment.unix(start).endOf('day').add(1, freq).unix()

        do {
            slots.push({ start, end });
            start = moment.unix(end).add(1, 'day').startOf('day').unix();
            // @ts-ignore
            if(freq === 'day')
                end = moment.unix(start).endOf('day').unix();
            else
                // @ts-ignore
                end = moment.unix(start).add(1, freq).endOf('day').unix();
        } while (start < moment().unix())

        slots = slots.map(slot => {
            const tracker = _find(Project.kra.tracker, t => t.start === slot.start && t.end === slot.end)
            return {
                ...slot,
                results: _get(tracker, 'results', Project.kra.results.map((result: any) => {
                    return {
                        ...result, progress: 0, color: "#FFCC18"
                    }
                }))
            }
        });

        return slots;

    }, [Project.frequency, Project.kra]);

    // runs after updating a project
    useEffect(() => {
        if (updateProjectKraLoading === false) {
            closeModal();
            // navigate(-1);
        }
    }, [updateProjectKraLoading]);

    useEffect(() => {
        if (getSlots && getSlots.length > 0) {
            const cslot = _find(getSlots, s => s.start < moment().unix() && s.end > moment().unix());
            console.log("cslot : ", cslot)
            // @ts-ignore
            setCurrentSlot(cslot);
        }
    }, [getSlots]);

    const handleSlider = (item: any, value: number, color: string) => {
        setCurrentSlot((prev: any) => {
            return {
                ...prev,
                results: prev.results.map((r: any) => {
                    if (r._id === item._id)
                        return { ...r, progress: value, color };
                    return r;
                })
            }
        })
    }

    const handleSubmit = () => {
        const kra = { ...Project.kra };
        kra.tracker = getSlots.map(slot => {
            //console.log(moment.unix(slot.start).format(), "--->", moment.unix(slot.end).format())
            // @ts-ignore
            if (slot.start === currentSlot.start && slot.end === currentSlot.end)
                return currentSlot
            return slot
        })
        console.log(kra.tracker)
        dispatch(updateProjectKraAction({ projectId: _get(Project, '_id', ''), daoUrl: _get(DAO, 'url', ''), payload: { kra } }))
    }

    console.log("current slots : ", currentSlot)

    return (
        <Drawer
            PaperProps={{ style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 } }}
            sx={{ zIndex: theme.zIndex.appBar + 1  }}
            anchor={'right'}
            open={open}
        >
            <Box className={classes.modalConatiner}>
                <IconButton sx={{ position: 'fixed', right: 32, top: 32 }} onClick={closeModal}>
                    <img src={CloseSVG} />
                </IconButton>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <img src={KRASVG} alt="project-resource" />
                    <Typography className={classes.modalTitle}>Key Results</Typography>
                    <Typography className={classes.modalSubtitle}>It's time to evaluate your scores</Typography>
                </Box>
                <Box display="flex" flexDirection="column" justifyContent={"space-between"} alignItems={"center"} sx={{ width: '100%', height: '100%' }}>
                    <Box display="flex" flexDirection="column" alignItems={"center"} sx={{ width: '80%' }}>
                        {/* @ts-ignore */}
                        {currentSlot && Project?.kra.frequency !== 'daily' && <Typography className={classes.modalSubtitle}>Review Period: {`${moment.unix(currentSlot.start).format('DD MMM, YYYY')} - ${moment.unix(currentSlot.end).format('DD MMM, YYYY')}`}</Typography>}
                        {/* @ts-ignore */}
                        {currentSlot && Project?.kra.frequency === 'daily' && <Typography className={classes.modalSubtitle}>Review Period: {`${moment.unix(currentSlot.start).format('DD MMM, YYYY hh:mm A')} - ${moment.unix(currentSlot.end).format('DD MMM, YYYY hh:mm A')}`}</Typography>}

                        {
                            // @ts-ignore
                            currentSlot && currentSlot.results.map((item: any, index: number) => {
                                return (
                                    <Paper className={classes.paperContainer} sx={{ width: '100%' }}>
                                        <Box><Typography>{item.name}</Typography></Box>
                                        <Box sx={{ width: '100%', marginTop: '10px' }} display="flex" alignItems={"center"} justifyContent={"space-between"}>
                                            <Box sx={{ width: '250px' }}>
                                                <RangeSlider
                                                    defaultValue={+item.progress}
                                                    showThumb={true}
                                                    disabled={false}
                                                    onChange={(value: any) => handleSlider(item, value.value, value.color)}
                                                />
                                            </Box>
                                            <Typography className={classes.progressText} sx={{ color: _get(item, 'color', '#FFCC18') }}>{`${item.progress}% done!`}</Typography>
                                        </Box>
                                    </Paper>
                                )
                            })
                        }

                    </Box>
                    {/* <Box display={"flex"} alignItems={"center"} justifyContent={"center"} style={{ width: '100%' }}>
                        <Button fullWidth size="small" variant="outlined" sx={{ marginRight: '20px' }} onClick={closeModal}>LATER</Button>
                        <Button fullWidth size="small" variant="contained" loading={updateProjectKraLoading} onClick={handleSubmit}>SUBMIT</Button>
                    </Box> */}
                </Box>
                <Box style={{ background: 'linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)', width: 430, position: 'fixed', bottom: 0, borderRadius: '0px 0px 0px 20px' , padding: "30px 0 20px" }}>
                        <Box display="flex" mt={4} width={380} style={{ margin: '0 auto' }} flexDirection="row">
                            <Button disabled={updateProjectKraLoading} onClick={closeModal} sx={{ mr:1 }} fullWidth variant='outlined' size="small">LATER</Button>
                            <Button loading={updateProjectKraLoading} disabled={updateProjectKraLoading} onClick={handleSubmit} sx={{ ml:1 }}  fullWidth variant='contained' size="small">SUBMIT</Button>
                        </Box>
                </Box>
            </Box>
        </Drawer>
    )
}