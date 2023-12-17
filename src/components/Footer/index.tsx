import React, { useMemo } from "react"
import { Grid, Stack, Typography, Container, Box } from "@mui/material"
import { makeStyles } from '@mui/styles';

import POLYGON_GREY from 'assets/svg/polygonGray.svg'
import POLYGON_WHITE from 'assets/svg/polygonWhite.svg'
import GNOSIS_GREY from 'assets/svg/safeGray.svg'
import GNOSIS_WHITE from 'assets/svg/safeWhite.svg'
import IPFS_GREY from 'assets/svg/ipfsGray.svg'
import IPFS_WHITE from 'assets/svg/ipfsWhite.svg'
import LOMADS_GREY from 'assets/svg/lomadsGray.svg'
import LOMADS_WHITE from 'assets/svg/lomadsWhite.svg'
import SUGGESTION_GREY from 'assets/svg/Calque_1.svg'
import SUGGESTION_WHITE from 'assets/svg/Calque_1 (1).svg'

const useStyles = makeStyles((theme: any) => ({
    root: {
        display: 'flex',
        height: '80px !important',
        width: '100%',
        backgroundColor: `transparent`,
    },
    poweredBy: {
        fontFamily: 'Inter, sans-serif',
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '18px',
        textAlign: 'center',
        letterSpacing: '-0.011em',
    },
    madeWith: {
        fontFamily: 'Inter, sans-serif',
        fontStyle: 'normal',
        fontWeight: 500,
        fontSize: '12px',
        lineHeight: '33px',
        letterSpacing: '-0.011em'
    },
    logo: {
        margin: '0 16px'
    }
}));

export default ({ theme = "light", ...props }: any) => {

    const classes = useStyles()

    const icons = useMemo(() => {
        if (theme === 'light')
            return { polygon: POLYGON_GREY, safe: GNOSIS_GREY, ipfs: IPFS_GREY, lomads: LOMADS_GREY, suggestion: SUGGESTION_GREY }
        return { polygon: POLYGON_WHITE, safe: GNOSIS_WHITE, ipfs: IPFS_WHITE, lomads: LOMADS_WHITE, suggestion: SUGGESTION_WHITE }
    }, [theme])

    const renderFooter = () => {
        return (
            <Box component="footer" className={classes.root} style={{ ...(props?.style || {}) }}>
                <Grid container alignItems="center" justifyContent={"space-between"}>
                    <Grid item sm={5}>
                        <Box display="flex" flexDirection="row" alignItems="center">
                            <Typography sx={{ color: theme == 'light' ? '#76808D' : '#FFF' }} className={classes.poweredBy}>Powered by</Typography>
                            <img className={classes.logo} src={icons.safe} />
{/*                             <img className={classes.logo} src={icons.polygon} />
                            
                            <img className={classes.logo} src={icons.ipfs} /> */}
                        </Box>
                    </Grid>
                    <Grid item sm={3}>
                        <Box display="flex" flexDirection="row" alignItems="center" justifyContent={"center"}>
                            <img src={icons.suggestion} />
                            <Typography sx={{ color: theme == 'light' ? '#76808D' : '#FFF' }} className={classes.poweredBy}>Noticed a <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => window.open('https://tally.so/r/wLZyyz', '_blank')}>bug</span>? Any <span onClick={() => window.open('https://tally.so/r/n9XgRp', '_blank')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>suggestion</span>? </Typography>
                        </Box>
                    </Grid>
                    <Grid item sm={3}>
                        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="flex-end">
                            <Box display="flex" flexDirection="row" alignItems="center">
                                <Typography sx={{ color: theme == 'light' ? '#76808D' : '#FFF' }} className={classes.madeWith}>Made with ❤️ by</Typography>
                                <img className={classes.logo} src={icons.lomads} />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        )
    }
    if (props?.container) {
        return <Box style={{ width: '100%', ...props?.style }}>
            <Container maxWidth={props?.container}>
                {renderFooter()}
            </Container>
        </Box>
    }
    return renderFooter()
}