import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { Grid, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Container } from '@mui/system';
import Account from 'components/Account';
import { useWeb3Auth } from 'context/web3Auth';
import { useAppSelector } from 'helpers/useAppSelector';
import IconButton from 'components/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme: any) => ({
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(169.22deg,#fdf7f7 12.19%,#efefef 92%);'
  },
}));

export default ({ children } : any) => {
  const { account } = useWeb3Auth();
  const navigate = useNavigate()
  //@ts-ignore
  const { token } = useAppSelector(store => store.session)
  const classes = useStyles();

  return (
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        { window.location.pathname.indexOf('organisation/create') > -1 && <Box style={{ position: 'absolute', top: 32, left: 32 }}>
          <IconButton onClick={() => navigate(-1)}>
            <CloseIcon/>
          </IconButton>
        </Box> }
        {  account && token &&
          <Box style={{ position: 'absolute', top: 24, right: 32 }}>
            <Account options={false} />
          </Box>
        }
        <Container maxWidth="lg">
          { children }
        </Container>
      </Grid>
  );
}