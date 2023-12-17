import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Typography from '@mui/material/Typography';
import CloseBtn from 'assets/svg/close-btn.svg';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Popper, { PopperPlacementType } from '@mui/material/Popper';
import { makeStyles } from '@mui/styles';

type tooltipObj = {
    step: number;
    id: string;
    title: string;
    content: string;
    imgPath: string;
    buttonText: string;
    placement: PopperPlacementType;
}

const useStyles = makeStyles((theme: any) => ({
    closeBtn: {
        cursor: "pointer",
        position: "absolute",
        right: "2%",
        top: "3%",
        background: "linear-gradient(180deg, #FBF4F2 0%, #EEF1F5 100%)",
        borderRadius: "10px"
    },
    walkthroughContainerRight: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        alignSelf: "center",
        width: "464px",
        padding: "30px",
    },
    walkthroughContainerLeft: {
        background: "#F0F0F0",
        borderRadius: "10px 0px 0px 10px",
        width: "186px",
        height: "247px",
        alignSelf: "center",
        padding: "20px"
    },
    walkthroughContainer: {
        position: "relative",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#FFFFFF",
        width: "650px",
        height: "247px",
        padding: "0",
        borderRadius: "10px",
        marginLeft: "20px",
        top: '5%',
        right: '3%'
    },
    textContent: {
        fontFamily: "'Inter', sans-serif",
        fontStyle: "normal",
        fontWeight: 400,
        alignSelf: "center",
        textAlign: "center",
        color: "#76808D",
        paddingBottom: "25px"
    },
    popperTitle: {
        fontFamily: "'Inter', sans-serif",
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: "22px !important",
        lineHeight: "25px",
        display: "flex",
        alignSelf: "center",
        textAlign: "center",
        letterSpacing: "-0.011em",
        color: "#76808D"
    }
}));

export default function WalkThroughPopover({
    displayPopover,
    obj,
    incrementWalkThroughSteps,
    endWalkThrough,
    anchorEl
}: {
    displayPopover: boolean,
    obj: tooltipObj,
    incrementWalkThroughSteps: any,
    endWalkThrough: any,
    anchorEl: any
}) {
    const classes = useStyles();
    const [arrowRef, setArrowRef] = useState<any>(null)

    return (
        <Popper open={displayPopover} anchorEl={anchorEl}
            sx={{
                zIndex: 2000,
                paddingBottom: 1
            }}
            placement={obj?.placement}
            modifiers={[
                {
                    name: 'arrow',
                    enabled: false,
                    options: {
                        element: arrowRef,
                    },
                },
            ]}
        >
            {
                true &&
                <span className="arrow" ref={setArrowRef} />
            }
            <Box>
                <Box
                    className={classes.walkthroughContainer}>
                    <Box className={classes.walkthroughContainerLeft}>
                        <img src={obj?.imgPath} />
                    </Box>
                    <Box className={classes.walkthroughContainerRight}>
                        <Typography component="h2" variant="h4" className={classes.popperTitle}>
                            {obj?.title}
                        </Typography>
                        <p className={classes.textContent} dangerouslySetInnerHTML={{ __html: obj?.content }} />
                        <Button
                            variant="contained"
                            onClick={incrementWalkThroughSteps}
                            size="small">
                            {obj?.buttonText}
                        </Button>
                    </Box>
                    <Box className={classes.closeBtn} onClick={endWalkThrough}>
                        <img src={CloseBtn} />
                    </Box>
                </Box>
            </Box>
        </Popper>
    );
}