import { isNil, find, filter, map } from "lodash";
import { replaceInArray } from "util/arrays";
import { mergeWithDefaults } from "util/objects";
import { createListReducerFromTransformers } from "./util";
import Mapping from "model/tableMappings";

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
  R extends Table.Row<G, C>,
  M extends Model,
  P extends Http.IPayload,
  C extends Table.RowChild = Table.RowChild,
  G extends Table.RowGroup = Table.RowGroup,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  mappings: Partial<ReducerFactory.ITableActionMap>,
  mapping: Mapping<R, M, P, C, G>,
  options: Partial<ReducerFactory.IOptions<Redux.ListStore<R>>> = { initialState: [], referenceEntity: "entity" }
) => {
  const Options = mergeWithDefaults<ReducerFactory.IOptions<Redux.ListStore<R>>>(options, {
    referenceEntity: "entity",
    initialState: []
  });

  const transformers: ReducerFactory.Transformers<ReducerFactory.ITableActionMap, Redux.ListStore<R>, A> = {
    ClearData: () => [],
    SetData: (response: Http.IListResponse<M>) => map(response.data, (model: M) => mapping.modelToRow(model)),
    AddPlaceholders: (numRows: number, st: Redux.ListStore<R>) => {
      const placeholders: R[] = [];
      const numPlaceholders = numRows || 1;
      for (let i = 0; i < numPlaceholders; i++) {
        placeholders.push(mapping.createPlaceholder());
      }
      return [...st, ...placeholders];
    },
    ActivatePlaceholder: (payload: Table.ActivatePlaceholderPayload<M>, st: Redux.ListStore<R>) => {
      const row: R | undefined = find(st, { id: payload.id } as any);
      if (isNil(row)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when activating ${Options.referenceEntity}
          placeholder row in state... the ${Options.referenceEntity} row with ID ${payload.id} does
          not exist in state when it is expected to.`
        );
        return st;
      } else {
        return replaceInArray<R>(st, { id: payload.id }, { ...row, ...mapping.modelToRow(payload.model) });
      }
    },
    UpdateInState: (payload: M, st: Redux.ListStore<R>) => {
      const row: R | undefined = find(st, { id: payload.id } as any);
      if (isNil(row)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating ${Options.referenceEntity} in state...
           the ${Options.referenceEntity} row with ID ${payload.id} does not exist in state when it is expected to.`
        );
        return st;
      } else {
        const modelRow: R = mapping.modelToRow(payload);
        return replaceInArray<R>(
          st,
          { id: payload.id },
          { ...row, ...modelRow, meta: { ...row.meta, ...modelRow.meta } }
        );
      }
    },
    UpdateRow: (payload: Redux.UpdateModelActionPayload<R>, st: Redux.ListStore<R>) => {
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
    AddErrors: (payload: Table.CellError | Table.CellError[], state: Redux.ListStore<R>) => {
      const updateStateWithError = (st: Redux.ListStore<R>, e: Table.CellError): Redux.ListStore<R> => {
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
    },
    UpdateGroup: (payload: { groupId: number; group: Partial<G> }, st: Redux.ListStore<R>) => {
      const rowsWithGroup = filter(st, (row: R) => !isNil(row.group) && row.group.id === payload.groupId);
      if (rowsWithGroup.length === 0) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating group in rows of ${Options.referenceEntity} table...
          no rows that are associated with group ID ${payload.groupId} exist when they are expected to.`
        );
      } else {
        for (let i = 0; i < rowsWithGroup.length; i++) {
          st = replaceInArray<R>(
            st,
            { id: rowsWithGroup[i].id },
            { ...rowsWithGroup[i], group: { ...rowsWithGroup[i].group, ...payload.group } }
          );
        }
      }
      return st;
    },
    AddGroup: (payload: { group: G; ids: number[] }, st: Redux.ListStore<R>) => {
      for (let i = 0; i < payload.ids.length; i++) {
        const row = find(st, { id: payload.ids[i] } as any);
        if (isNil(row)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when adding group to rows of ${Options.referenceEntity} table...
            the ${Options.referenceEntity} row with ID ${payload.ids[i]} does not exist in state when it is expected to.`
          );
        } else {
          st = replaceInArray<R>(
            st,
            { id: payload.ids[i] },
            { ...row, group: payload.group, meta: { ...row.meta, selected: false } }
          );
        }
      }
      return st;
    },
    RemoveGroup: (payload: number, st: Redux.ListStore<R>) => {
      const rows = filter(st, (row: R) => !isNil(row.group) && row.group.id === payload);
      if (rows.length === 0) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when removing group from rows of ${Options.referenceEntity} table...
          no rows are associated wtih group ID ${payload} when they are expected.`
        );
        return st;
      } else {
        for (let i = 0; i < rows.length; i++) {
          st = replaceInArray<R>(st, { id: rows[i].id }, { ...rows[i], group: null });
        }
        return st;
      }
    },
    RemoveRowFromGroup: (id: number, st: Redux.ListStore<R>) => {
      const row = find(st, { id } as any);
      if (isNil(row)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when removing ${Options.referenceEntity} row from group in state...
          the ${Options.referenceEntity} row with ID ${id} does not exist in state when it is expected to.`
        );
        return st;
      } else {
        return replaceInArray<R>(st, { id }, { ...row, group: null });
      }
    }
  };

  return createListReducerFromTransformers<ReducerFactory.ITableActionMap, R, A>(mappings, transformers, Options);
};
