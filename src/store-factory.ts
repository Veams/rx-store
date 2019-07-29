import {BehaviorSubject} from 'rxjs';
import {distinctUntilChanged, map, tap} from 'rxjs/operators';
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
	let state = initialState;
	const state$ = new BehaviorSubject(state);
	const connectedDevTools = options.devtools ? withDevTools(initialState, options.devtoolsOptions) : null;

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

		return state$.pipe(
			map(source => selector(source)),
			distinctUntilChanged()
		);
	}

	/**
	 * Dispatch function to update store.
	 *
	 * @param {Object} action - Action object containing type and payload.
	 */
	function dispatch(action: Action) {
		state = Object.values(combinedReducers).reduce((newState, reducer: (state, action: Action) => {}) => {
			return {...newState, ...reducer(newState, action)};
		}, state);

		state$.next(state);

		if (connectedDevTools) {
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
