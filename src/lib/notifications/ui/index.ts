export * as banner from "./banner";
export * from "./hooks";
export * from "./util";

import existingNotifications from "./notifications";

export type AddNotificationsDetail<N extends UINotificationType = UINotificationType> = {
  readonly notifications: SingleOrArray<N>;
  readonly opts?: Omit<UINotificationOptions, "behavior">;
};
export type ClearNotificationsDetail = SingleOrArray<UINotification["id"]> | undefined;

export type RequestErrorDetail = {
  readonly error: Error;
  readonly opts?: Omit<UINotificationOptions, "behavior">;
};

export type LookupAndNotifyDetail<K extends UIExistingNotificationId> = {
  readonly id: K;
  readonly params?: InferExistingNotificationParams<typeof existingNotifications[K]>;
};

/**
 * Dispatches an Event instructing any listeners to add the notification to the
 * managed notifications in state for the specific destination.
 *
 * @param destinationId  The specific destination that the notification is for.
 *                       This is used so that we can use event listeners for
 *                       different notification destinations without having their
 *                       wires get crossed.
 * @param notifications  The single notification or multiple notifications that
 *                       should be dispatched.
 * @param opts           Options for the dispatching of the notification(s).
 */
export const notify = (
  destinationId: string,
  notifications: SingleOrArray<UINotificationType>,
  opts?: UINotificationOptions
) => {
  const evt = new CustomEvent<AddNotificationsDetail>(`notifications:${destinationId}:add`, {
    detail: { notifications, opts }
  });
  document.dispatchEvent(evt);
};

/**
 * Dispatches an Event instructing any listeners to clear the notifications in
 * the managed notifications state for the specific destination.
 *
 * @param destinationId  The specific destination that the notification is for.
 *                       This is used so that we can use event listeners for
 *                       different notification destinations without having their
 *                       wires get crossed.
 * @param ids            The IDs of the notification that should be removed.  If
 *                       not provided, all notifications will be removed.
 */
export const clear = (destinationId: string, ids: SingleOrArray<UINotification["id"]> | undefined) => {
  const evt = new CustomEvent<ClearNotificationsDetail>(`notifications:${destinationId}:clear`, {
    detail: ids
  });
  document.dispatchEvent(evt);
};

/**
 * Dispatches an Event instructing any listeners to lookup the preset notification
 * by ID and, if it exists, dispatch it to the specific destination.
 *
 * @param destinationId  The specific destination that the notification is for.
 *                       This is used so that we can use event listeners for
 *                       different notification destinations without having their
 *                       wires get crossed.
 * @param id             The preset notification ID.
 * @param params         Props for the preset notification factory function.
 */
export const lookupAndNotify = <K extends UIExistingNotificationId>(
  destinationId: string,
  id: K,
  params: InferExistingNotificationParams<typeof existingNotifications[K]> = {} as InferExistingNotificationParams<
    typeof existingNotifications[K]
  >
) => {
  const evt = new CustomEvent<LookupAndNotifyDetail<K>>(`notifications:${destinationId}:lookupAndNotify`, {
    detail: { id, params }
  });
  document.dispatchEvent(evt);
};

/**
 * Dispatches an Event instructing any listeners to handle an HTTP request error
 * and dispatch notifications (if appropriate) to the managed notifications in
 * state for the specific destination.
 *
 * @param destinationId  The specific destination that the notification is for.
 *                       This is used so that we can use event listeners for
 *                       different notification destinations without having their
 *                       wires get crossed.
 * @param e              The HTTP request error that occurred.
 * @param opts           Options for the dispatching of the notification(s).
 */
export const handleRequestError = (destinationId: string, e: Error, opts?: UINotificationOptions) => {
  const evt = new CustomEvent<RequestErrorDetail>(`notifications:${destinationId}:requestError`, {
    detail: { error: e, opts }
  });
  document.dispatchEvent(evt);
};
