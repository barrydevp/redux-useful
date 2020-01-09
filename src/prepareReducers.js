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
    if (!handles || !is.object(handles) || is.undef(type)) {
      Log.warn(`reducers is not object and type is undefined`);
      return;
    }
    return handles[type];
  }

  function getReducer(handles, beforeHandle) {
    return (state = [], action) => {
      const { type } = action;
      const handleReducer = getHandleReducer(type, handles);

      is.func(beforeHandle) && (state = beforeHandle(state, action));

      return (handleReducer && handleReducer(state, action)) || state;
    };
  }

  function getReducerWithPersist(handles, beforeHandle, persistConfig) {
    return persistReducer(
      {
        storage: defaultStorage,
        stateReconciler: defaultStateReconciler,
        ...persistConfig
      },
      (state = [], action) => {
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
        reducers: { handles, beforeHandle },
        namespace
      } = model;

      if (!namespace) {
        Log.error(`missing namespace of model: ${model}`);
        return previos;
      }

      if (!reduxPersist || is.undef(persistConfig))
        return Object.assign(previos, {
          [namespace]: getReducer(handles, beforeHandle)
        });

      return Object.assign(previos, {
        [namespace]: getReducerWithPersist(handles, beforeHandle, persistConfig)
      });
    }, {});
  }
}
