/**
 * Combine all reducers to a final root reducer by validating them.
 *
 * @param {Object} reducers - Containing key/value pair.
 */
export default function combineReducers(reducers) {
	return Object.entries(reducers).reduce((finalReducers, entry) => {
		const [key, value] = entry;
		if (typeof value === 'undefined') {
			console.warn(`@veams/rx-store :: No reducer provided for key "${key}".`)
		}

		if (typeof value === 'function') {
			finalReducers[key] = value;
		}

		return finalReducers;
	}, {})
}
