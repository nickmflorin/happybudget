/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const isAction = (obj: Redux.Action | any): obj is Redux.Action => {
  return (obj as Redux.Action).type !== undefined;
};

export const isClearOnDetail = <T extends Redux.ActionPayload, C extends Table.Context = Table.Context>(
  obj: Redux.ClearOn<T, C>
): obj is Redux.ClearOnDetail<T, C> =>
  (obj as Redux.ClearOnDetail<T, C>).payload !== undefined && (obj as Redux.ClearOnDetail<T, C>).action !== undefined;

export const isListRequestIdsPayload = (obj: Redux.TableRequestPayload): obj is { ids: number[] } =>
  obj !== null &&
  typeof obj === "object" &&
  (obj as { ids: number[] }).ids !== undefined &&
  Array.isArray((obj as { ids: number[] }).ids);

export const isListRequestIdsAction = (obj: Redux.Action): obj is Redux.Action<{ ids: number[] }> =>
  isListRequestIdsPayload(obj.payload);
