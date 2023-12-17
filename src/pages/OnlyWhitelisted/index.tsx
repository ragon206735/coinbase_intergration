import React from "react";
import { get as _get } from 'lodash'
import { makeStyles } from '@mui/styles';
import frame2 from 'assets/svg/Frame-2.svg'
import { Box, Typography } from "@mui/material";
import palette from "theme/palette";
import { useDAO } from "context/dao";

const useStyles = makeStyles((theme: any) => ({
    root: {
        height: '70vh',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center'
    }
}));


const OnlyWhitelisted = () => {
    const classes = useStyles()
    const { DAO } = useDAO()
    return (
        <Box className={classes.root}>
            <img src={frame2} />
            <Typography style={{ color: palette.primary.main, fontSize: 30, fontWeight: 400, maxWidth: 600, textAlign: 'center', margin: "28px 0" }} variant="h2">{ DAO ? DAO?.name : "This organisation" } allows membership only for whitelisted individuals.</Typography>
            {/* <Typography style={{ fontFamily: 'Inter, sans-serif', maxWidth: 600, textAlign: 'center', margin: "8px 0" }} variant="subtitle2">Please contact the admin through email or other social channels.</Typography> */}
        </Box>
    )
}

export default OnlyWhitelisted;