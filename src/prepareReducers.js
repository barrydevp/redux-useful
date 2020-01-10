import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import { is, Log } from "./utils";

export default function prepareReducers(
  models = [],
  { root, reduxPersist } = {}
) {
  // console.log("models from prepareReducers", models);
  const { persistConfig: rootPersistConfig } = root;
  const { storage: defaultStorage, stateReconciler: defaultStateReconciler } =
    rootPersistConfig || {};

  const reducers = createReducers(models);

  // console.log(reducers);

  if (reduxPersist)
    return persistReducer(
      rootPersistConfig,
      combineReducers({
        ...reducers
      })
    );
  else
    return combineReducers({
      ...reducers
    });

  function getHandleReducer(type, handles) {
    // console.log(handles);
    // console.log(type);
    if (!is.object(handles) || !is.string(type)) {
      Log.warn(`reducers is not object or type is not string`);
      return;
    }
    return handles[type];
  }

  function getReducer(handles, beforeHandle, iniState) {
    return (state = iniState, action) => {
      const { type } = action;
      const handleReducer = getHandleReducer(type, handles);

      is.func(beforeHandle) && (state = beforeHandle(state, action));

      let newState;
      is.func(handleReducer) && (newState = handleReducer(state, action));

      return !is.undef(newState) ? newState : state;
    };
  }

  function getReducerWithPersist(
    handles,
    beforeHandle,
    iniState,
    persistConfig
  ) {
    return persistReducer(
      {
        storage: defaultStorage,
        stateReconciler: defaultStateReconciler,
        ...persistConfig
      },
      (state = iniState, action) => {
        const { type } = action;
        const handleReducer = getHandleReducer(type, handles);

        is.func(beforeHandle) && (state = beforeHandle(state, action));

        return (handleReducer && handleReducer(state, action)) || state;
      }
    );
  }

  function createReducers() {
    return Object.values(models).reduce((previos, model) => {
      const {
        persistConfig,
        state,
        reducers: { handles, beforeHandle },
        namespace
      } = model;

      if (!is.string(namespace)) {
        Log.error(`missing namespace of model: ${model}`);
        return previos;
      }

      if (!reduxPersist || is.undef(persistConfig))
        return Object.assign(previos, {
          [namespace]: getReducer(handles, beforeHandle, state)
        });

      return Object.assign(previos, {
        [namespace]: getReducerWithPersist(
          handles,
          beforeHandle,
          state,
          persistConfig
        )
      });
    }, {});
  }
}
