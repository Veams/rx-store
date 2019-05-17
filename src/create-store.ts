import StoreFactory from './store-factory';

const DEFAULT_OPTIONS = {
	devtools: false,
	devtoolsOptions: {},
	useSingleton: true
};
let store;

/**
 * Create store singleton by using rootReducer and initial state.
 *
 * @param {Object} rootReducer - rootReducer created by combineReducers().
 * @param {Object} initialState - initial state object.
 * @param {Object} options - Options object.
 *
 * @return {Object} store
 */
export default function createStore(rootReducer, initialState = {}, options = DEFAULT_OPTIONS) {
	const mergedOptions = {...DEFAULT_OPTIONS, ...options};
	const newStore = StoreFactory(rootReducer, initialState,  {
		devtools: mergedOptions.devtools,
		devtoolsOptions: mergedOptions.devtoolsOptions
	});

	if(mergedOptions.useSingleton) {
		store = newStore;
	} else {
		return newStore;
	}
};

export { store };
