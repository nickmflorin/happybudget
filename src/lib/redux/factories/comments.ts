import { Reducer } from "redux";
import { isNil, find, filter, concat } from "lodash";
import { removeFromArray, replaceInArray } from "lib/util";
import { initialCommentsListResponseState } from "store/initialState";

import { warnInconsistentState } from "../util";
import { createListResponseReducer } from "./list";
import { mergeOptionsWithDefaults, createObjectReducerFromMap } from "./util";
import { MappedReducers, FactoryOptions, createModelListActionReducer } from ".";

const getCommentAtPath = (data: IComment[], pt: number[]) => {
  if (pt.length === 0) {
    throw new Error("");
  } else if (pt.length === 1) {
    return data[pt[0]];
  } else {
    let root = data[pt[0]];
    let index = 1;
    while (index < pt.length) {
      root = root.comments[pt[index]];
      index = index + 1;
    }
    return root;
  }
};

const insertCommentAtPath = (data: IComment[], comment: IComment, pt: number[]) => {
  const newData = [...data];
  if (pt.length === 0) {
    throw new Error("");
  } else if (pt.length === 1) {
    newData[pt[0]] = comment;
  } else {
    let root = newData[pt[0]];
    let index = 1;
    while (index < pt.length - 1) {
      root = root.comments[pt[index]];
      index = index + 1;
    }
    root.comments[pt[pt.length - 1]] = comment;
  }
  return newData;
};

const findPath = (id: number, data: IComment[], current: number[] = []): number[] | undefined => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].id === id) {
      return concat(current, [i]);
    } else if (data[i].comments.length !== 0) {
      const subPath = findPath(id, data[i].comments, concat(current, [i]));
      if (!isNil(subPath)) {
        return subPath;
      }
    }
  }
};

export type ICommentsListResponseActionMap = {
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
  SelectAll: string;
  Deselect: string;
  Request: string;
  Deleting: string;
  Updating: string;
  Creating: string;
  Replying: string;
};

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * comments list response, where a list response might be the response received
 * from submitting an API request to /comments/.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.  The reducer inherits a lot of common behavior from
 * the list response reducer, but has the main difference in that comments have
 * nested comments, so we have to be able to apply certain logic recursively
 * to address the removal, updating and addition of comment state when it may
 * be nested.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
export const createCommentsListResponseReducer = <
  S extends Redux.ICommentsListResponseStore = Redux.ICommentsListResponseStore,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  /* eslint-disable indent */
  mappings: Partial<ICommentsListResponseActionMap>,
  options: Partial<FactoryOptions<S, A>> = {}
): Reducer<S, A> => {
  const Options = mergeOptionsWithDefaults<S, A>(
    { ...options, references: { ...options.references, entity: "commment" } },
    initialCommentsListResponseState as S
  );

  let subReducers = {};
  if (!isNil(mappings.Replying)) {
    subReducers = { ...subReducers, replying: createModelListActionReducer(mappings.Replying, Options.references) };
  }
  const genericListResponseReducer = createListResponseReducer<IComment, S, A>(
    {
      Response: mappings.Response,
      Request: mappings.Request,
      Loading: mappings.Loading,
      Deleting: mappings.Deleting,
      Creating: mappings.Creating,
      Updating: mappings.Updating
    },
    {
      subReducers,
      references: Options.references
    }
  );

  const reducers: MappedReducers<ICommentsListResponseActionMap, S, A> = {
    AddToState: (st: S = Options.initialState, action: Redux.IAction<{ data: IComment; parent?: number }>) => {
      if (!isNil(action.payload.parent)) {
        const path = findPath(action.payload.parent, st.data);
        if (isNil(path)) {
          warnInconsistentState({
            action: action.type,
            reason: "Parent does not exist in state when it is expected to.",
            parent: action.payload.parent,
            ...Options.references
          });
          return st;
        } else {
          const parent = getCommentAtPath(st.data, path);
          const newParent = {
            ...parent,
            comments: [...parent.comments, action.payload.data]
          };
          return { ...st, data: insertCommentAtPath(st.data, newParent, path) };
        }
      } else {
        const existing = find(st.data, { id: action.payload.data.id });
        if (!isNil(existing)) {
          warnInconsistentState({
            action: action.type,
            reason: "Entity already exists in state when it is not expected to.",
            id: action.payload.data.id,
            ...Options.references
          });
          return st;
        } else {
          let pageSize = st.pageSize;
          if (st.data.length + 1 >= st.pageSize) {
            pageSize = st.pageSize + 1;
          }
          return { ...st, data: [...st.data, action.payload.data], count: st.count + 1, pageSize };
        }
      }
    },
    RemoveFromState: (st: S = Options.initialState, action: Redux.IAction<number>) => {
      const path = findPath(action.payload, st.data);
      if (isNil(path)) {
        warnInconsistentState({
          action: action.type,
          reason: "Entity does not exist in state when it is expected to.",
          id: action.payload,
          ...Options.references
        });
        return st;
      } else {
        if (path.length === 1) {
          return {
            ...st,
            data: filter(st.data, (cmt: IComment) => cmt.id !== action.payload),
            count: st.count - 1
          };
        } else {
          const parent = getCommentAtPath(st.data, path.slice(0, -1));
          const newParent = { ...parent, comments: removeFromArray(parent.comments, "id", action.payload) };
          return { ...st, data: insertCommentAtPath(st.data, newParent, path.slice(0, -1)) };
        }
      }
    },
    UpdateInState: (st: S = Options.initialState, action: Redux.IAction<Redux.UpdateModelActionPayload<IComment>>) => {
      const path = findPath(action.payload.id, st.data);
      if (isNil(path)) {
        warnInconsistentState({
          action: action.type,
          reason: "Entity does not exist in state when it is expected to.",
          id: action.payload,
          ...Options.references
        });
        return st;
      } else {
        const { id: _, ...withoutId } = action.payload.data;
        const existing = getCommentAtPath(st.data, path);
        if (path.length === 1) {
          return {
            ...st,
            data: replaceInArray<IComment>(st.data, { id: action.payload.id }, { ...existing, ...withoutId })
          };
        } else {
          const parent = getCommentAtPath(st.data, path.slice(0, -1));
          const newParent = {
            ...parent,
            comments: replaceInArray(parent.comments, { id: action.payload.id }, { ...existing, ...withoutId })
          };
          return { ...st, data: insertCommentAtPath(st.data, newParent, path.slice(0, -1)) };
        }
      }
    }
  };

  return createObjectReducerFromMap<ICommentsListResponseActionMap, S, A>(mappings, reducers, {
    ...Options,
    extension: genericListResponseReducer
  });
};
