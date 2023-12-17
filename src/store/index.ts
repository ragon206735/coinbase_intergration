import { applyMiddleware, compose } from 'redux';
import { createStore } from 'redux'
import rootReducer from 'store/reducers';
import createSagaMiddleware from 'redux-saga';
import sessionSaga from 'store/sagas/session.saga';
import projectSaga from 'store/sagas/project.saga';
import taskSaga from 'store/sagas/task.saga';
import treasurySaga from 'store/sagas/treasury.saga';
import daoSaga from './sagas/dao.saga';
import { persistStore } from 'redux-persist';
import { composeWithDevTools } from 'redux-devtools-extension';
import monitorReducerEnhancer from 'store/enhancers/monitorReducer'

export let persistor: any = null;

const configureStore = (initialState: any = {}) => {
  const middlewares = [];

  const sagaMiddleware = createSagaMiddleware();
  middlewares.push(sagaMiddleware);

  const middlewareEnhancer = composeWithDevTools(applyMiddleware(...middlewares));
  const enhancers = [middlewareEnhancer, monitorReducerEnhancer];
  const composedEnhancers: any = compose(...enhancers)
  const store = createStore(rootReducer, initialState, composedEnhancers);
  sagaMiddleware.run(sessionSaga);
  sagaMiddleware.run(projectSaga);
  sagaMiddleware.run(taskSaga);
  sagaMiddleware.run(daoSaga);
  sagaMiddleware.run(treasurySaga);
  persistor = persistStore(store);
  return store;
};

export default configureStore
