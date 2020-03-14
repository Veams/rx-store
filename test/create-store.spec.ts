import { combineReducers, createStore as createReduxStore } from 'redux';
import { filter } from 'rxjs/operators';
import createObservableFromRedux, {RxStore} from '../src/create-store';

const createReduxMock = (singleton = false) =>
  createObservableFromRedux({
    useSingleton: singleton,
    store: createReduxStore(
      combineReducers({
        test: (state: any = {}, action) => {
          switch (action.type) {
            case 'test':
              return {
                ...state,
                ...action.payload,
              };
            default:
              return state;
          }
        },
      })
    ),
  });

describe('RxStore', () => {
  const store = createReduxMock();

  it('creates store instance with necessary props', () => {
    expect(store).toHaveProperty('redux');
    expect(store).toHaveProperty('observable');
    expect(store).toHaveProperty('dispatch');
    expect(store).toHaveProperty('select');
  });

  describe('Selector', () => {
    it('throws error when no callback function is provided', () => {
      const errorSelector = () => store.select(('test' as unknown as () => void));

      expect(errorSelector).toThrowError(/select()/);
    });
    it('returns subscribe method', () => {
      expect(store.select(state => state.test)).toHaveProperty('subscribe');
    });
  });

  describe('Store Interaction', () => {
    const hasKeys = (data: object) => Object.keys(data).length > 0;
    const action = {
      type: 'test',
      payload: {
        1: 2,
      },
    };

    it('dispatches value test and returns sliced state in subscription', done => {
      store
        .select(state => state.test)
        .pipe(filter(hasKeys))
        .subscribe(data => {
          expect(data).toStrictEqual(action.payload);
          done();
        });

      store.dispatch(action);
    });

    it('dispatches value test and returns general state in subscription', done => {
      store
        .select(state => state)
        .pipe(filter(hasKeys))
        .subscribe(data => {
          expect(data).toStrictEqual({ test: action.payload });
          done();
        });

      store.dispatch(action);
    });
  });

  describe('Store Option', () => {
    it('when not provided throws error', () => {
      const storeError = () => createObservableFromRedux({ useSingleton: true, store: null });

      expect(storeError).toThrowError(/FormStore/);
    });
  });

  describe('Singleton Option', () => {
    it('when "true" returns a singleton object', () => {
      const store1 = createReduxMock(true);
      const store2 = createReduxMock(true);

      expect(store1).toStrictEqual(store2);
    });

    it('when "false" returns different objects', () => {
      const store1 = createReduxMock(false);
      const store2 = createReduxMock(false);

      expect(store1).not.toStrictEqual(store2);
    });
  });
});
