import { TableCell, Box, Typography } from "@mui/material";
import { get as _get } from 'lodash'
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import React, { useMemo } from "react";
import CreatableSelectTag from "components/CreatableSelectTag";
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch } from "helpers/useAppDispatch";
import { updateTxLabelAction } from "store/actions/treasury";

export default ({ transaction, recipient }: any) => {
    const dispatch = useAppDispatch()
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;


    const tag = useMemo(() => {
        if(transaction && recipient) {
            const metadata = _get(transaction, `metadata.${recipient === '0x' ? transaction?.safeAddress : recipient}`, null)
            if(metadata){
                return metadata?.tag
            }
        }
        return null
    }, [transaction, recipient])

    const handleUpdateTag = (tag: any) => {
        //hacky !!
        setTimeout(() => { 
            //@ts-ignore
            if(document?.activeElement?.blur)
                //@ts-ignore
                document?.activeElement?.blur()
        }, 0);
       dispatch(updateTxLabelAction({ recipient, safeAddress: transaction?.safeAddress, tag, safeTxHash: transaction?.rawTx?.safeTxHash }))
    }

    return (
        <TableCell style={{width:'112px'}}>
            <Box>
                { tag ?
                 <Chip onClick={(e:any) => handleClick(e)} aria-describedby={id} label={tag?.label} size="small" sx={{ minWidth: 80, maxWidth: 80, fontSize: 10, fontWeight: 700, color: tag?.color, backgroundColor: `${tag?.color}20` }} /> :
                 <Chip onClick={(e:any) => handleClick(e)} variant="outlined" aria-describedby={id} label={"Add Label +"} size="small" sx={{ minWidth: 80, maxWidth: 80, fontSize: 10, fontWeight: 700 }} /> 
                }
            </Box>
            <Popover
                PaperProps={{
                    style: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none'
                    }
                }}
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
                }}
            >
            <Box style={{ width: 250, height: 350, padding: 1 }}>
                <CreatableSelectTag defaultMenuIsOpen={true} onChangeOption={(tag:any) => { 
                    handleClose()
                    handleUpdateTag(tag) 
                }}/>
            </Box>
            </Popover>
        </TableCell>
    )
}