import React, { useCallback, useMemo } from "react";
import { find as _find } from 'lodash'
import { useDAO } from "context/dao";
import { useWeb3Auth } from "context/web3Auth";
const { toChecksumAddress } = require('ethereum-checksum-address')

export default () => {
    const { account } = useWeb3Auth()
    const { DAO } = useDAO();

    const loadSafe = useCallback((safeAddress: string = '') => {
        return _find(DAO?.safes, (safe:any) => safe?.address === safeAddress)
    }, [DAO])

    const adminSafes = useMemo(() => {
        if(DAO?.safes){
            return DAO?.safes?.filter((safe:any) => safe?.enabled && Boolean(_find(safe?.owners, (m:any) => toChecksumAddress(m?.wallet) === toChecksumAddress(account))))
        }
        return []
    }, [DAO?.safes])

    const activeSafes = useMemo(() => {
        if(DAO?.safes){
            return DAO?.safes?.filter((safe:any) => safe?.enabled)
        }
        return []
    }, [DAO?.safes])

    return { loadSafe, adminSafes, activeSafes }
}