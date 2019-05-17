import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import withDevTools from './with-devtools';

export interface Action {
	type: string;
	payload: any;
}

export interface ReducerObject {
	[key: string]: (state: any, action: Action) => {}
}

/**
 * Store factory used to create a store singleton.
 *
 * @param {Object} combinedReducers - Combined reducer object.
 * @param {Object} initialState - Initial state object.
 * @param {Object} options - Use redux dev tools.
 *
 * @return {Object} - Containing select() and dispatch() functionality.
 */
export default function StoreFactory(combinedReducers: ReducerObject, initialState, options) {
	/**
	 * Factory Cache
	 */
	const subscriptions = new Map();
	let state = initialState;
	const connectedDevTools = options.devtools ? withDevTools(state, options.devtoolsOptions) : null;

	/**
	 * Select function to get a specific slice from state.
	 *
	 * @param {Function} selector - Selector function which gets passed the store.
	 */
	function select(selector: (state) => {}) {
		if (typeof selector !== 'function') {
			console.warn(`@veams/rx-store :: Passed selector is not a function!`);

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
	function dispatch(action: Action) {
		state = Object.values(combinedReducers).reduce((acc, reducer: (state, action: Action) => {}) => ({...acc, ...reducer(acc, action)}), state);
		subscriptions.forEach(subscription => subscription.subject$.next(subscription.selector(state)));

		if(connectedDevTools) {
			connectedDevTools.send(action.type, state);
		}
	}

	/**
	 * Return only select and dispatch.
	 */
	return Object.freeze({
		select,
		dispatch
	});
}
