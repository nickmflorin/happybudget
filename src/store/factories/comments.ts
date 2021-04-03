import { Reducer } from "redux";
import { isNil, forEach, find, filter, concat } from "lodash";
import { removeFromArray, replaceInArray } from "util/arrays";
import { mergeWithDefaults } from "util/objects";
import { initialCommentsListResponseState } from "store/initialState";

import { createListResponseReducer } from "./list";
import { createModelListActionReducer } from ".";
import { mergeOptionsWithDefaults, createObjectReducerFromTransformers } from "./util";

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
  mappings: Partial<ReducerFactory.ICommentsListResponseActionMap>,
  options: Partial<ReducerFactory.IOptions<S, A>> = {}
): Reducer<S, A> => {
  const Options = mergeOptionsWithDefaults<S, A>(
    { referenceEntity: "comment", ...options },
    initialCommentsListResponseState as S
  );

  let keyReducers = {};
  if (!isNil(mappings.Replying)) {
    keyReducers = { ...keyReducers, replying: createModelListActionReducer(mappings.Replying) };
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
      referenceEntity: "comment",
      keyReducers
    }
  );

  const transformers: ReducerFactory.Transformers<ReducerFactory.ICommentsListResponseActionMap, S, A> = {
    AddToState: (payload: { data: IComment; parent?: number }, st: S) => {
      if (!isNil(payload.parent)) {
        const path = findPath(payload.parent, st.data);
        if (isNil(path)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when adding ${Options.referenceEntity} to state...
            the ${Options.referenceEntity} parent with ID ${payload.parent} does not exist in state when it is expected to.`
          );
          return {};
        } else {
          const parent = getCommentAtPath(st.data, path);
          const newParent = {
            ...parent,
            comments: [...parent.comments, payload.data]
          };
          return { data: insertCommentAtPath(st.data, newParent, path) };
        }
      } else {
        const existing = find(st.data, { id: payload.data.id });
        if (!isNil(existing)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when adding ${Options.referenceEntity} to state...
        the ${Options.referenceEntity} with ID ${payload.data.id} already exists in state when it is not expected to.`
          );
          return {};
        } else {
          let pageSize = st.pageSize;
          if (st.data.length + 1 >= st.pageSize) {
            pageSize = st.pageSize + 1;
          }
          return { data: [...st.data, payload.data], count: st.count + 1, pageSize };
        }
      }
    },
    RemoveFromState: (id: number, st: S) => {
      const path = findPath(id, st.data);
      if (isNil(path)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when removing ${Options.referenceEntity} from state...
          the ${Options.referenceEntity} with ID ${id} does not exist in state when it is expected to.`
        );
        return {};
      } else {
        if (path.length === 1) {
          return {
            data: filter(st.data, (cmt: IComment) => cmt.id !== id),
            count: st.count - 1
          };
        } else {
          const parent = getCommentAtPath(st.data, path.slice(0, -1));
          const newParent = { ...parent, comments: removeFromArray(parent.comments, "id", id) };
          return { data: insertCommentAtPath(st.data, newParent, path.slice(0, -1)) };
        }
      }
    },
    UpdateInState: (payload: Redux.UpdateModelActionPayload<IComment>, st: S) => {
      const path = findPath(payload.id, st.data);
      if (isNil(path)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating ${Options.referenceEntity} in state...
          the ${Options.referenceEntity} with ID ${payload.id} does not exist in state when it is expected to.`
        );
        return {};
      } else {
        const { id: _, ...withoutId } = payload.data;
        const existing = getCommentAtPath(st.data, path);
        if (path.length === 1) {
          return {
            data: replaceInArray<IComment>(st.data, { id: payload.id }, { ...existing, ...withoutId })
          };
        } else {
          const parent = getCommentAtPath(st.data, path.slice(0, -1));
          const newParent = {
            ...parent,
            comments: replaceInArray(parent.comments, { id: payload.id }, { ...existing, ...withoutId })
          };
          return { data: insertCommentAtPath(st.data, newParent, path.slice(0, -1)) };
        }
      }
    }
  };

  return createObjectReducerFromTransformers<ReducerFactory.ICommentsListResponseActionMap, S, A>(
    mappings,
    transformers,
    {
      ...Options,
      extension: genericListResponseReducer
    }
  );
};
