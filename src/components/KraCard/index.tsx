import React from "react";
import { Typography, Card, CardContent } from "@mui/material";
import { makeStyles } from '@mui/styles';

interface KRACardProps {
    index: number,
    result: any
}

const useStyles = makeStyles((theme: any) => ({
    kraCard: {
        width: '315px',
        height: '60px',
        padding: '0 !important',
        background: 'rgba(118, 128, 141, 0.05) !important',
        boxShadow: 'inset 1px 0px 4px rgba(27, 43, 65, 0.1) !important',
        marginRight: '20px !important',
        marginBottom: '15px !important',
        borderRadius: '5px !important',
    },
    kraContent: {
        width: '100%',
        height: '100% !important',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: "0px 16px !important"
    },
    kraText: {
        fontSize: '14px !important',
        fontWeight: '700 !important',
        color: '#76808D',
        textTransform: 'capitalize'
    },
}));

export default ({ index, result }: KRACardProps) => {
    const classes = useStyles();

    return (
        <>
            <Card elevation={0} className={classes.kraCard}>
                <CardContent className={classes.kraContent}>
                    <Typography className={classes.kraText}>{result.name}</Typography>
                </CardContent>
            </Card>
        </>
    )
}