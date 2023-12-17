import { TableCell, Typography, Box } from "@mui/material";
import React from "react";
import DebitSvg from 'assets/svg/sendTokenOutline.svg'
import DebitExecutedSvg from 'assets/svg/sendToken.svg'
import CreditSvg from 'assets/svg/receiveToken.svg'

export default ({ credit = false, executed = false, amount, token, fiatConversion = undefined }: any) => {
    console.log("token : ", token)
    return (
        <TableCell style={{width:'185px'}}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                {!(isNaN(amount) || !token) ? <img style={{ width: 24, height: 24 }} src={credit ? CreditSvg : executed ? DebitExecutedSvg : DebitSvg} /> : <Box sx={{ width: 24, height: 24 }}></Box>}
                <Typography style={{ fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap', fontWeight: 700, fontSize: 14, color: '#76808d', }}  ml={1}>{isNaN(amount) || !token ? '-' : `${parseFloat(amount).toFixed(2)} ${token}`} <br/><span style={{ fontWeight: 400, fontSize: 10, color: "#76808D" }}>{ fiatConversion ? `${ (+amount * +fiatConversion).toFixed(3) } USD` : '' }</span></Typography>
            </Box>
        </TableCell>
    )
}