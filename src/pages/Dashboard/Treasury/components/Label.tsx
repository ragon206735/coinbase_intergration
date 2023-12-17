import { TableCell, Box, Typography } from "@mui/material";
import { get as _get } from 'lodash'
import TextInput from "components/TextInput";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch } from "helpers/useAppDispatch";
import { updateTxLabelAction } from "store/actions/treasury";

export default ({ transaction, recipient, defaultLabel }: any) => {
    console.log("transaction transaction, rec", transaction, recipient)
    const textfieldRef = useRef<any>()
    const dispatch = useAppDispatch()
    const [editable, setEditable] = useState(false)
    const [labelPlaceholder, setLabelPlaceholder] = useState(null)
    
    const label = useMemo(() => {
        console.log("transaction transaction, rec", transaction, recipient)
        if(transaction && recipient) {
            const metadata = _get(transaction, `metadata.${recipient === '0x' ? transaction?.safeAddress : recipient}`, null)
            if(metadata){
                return metadata?.label
            }
        }
        return null
    }, [transaction, recipient])

    useEffect(() => {
        if(editable && label)
            setLabelPlaceholder(label)
        else
            setLabelPlaceholder(null)
    }, [editable, label])
    
    const handleUpdateLabel = () => {
        //hacky !!
        setTimeout(() => { 
            //@ts-ignore
            if(document?.activeElement?.blur)
                //@ts-ignore
                document?.activeElement?.blur()
        }, 0);
       let txHash = transaction?.rawTx?.safeTxHash
       if(!txHash || txHash && txHash === "0x") {
        txHash = transaction?.rawTx?.transactionHash || transaction?.rawTx?.txHash
       }
       dispatch(updateTxLabelAction({ recipient: recipient === "0x" ? transaction?.safeAddress : recipient, safeAddress: transaction?.safeAddress, label: labelPlaceholder, safeTxHash: txHash }))
    }

    return (
        <TableCell style={{width:'225px'}}>
            <Box>
                { (!defaultLabel && !label) || editable ? 
                    <TextInput 
                        ref={textfieldRef}
                        autoFocus={editable}
                        value={labelPlaceholder} 
                        onChange={(e:any) => setLabelPlaceholder(e?.target?.value)} 
                        placeholder="Reason for transaction"
                        inputProps={{ maxLength: 150 }} 
                        fullWidth 
                        size="small"
                        onBlur={(e:any) => {
                            setEditable(false)
                        }}
                        onKeyDown={(e:any) => {
                            if(e.key === 'Enter') {
                                handleUpdateLabel()
                            }
                        }}
                    /> : 
                    <Typography onClick={() => transaction ? setEditable(true) : undefined}>{ defaultLabel ? defaultLabel : label }</Typography> 
                }
            </Box>
        </TableCell>
    )
}