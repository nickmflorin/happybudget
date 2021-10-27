import { isNil, find, filter, concat } from "lodash";
import { util } from "lib";

import { initialAuthenticatedModelListResponseState } from "../../initialState";
import { createModelListActionReducer } from "../../reducers";
import { warnInconsistentState } from "../../util";

import * as transformers from "./transformers";
import { createObjectReducerFromTransformers } from "./util";

export const initialCommentsListResponseState: Redux.CommentsListResponseStore = {
  ...initialAuthenticatedModelListResponseState,
  replying: []
};

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

const findPath = (id: ID, data: Model.Comment[], current: ID[] = []): number[] | undefined => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].id === id) {
      return concat(current as number[], [i]);
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
 */
export const createCommentsListResponseReducer = (
  /* eslint-disable indent */
  config: Omit<
    Redux.ReducerConfig<Redux.CommentsListResponseStore, Redux.CommentsListResponseActionMap>,
    "initialState"
  >,
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  subReducers?: { [Property in keyof Partial<Redux.CommentsListResponseStore>]: Redux.Reducer<any> } | null | {}
): Redux.Reducer<Redux.CommentsListResponseStore> => {
  subReducers = {
    ...subReducers,
    replying: createModelListActionReducer({
      actions: { change: config.actions.replying }
    })
  };

  const reducers: Redux.Transformers<
    Redux.CommentsListResponseStore,
    Omit<Redux.CommentsListResponseActionMap, "submit" | "delete" | "replying" | "edit">
  > = {
    ...transformers.authenticatedModelListResponseReducerTransformers<Model.Comment, Redux.CommentsListResponseStore>(
      initialCommentsListResponseState
    ),
    addToState: (
      st: Redux.CommentsListResponseStore = initialCommentsListResponseState,
      action: Redux.Action<{ data: Model.Comment; parent?: number }>
    ) => {
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
    removeFromState: (
      st: Redux.CommentsListResponseStore = initialCommentsListResponseState,
      action: Redux.Action<ID>
    ) => {
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
    updateInState: (
      st: Redux.CommentsListResponseStore = initialCommentsListResponseState,
      action: Redux.Action<Redux.UpdateActionPayload<Model.Comment>>
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

  return createObjectReducerFromTransformers<Redux.CommentsListResponseStore, Redux.CommentsListResponseActionMap>(
    { ...config, initialState: initialCommentsListResponseState },
    reducers,
    subReducers
  );
};
