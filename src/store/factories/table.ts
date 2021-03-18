import { Reducer } from "redux";
import { isNil, forEach, find, filter, map } from "lodash";
import { replaceInArray } from "util/arrays";
import { mergeWithDefaults } from "util/objects";
import { initialTableState } from "store/initialState";
import { createListReducerFromTransformers } from "./util";

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
  mappings: Partial<ReducerFactory.ITableDataActionMap>,
  placeholderCreator: () => R,
  options: ReducerFactory.IOptions<Redux.ListStore<R>> = { initialState: [], referenceEntity: "entity" }
) => {
  const Options = mergeWithDefaults<ReducerFactory.IOptions<Redux.ListStore<R>>>(options, {
    referenceEntity: "entity",
    initialState: []
  });

  const transformers: ReducerFactory.Transformers<ReducerFactory.ITableDataActionMap, Redux.ListStore<R>, A> = {
    SetData: (payload: R[]) => payload,
    AddPlaceholders: (numRows: number, st: Redux.ListStore<R>) => {
      const placeholders: R[] = [];
      const numPlaceholders = numRows || 1;
      for (let i = 0; i < numPlaceholders; i++) {
        placeholders.push(placeholderCreator());
      }
      return [...st, ...placeholders];
    },
    ActivatePlaceholder: (payload: Table.IActivatePlaceholderPayload, st: Redux.ListStore<R>) => {
      const row: R | undefined = find(st, { id: payload.oldId } as any);
      if (isNil(row)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when activating ${Options.referenceEntity} placeholder row in state...
         the ${Options.referenceEntity} row with ID ${payload.oldId} does not exist in state when it is expected to.`
        );
        return st;
      } else {
        return replaceInArray<R>(
          st,
          { id: payload.oldId },
          { ...row, id: payload.id, meta: { ...row.meta, isPlaceholder: false } }
        );
      }
    },
    UpdateRow: (payload: { id: number; data: Partial<R> }, st: Redux.ListStore<R>) => {
      const row: R | undefined = find(st, { id: payload.id } as any);
      if (isNil(row)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating ${Options.referenceEntity} row in state...
           the ${Options.referenceEntity} row with ID ${payload.id} does not exist in state when it is expected to.`
        );
        return st;
      } else {
        return replaceInArray<R>(st, { id: payload.id }, { ...row, ...payload.data });
      }
    },
    RemoveRow: (id: number, st: Redux.ListStore<R>) => {
      const row = find(st, { id });
      if (isNil(row)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when removing ${Options.referenceEntity} row from state...
       the ${Options.referenceEntity} row with ID ${id} does not exist in state when it is expected to.`
        );
        return st;
      } else {
        return filter(st, (r: R) => r.id !== id);
      }
    },
    SelectRow: (id: number, st: Redux.ListStore<R>) => {
      const row = find(st, { id } as any);
      if (isNil(row)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when selecting ${Options.referenceEntity} row in state...
       the ${Options.referenceEntity} row with ID ${id} does not exist in state when it is expected to.`
        );
        return st;
      } else if (row.meta.selected === true) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when selecting ${Options.referenceEntity} row in state...
       the ${Options.referenceEntity} row with ID ${id} is already selected when it is not expected to be.`
        );
        return st;
      } else {
        return replaceInArray<R>(st, { id }, { ...row, meta: { ...row.meta, selected: true } });
      }
    },
    DeselectRow: (id: number, st: Redux.ListStore<R>) => {
      const row = find(st, { id } as any);
      if (isNil(row)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when deselecting ${Options.referenceEntity} row in state...
       the ${Options.referenceEntity} row with ID ${id} does not exist in state when it is expected to.`
        );
        return st;
      } else if (row.meta.selected === false) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when deselecting ${Options.referenceEntity} row in state...
       the ${Options.referenceEntity} row with ID ${id} is already deselected when it is not expected to be.`
        );
        return st;
      } else {
        return replaceInArray<R>(st, { id }, { ...row, meta: { ...row.meta, selected: false } });
      }
    },
    SelectAllRows: (payload: undefined, st: Redux.ListStore<R>) => {
      const selected = filter(st, (row: R) => row.meta.selected === true);
      if (selected.length === st.length) {
        return map(st, (row: R) => ({ ...row, meta: { ...row.meta, selected: false } }));
      } else {
        return map(st, (row: R) => ({ ...row, meta: { ...row.meta, selected: true } }));
      }
    },
    AddErrors: (payload: Table.ICellError | Table.ICellError[], state: Redux.ListStore<R>) => {
      const updateStateWithError = (st: Redux.ListStore<R>, e: Table.ICellError): Redux.ListStore<R> => {
        const row = find(state, { id: e.id }) as R;
        if (isNil(row)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when adding error to ${Options.referenceEntity} table...
       the ${Options.referenceEntity} row with ID ${e.id} does not exist in state when it is expected to.`
          );
          return state;
          // Ideally - we should improve the typecasting on the fields that comprise the sub account
          // and account rows so we do not have to do `as keyof R` here.
        } else if (isNil(row[e.field as keyof R])) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when adding error to ${Options.referenceEntity} table...
         the ${Options.referenceEntity} cell with field ${e.field} does not exist in state when it is expected to.`
          );
          return state;
        } else {
          return replaceInArray<R>(
            state,
            { id: e.id },
            { ...row, meta: { ...row.meta, errors: [...row.meta.errors, e] } }
          );
        }
      };
      if (Array.isArray(payload)) {
        for (let i = 0; i < payload.length; i++) {
          state = updateStateWithError(state, payload[i]);
        }
      } else {
        state = updateStateWithError(state, payload);
      }
      return state;
    }
  };

  return createListReducerFromTransformers<ReducerFactory.ITableDataActionMap, R, A>(mappings, transformers, Options);
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
  mappings: ReducerFactory.ITableActionMap,
  placeholderCreator: () => R,
  modelToRow: (model: M) => R,
  options: Partial<ReducerFactory.ITableReducerOptions<F, E, R, M>> = {
    initialState: initialTableState,
    referenceEntity: "entity"
  }
) => {
  const Options: ReducerFactory.ITableReducerOptions<F, E, R, M> = mergeWithDefaults(options, {
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
    const transformers: ReducerFactory.Transformers<
      ReducerFactory.ITableActionMap,
      Redux.ITableStore<F, E, R, M>,
      A
    > = {
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
      const transformer: ReducerFactory.Transformer<Redux.ITableStore<F, E, R, M>, A> | undefined =
        transformers[standardizedActionType];
      if (!isNil(transformer)) {
        const updateToState = transformer(action.payload, newState, action);
        newState = { ...newState, ...updateToState };
      }
    }

    return newState;
  };

  return reducer;
};