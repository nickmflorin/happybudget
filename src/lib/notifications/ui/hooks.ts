import { useReducer, useMemo, useRef, useEffect } from "react";
import axios from "axios";
import { isNil, filter, map, reduce } from "lodash";

import * as api from "api";
import { util, hooks } from "lib";

import * as internal from "../internal";
import * as typeguards from "./typeguards";
import { combineFieldNotifications, standardizeNotification } from "./util";
import { UINotificationReducer } from "./reducers";
import existingNotifications from "./notifications";
import { AddNotificationsDetail, RequestErrorDetail, ClearNotificationsDetail, LookupAndNotifyDetail } from ".";

type UseNotificationsConfig = {
  readonly defaultBehavior: UINotificationBehavior;
  readonly defaultClosable?: boolean;
  readonly handleFieldErrors?: (errors: UIFieldNotification[]) => void;
};

/**
 * Manages notifications for a component.
 *
 * @param config UseNotificationsConfig
 * @returns UINotificationsHandler
 */
export const useNotifications = (config: UseNotificationsConfig): UINotificationsHandler => {
  const [ns, dispatchNotification] = useReducer(UINotificationReducer, []);
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  const clearNotifications = useMemo(() => (id?: SingleOrArray<UINotification["id"]>) => dispatchNotification(id), []);

  const doTimeout = hooks.useDynamicCallback((fn: () => void, ms: number) => {
    const timeout = setTimeout(fn, ms);
    timeouts.current = [...timeouts.current, timeout];
  });

  useEffect(() => {
    for (let i = 0; i < timeouts.current.length; i++) {
      clearTimeout(timeouts.current[i]);
    }
  }, []);

  const notifications = useMemo(() => {
    return map(ns, (n: Omit<UINotification, "remove">) => ({ ...n, remove: () => clearNotifications(n.id) }));
  }, [clearNotifications, ns]);

  /**
   * Dispatches a single notification or a series of notifications to state.
   * Each notification (of type UINotificationType) is standardized to the
   * consistent UINotification object form and then added to the notifications
   * in state so they can be easily rendered by components using this hook.
   */
  const notify = useMemo(
    () => (notes: SingleOrArray<UINotificationType>, opts?: UINotificationOptions) => {
      let notices = Array.isArray(notes) ? notes : [notes];

      const fieldRelatedErrors: (Http.FieldError | UIFieldNotification)[] = filter(
        notices,
        (n: UINotificationType) =>
          typeguards.isUIFieldNotification(n) || (api.typeguards.isHttpError(n) && api.typeguards.isFieldError(n))
      ) as (Http.FieldError | UIFieldNotification)[];

      // Filter out the notifications that do not pertain to individual fields.
      notices = filter(
        notices,
        (n: UINotificationType) =>
          !(typeguards.isUIFieldNotification(n) || (api.typeguards.isHttpError(n) && api.typeguards.isFieldError(n)))
      ) as UINonFieldNotificationType[];

      /* For the notification sources that pertain to field type errors, a
				 callback can be provided that allows for more granular handling of
				 each error pertinent to an individual field.  This is primarily used
				 for Forms, where the field-related errors need to be rendered next
				 to the individual FormItem(s) that are associated with the fields for
				 which an error occurred.  If this callback is not provided, the
				 field-related errors are included in the same scope as the non-field
				 errors.
				 */
      const fieldHandler = config?.handleFieldErrors;
      if (!isNil(fieldHandler)) {
        fieldHandler(fieldRelatedErrors);
      } else if (fieldRelatedErrors.length !== 0) {
        /* If the fieldHandler is not defined, field related errors will still be
				   in the set of notifications.  If field related errors are submitted in
					 a single batch, we want to group them together into a single
					 notification.

					 The purpose of this is to prevent the dispatching of several UI
					 notifications for a single request error - as a single request error
					 can contain children errors, each of which is an error related to a
					 single field.

					 Note that regardless of the location (index) of the first (or any)
					 field related errors in the array of notifications provided, the field
					 related errors will always come last - at least by the current logic.
					 This should be improved, as the location of the final grouped field
					 related error can be determined from the location of the first child
					 field related error in the array. */
        const combined = combineFieldNotifications(fieldRelatedErrors, { behavior: config.defaultBehavior, ...opts });
        if (combined !== null) {
          notices = [...notices, combined];
        }
      }
      const addedNotifications = reduce(
        notices,
        (curr: UINotification[], n: UINotificationType) => {
          const id = util.generateRandomNumericId();
          const standardized = standardizeNotification(n, {
            behavior: config.defaultBehavior,
            ...opts
          });
          if (standardized !== null) {
            /* All notifications will default to being closable unless the
							`defaultClosable` configuration is provided or the
							 notification or options indicate the closability of the
							 notification itself. */
            const closable =
              standardized.closable !== undefined
                ? standardized.closable
                : config.defaultClosable !== undefined
                ? config.defaultClosable
                : true;
            return [
              ...curr,
              {
                ...standardized,
                closable,
                id,
                remove: () => clearNotifications(id)
              }
            ];
          }
          return curr;
        },
        []
      );
      dispatchNotification({
        notifications: addedNotifications,
        opts: { behavior: config.defaultBehavior, ...opts }
      });
      if (!isNil(opts?.duration)) {
        doTimeout(() => clearNotifications(map(addedNotifications, (n: UINotification) => n.id)), opts?.duration);
      } else {
        for (let i = 0; i < addedNotifications.length; i++) {
          if (addedNotifications[i].duration !== undefined) {
            doTimeout(() => clearNotifications(addedNotifications[i].id), addedNotifications[i].duration);
          }
        }
      }
      return addedNotifications;
    },
    [config?.handleFieldErrors, clearNotifications]
  );

  const lookupAndNotify = useMemo(
    () =>
      <K extends UIExistingNotificationId>(
        id: K,
        params: InferExistingNotificationParams<
          typeof existingNotifications[K]
        > = {} as InferExistingNotificationParams<typeof existingNotifications[K]>
      ) => {
        const notificationData = existingNotifications[id](params);
        return notify(notificationData, { ignoreIfDuplicate: true });
      },
    [notify]
  );

  /**
   * Handles the dispatching of notifications when there is an HTTP request
   * error.  Note that unlike the `notify` method, this will throw the Error
   * if it is not associated with an HTTP error.
   *
   * For convenience, the method will also dispatch an internal notification
   * to the internal notifications handler in order to provide context to
   * Sentry and/or the console.
   */
  const handleRequestError = useMemo(
    () => (e: Error, opts?: UINotificationOptions) => {
      if (!axios.isCancel(e) && !(e instanceof api.ForceLogout)) {
        /* Dispatch the notification to the internal handler so we can, if
           appropriate, send notifications to Sentry or the console. */
        internal.requestError(e);
        if (e instanceof api.ClientError) {
          return notify(e.errors, { message: "There was a problem with your request.", ...opts });
        } else if (e instanceof api.NetworkError || e instanceof api.ServerError) {
          return notify(e, {
            message: "There was an error with your request.",
            detail: "There was a problem communicating with the server.",
            ...opts
          });
        } else {
          throw e;
        }
      }
      return [];
    },
    []
  );

  return {
    handleRequestError,
    notify,
    clearNotifications,
    lookupAndNotify,
    notifications
  };
};

type UseNotificationsEventListenerConfig = UseNotificationsConfig & {
  readonly destinationId: string;
};

/**
 * Manages notifications for a component via event listeners on the global
 * document object.
 *
 * @param config UseNotificationsEventListenerConfig
 * @returns UINotificationsHandler
 */
export const useNotificationsEventListener = (config: UseNotificationsEventListenerConfig): UINotificationsHandler => {
  const NotificationsHandler = useNotifications(config);

  useEffect(() => {
    const listener = ((evt: CustomEvent<AddNotificationsDetail>) => {
      NotificationsHandler.notify(evt.detail.notifications, evt.detail.opts);
    }) as EventListener;
    document.addEventListener(`notifications:${config.destinationId}:add`, listener);
    return () => document.removeEventListener(`notifications:${config.destinationId}:add`, listener);
  }, []);

  useEffect(() => {
    const listener = ((evt: CustomEvent<RequestErrorDetail>) => {
      NotificationsHandler.handleRequestError(evt.detail.error, evt.detail.opts);
    }) as EventListener;
    document.addEventListener(`notifications:${config.destinationId}:requestError`, listener);
    return () => document.removeEventListener(`notifications:${config.destinationId}:requestError`, listener);
  }, []);

  useEffect(() => {
    const listener = ((evt: CustomEvent<ClearNotificationsDetail>) => {
      NotificationsHandler.clearNotifications(evt.detail);
    }) as EventListener;
    document.addEventListener(`notifications:${config.destinationId}:clear`, listener);
    return () => document.removeEventListener(`notifications:${config.destinationId}:clear`, listener);
  }, []);

  useEffect(() => {
    const listener = (<K extends UIExistingNotificationId>(evt: CustomEvent<LookupAndNotifyDetail<K>>) => {
      NotificationsHandler.lookupAndNotify(evt.detail.id, evt.detail.params);
    }) as EventListener;
    document.addEventListener(`notifications:${config.destinationId}:lookupAndNotify`, listener);
    return () => document.removeEventListener(`notifications:${config.destinationId}:lookupAndNotify`, listener);
  }, []);

  return NotificationsHandler;
};
