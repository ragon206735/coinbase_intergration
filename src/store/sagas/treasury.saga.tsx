import {
	call,
	put,
	takeLatest
} from 'redux-saga/effects';
import * as actionTypes from 'store/actionTypes';
import { get as _get } from 'lodash';
import { createRecurringPaymentsService, loadRecurringPaymentsService, loadTreasuryService, createTreasuryTransactionService, syncSafeService, updateTxLabelService, updateTreasuryTransactionService } from 'store/services/treasury'

function* loadTreasurySaga(action:any) {
	try {
	  yield put({ type: actionTypes.LOAD_TREASURY_LOADING, payload: true })
	  const { data } = yield call(loadTreasuryService, action.payload)
	  console.log('json, response', data)
		yield put({ type: actionTypes.LOAD_TREASURY_LOADING, payload: false })
		yield put({ type: actionTypes.SET_TREASURY, payload: data })
		yield put({ type: actionTypes.LOAD_TREASURY_LOADING, payload: null })
	} catch (e) {

	}
  }

  function* createTreasuryTransactionSaga(action:any) {
	try {
	  const { data } = yield call(createTreasuryTransactionService, action.payload)
	  yield put({ type: actionTypes.APPEND_TREASURY_TRANSACTION, payload: data })
	  console.log('json, response', data)
	} catch (e) {

	}
  }

  function* updateTreasuryTransactionSaga(action:any) {
	try {
	  const { data } = yield call(updateTreasuryTransactionService, action.payload)
	  yield put({ type: actionTypes.UPDATE_TREASURY_TRANSACTION, payload: data })
	  console.log('json, response', data)
	} catch (e) {

	}
  }


  function* updateTxLabelSaga(action:any) {
	try {
	  const { data } = yield call(updateTxLabelService, action.payload)
	  yield put({ type: actionTypes.SET_TX_LABEL, payload: data })
	  console.log('json, response', data)
	} catch (e) {

	}
  }

  function* syncSafeSaga(action:any) {
	try {
	  const { data } = yield call(syncSafeService, action.payload)
	  console.log('json, response', data)
	} catch (e) {

	}
  }

  function* loadRecurringPaymentsSaga(action:any) {
	try {
	  yield put({ type: actionTypes.LOAD_RECURRING_PAYMENTS_LOADING, payload: true })
	  const { data } = yield call(loadRecurringPaymentsService, action.payload)
	  yield put({ type: actionTypes.SET_RECURRING_PAYMENTS, payload: data })
	  yield put({ type: actionTypes.LOAD_RECURRING_PAYMENTS_LOADING, payload: null })
	  console.log('json, response', data)
	} catch (e) {
		yield put({ type: actionTypes.LOAD_RECURRING_PAYMENTS_LOADING, payload: null })
	}
  }

  function* createRecurringPaymentSaga(action:any) {
	try {
		yield put({ type: actionTypes.CREATE_RECURRING_PAYMENT_LOADING, payload: true })
		const { data } = yield call(createRecurringPaymentsService, action.payload)
		yield put({ type: actionTypes.CREATE_RECURRING_PAYMENT_SUCCESS, payload: data })
		yield put({ type: actionTypes.CREATE_RECURRING_PAYMENT_LOADING, payload: false })
		yield call(() => new Promise(resolve => setTimeout(resolve, 200)))
		yield put({ type: actionTypes.CREATE_RECURRING_PAYMENT_LOADING, payload: null })
		console.log('json, response', data)
	  } catch (e) {
		  yield put({ type: actionTypes.LOAD_RECURRING_PAYMENTS_LOADING, payload: null })
	  }
  }

export default function* treasurySaga() {
	yield takeLatest(actionTypes.LOAD_TREASURY_ACTION, loadTreasurySaga)
	yield takeLatest(actionTypes.CREATE_TREASURY_TRANSACTION_ACTION, createTreasuryTransactionSaga)
	yield takeLatest(actionTypes.UPDATE_TREASURY_TRANSACTION_ACTION, updateTreasuryTransactionSaga)
	yield takeLatest(actionTypes.UPDATE_TX_LABEL_ACTION, updateTxLabelSaga)
	yield takeLatest(actionTypes.SYNC_SAFE_ACTION, syncSafeSaga)
	yield takeLatest(actionTypes.LOAD_RECURRING_PAYMENTS_ACTION, loadRecurringPaymentsSaga)
	yield takeLatest(actionTypes.CREATE_RECURRING_PAYMENT_ACTION, createRecurringPaymentSaga)
}