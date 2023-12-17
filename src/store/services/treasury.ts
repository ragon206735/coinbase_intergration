import axiosHttp from 'api';
import axios from 'axios';
import { get as _get, map as _map, filter as _filter, find as _find, orderBy as _orderBy } from 'lodash'
import { getQueryString } from 'utils'

export const loadOffChainTxn = (daoId: string) => {
    return axiosHttp.get(`transaction/off-chain?daoId=${daoId}`)
    .then(txn => txn.data)
    .then(txn => {
        return { pTxn: txn.map((pt: any) => { return { safeAddress: pt?.safe, rawTx: pt } }) }
    })
}

export const createTreasuryTransactionService = (payload: any) => {
    return axiosHttp.post(`/gnosis-safe`, payload)
}

export const updateTreasuryTransactionService = (payload: any) => {
    return axiosHttp.patch(`/gnosis-safe`, payload)
}

export const updateTxLabelService = (payload: any) => {
    return axiosHttp.patch(`/gnosis-safe/tx-label`, payload)
}

export const syncSafeService = (payload: any) => {
    return axiosHttp.post(`/gnosis-safe/sync-safe`, payload)
}

export const loadTreasuryService = (payload: any) => {
    return axiosHttp.get(`/gnosis-safe${getQueryString(payload)}`)
    .then(ptx => _get(ptx, 'data', []))
    .then(ptx =>
        _map(ptx, (p: any) => {
            if(p.rawTx.nonce) {
                let matchTx = _find(ptx, px => px.safeAddress === p.safeAddress && (px.rawTx.nonce === p.rawTx.nonce && px.rawTx.isExecuted));
                console.log("matchTx", matchTx, p)
                if (matchTx) {
                    if(matchTx?.rawTx?.isExecuted)
                        return { ...p, rawTx : matchTx?.rawTx }
                }
            }
            return p
        })
    )
    .then(ptx =>
        _map(ptx, (p: any) => {
            if(p.rawTx.nonce) {
                let matchRejTx = _find(ptx, px => px.safeAddress === p.safeAddress && (px.rawTx.nonce === p.rawTx.nonce && px.rawTx.data === null && px.rawTx.value === "0"));
                if (matchRejTx) {
                    if(matchRejTx?.rawTx?.isExecuted) {
                        return { ...p, rawTx : matchRejTx?.rawTx }
                    }
                    return { ...p, rawTx : { ...p.rawTx, rejectedTxn: matchRejTx?.rawTx }  }
                }
            }
            return p
        })
    )
    .then(ptx => _filter(ptx, p => {
        if(p.rawTx.nonce){
            let matchRejTx = _find(ptx, px => px.safeAddress === p.safeAddress && (px.rawTx.nonce === p.rawTx.nonce && px.rawTx.data === null && px.rawTx.value === "0"));
            if (matchRejTx)
                return matchRejTx.rawTx.safeTxHash !== p.rawTx.safeTxHash
        }
        return true
    }))
    //.then(ptx => _filter(ptx, p => !p.rawTx.dataDecoded || (_get(p, 'rawTx.dataDecoded.method', '') === 'multiSend' || _get(p, 'rawTx.dataDecoded.method', '') === 'transfer' || _get(p, 'rawTx.dataDecoded.method', '') === 'addOwnerWithThreshold' || _get(p, 'rawTx.dataDecoded.method', '') === 'removeOwner' || _get(p, 'rawTx.dataDecoded.method', '') === 'changeThreshold')))
    // .then(async ptx => {
    //     let { pTxn } = await loadOffChainTxn(payload?.daoId)
    //     //@ts-ignore
    //     return ptx.concat(pTxn)
    // })
    .then(ptx => _orderBy(ptx, [p => p?.rawTx?.isExecuted, p => p?.rawTx?.offChain, p => p?.rawTx?.executionDate, p => p?.rawTx?.nonce], ['asc', 'asc', 'desc','asc']))
    .then(ptx =>  ptx.filter(p => p.rawTx.type !== 'ETHER_TRANSFER'))
    .then(ptx => { console.log("FINAL", ptx); return { data: ptx } })
}

export const loadRecurringPaymentsService = (payload: any) => {
    return axiosHttp.get(`/recurring-payment${getQueryString(payload)}`)
}

export const createRecurringPaymentsService = (payload: any) => {
    return axiosHttp.post(`/recurring-payment`, payload)
}