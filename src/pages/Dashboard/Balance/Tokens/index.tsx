import React, { useContext } from "react";
import { makeStyles } from '@mui/styles';
import Token from "./iterm";
import { sliceAddress } from "utils";
import { get as _get } from "lodash";
import { CHAIN_INFO } from "constants/chainInfo";
import { SafeTokensContext } from "context/safeTokens";
import { Grid, Box, Typography, Tabs, Tab, Divider, Skeleton, TableContainer, Table, TableBody, Stack, Paper, TableCell, TableHead, TablePagination, TableRow } from "@mui/material"
import useSafe from "hooks/useSafe";
import { beautifyHexToken } from "utils";
import { BiFontFamily } from "react-icons/bi";
import { AnyAsyncThunk } from "@reduxjs/toolkit/dist/matchers";

const useStyles = makeStyles((theme: any) => ({
  root: {

  },
  ChainLogo: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#EEE',
      borderRadius: '50%',
      width: 30,
      height: 30,
      fontSize: '20px'
  },
  heading:
  {
    margin: 0,
    FontFamily: 'Inter,sans-serif',
    letterSpacing: '-0.04px',
    lineHeight: '1.15rem',
    color: '#76808D',
    fontSize: '16px',
    opacity: '0.5'
}
}));



export default function TokenSection() {
  const classes = useStyles();
  const { safeTokensInfo } = useContext(SafeTokensContext);
  console.log("safeinfo",safeTokensInfo)
  const { loadSafe } = useSafe();

  

  return (
    <>
      {safeTokensInfo &&
        Object.keys(safeTokensInfo).map((address, index) => {
          let safeBalance = 0.0;
          safeTokensInfo[address]?.tokens.map((token: any) => {
          safeBalance += parseFloat(token.fiatBalance)  
          }
          ) 
          return (
            <div key={index}>
              <div className="border-b border-gray-200 w-full px-6 py-4 flex " style={{justifyContent:'space-between'}}>
                <div className="flex gap-6">
                <Box className={classes.ChainLogo}>
{/*                   <img
                    src={CHAIN_INFO[safeTokensInfo[address].chainId]?.logoUrl}
                    alt=""
                    className="w-7 h-7 my-auto"
                  /> */}
                  <img src={CHAIN_INFO[safeTokensInfo[address].chainId]?.logoUrl} alt="seek-logo" />
                  </Box>
    
                  <div>
                    <span className="text-sm font-semibold" style={{fontSize:'18px', fontWeight:'500'}}>
                      {safeTokensInfo[address]?.name || "Multi-sig wallet"}
                    </span>
                    <br />
                    <span className="text-sm italic text-gray-300">
                      {sliceAddress(address)}
                    </span>
                  </div>
                </div>
                <div style={{marginRight:'300px'}}>
                <Box>
                  <Typography style={{ color: "#188C7C", fontWeight: "700", fontSize: 14 }}>{`$${safeBalance.toFixed(3)} Total Balance`}</Typography>
                </Box>
                </div>

              </div>
              <div className="px-7 pt-4 grid grid-cols-10"> 
                <div className="col-span-2 text-lg " style={{fontSize:'16px', fontWeight:'normal', opacity:'0.5'}}>Asset</div>
                <div className="col-span-2 text-lg " style={{fontSize:'16px', fontWeight:'normal', opacity:'0.5'}}>Price</div>
                <div className="col-span-2 text-lg " style={{fontSize:'16px', fontWeight:'normal', opacity:'0.5'}}>Balance</div>
                <div className="col-span-2 text-lg " style={{fontSize:'16px', fontWeight:'normal', opacity:'0.5'}}>Value</div>
              </div>

              <div className="py-4" style={{ marginBottom: "30px"}}>
                {safeTokensInfo[address]?.tokens &&
                  safeTokensInfo[address]?.tokens.map(
                    (token: any, key: Number) => {
                      if (token.token.symbol !== 'SWEAT')
                      {return <Token token={token} key={key} />}              
                    }
                  )}
              </div>
            </div>
          );
        })}
    </>
  );
}