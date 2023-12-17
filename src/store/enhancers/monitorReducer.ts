const monitorReducerEnhancer =
  (createStore: any) => (reducer: any, initialState: any, enhancer: any) => {
    const monitoredReducer = (state: any, action: any) => {
      const newState = reducer(state, action)
      return newState
    }
    return createStore(monitoredReducer, initialState, enhancer)
  }

export default monitorReducerEnhancer
