import { Reducer } from "redux";
import { isNil, forEach, find, filter, includes, map } from "lodash";
import { replaceInArray } from "lib/util";
import { initialListResponseState } from "store/initialState";
import { mergeOptionsWithDefaults, createObjectReducerFromTransformers } from "./util";

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
  mappings: Partial<ReducerFactory.IListResponseActionMap>,
  options: Partial<ReducerFactory.IOptions<S, A>> = {}
): Reducer<S, A> => {
  const Options = mergeOptionsWithDefaults<S, A>(options, initialListResponseState as S);

  const transformers: ReducerFactory.Transformers<ReducerFactory.IListResponseActionMap, S, A> = {
    // We have to reset the page to it's initial state otherwise we run the risk
    // of a 404 with the API request due to the page not being found.
    SetSearch: (payload: string) => ({ page: 1, search: payload }),
    Response: (payload: Http.IListResponse<M>) => {
      return {
        data: payload.data,
        count: payload.count,
        selected: [],
        responseWasReceived: true
      };
    },
    Request: () => ({ responseWasReceived: false }),
    Loading: (payload: boolean) => ({ loading: payload }),
    SetPage: (payload: number) => ({ page: payload, selected: [] }),
    SetPageSize: (payload: number) => ({ pageSize: payload }),
    SetPageAndSize: (payload: { pageSize: number; page: number }) => ({ ...payload }),
    AddToState: (payload: M, st: S, action: Redux.IAction<M>) => {
      const existing = find(st.data, { id: payload.id });
      if (!isNil(existing)) {
        if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when adding ${Options.referenceEntity} to state...
          the ${Options.referenceEntity} with ID ${payload.id} already exists in state when it is not expected to.`
          );
        }
        return {};
      } else {
        let pageSize = st.pageSize;
        if (st.data.length + 1 >= st.pageSize) {
          pageSize = st.pageSize + 1;
        }
        return { data: [...st.data, payload], count: st.count + 1, pageSize };
      }
    },
    RemoveFromState: (payload: number, st: S, action: Redux.IAction<number>) => {
      const existing = find(st.data, { id: payload });
      if (isNil(existing)) {
        if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when removing ${Options.referenceEntity} from state...
          the ${Options.referenceEntity} with ID ${payload} does not exist in state when it is expected to.`
          );
        }
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
    UpdateInState: (payload: M, st: S, action: Redux.IAction<M>) => {
      const existing: M | undefined = find(st.data, { id: payload.id } as any);
      // TODO: If the entity does not exist in the state when updating, should
      // we auto add it?
      if (isNil(existing)) {
        if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when updating ${Options.referenceEntity} in state...
          the ${Options.referenceEntity} with ID ${payload.id} does not exist in state when it is expected to.`
          );
        }
        return {};
      }
      const { id: _, ...withoutId } = payload;
      return { data: replaceInArray<M>(st.data, { id: payload.id }, { ...existing, ...withoutId }) };
    },
    Deselect: (payload: number, st: S, action: Redux.IAction<number>) => {
      const element = find(st.data, { id: payload });
      if (!isNil(element) || Options.strictSelect === false) {
        if (!includes(st.selected, payload)) {
          if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
            /* eslint-disable no-console */
            console.error(`Inconsistent State!: Selected ${Options.referenceEntity} with ID ${payload} not in state!`);
          }
          return {};
        }
        return { selected: filter(st.selected, (id: number) => id !== payload) };
      } else {
        if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
          /* eslint-disable no-console */
          console.error(`Inconsistent State!: Selected ${Options.referenceEntity} with ID ${payload} not in state!`);
        }
        return {};
      }
    },
    SelectAll: (payload: undefined | null, st: S) => {
      if (st.selected.length === st.data.length) {
        return { selected: [] };
      } else {
        return { selected: map(st.data, (model: M) => model.id) };
      }
    },
    Select: (payload: number[] | number, st: S, action: Redux.IAction<number | number[]>) => {
      const selected: number[] = [];
      if (Array.isArray(payload)) {
        forEach(payload, (id: number) => {
          const element = find(st.data, { id });
          if (!isNil(element) || Options.strictSelect === false) {
            selected.push(id);
          } else {
            if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
              /* eslint-disable no-console */
              console.error(`Inconsistent State!: Selected ${Options.referenceEntity} with ID ${id} not in state!`);
            }
          }
        });
        return { selected };
      } else {
        const element = find(st.data, { id: payload });
        if (!isNil(element) || Options.strictSelect === false) {
          return { selected: [...st.selected, payload] };
        } else {
          if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
            /* eslint-disable no-console */
            console.error(`Inconsistent State!: Selected ${Options.referenceEntity} with ID ${payload} not in state!`);
          }
          return {};
        }
      }
    },
    Creating: (payload: boolean) => ({ creating: payload }),
    Deleting: (payload: Redux.ModelListActionPayload, st: S, action: Redux.IAction<boolean>) => {
      if (payload.value === true) {
        if (includes(st.deleting, payload.id)) {
          if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
            /* eslint-disable no-console */
            console.warn(
              `Inconsistent State!  Inconsistent state noticed when adding ${Options.referenceEntity}
              to deleting state... the ${Options.referenceEntity} with ID ${payload.id} already
              exists in the deleting state when it is not expected to.`
            );
          }
          return {};
        } else {
          return { deleting: [...st.deleting, payload.id] };
        }
      } else {
        if (!includes(st.deleting, payload.id)) {
          if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
            /* eslint-disable no-console */
            console.warn(
              `Inconsistent State!  Inconsistent state noticed when removing ${Options.referenceEntity}
              from deleting state... the ${Options.referenceEntity} with ID ${payload.id} does
              not exist in the deleting state when it is expected to.`
            );
          }
          return {};
        } else {
          return { deleting: filter(st.deleting, (id: number) => id !== payload.id) };
        }
      }
    },
    Updating: (payload: Redux.ModelListActionPayload, st: S, action: Redux.IAction<number>) => {
      if (payload.value === true) {
        if (includes(st.updating, payload.id)) {
          if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
            /* eslint-disable no-console */
            console.warn(
              `Inconsistent State!  Inconsistent state noticed when adding ${Options.referenceEntity}
            to updating state... the ${Options.referenceEntity} with ID ${payload.id} already
            exists in the updating state when it is not expected to.`
            );
          }
          return {};
        } else {
          return { updating: [...st.updating, payload.id] };
        }
      } else {
        if (!includes(st.updating, payload.id)) {
          if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
            /* eslint-disable no-console */
            console.warn(
              `Inconsistent State!  Inconsistent state noticed when removing ${Options.referenceEntity}
              from updating state... the ${Options.referenceEntity} with ID ${payload.id} does
              not exist in the updating state when it is expected to.`
            );
          }
          return {};
        } else {
          return { updating: filter(st.updating, (id: number) => id !== payload.id) };
        }
      }
    }
  };

  return createObjectReducerFromTransformers<ReducerFactory.IListResponseActionMap, S, A>(
    mappings,
    transformers,
    Options
  );
};
