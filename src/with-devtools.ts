export default function withDevTools(initialState, options = {}) {
	if(typeof window === undefined || !(window as any).__REDUX_DEVTOOLS_EXTENSION__) {
		console.error('@veams/rx-store :: No devtools extension installed!');

		return;
	}

	const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect(options);

	devTools.init(initialState);

	return devTools;
}
