import { Reducer } from "redux";
import { isNil, forEach, find, filter, includes } from "lodash";
import { replaceInArray } from "util/arrays";
import { mergeWithDefaults } from "util/objects";
import { initialListResponseState } from "store/initialState";

import { createListResponseReducer } from "./list";
import { createSimpleBooleanReducer, createModelListActionReducer } from ".";
import { createObjectReducerFromTransformers } from "./util";

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
  S extends Redux.ICommentsListResponseStore,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  /* eslint-disable indent */
  mappings: Partial<ReducerFactory.ICommentsListResponseActionMap>,
  options: Partial<ReducerFactory.ITransformerReducerOptions<S, A>> = {
    initialState: initialListResponseState as S,
    referenceEntity: "comment"
  }
): Reducer<S, A> => {
  const Options = mergeWithDefaults<ReducerFactory.ITransformerReducerOptions<S, A>>(options, {
    referenceEntity: "comment",
    extensions: {},
    keyReducers: {},
    initialState: initialListResponseState as S,
    excludeActionsFromExtensions: true
  });

  const keyActions: {
    action: string;
    key: string;
    factory: (actionType: string) => Reducer<any, Redux.IAction<any>>;
  }[] = [
    { action: "Submitting", key: "submitting", factory: createSimpleBooleanReducer },
    { action: "Editing", key: "editing", factory: createModelListActionReducer },
    { action: "Replying", key: "replying", factory: createModelListActionReducer },
    { action: "Deleting", key: "deleting", factory: createModelListActionReducer }
  ];
  const keyReducers: { [key: string]: Reducer<any, Redux.IAction<any>> } = {};
  forEach(
    keyActions,
    (action: { action: string; key: string; factory: (actionType: string) => Reducer<any, Redux.IAction<any>> }) => {
      const actionType: string | undefined = mappings[action.action];
      if (!isNil(actionType)) {
        keyReducers[action.key] = action.factory(actionType);
      }
    }
  );
  const genericListResponseReducer = createListResponseReducer<IComment, S, A>(
    {
      Response: mappings.Response,
      Request: mappings.Request,
      Loading: mappings.Loading
    },
    {
      referenceEntity: "comment",
      // extensions: {
      //   [ActionType.SubAccount.Comments.UpdateWithChildInState]: (
      //     payload: { id: number; data: IComment },
      //     st: Redux.Calculator.ICommentsStore
      //   ) => {
      //     // NOTE: This will only work for replies to top level comments.  For subsequent
      //     // comments, we will have to figure out a way to do this recursively.  The other
      //     // option is to create a comments reducer for the nested sets of comments.
      //     const existing = find(st.data, { id: payload.id });
      //     if (isNil(existing)) {
      //       /* eslint-disable no-console */
      //       console.error(
      //         `Inconsistent State!:  Inconsistent state noticed when updating comment in state...
      //         the comment with ID ${payload.id} does not exist in state when it is expected to.`
      //       );
      //     } else {
      //       return {
      //         data: replaceInArray<IComment>(
      //           st.data,
      //           { id: payload.id },
      //           { ...existing, comments: [...existing.comments, payload.data] }
      //         )
      //       };
      //     }
      //   }
      // },
      keyReducers
    }
  );

  const transformers: ReducerFactory.Transformers<ReducerFactory.ICommentsListResponseActionMap, S, A> = {
    AddToState: (payload: IComment, st: S) => {
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
          data: filter(st.data, (comment: IComment) => comment.id !== payload),
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
    UpdateInState: (payload: Redux.UpdateModelActionPayload<IComment>, st: S) => {
      const existing: IComment | undefined = find(st.data, { id: payload.id } as any);
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
      return { data: replaceInArray<IComment>(st.data, { id: payload.id }, { ...existing, ...withoutId }) };
    }
  };

  return createObjectReducerFromTransformers(mappings, transformers, {
    ...Options,
    extension: genericListResponseReducer
  });
};
