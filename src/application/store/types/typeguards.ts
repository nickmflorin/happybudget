import * as actions from "./actions";
import * as tabling from "./tabling";

export const requestActionIsForced = <C extends actions.ActionContext>(
  a: actions.RequestAction<C>,
): a is actions.Action<{ force: true }, C> =>
  a.payload !== null && (a as actions.Action<{ force: true }, C>).payload.force === true;

export const tableRequestActionIsForced = <C extends actions.ActionContext>(
  a: tabling.TableRequestAction<C>,
): a is actions.Action<{ force: true }, C> =>
  a.payload !== null && (a as actions.Action<{ force: true }, C>).payload.force === true;

export const isListRequestIdsPayload = (
  obj: tabling.TableRequestActionPayload,
): obj is { ids: number[] } =>
  obj !== null &&
  typeof obj === "object" &&
  (obj as { ids: number[] }).ids !== undefined &&
  Array.isArray((obj as { ids: number[] }).ids);

export const tableRequestActionIsListIds = <C extends actions.ActionContext>(
  obj: actions.Action<tabling.TableRequestActionPayload, C>,
): obj is actions.Action<{ ids: number[] }, C> => isListRequestIdsPayload(obj.payload);
