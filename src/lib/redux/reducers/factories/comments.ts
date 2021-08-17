import { isNil, find, filter, concat } from "lodash";
import { util, redux } from "lib";

import { warnInconsistentState } from "../../util";
import { createModelListResponseReducer } from "./table";
import { mergeOptionsWithDefaults, createObjectReducerFromMap } from "./util";
import { createModelListActionReducer } from ".";

const getCommentAtPath = (data: Model.Comment[], pt: number[]) => {
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

const insertCommentAtPath = (data: Model.Comment[], comment: Model.Comment, pt: number[]) => {
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

const findPath = (id: number, data: Model.Comment[], current: number[] = []): number[] | undefined => {
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
  S extends Redux.CommentsListResponseStore = Redux.CommentsListResponseStore
>(
  /* eslint-disable indent */
  mappings: Partial<Redux.CommentsListResponseActionMap>,
  options: Partial<Redux.FactoryOptions<Redux.CommentsListResponseActionMap, S>> = {}
): Redux.Reducer<S> => {
  const Options = mergeOptionsWithDefaults<Redux.CommentsListResponseActionMap, S>(
    options,
    redux.initialState.initialCommentsListResponseState as S
  );

  let subReducers = {};
  if (!isNil(mappings.Replying)) {
    subReducers = { ...subReducers, replying: createModelListActionReducer(mappings.Replying) };
  }
  const genericListResponseReducer = createModelListResponseReducer<Model.Comment, S>(
    {
      Response: mappings.Response,
      Request: mappings.Request,
      Loading: mappings.Loading,
      Deleting: mappings.Deleting,
      Creating: mappings.Creating,
      Updating: mappings.Updating
    },
    {
      subReducers
    }
  );

  const reducers: Redux.MappedReducers<Redux.CommentsListResponseActionMap, S> = {
    AddToState: (st: S = Options.initialState, action: Redux.Action<{ data: Model.Comment; parent?: number }>) => {
      if (!isNil(action.payload.parent)) {
        const path = findPath(action.payload.parent, st.data);
        if (isNil(path)) {
          warnInconsistentState({
            action: action.type,
            reason: "Parent does not exist in state when it is expected to.",
            parent: action.payload.parent
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
            id: action.payload.data.id
          });
          return st;
        } else {
          return { ...st, data: [...st.data, action.payload.data], count: st.count + 1 };
        }
      }
    },
    RemoveFromState: (st: S = Options.initialState, action: Redux.Action<number>) => {
      const path = findPath(action.payload, st.data);
      if (isNil(path)) {
        warnInconsistentState({
          action: action.type,
          reason: "Entity does not exist in state when it is expected to.",
          id: action.payload
        });
        return st;
      } else {
        if (path.length === 1) {
          return {
            ...st,
            data: filter(st.data, (cmt: Model.Comment) => cmt.id !== action.payload),
            count: st.count - 1
          };
        } else {
          const parent = getCommentAtPath(st.data, path.slice(0, -1));
          const newParent = { ...parent, comments: util.removeFromArray(parent.comments, "id", action.payload) };
          return { ...st, data: insertCommentAtPath(st.data, newParent, path.slice(0, -1)) };
        }
      }
    },
    UpdateInState: (
      st: S = Options.initialState,
      action: Redux.Action<Redux.UpdateModelActionPayload<Model.Comment>>
    ) => {
      const path = findPath(action.payload.id, st.data);
      if (isNil(path)) {
        warnInconsistentState({
          action: action.type,
          reason: "Entity does not exist in state when it is expected to.",
          id: action.payload
        });
        return st;
      } else {
        const { id: _, ...withoutId } = action.payload.data;
        const existing = getCommentAtPath(st.data, path);
        if (path.length === 1) {
          return {
            ...st,
            data: util.replaceInArray<Model.Comment>(st.data, { id: action.payload.id }, { ...existing, ...withoutId })
          };
        } else {
          const parent = getCommentAtPath(st.data, path.slice(0, -1));
          const newParent = {
            ...parent,
            comments: util.replaceInArray(parent.comments, { id: action.payload.id }, { ...existing, ...withoutId })
          };
          return { ...st, data: insertCommentAtPath(st.data, newParent, path.slice(0, -1)) };
        }
      }
    }
  };

  return createObjectReducerFromMap<Redux.CommentsListResponseActionMap, S>(mappings, reducers, {
    ...Options,
    extension: genericListResponseReducer
  });
};
