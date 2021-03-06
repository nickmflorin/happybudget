import { Reducer } from "redux";
import { isNil, find, filter, forEach, includes, map } from "lodash";
import { replaceInArray } from "util/arrays";
import { mergeWithDefaults } from "util/objects";
import { initialListResponseState, initialDetailResponseState } from "../initialState";

import {
  IReducerFactoryOptions,
  IDetailResponseActionMap,
  IDetailResponseReducerOptions,
  Transformers,
  Transformer,
  IListResponseActionMap,
  IListResponseReducerOptions,
  ITableActionMap,
  TableRowModel
} from "./model";

export const createSimpleBooleanReducer = <A extends Redux.IAction<boolean>>(
  actionType: string
): Reducer<boolean, A> => {
  const reducer: Reducer<boolean, A> = (state: boolean = false, action: A): boolean => {
    if (action.type === actionType && !isNil(action.payload)) {
      return action.payload;
    }
    return state;
  };
  return reducer;
};

export const createModelListActionReducer = <A extends Redux.IAction<Redux.ModelListActionPayload>>(
  actionType: string,
  options: IReducerFactoryOptions = {}
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

export const createTableReducer = <R extends TableRowModel, A extends Redux.IAction<any>>(
  mappings: ITableActionMap,
  placeholderCreator: () => R,
  options: IReducerFactoryOptions = {}
) => {
  options = mergeWithDefaults(options, {
    referenceEntity: "entity"
  });

  const reducer: Reducer<Redux.ListStore<R>, A> = (state: Redux.ListStore<R> = [], action: A) => {
    let newState = [...state];
    if (action.type === mappings.SetData) {
      return action.payload;
    } else if (action.type === mappings.AddRow) {
      newState = [...newState, placeholderCreator()];
    } else if (action.type === mappings.UpdateRow || action.type === mappings.UpdateRowInStateOnly) {
      const existing = find(newState, { id: action.payload.id });
      if (isNil(existing)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating ${options.referenceEntity} in state...
        the ${options.referenceEntity} with ID ${action.payload.id} does not exist in state when it is expected to.`
        );
      } else {
        newState = replaceInArray<R>(newState, { id: action.payload.id }, { ...existing, ...action.payload.payload });
      }
    } else if (action.type === mappings.RemoveRow) {
      const existing = find(newState, { id: action.payload.id });
      if (isNil(existing)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when removing ${options.referenceEntity} from state...
          the ${options.referenceEntity} with ID ${action.payload.id} does not exist in state when it is expected to.`
        );
      } else {
        newState = filter(newState, (row: R) => row.id !== action.payload.id);
      }
    } else if (action.type === mappings.SelectRow) {
      const existing = find(newState, { id: action.payload });
      if (isNil(existing)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when selecting ${options.referenceEntity} in state...
          the ${options.referenceEntity} with ID ${action.payload} does not exist in state when it is expected to.`
        );
      } else if (existing.selected === true) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when selecting ${options.referenceEntity} in state...
          the ${options.referenceEntity} with ID ${action.payload} is already selected when it is not expected to be.`
        );
      } else {
        newState = replaceInArray<R>(newState, { id: action.payload }, { ...existing, selected: true });
      }
    } else if (action.type === mappings.DeselectRow) {
      const existing = find(newState, { id: action.payload });
      if (isNil(existing)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when deselecting ${options.referenceEntity} in state...
          the ${options.referenceEntity} with ID ${action.payload} does not exist in state when it is expected to.`
        );
      } else if (existing.selected === false) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when deselecting ${options.referenceEntity} in state...
          the ${options.referenceEntity} with ID ${action.payload} is already deselected when it is not expected to be.`
        );
      } else {
        newState = replaceInArray<R>(newState, { id: action.payload }, { ...existing, selected: false });
      }
    } else if (action.type === mappings.SelectAllRows) {
      const selected = filter(newState, (row: R) => row.selected === true);
      if (selected.length === newState.length) {
        newState = map(newState, (row: R) => ({ ...row, selected: false }));
      } else {
        newState = map(newState, (row: R) => ({ ...row, selected: true }));
      }
    }
    return newState;
  };
  return reducer;
};

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
    excludeActionsFromExtensions: true,
    referenceEntity: "entity"
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
