import * as sagaEffects from "redux-saga/effects";
import { Log, is } from "./utils";

const defaultOnError = error => {
  Log.error(error);
};

const defaultType = "takeEvery";

export default function prepareRootSaga(
  models = [],
  { onError, onEffect } = { onError: defaultOnError }
) {
  return function*() {
    const allSagas = createRootSagas();

    // console.log(allSagas);

    yield sagaEffects.all(allSagas);
  };

  function createWatcherSaga(key, effect, type, ms, delayMs) {
    type = type || defaultType;

    switch (type) {
      case "takeLatest":
        return function*() {
          yield sagaEffects.takeLatest(key, effect);
        };
      case "throttle":
        return function*() {
          yield sagaEffects.throttle(ms, key, effect);
        };
      case "watcher":
        return effect;
      case "poll":
        return function*() {
          function delay(timeout) {
            return new Promise(resolve => setTimeout(resolve, timeout));
          }
          function* pollSagaWorker(action) {
            while (true) {
              yield sagaEffects.call(effect, action);
              yield sagaEffects.call(delay, delayMs);
            }
          }
          while (true) {
            const action = yield sagaEffects.take(`${key}-start`);
            yield race([
              sagaEffects.call(pollSagaWorker, action),
              sagaEffects.take(`${key}-stop`)
            ]);
          }
        };
      default:
        return function*() {
          yield sagaEffects.takeEvery(key, effect);
        };
    }
  }

  function createRootSagas() {
    return Object.values(models).reduce((previous, model) => {
      // console.log(model);
      const sagas = model.sagas;

      if (!is.object(sagas) && !is.array(sagas)) {
        Log.warn(`sagas is not object or array`);

        return previous;
      }

      const activeSagas = Object.keys(sagas).map(key => {
        const saga = sagas[key];
        let effect, options;

        if (is.array(saga)) {
          effect = saga[0];
          options = saga[1];
        } else {
          effect = saga;
        }

        const { type, ms, delayMs } = options || {};

        return createWatcherSaga(key, effect, type, ms, delayMs)();
      });

      return previous.concat(activeSagas);
    }, []);
  }
}
