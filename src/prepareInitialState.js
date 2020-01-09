import { Log, is } from "./utils";

export default function(models = []) {
  const initialState = Object.values(models).reduce((previous, model) => {
    const iniState = model.state;
    const namespace = model.namespace;

    if (is.undef(iniState) || !namespace) {
      Log.warn(`iniState || namespace is undefined`);

      return previous;
    }

    return Object.assign(previous, { [namespace]: iniState });
  }, {});

  return initialState;
}
