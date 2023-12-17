import { combineReducers } from 'redux';
import sessionReducer from './session';
import DAOReducer from './dao';
import projectReducer from './project';
import { persistReducer } from 'redux-persist';
import TreasuryReducer from './treasury';
import localforage from 'localforage';
import storage from 'redux-persist/lib/storage'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import taskReducer from './task';
import * as actionTypes from 'store/actionTypes';

// const isRemember = async()=> await getValue(REMEBER_DATA)

const rootPersistConfig = {
  key: 'root',
  version: 0,
  storage: storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['session'],
};


const appReducer: any = combineReducers({
  session: sessionReducer,
  dao: DAOReducer,
  project: projectReducer,
  task: taskReducer,
  treasury: TreasuryReducer
});

const rootReducer = (state: any, action: any) => {
  // if (action.type === actionTypes.LOGOUT_ACTION) {
  //   storage.removeItem('persist:root')
  //   return appReducer(undefined, action)
  // }
  return appReducer(state, action)
}

export default persistReducer(rootPersistConfig, rootReducer);
