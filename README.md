# Veams RxStore (`@veams/rx-store`)

The Veams RxStore is a simple but powerful state management module based on RxJS with a similar Api like Redux or NgRx. 

It is not framework agnostic and can be used in Angular, React, Vue or any other web application frameworks/libraries. 

TypeScript is supported. 

## Why this package?

### Why not using Redux?

Redux has some great benefits and advantages: small, simple and it has a huge community and eco system.

But: It follows the pattern of Observables, without having the power of RxJS Observables.

### Why not using ngrx?

That is easy to answer: It is bound to Angular. 

When they would create this package without any fixed connection to Angular I would directly use it.

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
import { combineReducers, createStore } from '@veams/rx-store';

function uiReducer(state, action) {
    switch(action.type) {
        case 'ui:currentMedia': {
            return {...state, ui: {
                ...state.ui,
                currentMedia: action.payload
            }}
        }
    }
}

function anotherReducer(state, action) {
    switch(action.type) {
        case 'test:update': {
            return {...state, test: {
                ...state.test,
                activeIdx: action.payload
            }}
        }
    }
}

const rootReducer = combineReducers({
	ui: uiReducer,
	another: anotherReducer
});

createStore(rootReducer, {
	ui: {},
	test: {
		activeIdx: 0
	}
});

```

By calling `createStore()` it is creating a singleton which you can use in your app by using the library like this: 

``` js
import { store } from '@veams/rx-store';
``` 

**Select & Subscription**

Because Veams RxStore is giving you back the store, you are now able to select a slice out of it and subscribe to changes: 

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

**Enable devtools extension**

You can use the devtools extension by just passing the option to `createStore()`: 

``` js 
createStore(rootReducer, {
	ui: {},
	test: {
		activeIdx: 0
	},
	options: {
	    devtools: true
	}
});
```

------------------------------

## API

### `combineReducers()`

Combine all reducers to a final root reducer by validating them.

* @param {Object} reducers - Containing key/value pair. 

### `createStore()`

Create store singleton by using rootReducer and initial state.

* @param {Object} rootReducer - rootReducer created by combineReducers().
* @param {Object} initialState - initial state object.
* @param {Object} options - Options object.

The options object has some defaults, these are: 

``` 
DEFAULT_OPTIONS = {
	devtools: false,
	devtoolsOptions: {},
	useSingleton: true
};
```

### store 

The store singleton has the following API: 

**`select(cb)`**

Select function can be used to get a specific slice from state.

* @param {Function} selector - Selector function which gets passed the store.

**`select(cb)`**

Dispatch function to update store.

* @param {Object} action - Action object containing `type` and `payload`.
