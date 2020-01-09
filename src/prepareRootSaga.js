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

    yield sagaEffects.fork(allSagas);
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
    return function*() {
      for (const key in models) {
        // Log.warn(models[key]);
        const { sagas, namespace } = models[key];

        if (!is.object(sagas) && !is.array(sagas)) {
          Log.warn(`sagas is not object or array`);

          continue;
        }

        const watcher = function*() {
          try {
            const activeSagas = Object.keys(sagas).map(_key => {
              const saga = sagas[_key];
              let effect, options;

              if (is.array(saga)) {
                effect = saga[0];
                options = saga[1];
              } else {
                effect = saga;
              }

              const { type, ms, delayMs } = options || {};

              return createWatcherSaga(_key, effect, type, ms, delayMs)();
            });

            yield sagaEffects.all(activeSagas);
          } catch (e) {
            onError(e);
          }
        };

        const task = yield sagaEffects.fork(watcher);

        yield sagaEffects.fork(function*() {
          yield sagaEffects.take(`${namespace}/~@~CANCEL_EFFECTS`);
          yield sagaEffects.cancel(task);
        });
      }
    };
  }
}
