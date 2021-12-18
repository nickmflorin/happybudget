import { useReducer, useMemo } from "react";
import axios from "axios";
import { isNil, reduce, filter } from "lodash";

import * as api from "api";

import * as internal from "./internal";
import * as typeguards from "./typeguards";

const isNotificationObj = (n: UINotification | NotificationDetail): n is UINotification =>
  typeof n !== "string" && !(n instanceof Error) && !api.typeguards.isHttpError(n);

const isFieldNotification = (e: UINotification | NotificationDetail): e is Http.FieldError | UIFieldNotification =>
  (api.typeguards.isHttpError(e) && e.error_type === "field") || (isNotificationObj(e) && e.field !== undefined);

const isError = (n: InternalNotification | NotificationDetail): n is Error =>
  typeof n !== "string" && n instanceof Error;

export const uiNotificationMessage = (e: UINotification | NotificationDetail) => {
  return isNotificationObj(e)
    ? e.message
    : api.typeguards.isHttpError(e)
    ? api.standardizeError(e).message
    : isError(e)
    ? e.message
    : e;
};

type UINotifyAction = {
  readonly notifications: SingleOrArray<UINotification | Error | string>;
  readonly append?: boolean;
};

const UINotificationReducer = (state: UINotification[] = [], action: UINotifyAction | undefined): UINotification[] => {
  if (!isNil(action)) {
    const ns = Array.isArray(action.notifications) ? action.notifications : [];
    return reduce(
      ns,
      (curr: UINotification[], n: UINotification | NotificationDetail): UINotification[] => {
        if (typeguards.isNotificationDetail(n)) {
          return [
            ...curr,
            {
              message: uiNotificationMessage(n),
              level: isFieldNotification(n) ? "warning" : "error"
            }
          ];
        }
        return [...curr, n];
      },
      action.append === true ? state : []
    );
  } else {
    return [];
  }
};

type UseNotificationsConfig = {
  readonly handleFieldErrors?: (errors: UIFieldNotification[]) => void;
};

export const useNotifications = (config?: UseNotificationsConfig): UINotificationsHandler => {
  const [ns, dispatchNotification] = useReducer(UINotificationReducer, []);

  const clearNotifications = useMemo(() => () => dispatchNotification(undefined), []);

  const notify = useMemo(
    /* eslint-disable-next-line max-len */
    () => (notes: SingleOrArray<UINotification | Http.Error | Error | string>, opts?: UINotificationOptions) => {
      const notices = Array.isArray(notes) ? notes : [notes];
      /* For the notification sources that pertain to field type errors, either
			   allow the UI elemenet to render them next to the individual fields or
				 include them in the same scope as non-field errors. */
      const fieldRelatedErrors: (Http.FieldError | UIFieldNotification)[] = filter(notices, (n: UINotification) =>
        isFieldNotification(n)
      ) as (Http.FieldError | UIFieldNotification)[];
      const fieldHandler = config?.handleFieldErrors;
      if (!isNil(fieldHandler)) {
        fieldHandler(fieldRelatedErrors);
        /* Filter out the notifications that do not pertain to individual fields
				 of the form and dispatch them to the notifications store. */
        dispatchNotification({
          notifications: filter(notices, (n: UINotification) => !isFieldNotification(n)) as UINotification[],
          append: opts?.append
        });
      } else {
        dispatchNotification({
          notifications: notices,
          append: opts?.append
        });
      }
    },
    [config?.handleFieldErrors]
  );

  const handleRequestError = useMemo(
    () => (e: Error, opts?: UINotificationOptions) => {
      if (!axios.isCancel(e) && !(e instanceof api.ForceLogout)) {
        internal.requestError(e);
        if (e instanceof api.ClientError) {
          notify(e.errors, opts);
        } else if (e instanceof api.NetworkError) {
          notify("There was a problem communicating with the server.", opts);
        } else if (e instanceof api.ServerError) {
          notify("There was a problem communicating with the server.", opts);
        } else {
          throw e;
        }
      }
    },
    []
  );

  return {
    handleRequestError,
    notify,
    clearNotifications,
    notifications: ns
  };
};
