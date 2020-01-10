import { createStore, applyMiddleware } from "redux";
import { persistStore } from "redux-persist";
import createSagaMiddleware from "redux-saga";
import prepareReducers from "./prepareReducers";
import prepareRootSaga from "./prepareRootSaga";
import prepareInitialState from "./prepareInitialState";
import prefixNamespace from "./prefixNamespace";
import { is, Log } from "./utils";

import defaultRoot from "./defaultRoot";

const defaultOptions = { root: defaultRoot, reduxPersist: false };

export default function createStoreFul(models, options = defaultOptions) {
  // console.log(options);
  let { root, reduxPersist } = options;

  reduxPersist = !!reduxPersist;
  is.object(root) || (root = {});
  is.object(rootPersistConfig) || (rootPersistConfig = {});

  const { persistConfig: rootPersistConfig } = root;
  const { storage, stateReconciler } = rootPersistConfig;
  // console.log(reduxPersist);
  if (!storage || !stateReconciler) {
    reduxPersist = false;
  }

  // console.log(reduxPersist);
  const newModels = initModels();

  // console.log(models);
  // console.log(newModels);

  const reducers = prepareReducers(newModels, { root, reduxPersist });
  const rootSagas = prepareRootSaga(newModels);
  const initialState = prepareInitialState(newModels);

  // console.log("reducers:", reducers);
  // console.log("rootSagas:", rootSagas);
  // console.log("initialState:", initialState);

  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    reducers,
    initialState,
    applyMiddleware(sagaMiddleware)
  );

  if (reduxPersist) {
    const persistor = persistStore(store);
    sagaMiddleware.run(rootSagas);

    return { store, persistor };
  } else {
    sagaMiddleware.run(rootSagas);

    return { store };
  }

  function initModels() {
    return Object.values(models).reduce((_newModels, _model) => {
      const newModel = prefixNamespace(_model);
      // console.log("newModel, ", newModel);
      if (!is.modelObject(_model)) {
        Log.warn(`${_model} is not redux-useful model`);

        return _newModels;
      }
      _newModels[newModel.namespace] = newModel;

      return _newModels;
    }, {});
  }
}
