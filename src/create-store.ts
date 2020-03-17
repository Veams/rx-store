import isEqual from 'fast-deep-equal';
import { AnyAction, createStore, Store } from 'redux';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export interface RxStore {
  redux: Store;
  observable: Observable<unknown>;
  select: (selector: (data: any) => any) => Observable<any>;
  dispatch: (action: AnyAction) => void;
}

const DEFAULT_OPTIONS: {
  store: Store | null;
  useSingleton: boolean;
} = {
  store: null,
  useSingleton: true,
};
let store: RxStore;

function getState$(reduxStore: Store): Observable<unknown> {
  return new Observable(observer => {
    // emit the current state as first value:
    observer.next(reduxStore.getState());
    return reduxStore.subscribe(() => {
      // emit on every new state changes
      observer.next(reduxStore.getState());
    });
  });
}

function createRxStore(reduxStore: Store): Observable<unknown> {
  return getState$(reduxStore);
}

function createFormStore(reduxStore: Store): RxStore {
  const store$ = createRxStore(reduxStore);

  return {
    dispatch(action): void {
      reduxStore.dispatch(action);
    },
    observable: store$,
    redux: reduxStore,
    select(selector): Observable<any> {
      if (typeof selector !== 'function') {
        throw new Error('RxStore :: select() : Please provide a selector function!');
      }
      return store$.pipe(
        map(source => selector(source)),
        distinctUntilChanged((a, b) => isEqual(a, b))
      );
    },
  };
}

/**
 * Create store singleton by using rootReducer and initial state.
 *
 * @param {Object} options - Options object.
 *
 * @return {Object} store
 */
export default function createObservableFromRedux(options = DEFAULT_OPTIONS): RxStore {
  if (!options.store) {
    throw new Error('RxStore :: FormStore : Redux is not provided as option!');
  }

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const newStore = createFormStore(mergedOptions.store || createStore(state => state));

  if (mergedOptions.useSingleton) {
    store = store || newStore;
    return store;
  } else {
    return newStore;
  }
}

export { store };
