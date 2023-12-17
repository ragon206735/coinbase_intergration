import React, { useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { get as _get } from 'lodash'
import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import palette from 'theme/palette';
import Skeleton from '@mui/material/Skeleton';

const useStyles = makeStyles((theme: any) => ({
  root: {
    cursor: 'pointer',
    background: `linear-gradient(178.31deg, #C94B32 0.74%, #A54536 63.87%)`,
    minHeight: 107, 
    minWidth: 116,
    px: [1],
    borderBottomRightRadius: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
    width: 35,
    height: 35,
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
    fontSize: '16px !important',
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
  }
}));

export default ({ children, dao, ...props } : any) => {

  const classes = useStyles();

  const initials = useMemo(() => {
    const daoName = _get(dao, 'name', '').trim().split(" ");
    return daoName.length === 1
    ? daoName[0].charAt(0)
    : daoName[0].charAt(0) + daoName[daoName.length - 1].charAt(0)
  }, [dao])

  return (
      <Box { ...props } style={{ zIndex: 999999 }} className={props.plain ? classes.plain : classes.root}>
        { dao ? 
        <Box className={classes.logoContainer}>
          { dao?.image ? <img className={classes.image} src={_get(dao, 'image')} /> :
              dao && <Typography variant='h6' className={classes.title}>{initials}</Typography>
          }
        </Box> :
        <Box className={classes.logoContainer}>
          <Skeleton className={classes.logoContainer} animation="wave" variant="rounded" height={35} width={35} />
        </Box>
      }
      </Box>
  );
}