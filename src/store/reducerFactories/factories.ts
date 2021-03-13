import { Reducer } from "redux";
import { isNil, find, filter, forEach, includes, map } from "lodash";
import { replaceInArray } from "util/arrays";
import { mergeWithDefaults } from "util/objects";
import { initialListResponseState, initialDetailResponseState, initialTableState } from "../initialState";
import {
  IReducerFactoryOptions,
  IDetailResponseActionMap,
  IDetailResponseReducerOptions,
  Transformers,
  Transformer,
  IListResponseActionMap,
  IListResponseReducerOptions,
  ITableActionMap,
  ITableDataActionMap,
  ITableReducerOptions
} from "./model";

export const createSimplePayloadReducer = <P, A extends Redux.IAction<P>>(
  actionType: string,
  options: Partial<IReducerFactoryOptions<P>> = { initialState: {} as P, referenceEntity: "entity" }
): Reducer<P, A> => {
  const Options = mergeWithDefaults<IReducerFactoryOptions<P>>(options, {
    referenceEntity: "entity",
    initialState: {} as P
  });
  const reducer: Reducer<P, A> = (state: P = Options.initialState, action: A): P => {
    if (action.type === actionType && !isNil(action.payload)) {
      return action.payload;
    }
    return state;
  };
  return reducer;
};

export const createSimpleBooleanReducer = <A extends Redux.IAction<boolean>>(actionType: string): Reducer<boolean, A> =>
  createSimplePayloadReducer<boolean, A>(actionType, { initialState: false });

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * list of primary keys that indicate that certain behavior is taking place for
 * the models corresponding to the primary keys of the list.  For instance, if
 * we wanted to keep track of the Accounts that are actively being updated, the
 * reducer would handle the state of a list of primary keys corresponding to the
 * Accounts that are being updated.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
export const createModelListActionReducer = <A extends Redux.IAction<Redux.ModelListActionPayload>>(
  actionType: string,
  options: Partial<IReducerFactoryOptions<Redux.ListStore<number>>> = { initialState: [], referenceEntity: "entity" }
): Reducer<Redux.ListStore<number>, A> => {
  const Options = mergeWithDefaults<IReducerFactoryOptions<Redux.ListStore<number>>>(options, {
    referenceEntity: "entity",
    initialState: []
  });
  const reducer: Reducer<Redux.ListStore<number>, A> = (
    state: Redux.ListStore<number> = Options.initialState,
    action: A
  ): Redux.ListStore<number> => {
    let newState = [...state];
    if (action.type === actionType && !isNil(action.payload)) {
      const payload: Redux.ModelListActionPayload = action.payload;
      if (payload.value === true) {
        if (includes(newState, payload.id)) {
          /* eslint-disable no-console */
          console.warn(
            `Inconsistent State!  Inconsistent state noticed when adding ${Options.referenceEntity}
            to action list state... the ${Options.referenceEntity} with ID ${payload.id} already
            exists in the action list state when it is not expected to.`
          );
        } else {
          newState = [...newState, payload.id];
        }
      } else {
        if (!includes(newState, payload.id)) {
          /* eslint-disable no-console */
          console.warn(
            `Inconsistent State!  Inconsistent state noticed when removing ${Options.referenceEntity}
            from action list state... the ${Options.referenceEntity} with ID ${payload.id} does
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

/**
 * A reducer factory that creates a generic reducer to handle the state of the
 * data in a table that is generated from a list response of an API request, where a list
 * response might be the response received from submitting an API request to /entity/.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings            Mappings of the standard actions to the specific actions that
 *                            the reducer should listen for.
 * @param placeholderCreator  A function that returns a placeholder row to be used when
 *                            adding new rows to the table.
 * @param options             Additional options supplied to the reducer factory.
 */
export const createTableDataReducer = <
  /* eslint-disable indent */
  F extends string,
  E extends Table.IRowMeta,
  R extends Table.IRow<F, E>,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  mappings: Partial<ITableDataActionMap>,
  placeholderCreator: () => R,
  options: IReducerFactoryOptions<Redux.ListStore<R>> = { initialState: [], referenceEntity: "entity" }
) => {
  const Options = mergeWithDefaults<IReducerFactoryOptions<Redux.ListStore<R>>>(options, {
    referenceEntity: "entity",
    initialState: []
  });

  const reducer: Reducer<Redux.ListStore<R>, A> = (
    state: Redux.ListStore<R> = Options.initialState || [],
    action: A
  ) => {
    let newState = [...state];

    const transformers: Transformers<ITableDataActionMap, Redux.ListStore<R>, A> = {
      SetData: (payload: R[]) => payload,
      AddPlaceholders: (numRows?: number) => {
        const placeholders: R[] = [];
        const numPlaceholders = numRows || 1;
        for (let i = 0; i < numPlaceholders; i++) {
          placeholders.push(placeholderCreator());
        }
        return [...newState, ...placeholders];
      },
      ActivatePlaceholder: (payload: Table.IActivatePlaceholderPayload) => {
        const row: R | undefined = find(newState, { id: payload.oldId } as any);
        if (isNil(row)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when activating ${Options.referenceEntity} placeholder row in state...
            the ${Options.referenceEntity} row with ID ${payload.oldId} does not exist in state when it is expected to.`
          );
          return newState;
        } else {
          return replaceInArray<R>(
            newState,
            { id: payload.oldId },
            { ...row, id: payload.id, meta: { ...row.meta, isPlaceholder: false } }
          );
        }
      },
      UpdateRow: (payload: { id: number; data: Partial<R> }) => {
        const row: R | undefined = find(newState, { id: payload.id } as any);
        if (isNil(row)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when updating ${Options.referenceEntity} row in state...
              the ${Options.referenceEntity} row with ID ${payload.id} does not exist in state when it is expected to.`
          );
          return newState;
        } else {
          return replaceInArray<R>(newState, { id: payload.id }, { ...row, ...payload.data });
        }
      },
      RemoveRow: (payload: { id: number }) => {
        const row = find(newState, { id: payload.id });
        if (isNil(row)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when removing ${Options.referenceEntity} row from state...
          the ${Options.referenceEntity} row with ID ${payload.id} does not exist in state when it is expected to.`
          );
          return newState;
        } else {
          return filter(newState, (r: R) => r.id !== payload.id);
        }
      },
      SelectRow: (id: any) => {
        const row = find(newState, { id });
        if (isNil(row)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when selecting ${Options.referenceEntity} row in state...
          the ${Options.referenceEntity} row with ID ${id} does not exist in state when it is expected to.`
          );
          return newState;
        } else if (row.meta.selected === true) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when selecting ${Options.referenceEntity} row in state...
          the ${Options.referenceEntity} row with ID ${id} is already selected when it is not expected to be.`
          );
          return newState;
        } else {
          return replaceInArray<R>(newState, { id }, { ...row, meta: { ...row.meta, selected: true } });
        }
      },
      DeselectRow: (id: any) => {
        const row = find(newState, { id });
        if (isNil(row)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when deselecting ${Options.referenceEntity} row in state...
          the ${Options.referenceEntity} row with ID ${id} does not exist in state when it is expected to.`
          );
          return newState;
        } else if (row.meta.selected === false) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when deselecting ${Options.referenceEntity} row in state...
          the ${Options.referenceEntity} row with ID ${id} is already deselected when it is not expected to be.`
          );
          return newState;
        } else {
          return replaceInArray<R>(newState, { id }, { ...row, meta: { ...row.meta, selected: false } });
        }
      },
      SelectAllRows: () => {
        const selected = filter(newState, (row: R) => row.meta.selected === true);
        if (selected.length === newState.length) {
          return map(newState, (row: R) => ({ ...row, meta: { ...row.meta, selected: false } }));
        } else {
          return map(newState, (row: R) => ({ ...row, meta: { ...row.meta, selected: true } }));
        }
      },
      AddErrors: (payload: Table.ICellError | Table.ICellError[]) => {
        const updateStateWithError = (st: Redux.ListStore<R>, e: Table.ICellError): Redux.ListStore<R> => {
          const row = find(newState, { id: e.id }) as R;
          if (isNil(row)) {
            /* eslint-disable no-console */
            console.error(
              `Inconsistent State!:  Inconsistent state noticed when adding error to ${Options.referenceEntity} table...
          the ${Options.referenceEntity} row with ID ${e.id} does not exist in state when it is expected to.`
            );
            return newState;
            // Ideally - we should improve the typecasting on the fields that comprise the sub account
            // and account rows so we do not have to do `as keyof R` here.
          } else if (isNil(row[e.field as keyof R])) {
            /* eslint-disable no-console */
            console.error(
              `Inconsistent State!:  Inconsistent state noticed when adding error to ${Options.referenceEntity} table...
            the ${Options.referenceEntity} cell with field ${e.field} does not exist in state when it is expected to.`
            );
            return newState;
          } else {
            return replaceInArray<R>(
              newState,
              { id: e.id },
              { ...row, meta: { ...row.meta, errors: [...row.meta.errors, e] } }
            );
          }
        };
        if (Array.isArray(payload)) {
          for (let i = 0; i < payload.length; i++) {
            newState = updateStateWithError(newState, payload[i]);
          }
        } else {
          newState = updateStateWithError(newState, payload);
        }
        return newState;
      }
    };

    // Find the standardized action type.
    let standardizedActionType: string | undefined = undefined;
    forEach(mappings, (value: string | undefined | Transformer<Redux.ListStore<R>, A>, standard: string) => {
      if (value !== undefined && value === action.type) {
        standardizedActionType = standard;
        return false;
      }
    });

    if (!isNil(standardizedActionType)) {
      const transformer: Transformer<Redux.ListStore<R>, A> = transformers[standardizedActionType];
      newState = transformer(action.payload, newState, action);
    }

    return newState;
  };
  return reducer;
};

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * table that is generated from a list response of an API request, where a list
 * response might be the response received from submitting an API request to /entity/.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings            Mappings of the standard actions to the specific actions that
 *                            the reducer should listen for.
 * @param placeholderCreator  A function that returns a placeholder row to be used when
 *                            adding new rows to the table.
 * @param modelToRow          A function that converts an entity of the list response
 *                            to a row in the table.
 * @param options             Additional options supplied to the reducer factory.
 */
export const createTableReducer = <
  /* eslint-disable indent */
  F extends string,
  E extends Table.IRowMeta,
  R extends Table.IRow<F, E>,
  M extends Model,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  /* eslint-disable indent */
  mappings: ITableActionMap,
  placeholderCreator: () => R,
  modelToRow: (model: M) => R,
  options: Partial<ITableReducerOptions<F, E, R, M>> = { initialState: initialTableState, referenceEntity: "entity" }
) => {
  const Options: ITableReducerOptions<F, E, R, M> = mergeWithDefaults(options, {
    referenceEntity: "entity",
    initialState: initialTableState
  });

  const dataReducer = createTableDataReducer<F, E, R, A>(
    {
      AddPlaceholders: mappings.AddPlaceholders,
      RemoveRow: mappings.RemoveRow,
      UpdateRow: mappings.UpdateRow,
      ActivatePlaceholder: mappings.ActivatePlaceholder,
      SelectRow: mappings.SelectRow,
      DeselectRow: mappings.DeselectRow,
      SelectAllRows: mappings.SelectAllRows,
      AddErrors: mappings.AddErrors
    },
    placeholderCreator,
    { referenceEntity: Options.referenceEntity as string, initialState: Options.initialState.data }
  );

  const reducer: Reducer<Redux.ITableStore<F, E, R, M>, A> = (
    state: Redux.ITableStore<F, E, R, M> = Options.initialState as Redux.ITableStore<F, E, R, M>,
    action: A
  ) => {
    let newState = { ...state };

    // First, we use the reducer that just maintains the table's rows to update
    // the table data.
    newState = { ...newState, data: dataReducer(newState.data, action) };

    const transformers: Transformers<ITableActionMap, Redux.ITableStore<F, E, R, M>, A> = {
      SetSearch: (search: string) => ({ search }),
      Loading: (loading: boolean) => ({ loading }),
      Request: () => ({ rawData: [], data: [], responseWasReceived: false }),
      Response: (response: Http.IListResponse<M>) => {
        return {
          data: map(response.data, (model: M) => modelToRow(model)),
          rawData: response.data,
          responseWasReceived: true
        };
      }
    };

    // Find the standardized action type.
    let standardizedActionType: string | undefined = undefined;
    forEach(mappings, (value: string | undefined | Transformer<Redux.ITableStore<F, E, R, M>, A>, standard: string) => {
      if (value !== undefined && value === action.type) {
        standardizedActionType = standard;
        return false;
      }
    });

    if (!isNil(standardizedActionType)) {
      const transformer: Transformer<Redux.ITableStore<F, E, R, M>, A> = transformers[standardizedActionType];
      if (!isNil(transformer)) {
        const updateToState = transformer(action.payload, newState, action);
        newState = { ...newState, ...updateToState };
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
  options: Partial<IDetailResponseReducerOptions<M, S, A>> = {
    initialState: initialDetailResponseState as S,
    referenceEntity: "entity"
  }
): Reducer<S, A> => {
  const Options = mergeWithDefaults<IDetailResponseReducerOptions<M, S, A>>(options, {
    extensions: {},
    initialState: initialDetailResponseState as S,
    excludeActionsFromExtensions: true,
    referenceEntity: "entity"
  });

  const transformers: Transformers<IDetailResponseActionMap, S, A> = {
    Response: (payload: M) => ({ data: payload, responseWasReceived: true }),
    Loading: (payload: boolean) => ({ loading: payload }),
    RemoveFromState: (payload?: null | undefined) => ({ data: undefined }),
    UpdateInState: (payload: M) => ({ data: payload }),
    Request: (payload: any) => ({ responseWasReceived: false })
  };

  const reducer: Reducer<S, A> = (state: S = Options.initialState as S, action: A): S => {
    let newState = { ...state };

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
      if (isNil(Options.excludeActions) || Options.excludeActions(action, state) === false) {
        const transformer: Transformer<S, A> | undefined = transformers[standardizedActionType];
        if (!isNil(transformer)) {
          const updateToState = transformer(action.payload, newState, action);
          newState = { ...newState, ...updateToState };
        }
      }
    } else {
      // The extension transformers are allowed to be included to allow the scope
      // of this generic reducer to be expanded, without requiring a new reducer.
      if (!isNil(Options.extensions) && !isNil(Options.extensions[action.type])) {
        if (
          isNil(Options.excludeActions) ||
          Options.excludeActionsFromExtensions !== true ||
          Options.excludeActions(action, state) === false
        ) {
          const updateToState = Options.extensions[action.type](action.payload, newState, action);
          newState = { ...newState, ...updateToState };
        }
      }
    }

    return newState;
  };
  return reducer;
};

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * list response, where a list response might be the response received from
 * submitting an API request to /entity/.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
export const createListResponseReducer = <
  M extends Model,
  S extends Redux.IListResponseStore<M> = Redux.IListResponseStore<M>,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  /* eslint-disable indent */
  mappings: Partial<IListResponseActionMap>,
  options: Partial<IListResponseReducerOptions<M, S, A>> = {
    initialState: initialListResponseState as S,
    referenceEntity: "entity"
  }
): Reducer<S, A> => {
  const Options = mergeWithDefaults<IListResponseReducerOptions<M, S, A>>(options, {
    referenceEntity: "entity",
    extensions: {},
    keyReducers: {},
    initialState: initialListResponseState as S,
    excludeActionsFromExtensions: true
  });

  const reducer: Reducer<S, A> = (state: S = Options.initialState, action: A): S => {
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
            `Inconsistent State!:  Inconsistent state noticed when adding ${Options.referenceEntity} to state...
            the ${Options.referenceEntity} with ID ${payload.id} already exists in state when it is not expected to.`
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
            `Inconsistent State!:  Inconsistent state noticed when removing ${Options.referenceEntity} from state...
            the ${Options.referenceEntity} with ID ${payload} does not exist in state when it is expected to.`
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
      UpdateInState: (payload: Redux.UpdateModelActionPayload<M>, st: S) => {
        const existing: M | undefined = find(st.data, { id: payload.id } as any);
        // TODO: If the entity does not exist in the state when updating, should
        // we auto add it?
        if (isNil(existing)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when updating ${Options.referenceEntity} in state...
            the ${Options.referenceEntity} with ID ${payload.id} does not exist in state when it is expected to.`
          );
          return {};
        }
        const { id: _, ...withoutId } = payload.data;
        return { data: replaceInArray<M>(st.data, { id: payload.id }, { ...existing, ...withoutId }) };
      },
      Select: (payload: number[], st: S) => {
        const selected: number[] = [];
        forEach(payload, (id: number) => {
          const element = find(state.data, { id });
          if (!isNil(element)) {
            selected.push(id);
          } else {
            /* eslint-disable no-console */
            console.error(`Inconsistent State!: Selected ${Options.referenceEntity} with ID ${id} not in state!`);
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
      if (isNil(Options.excludeActions) || Options.excludeActions(action, state) === false) {
        const transformer: Transformer<S, A> | undefined = transformers[standardizedActionType];
        if (!isNil(transformer)) {
          const updateToState = transformer(action.payload, newState, action);
          newState = { ...newState, ...updateToState };
        }
      }
    } else {
      // The extension transformers are allowed to be included to allow the scope
      // of this generic reducer to be expanded, without requiring a new reducer.
      if (!isNil(Options.extensions) && !isNil(Options.extensions[action.type])) {
        if (
          isNil(Options.excludeActions) ||
          Options.excludeActionsFromExtensions !== true ||
          Options.excludeActions(action, state) === false
        ) {
          const updateToState = Options.extensions[action.type](action.payload, newState, action);
          newState = { ...newState, ...updateToState };
        }
      }
      if (!isNil(Options.keyReducers)) {
        const subReducers: { [key: string]: Reducer<any, A> } = Options.keyReducers;
        forEach(Object.keys(Options.keyReducers), (key: string) => {
          if (!isNil(newState[key as keyof S])) {
            const red: Reducer<any, A> = subReducers[key];
            newState = { ...newState, [key]: red(newState[key as keyof S], action) };
          }
        });
      }
    }
    if (!isNil(Options.listReducer)) {
      const listReducer: Reducer<M[], A> = Options.listReducer;
      newState = { ...newState, data: listReducer(newState.data, action) };
    }
    if (!isNil(Options.itemReducer)) {
      const itemReducer: Reducer<M, A> = Options.itemReducer;
      newState = { ...newState, data: map(newState.data, (item: M) => itemReducer(item, action)) };
    }
    if (!isNil(Options.extension)) {
      newState = Options.extension(newState, action);
    }
    return newState;
  };
  return reducer;
};
