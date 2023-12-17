import React from "react";
import clsx from "clsx";
import { IconButton } from "@mui/material"
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: any) => ({
    root: {
      cursor: 'pointer',
      background: 'linear-gradient(180deg, #FBF4F2 0%, #EEF1F5 100%) !important',
      maxWidth: '37px !important',
      maxHeight: '37px !important',
      borderRadius: '5px !important',
      '&:hover': {
        backgroundColor: 'linear-gradient(180deg, #fcebe6 0%, #dfe3e8 100%) !important',
      },
    },
  }));

export default ({ children, ...props }: any) => {
    const classes = useStyles()
    return (
        <IconButton className={clsx(classes.root, props.className)} { ...props }>
            { children }
        </IconButton>        
    )
}