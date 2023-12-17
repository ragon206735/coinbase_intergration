import produce from 'immer';
import { get as _get } from 'lodash'
import * as actionTypes from 'store/actionTypes';


export function getInitialState() {
  return {
    selectedChainId: 137,
    web3AuthNetwork: "cyan",
    chain: "polygon",
    token: null,
    user: null,
    transactions: null,
    userTransactionLoading: null
  };
}

const SessionReducer = (state: any = getInitialState(), action: any) =>
  produce(state, (draft: any) => {
    const { payload } = action;
    switch (action.type) {
      case actionTypes.SET_TOKEN_ACTION: {
        draft.token = payload?.token;
        break;
      }
      case actionTypes.SET_USER_ACTION: {
        draft.user = payload;
        break;
      }
      case actionTypes.SET_NETWORK_CONFIG: {
        draft.web3AuthNetwork = payload.web3AuthNetwork;
        draft.chain = payload.chain;
        draft.selectedChainId = payload.selectedChainId;
        break;
      }
      case actionTypes.LOGOUT_ACTION: {
        draft.token = null;
        draft.user = null;
        break;
      }
      case actionTypes.LOAD_USER_TRANSACTION_LOADING: {
        draft.userTransactionLoading = payload
        break;
      }
      case actionTypes.SET_USER_TRANSACTION: {
        draft.transactions = payload
        break;
      }
      case actionTypes.LOGOUT_ACTION: {
				draft = getInitialState()
        break;
			}
    }
  });

export default SessionReducer;
