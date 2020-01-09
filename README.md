# Redux Useful

Persist and rehydrate a redux store.

[npm version 6.12.1](https://www.npmjs.com/package/redux-useful) [npm downloads](https://www.npmjs.com/package/redux-useful)

## Quickstart
`npm install redux-useful`

Usage Examples:
1. [Basic Usage](#basic-usage)
2. [Store with Persist](#store-with-persist)

#### Basic Usage
Basic create Store without Persist [more abou redux-persist here](https://github.com/rt2zz/redux-persist)

```js
// counterModel.js

import { put, delay } from "redux-saga/effects";

const reducers = {
  increment: (state, action) => {
    return state + 1;
  },
  decrement: (state, action) => {
    return state - 1;
  }
};

const sagas = {
  incrementAsync: function* (){
    yield delay(1000);
    yield put({type: "counter/increment"});
  }
};

export default {
  namespace: "counter", // is prefix of your reducer
  state: 0, // default state
  sagas,
  reducers
};

```

```js
// store.js

import { createStoreFul } from "redux-useful";
import counterModel from "./counterModel.js";

const models = [counterModel];

const { store } = createStoreFul(models, {
  reduxPersist: false
});

export { store };

```

### Store With Persist
Create Store with Persist using AsyncStorage [more abou redux-persist here](https://github.com/rt2zz/redux-persist)

```js
// counterModel.js

import { put, delay } from "redux-saga/effects";

const reducers = {
  increment: (state, action) => {
    return state + 1;
  },
  decrement: (state, action) => {
    return state - 1;
  }
};

const sagas = {
  incrementAsync: function* (){
    yield delay(1000);
    yield put({type: "counter/increment"});
  }
};

export default {
  namespace: "counter", // is prefix of your reducer
  state: 0, // default state
  sagas,
  reducers
};

```

```js
// store.js

import { createStoreFul } from "redux-useful";
import { AsyncStorage } from "react-native";
import counterModel from "./counterModel.js";

const models = [counterModel];

const rootModel = {
  persistConfig: {
    key: "root",
    storage: AsyncStorage,
  },
  reduxPersist: true
}

const { store, persistor } = createStoreFul(models, rootModel);

export { store, persistor };

```

## API
[Full API](#)

### INSPIRE OF

* [dva](https://github.com/dvajs/dva/)
* [redux](https://redux.js.org/)
* [redux-saga](https://redux-saga.js.org/)
* [redux-persists](https://github.com/rt2zz/redux-persist/)