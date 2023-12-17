import React, { useState, useEffect, useMemo } from 'react';
import { get as _get, find as _find } from 'lodash';
import Avatar from "boring-avatars";
import { Box, Typography } from '@mui/material';
import RecurringPaymentSvg from 'assets/svg/recurring.svg'
import { beautifyHexToken } from 'utils';
import { useAppSelector } from 'helpers/useAppSelector';


export default ({ name, wallet, hideDetails, recurringPayment = false, ...props }: any) => {

    const { recurringPayments } = useAppSelector((store: any) => store.treasury)

    var getInitials = function (value: string) {
        var names = value.split(' '),
            initials = names[0].substring(0, 1).toUpperCase();

        if (names?.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    };

    if(!wallet) return null

    const hasRecurringPayment = useMemo(() => {
        if(recurringPayments && recurringPayments.length > 0 && recurringPayment && wallet)
            return Boolean(_find(recurringPayments, (rp:any) => rp?.receiver?.wallet?.toString() === wallet?.toString()))
        return false
    }, [recurringPayments, wallet, recurringPayment])

    return (
        <Box style={{ display: 'flex', width: '100%', position: 'relative' }}>
            <Box style={{ position: 'relative' }}>
                <Avatar
                    key={`${name}-${wallet}`}
                    size={props?.small ? 24 : 32}
                    name={wallet}
                    variant="marble"
                    colors={["#E67C40", "#EDCD27", "#8ECC3E", "#2AB87C", "#188C8C"]}
                />
                { hasRecurringPayment && <img style={{ position: 'absolute', top: -32/2, right: -32/2 }} src={RecurringPaymentSvg} /> }
            </Box>
            {name && <Box style={{ height: props?.small ? 24 : 32, width: props?.small ? 24 : 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', left: 0, top: 0 }} >
                <Typography sx={{ color: '#FFF', fontWeight: 500 }}>{getInitials(name)}</Typography>
            </Box>}
            {
                !hideDetails &&
                <Box style={{ marginLeft: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                    {
                        name && <Typography style={{ color: '#1b2b41', fontWeight: '700', fontSize: '12px', margin: '0' }}>{name}</Typography>
                    }
                    <Typography style={{ color: '#1b2b41', fontWeight: '400', fontSize: '12px', margin: '0' }}>{beautifyHexToken(wallet)}</Typography>
                </Box>
            }
        </Box>
    )
}
