import React, { useState } from "react";
import clsx from "clsx";
import { get as _get } from 'lodash';
import { makeStyles } from '@mui/styles';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import Button from "components/Button";
import { CHAIN_INFO } from "constants/chainInfo";
import { KeyboardArrowDown } from '@mui/icons-material';
import { chain } from "lodash";
import { SUPPORTED_CHAIN_IDS } from "constants/chains";

const useStyles = makeStyles((theme: any) => ({
    root: {
        borderRadius: '10px !important',
        boxShadow: 'none !important',
        fontSize: '16px !important',
        minWidth: 'inherit !importnt',
        padding: '0px !important'
    }
  }));

export default ({ chainId, onselect = () => {}, buttonClass }: { chainId: number, onselect?: Function | undefined, buttonClass?: any }) => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    return (
        <Box>
            <Button id="chain-switch-button" onClick={handleClick} sx={{ height: 36}} aria-controls={open ? 'fade-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} className={clsx([classes.root, buttonClass])} variant="contained" color="secondary" disableElevation startIcon={<img style={{ width: 18, height: 18 }} src={ _get(CHAIN_INFO, `${chainId}.logoUrl`)}/>} endIcon={<KeyboardArrowDown />}>
                { _get(CHAIN_INFO, `${chainId}.label`) }
            </Button>
            <Menu
                key="chain-switch-menu"
                id="chain-switch-menu"
                keepMounted
                MenuListProps={{
                    'aria-labelledby': 'chain-switch-button',
                }}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                {
                    SUPPORTED_CHAIN_IDS.map(sc => 
                        <MenuItem style={{ textTransform: 'uppercase' }} onClick={() => { onselect(sc); handleClose() }}>
                            <img style={{ marginRight: '8px', width: 18, height: 18 }} src={CHAIN_INFO[sc].logoUrl} />{ CHAIN_INFO[sc].label }</MenuItem>)
                }
            </Menu>
        </Box>
    )
}
