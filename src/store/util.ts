import { AnyAction, Reducer } from "redux";
import { isNil, find, filter, forEach, includes, map } from "lodash";
import { replaceInArray } from "util/arrays";
import { mergeWithDefaults } from "util/objects";
import { initialListResponseState, initialDetailResponseState } from "./initialState";

/**
 * Function to sequentially apply a series of simple reducers of form
 * (state, action) => newState into a larger reducer.
 *
 * This is useful in allowing users to cleanly write reducers for specific
 * action types without needing a giant switch statement.
 */
export const composeReducers = <A extends AnyAction = AnyAction>(initialState: any, ...args: any) => {
  const withIdentity: Reducer<any, A>[] = [(x: any) => x].concat(args);
  const composed = (prevState: any = initialState, action: A) =>
    withIdentity.reduce(
      (state: any, reducer: Reducer<any, A>) => Object.assign(initialState, state, reducer(prevState, action)),
      {}
    );
  return composed;
};

export interface IModelListActionReducerOptions {
  referenceEntity?: string;
}

export const createModelListActionReducer = <A extends Redux.IAction<Redux.ModelListActionPayload>>(
  actionType: string,
  options: IModelListActionReducerOptions = {}
): Reducer<Redux.ListStore<number>, A> => {
  options = mergeWithDefaults(options, {
    referenceEntity: "entity"
  });
  const reducer: Reducer<Redux.ListStore<number>, A> = (
    state: Redux.ListStore<number> = [],
    action: A
  ): Redux.ListStore<number> => {
    let newState = [...state];
    if (action.type === actionType && !isNil(action.payload)) {
      const payload: Redux.ModelListActionPayload = action.payload;
      if (payload.value === true) {
        if (includes(newState, payload.id)) {
          /* eslint-disable no-console */
          console.warn(
            `Inconsistent State!  Inconsistent state noticed when adding ${options.referenceEntity}
            to action list state... the ${options.referenceEntity} with ID ${payload.id} already
            exists in the action list state when it is not expected to.`
          );
        } else {
          newState = [...newState, payload.id];
        }
      } else {
        if (!includes(newState, payload.id)) {
          /* eslint-disable no-console */
          console.warn(
            `Inconsistent State!  Inconsistent state noticed when removing ${options.referenceEntity}
            from action list state... the ${options.referenceEntity} with ID ${payload.id} does
            not exist in the action list state when it is expected to.`
          );
        } else {
          newState = filter(newState, (id: number) => id !== payload.id);
        }
      }
    }
    return newState;
  };
  return reducer;
};

export type Transformer<S, A extends Redux.IAction<any>> = (payload: any, st: S, action: A) => any;

export type Transformers<O, S, A extends Redux.IAction<any>> = Record<keyof O, Transformer<S, A>>;

export type TransformerExtensions<S, A extends Redux.IAction<any>> = Record<string, Transformer<S, A>>;

export interface IDetailResponseActionMap {
  Loading: string;
  Response: string;
  Request: string;
  RemoveFromState: string;
  UpdateInState: string;
}

export interface IDetailResponseReducerOptions<
  M extends Model,
  S extends Redux.IDetailResponseStore<M> = Redux.IDetailResponseStore<M>,
  A extends Redux.IAction<any> = Redux.IAction<any>
> {
  initialState?: S;
  excludeActions?: (action: A, state: S) => boolean | undefined | void;
  excludeActionsFromExtensions?: boolean;
  extensions?: TransformerExtensions<S, A>;
}

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * detail response, where a detail response might be the response received from
 * submitting an API request to /entity/<pk>.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
export const createDetailResponseReducer = <
  M extends Model,
  S extends Redux.IDetailResponseStore<M> = Redux.IDetailResponseStore<M>,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  /* eslint-disable indent */
  mappings: Partial<IDetailResponseActionMap>,
  options: IDetailResponseReducerOptions<M, S, A> = {}
): Reducer<S, A> => {
  options = mergeWithDefaults(options, {
    extensions: {},
    initialState: initialDetailResponseState,
    excludeActionsFromExtensions: true
  });

  const reducer: Reducer<S, A> = (state: S = options.initialState as S, action: A): S => {
    let newState = { ...state };

    const transformers: Transformers<IDetailResponseActionMap, S, A> = {
      Response: (payload: M) => ({ data: payload, responseWasReceived: true }),
      Loading: (payload: boolean) => ({ loading: payload }),
      RemoveFromState: (payload?: null | undefined) => ({ data: undefined }),
      UpdateInState: (payload: M) => ({ data: payload }),
      Request: (payload: any) => ({ responseWasReceived: false })
    };

    // Find the standardized action type.
    let standardizedActionType: string | undefined = undefined;
    forEach(mappings, (value: string | undefined, standard: string) => {
      if (value !== undefined && value === action.type) {
        standardizedActionType = standard;
        return false;
      }
    });

    if (!isNil(standardizedActionType)) {
      // If the action is being filtered out of the reducer, do not update the state.
      if (isNil(options.excludeActions) || options.excludeActions(action, state) === false) {
        const transformer: Transformer<S, A> = transformers[standardizedActionType];
        const updateToState = transformer(action.payload, newState, action);
        newState = { ...newState, ...updateToState };
      }
    } else {
      // The extension transformers are allowed to be included to allow the scope
      // of this generic reducer to be expanded, without requiring a new reducer.
      if (!isNil(options.extensions) && !isNil(options.extensions[action.type])) {
        if (
          isNil(options.excludeActions) ||
          options.excludeActionsFromExtensions !== true ||
          options.excludeActions(action, state) === false
        ) {
          const updateToState = options.extensions[action.type](action.payload, newState, action);
          newState = { ...newState, ...updateToState };
        }
      }
    }

    return newState;
  };
  return reducer;
};

export interface IListResponseActionMap {
  SetSearch: string;
  Loading: string;
  Response: string;
  SetPage: string;
  SetPageSize: string;
  SetPageAndSize: string;
  AddToState: string;
  RemoveFromState: string;
  UpdateInState: string;
  Select: string;
  Request: string;
}

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * list response, where a list response might be the response received from
 * submitting an API request to /entity/ (i.e. a list of results).
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
export interface IListResponseReducerOptions<
  M extends Model,
  S extends Redux.IListResponseStore<M> = Redux.IListResponseStore<M>,
  A extends Redux.IAction<any> = Redux.IAction<any>
> {
  referenceEntity?: string;
  initialState?: S;
  excludeActions?: (action: A, state: S) => boolean | undefined | void;
  excludeActionsFromExtensions?: boolean;
  extensions?: TransformerExtensions<S, A>;
  listReducer?: Reducer<M[], A>;
  itemReducer?: Reducer<M, A>;
  extension?: Reducer<S, A>;
}

export const createListResponseReducer = <
  M extends Model,
  S extends Redux.IListResponseStore<M> = Redux.IListResponseStore<M>,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  /* eslint-disable indent */
  mappings: Partial<IListResponseActionMap>,
  options: IListResponseReducerOptions<M, S, A> = {}
): Reducer<S, A> => {
  options = mergeWithDefaults(options, {
    referenceEntity: "entity",
    extensions: {},
    initialState: initialListResponseState,
    excludeActionsFromExtensions: true
  });

  const reducer: Reducer<S, A> = (state: S = options.initialState as S, action: A): S => {
    let newState = { ...state };

    const transformers: Transformers<IListResponseActionMap, S, A> = {
      // We have to reset the page to it's initial state otherwise we run the risk
      // of a 404 with the API request due to the page not being found.
      SetSearch: (payload: string) => ({ page: 1, search: payload }),
      Response: (payload: Http.IListResponse<M>) => ({
        data: payload.data,
        count: payload.count,
        selected: [],
        responseWasReceived: true
      }),
      Request: (payload: any) => ({ responseWasReceived: false }),
      Loading: (payload: boolean) => ({ loading: payload }),
      SetPage: (payload: number) => ({ page: payload, selected: [] }),
      SetPageSize: (payload: number) => ({ pageSize: payload }),
      SetPageAndSize: (payload: { pageSize: number; page: number }) => ({ ...payload }),
      AddToState: (payload: M, st: S) => {
        const existing = find(st.data, { id: payload.id });
        if (!isNil(existing)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when adding ${options.referenceEntity} to state...
            the ${options.referenceEntity} with ID ${payload.id} already exists in state when it is not expected to.`
          );
          return {};
        } else {
          let pageSize = st.pageSize;
          if (st.data.length + 1 >= st.pageSize) {
            pageSize = st.pageSize + 1;
          }
          return { data: [...st.data, payload], count: st.count + 1, pageSize };
        }
      },
      RemoveFromState: (payload: number, st: S) => {
        const existing = find(st.data, { id: payload });
        if (isNil(existing)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when removing ${options.referenceEntity} from state...
            the ${options.referenceEntity} with ID ${payload} does not exist in state when it is expected to.`
          );
          return {};
        } else {
          const partial = {
            data: filter(st.data, (entity: M) => entity.id !== payload),
            count: st.count - 1,
            selected: st.selected
          };
          // Also remove the document from the selected documents.
          if (includes(st.selected, payload)) {
            partial.selected = filter(st.selected, (id: number) => id !== payload);
          }
          return partial;
        }
      },
      UpdateInState: (payload: M, st: S) => {
        const existing = find(st.data, { id: payload.id });
        // TODO: If the entity does not exist in the state when updating, should
        // we auto add it?
        if (isNil(existing)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when updating ${options.referenceEntity} in state...
            the ${options.referenceEntity} with ID ${payload.id} does not exist in state when it is expected to.`
          );
          return {};
        }
        return { data: replaceInArray<M>(st.data, { id: payload.id }, payload) };
      },
      Select: (payload: number[], st: S) => {
        const selected: number[] = [];
        forEach(payload, (id: number) => {
          const element = find(state.data, { id });
          if (!isNil(element)) {
            selected.push(id);
          } else {
            /* eslint-disable no-console */
            console.error(`Inconsistent State!: Selected ${options.referenceEntity} with ID ${id} not in state!`);
          }
        });
        return { selected };
      }
    };

    // Find the standardized action type.
    let standardizedActionType: string | undefined = undefined;
    forEach(mappings, (value: string | undefined | Transformer<S, A>, standard: string) => {
      if (value !== undefined && value === action.type) {
        standardizedActionType = standard;
        return false;
      }
    });

    if (!isNil(standardizedActionType)) {
      // If the action is being filtered out of the reducer, do not update the state.
      if (isNil(options.excludeActions) || options.excludeActions(action, state) === false) {
        const transformer: Transformer<S, A> = transformers[standardizedActionType];
        const updateToState = transformer(action.payload, newState, action);
        newState = { ...newState, ...updateToState };
      }
    } else {
      // The extension transformers are allowed to be included to allow the scope
      // of this generic reducer to be expanded, without requiring a new reducer.
      if (!isNil(options.extensions) && !isNil(options.extensions[action.type])) {
        if (
          isNil(options.excludeActions) ||
          options.excludeActionsFromExtensions !== true ||
          options.excludeActions(action, state) === false
        ) {
          const updateToState = options.extensions[action.type](action.payload, newState, action);
          newState = { ...newState, ...updateToState };
        }
      }
    }
    if (!isNil(options.listReducer)) {
      const listReducer: Reducer<M[], A> = options.listReducer;
      newState = { ...newState, data: listReducer(newState.data, action) };
    }
    if (!isNil(options.itemReducer)) {
      const itemReducer: Reducer<M, A> = options.itemReducer;
      newState = { ...newState, data: map(newState.data, (item: M) => itemReducer(item, action)) };
    }
    if (!isNil(options.extension)) {
      newState = options.extension(newState, action);
    }
    return newState;
  };
  return reducer;
};
