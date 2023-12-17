import produce from 'immer';
import { get as _get, findIndex as _findIndex, orderBy as _orderBy, map as _map, find as _find, filter as _filter } from 'lodash'
import * as actionTypes from 'store/actionTypes';


export function getInitialState() {
  return {
    treasuryLoading: null,
    treasury: null,
    recurringPayments: null,
    recurringPaymentsLoading: null,
    createRecurringPaymentsLoading: null
  };
}

const TreasuryReducer = (state: any = getInitialState(), action: any) =>
  produce(state, (draft: any) => {
    const { payload } = action;
    switch (action.type) {
        case actionTypes.LOAD_TREASURY_LOADING: {
            draft.treasuryLoading = payload
            break;
        }
        case actionTypes.SET_TREASURY: {
            draft.treasury = payload
            draft.treasuryLoading = null
            break;
        }
        case actionTypes.APPEND_TREASURY_TRANSACTION: {
            let ptx: any = [ ...state.treasury, payload ];
            ptx = _map(ptx, (p: any) => {
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
            ptx = _map(ptx, (p: any) => {
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
            ptx = _filter(ptx, p => {
              if(p.rawTx.nonce){
                    let matchRejTx = _find(ptx, px => px.safeAddress === p.safeAddress && (px.rawTx.nonce === p.rawTx.nonce && px.rawTx.data === null && px.rawTx.value === "0"));
                    if (matchRejTx)
                        return matchRejTx.rawTx.safeTxHash !== p.rawTx.safeTxHash
                }
                return true
            })
            ptx = _filter(ptx, p => !p.rawTx.dataDecoded || (_get(p, 'rawTx.dataDecoded.method', '') === 'multiSend' || _get(p, 'rawTx.dataDecoded.method', '') === 'transfer' || _get(p, 'rawTx.dataDecoded.method', '') === 'addOwnerWithThreshold' || _get(p, 'rawTx.dataDecoded.method', '') === 'removeOwner' || _get(p, 'rawTx.dataDecoded.method', '') === 'changeThreshold'))
            draft.treasury = _orderBy(ptx, [p => p?.rawTx?.isExecuted, p => p?.rawTx?.offChain, p => p?.rawTx?.executionDate, p => p?.rawTx?.nonce], ['asc', 'asc', 'desc','asc'])
            break;
        }
        case actionTypes.UPDATE_TREASURY_TRANSACTION: {
            let ptx = draft.treasury.map((txn:any) => {
              if(txn.safeAddress === payload.safeAddress && txn.rawTx.safeTxHash === payload.rawTx.safeTxHash){
                return { ...txn, rawTx: { 
                  ...payload.rawTx, 
                    rejectedTxn: txn?.rawTx?.rejectedTxn || undefined  
                  } }
              } else if (txn.safeAddress === payload.safeAddress && txn.rawTx?.rejectedTxn?.safeTxHash === payload.rawTx?.safeTxHash) {
                if(payload.rawTx?.isExecuted)
                  return { ...txn, rawTx: { ...payload.rawTx } }
                return { ...txn, rawTx: { 
                  ...txn.rawTx, 
                    rejectedTxn: payload.rawTx
                  } }
              } else if (txn.safeAddress === payload.safeAddress && txn._id === payload?._id) {
                return { ...txn, rawTx: { 
                  ...payload.rawTx, 
                    rejectedTxn: txn?.rawTx?.rejectedTxn || undefined  
                  } }
              }
              return txn
            })
            ptx = _filter(ptx, p => {
              if(p.rawTx.nonce){
                    let matchRejTx = _find(ptx, px => px.safeAddress === p.safeAddress && (px.rawTx.nonce === p.rawTx.nonce && px.rawTx.data === null && px.rawTx.value === "0"));
                    if (matchRejTx)
                        return matchRejTx.rawTx.safeTxHash !== p.rawTx.safeTxHash
                }
                return true
            })
            ptx = _orderBy(ptx, [p => p?.rawTx?.isExecuted, p => p?.rawTx?.offChain, p => p?.rawTx?.executionDate, p => p?.rawTx?.nonce], ['asc', 'asc', 'desc','asc'])
            draft.treasury = ptx
            break;
        }
        case actionTypes.SET_TX_LABEL: {
          draft.treasury = state.treasury.map((txn:any) => {
            // if(txn.safeAddress === payload.safeAddress && txn.rawTx.safeTxHash === payload.rawTx.safeTxHash){
            //   return { ...txn, metadata: action?.payload?.metadata }
            // }
            if(txn._id === payload._id){
              return { ...txn, metadata: action?.payload?.metadata }
            }
            return txn
          })
          break;
        }
        case actionTypes.SET_RECURRING_PAYMENTS: {
          draft.recurringPayments = payload
          draft.recurringPaymentsLoading = null
          break;
        }
        case actionTypes.LOAD_RECURRING_PAYMENTS_LOADING: {
          draft.recurringPaymentsLoading = payload
          break;
        }
        case actionTypes.CREATE_RECURRING_PAYMENT_LOADING: {
          draft.createRecurringPaymentsLoading = payload
          break;
        }
        case actionTypes.CREATE_RECURRING_PAYMENT_SUCCESS: {
          draft.recurringPayments = [ ...draft?.recurringPayments, payload ]
          break;
        }
        case actionTypes.LOGOUT_ACTION: {
          draft = getInitialState()
        }
    }
  });

export default TreasuryReducer;
