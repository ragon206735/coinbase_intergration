import React, { useCallback, useEffect } from "react";
import { get as _get } from 'lodash'
import { Box, Fade, Typography, IconButton } from "@mui/material";
import Button from "components/Button";
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { toast } from "react-hot-toast";
import { CHAIN_INFO } from "constants/chainInfo";
import { useWeb3Auth } from "context/web3Auth";
import { setNetworkConfig } from "store/actions/session";
import { useAppDispatch } from "helpers/useAppDispatch";


export default ({ t, nextChainId }: any) => {
    console.log("nextChainId", nextChainId)
    const { chainId, switchChain } = useWeb3Auth()
    const dispatch = useAppDispatch()

    useEffect(() => {
        console.log('CURRENT_CHAIN', chainId)
    }, [chainId])

    const handleSwitch = useCallback(async () => {
        try {
            toast.dismiss(t.id)
            const chainInfo = CHAIN_INFO[nextChainId]
            dispatch(setNetworkConfig({ selectedChainId: nextChainId, chain: chainInfo.chainName, web3AuthNetwork: chainInfo.network }))
            await switchChain(chainInfo?.chainId)
        } catch (e) {
            console.log(e)
        }
    }, [nextChainId])

    return (
        <Fade in={t?.visible}>
            <Box style={{ 
                    padding: '16px',
                    backgroundColor: '#FFF',
                    borderRadius: 8,
                    borderWidth: 1,
                    filter: 'drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.161))'
                }}>
                <Box flexGrow={1} width={296}>
                    <Box display="flex" flexDirection="row" alignItems="center">
                        <Typography style={{
                            flexGrow: 1,
                            fontFamily: 'Inter, sans-serif',
                            fontStyle: 'normal',
                            fontWeight: '600',
                            fontSize: '14px',
                            lineHeight: '19px',
                            color: '#1B2B41'
                        }}>Switch Chain</Typography>
                        <IconButton  onClick={() => toast.dismiss(t.id)}>
                            <CloseIcon style={{ color: '#D1D4D9' }}/>
                        </IconButton>
                    </Box>
                    <Typography variant="subtitle2">You are on a different safe chain. Swtich to correct chain to execute the transaction.</Typography>
                </Box>
                <Box sx={{ backgroundColor:'#FDEDED', py: 1, px:2, mt: 3 }} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" borderRadius={28}>
                    <Typography 
                    style={{
                        fontFamily: 'Inter, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        fontSize: '12px',
                        lineHeight: '18px',
                        letterSpacing: '-0.011em',
                        color: '#C94B32'
                    }}
                    >{ CHAIN_INFO[nextChainId].label }</Typography>
                    <Typography
                    onClick={() => handleSwitch()}
                    style={{
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        fontSize: '12px',
                        lineHeight: '18px',
                        letterSpacing: '-0.011em',
                        color: '#C94B32'
                    }}
                    >SWITCH</Typography>
                </Box>
            </Box>
        </Fade>
    )
}