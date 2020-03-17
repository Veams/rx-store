[![Build Status](https://travis-ci.com/Veams/rx-store.svg?branch=master)](https://travis-ci.com/Veams/rx-store) ![Codecov](https://img.shields.io/codecov/c/github/veams/rx-store) ![npm (scoped)](https://img.shields.io/npm/v/@veams/rx-store) [![GitHub license](https://img.shields.io/github/license/Veams/rx-store)](https://github.com/Veams/rx-store/blob/master/LICENSE)

# Veams RxStore (`@veams/rx-store`)

> Veams provides the missing RxJS wrapper for Redux to provide a simple but powerful state management module.

**It is framework agnostic and can be used in any web application frameworks/libraries** like Angular, React, Vue. 

**It is written in TypeScript.** 

**It is bundled and gzipped _(with Redux fallback and RxJS)_ around 5KB.** 
Take a look at our uncompressed [stats file](https://github.com/Veams/rx-store/raw/master/bundle.png) to find out more about our bundle.

## Why this package?

### Why not using Redux standalone?

Redux has some great benefits and advantages: small, simple and it has a huge community and eco system. That's why we are using it!

**But:** It follows the pattern of Observables, without having the power of RxJS Observables. 

Try to use it out of the React ecosystem. You will discover that you have to add a lot manual work to handle filtering of values and changes. You need to add your own comparison logic. 

### `@veams/rx-store` to rescue!

`@veams/rx-store` starts there, where Redux ends. It provides a simple interface to get slices/chunks/parts out your store. 

Next to that, you only subscribe to changes for this specific portion of the store, means `@veams/rx-store` is filtering the changes for you and only executes your provided subscription callback when the new state is different from the previous one. 

Let's see the benefits in code form. Say we have a store which has the following structure: 

``` js 
{
    ui: {
        breakpoint: "small"
    },
    person: {
        status: "fetched",
        entities: {
            1: {
                name: "John",
                gender: "male"
            },
            2: {
                name: "Max",
                gender: "male"
            },
            3: {
                name: "Adriana",
                gender: "female"
            }
        }
    }
}
```

When we only want to listen to changes to our UI slice, we can do the following: 

``` js 
const ui$ = store
                .select(state => state.ui)
                .subscribe((uiState) => {
                    console.log(uiState); // Prints {breakpoint: "small"} and upcoming changes to the object
                });

// Later on we want to unsubscribe
ui$.unsubscribe();
```

You can go even further down in your data chain: 

``` js 
const personX$ = store
                    .select(state => state.person.entities.1)
                    .subscribe((dataFromPersonWithId1) => {
                        console.log(dataFromPersonWithId1); // Prints {name: "John", gender: "male"} and upcoming changes to the object
                    });

// Later on we want to unsubscribe
personX$.unsubscribe();

```

Or what if you want to add more custom handling like returning only females: 

``` js 
import { map } from 'rxjs/operators';

const getFemales = (data) => Object.values(data).filter(person => person.gender === "female")

// By using operators
const femalesByOperator$ = store
                    .select(state => state.person.entities)
                    .pipe(
                        map(persons => getFemales(persons))
                    )
                    .subscribe((females) => {
                        console.log(females); // Prints [{name: "Adriana", gender: "female"}] and upcoming changes to the person slice
                    });

// By using selector function
const femalesBySelector$ = store
                    .select(state => getFemales(state.person.entities))
                    .subscribe((females) => {
                        console.log(females); // Prints [{name: "Adriana", gender: "female"}] and upcoming changes to the person slice
                    });

// Later on we want to unsubscribe
femalesByOperator$.unsubscribe();
femalesBySelector$.unsubscribe();

```

_It is as easy as this!_ 

You can also take a look at the [demo implementation](https://github.com/Veams/rx-store/blob/master/demo/index.html)! 
In the provided example we have simple counter and store in place. Via `setTimeout()` we add data to the store - nothing more and really basic. 

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

By calling `createObservableFromRedux()` with the option `useSingleton: true` we create a singleton which you can use in your app by using the library import like this: 

``` js
import { store } from '@veams/rx-store';
``` 

**Select & Subscription**

Because `@veams/rx-store` is giving you back a [`RxStore`](#interface) interface, you are now able to select a slice out of it and subscribe to changes: 

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

## Some technical stuff for you

### Interface 

``` ts 
export interface RxStore {
  redux: Store; 
  observable: Observable<unknown>;
  select: (selector: (data: any) => any) => Observable<any>;
  dispatch: (action: AnyAction) => void;
}
```

### API

#### `createObservableFromRedux()`

Create store singleton by passing Redux.

* @param {Object} options - Options object.
* @return {RxStore} store

The options object has some defaults, these are: 

``` 
DEFAULT_OPTIONS = {
	useSingleton: true,
    store: createStore((state) => state)
};
```

#### store 

The returned store has the following API: 

**`redux`**

Redux instance you passed. 

_It should not be necessary to work with the instance._

**`observable`**

Observable instance which was created by `createObservableFromRedux`. 

_It should not be necessary to work with the instance._

**`select(cb)`**

Select function can be used to get the whole state or a specific slice from state.

* @param {Function} selector - Selector function which gets passed the store.
* @return {Any} state slice

**`dispatch(actionObject)`**

Dispatch function to update store.

* @param {Object} action - Action object containing `type` and `payload`.

