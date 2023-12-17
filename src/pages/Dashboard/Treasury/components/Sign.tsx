import { TableCell, Box, Typography } from "@mui/material"
import clsx from "clsx";
import moment from "moment"
import { makeStyles } from '@mui/styles';
import CloseBtnSvg from 'assets/svg/close-btn.svg';
import CheckBtnSvg from 'assets/svg/check-btn.svg'
import React from "react"

const useStyles = makeStyles((theme: any) => ({
    root: {

    },
    cell: {
        width: 60,
        height: 30,
        backgroundColor: "#F0F0F0",
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    cellReject: {
        borderRadius: '50px 0 0 50px',
        borderRight: '1px solid rgba(27, 43, 65, 0.2)'
    },
    text: {
        fontFamily: 'Inter, sans-serif',
        fontStyle: 'normal',
        fontWeight: '700 !important',
        fontSize: '13px !important',
        lineHeight: '16px',
        color: '#76808D'
    }
  }));

export default ({ transaction, index }: any) => {

    const classes = useStyles()

    if(transaction.executionDate || index !== 0) {
        return <TableCell></TableCell>
    }

    return (
        <TableCell align="right">
            {/* <div>{ transaction?.nonce }</div> */}
            {
                <Box display="flex" flexDirection="row" alignItems="center" justifyContent="flex-end">
                    <Box className={clsx([classes.cell, classes.cellReject])}>
                        <img src={CloseBtnSvg} />
                        <Typography className={classes.text}>{ `${transaction?.rejections}/${transaction?.confimationsRequired}` }</Typography>
                    </Box>
                    <Box className={classes.cell}>
                        <img src={CheckBtnSvg} />
                        <Typography className={classes.text}>{ `${transaction?.confirmations}/${transaction?.confimationsRequired}` }</Typography>
                    </Box>
                </Box>
            }
        </TableCell>
    )
}