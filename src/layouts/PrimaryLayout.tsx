import React, { useMemo } from 'react';
import { get as _get } from 'lodash'
import clsx from 'clsx';
import CssBaseline from '@mui/material/CssBaseline';
import { Grid, Box, Typography, IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Container } from '@mui/system';
import SettingsXL from 'assets/svg/settingsXL.svg'
import Footer from 'components/Footer';
import { useDAO } from 'context/dao';
import palette from 'theme/palette';
import Skeleton from '@mui/material/Skeleton';
import { Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';


const useStyles = makeStyles((theme: any) => ({
  root: {
    background: 'linear-gradient(178.31deg, #C94B32 0.74%, #A54536 63.87%)',
    position: 'relative'
  },
  content: {
    minHeight: 'calc(100vh - 80px)'
  },
  settingIcon: {
    position: 'absolute',
    top: "30%"
  },
  header: {
    position: 'relative',
    height: 100,
    padding: '33px',
    marginTop: 24,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  plain: {
    cursor: 'pointer',
    px: [1],
    borderBottomRightRadius: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoContainer: {
    width: 75,
    height: 75,
    background: `linear-gradient(180deg, #FBF4F2 0%, #EEF1F5 100%)`,
    boxShadow: `inset 1px 0px 4px rgba(27, 43, 65, 0.1)`,
    borderRadius: 10,
    transform: `rotate(45deg)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow : 'hidden'
  },
  title: {
    fontWeight: '600 !important',
    fontSize: '35px !important',
    lineHeight: 25,
    textAlign: 'center',
    letterSpacing: '-0.011em !important',
    color: `${palette.primary.main} !important`,
    transform: `rotate(-45deg)`,
    textTransform: 'uppercase'
  },
  image: {
    transform: 'rotate(-45deg)',
    width: '141%',
    maxWidth: '141% !important',
    height: '141%;',
    flexShrink: 0
  },
  daoName: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: '700 !important',
    fontSize: '24px !important',
    lineHeight: '33px !important',
    display: 'flex',
    alignItems: 'center',
    color: '#FFFFFF'
  },
  settings: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: '400 !important',
    fontSize: '24px !important',
    lineHeight: '33px !important',
    color: '#FFFFFF'
  }
}));

export default ({ children } : any) => {
  const navigate = useNavigate()
  const classes = useStyles();
  const { DAO } = useDAO()

  const initials = useMemo(() => {
    const daoName = _get(DAO, 'name', '').trim().split(" ");
    return daoName.length === 1
    ? daoName[0].charAt(0)
    : daoName[0].charAt(0) + daoName[daoName.length - 1].charAt(0)
  }, [DAO])

  return (
      <Box className={classes.root}>
        <Grid container component="main" className={classes.content}>
            <CssBaseline />
            <Grid container mx={3}>
              <Grid item sm={12}>
                <Box className={classes.header}>
                  <Box ml={4} flexGrow={1}>

                  </Box>
                  <IconButton onClick={() => { window.location.href = `/${DAO?.url}` }} sx={{ width: 37, height: 37, borderRadius: 1, backgroundColor: 'rgba(27, 43, 65, 0.2)' }}>
                    <Close sx={{ color: '#FFF' }} />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
            <Container maxWidth="lg">
            { children }
            </Container>
        </Grid>
        <Container maxWidth="lg">
            <Footer theme='dark' />
        </Container>
      </Box>
  );
}