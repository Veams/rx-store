[![Build Status](https://travis-ci.com/Veams/rx-store.svg?branch=master)](https://travis-ci.com/Veams/rx-store) ![Codecov](https://img.shields.io/codecov/c/github/veams/rx-store) [![GitHub license](https://img.shields.io/github/license/Veams/rx-store)](https://github.com/Veams/rx-store/blob/master/LICENSE)

# Veams RxStore (`@veams/rx-store`)

The Veams RxStore is a simple but powerful state management module based on RxJS and Redux.

It is framework agnostic and can be used in Angular, React, Vue or any other web application frameworks/libraries. 

TypeScript is supported. 

## Why this package?

### Why not using Redux standalone?

Redux has some great benefits and advantages: small, simple and it has a huge community and eco system. That's why we are using it as core foundation.

But: It follows the pattern of Observables, without having the power of RxJS Observables. Try to use it out of the React ecosystem and you will discover some major issues like handling filtering of values and comparing previous and next incoming changes. 

-------------------
 
## Installation

### NPM

``` bash 
npm install @veams/rx-store --save
```

### Yarn 

``` bash 
yarn add @veams/rx-store
```

--------------------

## Usage

A simple store gist can look like this: 

``` js
import { createObservableFromRedux } from '@veams/rx-store';
import { combineReducers, createStore } from 'redux';

/** 
 * Redux stuff starts
 */
// Typical reducer
function uiReducer(state, action) {
    switch(action.type) {
        case 'ui:currentMedia': {
            return {...state, ui: {
                ...state.ui,
                currentMedia: action.payload
            }}
        }
        default: 
            return state;
    }
}

// And another one
function anotherReducer(state, action) {
    switch(action.type) {
        case 'test:update': {
            return {...state, test: {
                ...state.test,
                activeIdx: action.payload
            }}
        }
        default: 
            return state;
    }
}

// Let's create 
const rootReducer = combineReducers({
	ui: uiReducer,
	another: anotherReducer
});

const reduxStore = createStore(rootReducer, /* Place your middlewares here */)

/** 
 * Redux stuff ends
 */

/** 
 * RxStore
 */
const store = createObservableFromRedux({
    useSingleton: false,
    store: reduxStore
});

export default store;

```

By calling `createObservableFromRedux()` with `useSingleton: true` it is creating a singleton which you can use in your app by using the library like this: 

``` js
import { store } from '@veams/rx-store';
``` 

**Select & Subscription**

Because Veams RxStore is giving you back an observable store, you are now able to select a slice out of it and subscribe to changes: 

``` js 
import { store } from '@veams/rx-store';

const testState$ = store.select((state) => state.test);
const activeIdx = 0;

testState$.subscribe(data => {
    activeIdx = data.activeIdx;
    
    console.log(activeIdx); // Print out new value 
})
```

**Operators**

Because we have RxJS in place you can do all common operations like you wish: 

``` js 
// Apply operators ... 
testState$.pipe(
    filter(data => data.activeIdx < 4),
    delay(500),
).subscribe(data => { // ... and subscribe to new data values
    console.log(data.activeIdx);
})
```

**Actions**

To update the store you need to dispatch actions: 

``` js 
import { store } from '@veams/rx-store';

store.dispatch({type: 'test:update', payload: 1})
```

Bringing it all together it can look like this: 

``` js 
import { store } from '@veams/rx-store';
import { filter, delay } from 'rxjs/operators';

// Select a state slice from store
const testState$ = store.select((state) => state.test);
const activeIdx = 0;

// Just select an element.
const app = document.getElementById('app');
const btn = document.getElementById('btn');

// Apply operators ... 
testState$.pipe(
    filter(data => data.activeIdx < 4),
    delay(500),
).subscribe(data => { // ... and subscribe to new data values
    activeIdx = data.activeIdx
    
    // Call a function to render the app.
    renderApp(activeIdx);
})

// Simple rendering of html
function renderApp(activeIdx) {
    app.innerHTML = activeIdx;
}

// Click handler to update the store by using actions.
btn.addEventListener('click', () => store.dispatch({type: 'test:update', payload: activeIdx + 1}))
```

------------------------------

## API

### `createObservableFromRedux()`

Create store singleton by passing Redux.

* @param {Object} options - Options object.

The options object has some defaults, these are: 

``` 
DEFAULT_OPTIONS = {
	useSingleton: true,
    store: createStore((state) => state)
};
```

### store 

The store singleton has the following API: 

**`redux`**

Redux instance you passed.

**`observable`**

Observable instance which was created by `createObservableFromRedux`.

**`select(cb)`**

Select function can be used to get a specific slice from state.

* @param {Function} selector - Selector function which gets passed the store.

**`dispatch(actionObject)`**

Dispatch function to update store.

* @param {Object} action - Action object containing `type` and `payload`.
