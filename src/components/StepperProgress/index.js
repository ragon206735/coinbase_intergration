import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";
import { Box } from "@mui/material";
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    indexedStep: {
        color: '#FFF',
        width: 11,
        height: 11,
        fontSize: 12,
        backgroundColor: 'rgba(211, 211, 211, 1)',
        borderRadius: '50% !important',
        "&.accomplished": {
            backgroundColor: '#188C7C'
        }
    }
}));


export default ({ variant, milestones }) => {
    const classes = useStyles();

    return (
        <ProgressBar
            percent={(parseFloat((milestones.filter((item) => item.complete === true).length) / (milestones.length)) * 100).toFixed(2)}
            filledBackground={"#188C7C"}
            unfilledBackground="#F0F0F0"
            height="5px"
        >
            <Step transition="scale">
                {({ accomplished, index }) => (
                    <Box
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"center"}
                    >
                    </Box>
                )}
            </Step>
            {
                milestones.map((item, index) => {
                    return (
                        <Step transition="scale" key={index}>
                            {({ accomplished, index }) => (
                                <Box display={"flex"} alignItems={"center"} justifyContent={"center"} className={accomplished ? `${classes.indexedStep} accomplished` : `${classes.indexedStep}`}></Box>
                            )}
                        </Step>
                    )
                })
            }
        </ProgressBar>
    )
}