import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

let store;

function StoreFactory(combinedReducers, initialState) {
    /**
     * Factory Cache
     */
    const subscriptions = new Map();
    let state = initialState;

    /**
     * Select function to get a specific slice from state.
     * 
     * @param {Function} selector - Selector function which gets passed the store. 
     */
    function select(selector) {
        if (typeof selector !== 'function') {
            console.warn(`Veams Store :: Passed selector is not a function!`);

            return;
        }

        const selectorId = selector.toString();

        if (!subscriptions.has(selectorId)) {
            const subject$ = new BehaviorSubject(selector(state));

            subscriptions.set(selectorId, {
                subject$,
                selector
            });
        }

        return subscriptions.get(selectorId).subject$.pipe(
            distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
        );
    }

    /**
     * Dispatch function to update store.
     * 
     * @param {Object} action - Action object containing type and payload.
     */
    function dispatch(action) {
        state = Object.values(combinedReducers).reduce((acc, reducer) => ({ ...acc, ...reducer(acc, action) }), state);
        subscriptions.forEach(subscription => subscription.subject$.next(subscription.selector(state)));
    }

    /**
     * Return only select and dispatch.
     */
    return Object.freeze({
        select,
        dispatch
    });
}

/**
 * Combine all reducers to a final root reducer by validating them. 
 *
 * @param {Object} reducers - Containing key/value pair.
 */
export function combineReducers(reducers) {
    return Object.entries(reducers).reduce((finalReducers, entry) => {
        const [key, value] = entry;
        if (typeof value === 'undefined') {
            warning(`No reducer provided for key "${key}"`)
        }

        if (typeof value === 'function') {
            finalReducers[key] = value;
        }

        return finalReducers;
    }, {})
}

/**
 * Create store singleton by using rootReducer and initial state.
 * 
 * @param {Object} rootReducer - rootReducer created by combineReducers().
 * @param {Object} initialState - initial state object.
 * 
 * @return {Object} store
 */
export function createStore(rootReducer, initialState = {}) {
    store = StoreFactory(rootReducer, initialState);

    return store;
}

export { store };