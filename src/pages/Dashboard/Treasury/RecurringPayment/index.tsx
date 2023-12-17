import { Box, Skeleton, Table, TableBody, TableContainer } from "@mui/material";
import { useDAO } from "context/dao";
import { useSafeTokens } from "context/safeTokens";
import { useAppDispatch } from "helpers/useAppDispatch";
import { useAppSelector } from "helpers/useAppSelector";
import React, { useEffect } from "react";
import { loadRecurringPaymentsAction } from "store/actions/treasury";
import Row from "./components/Row";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: any) => ({
    table: {
        //filter: "drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.09))",
        backgroundColor: "#FFF",
        borderRadius: 5
    },
  }));

export default ({ onRecurringEdit }: any) => {
    const classes = useStyles()
    const { DAO } = useDAO();
    const dispatch = useAppDispatch()
    const { safeTokens } = useSafeTokens()
    const { recurringPayments } = useAppSelector((store: any) => store?.treasury)

    useEffect(() => {
        if(DAO?.url) {
            const safes = DAO?.safes?.map((safe:any) => safe?.address)
            dispatch(loadRecurringPaymentsAction({ safes }))
        }
    }, [DAO?.url])

    return (
        <Box>
            { (!DAO || !recurringPayments)  ? 
                <Skeleton sx={{ borderRadius: 1 }} variant="rectangular" height={500} animation="wave" /> :
                <Box className={classes.table}>
                    <TableContainer  style={{ maxHeight: 500 }} component={Box}>
                        <Table size="small" stickyHeader aria-label="simple table">
                            <TableBody>
                                {
                                    DAO && recurringPayments && recurringPayments.map((txn:any) => {
                                        return <Row onRecurringEdit={onRecurringEdit} transaction={txn} />
                                    })
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            }
        </Box>
    )
}