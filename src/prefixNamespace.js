import { _, is, Log } from "./utils";
import CONSTANTS from "./constants";

function prefix(value, namespace, type) {
  // if(!is.object(value)) return ;

  return Object.keys(value).reduce((memo, key) => {
    // Log.warn(
    //   `[prefixNamespace]: ${type} ${key} should not be prefixed with namespace ${namespace}`
    // );
    const newKey = `${namespace}${CONSTANTS.NAMESPACE_SEP}${key}`;
    memo[newKey] = value[key];
    return memo;
  }, {});
}

export default function prefixNamespace(model) {
  const { namespace, reducers, sagas, persistConfig, state } = model;
  let handles, beforeHandle, newSagas, newPersistConfig = {};

  if (!namespace) {
    Log.error(`missing namespace of model: ${model}`);
    return;
  }

  if (is.object(reducers) || is.array(reducers)) {
    if (is.object(reducers)) {
      handles = _.cloneDeep(reducers);
      handles = prefix(handles, namespace, "reducer");
    } else {
      handles = _.cloneDeep(reducers[0]);
      handles = prefix(handles, namespace, "reducer");
      beforeHandle = reducers[1];
    }
  } else {
    Log.error(`reducers is not Object or Array`);
  }

  if (
    is.undef(persistConfig) ||
    !is.object(persistConfig) ||
    _.isEmpty(persistConfig)
  ) {
    newPersistConfig = undefined;
  } else {
    newPersistConfig.key = namespace;
  }

  if (sagas && is.object(sagas)) {
    newSagas = prefix(sagas, namespace, "sagas");
  }

  return {
    namespace,
    state,
    reducers: {
      handles,
      beforeHandle
    },
    sagas: newSagas,
    persistConfig: newPersistConfig
  };
}
