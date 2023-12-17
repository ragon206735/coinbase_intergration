import React, { useContext } from "react";
import NFT from "./iterm";
import { makeStyles } from '@mui/styles';
import { Web3AuthContext } from "context/web3Auth";
import { sliceAddress } from "utils";
import { get as _get } from "lodash";
import { CHAIN_INFO } from "constants/chainInfo";
import { SafeNFTsContext } from "context/safeNFTs";
import { Grid, Box, Typography, Tabs, Tab, Divider, Skeleton, TableContainer, Table, TableBody, Stack, Paper, TableCell, TableHead, TablePagination, TableRow } from "@mui/material"
import { AnyAsyncThunk } from "@reduxjs/toolkit/dist/matchers";
import { AnyCnameRecord } from "dns";


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

export default function NFTSection() {
  const { chainId } = useContext(Web3AuthContext);
  const classes = useStyles();

  const { safeNFTsInfo } = useContext(SafeNFTsContext);
  console.log("safeinfo",safeNFTsInfo)

return (
  <>
  {safeNFTsInfo &&
    Object.keys(safeNFTsInfo).map((address, index) => 
    { 
      return ( 
        <div>
        {safeNFTsInfo[address]?.tokens.count!==0 &&
          <>
          <div className="border-b border-gray-300 w-full px-6 py-4">
              <div className="flex gap-6">
              <Box className={classes.ChainLogo}>
                <img
                  src={CHAIN_INFO[safeNFTsInfo[address].chainId]?.logoUrl}
                  alt=""/>
              </Box>
                <div>
                  <span className="text-sm font-semibold" style={{fontSize:'18px',fontWeight:'500'}}>{safeNFTsInfo[address]?.name || "Multi-sig wallet"}</span>
                  <br />
                  <span className="text-sm italic text-gray-300">
                    {sliceAddress(address)}
                  </span>
                </div>
              </div>
            </div><div className="px-7 pt-4 grid grid-cols-12">
                <div className="col-span-5 text-lg font-semibold" style={{fontSize:'16px', fontWeight:'normal', opacity:'0.5'}}>Collection</div>
                <div className="col-span-3 text-lg font-semibold" style={{fontSize:'16px', fontWeight:'normal', opacity:'0.5'}}>Token ID</div>
                <div className="col-span-4 text-lg font-semibold" style={{fontSize:'16px', fontWeight:'normal', opacity:'0.5'}}>Links</div>
              </div>
              <div className="py-4">
          {safeNFTsInfo[address]?.tokens.count!==0 &&
                  safeNFTsInfo[address]?.tokens.results.map(
                    (token: any) => {
                      const props = {
                        token:token,
                        chainId:safeNFTsInfo[address]?.chainId, 
                      }
                      return <NFT props={props}/>;
                    }
                  )}
          </div>
              </>
          }
        </div>
          );
        })}
    </>
  );
}