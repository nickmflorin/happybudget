import {
  notify as RootNotify,
  handleRequestError as RootHandleRequestError,
  clear as RootClear,
  lookupAndNotify as RootLookupAndNotify,
} from "./base";
import existingNotifications from "./notifications";

/**
 * Dispatches an Event instructing any listeners to add the notification to the
 * managed notifications in state for the 'banner' destination.
 */
export const notify = (
  notifications: SingleOrArray<UINotificationType>,
  opts?: UINotificationOptions,
) => RootNotify("banner", notifications, opts);

/**
 * Dispatches an Event instructing any listeners to clear the managed
 * notifications in state for the 'banner' destination.
 */
export const clear = (ids: SingleOrArray<UINotification["id"]> | undefined) =>
  RootClear("banner", ids);

/**
 * Dispatches an Event instructing any listeners to handle an HTTP request error
 * and dispatch notifications (if appropriate) to the managed notifications in
 * state for the 'banner' destination.
 */
export const handleRequestError = (e: Error, opts?: UINotificationOptions) =>
  RootHandleRequestError("banner", e, opts);

/**
 * Dispatches an Event instructing any listeners to lookup an existing
 * notification by the provided ID and, if it exists, dispatch the notification
 * associated with the provided ID to the managed notifications in state for
 * the `banner` destination.
 */
export const lookupAndNotify = <K extends UIExistingNotificationId>(
  id: K,
  params: InferExistingNotificationParams<
    typeof existingNotifications[K]
  > = {} as InferExistingNotificationParams<typeof existingNotifications[K]>,
) => RootLookupAndNotify("banner", id, params);
