/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const isAction = (obj: Redux.Action | any): obj is Redux.Action =>
  (obj as Redux.Action).type !== undefined;

export const requestActionIsForced = <C extends Redux.ActionContext>(
  a: Redux.RequestAction<C>,
): a is Redux.Action<{ force: true }, C> =>
  a.payload !== null && (a as Redux.Action<{ force: true }, C>).payload.force === true;

export const tableRequestEffectRTIsError = <C>(
  rt: Redux.ListRequestEffectRTWithError<C>,
): rt is Redux.RequestEffectError =>
  rt !== null && (rt as Redux.RequestEffectError).error !== undefined;

export const isListRequestIdsPayload = (obj: Redux.TableRequestPayload): obj is { ids: number[] } =>
  obj !== null &&
  typeof obj === "object" &&
  (obj as { ids: number[] }).ids !== undefined &&
  Array.isArray((obj as { ids: number[] }).ids);

export const tableRequestActionIsListIds = <C extends Redux.ActionContext>(
  obj: Redux.Action<Redux.TableRequestPayload, C>,
): obj is Redux.Action<{ ids: number[] }, C> => isListRequestIdsPayload(obj.payload);
