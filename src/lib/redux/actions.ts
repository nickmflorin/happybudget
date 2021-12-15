export { createAction } from "@reduxjs/toolkit";

/**
 * Modified version of @redux.js/toolkit's `createAction` method that uses an
 * action creator that attaches the context to the given action.
 * @param type 					 The action type.
 * @param prepareAction  Callback to prepare action.
 * @returns 						 Function to create action.
 */
export function createContextAction<P, C>(
  type: string,
  prepareAction?: (p: P, c: C) => Omit<Redux.Action<P>, "type">
): (p: P, c: C) => Redux.ActionWithContext<P, C> {
  function actionCreator(payload: P, context: C) {
    if (prepareAction) {
      let prepared = prepareAction(payload, context);
      if (!prepared) {
        throw new Error("prepareAction did not return an object");
      }
      return {
        type,
        payload: prepared.payload,
        context
      };
    }
    return { type, payload, context };
  }

  actionCreator.toString = () => `${type}`;
  actionCreator.type = type;
  return actionCreator;
}
