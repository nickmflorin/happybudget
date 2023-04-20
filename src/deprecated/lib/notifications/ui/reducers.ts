import { filter, includes } from "lodash";

import { AddNotificationsDetail, ClearNotificationsDetail } from "./base";
import { notificationsAreEqual } from "./util";

type AddNotificationsReducerDetail = Omit<AddNotificationsDetail<UINotification>, "opts"> & {
  // For the reducer, the behavior (append or replace) must be provided.
  readonly opts: Omit<UINotificationOptions, "behavior"> & {
    readonly behavior: UINotificationOptions["behavior"];
  };
};

const isAddNotificationsDetail = (
  action: AddNotificationsReducerDetail | ClearNotificationsDetail | undefined,
): action is AddNotificationsReducerDetail =>
  action !== undefined && (action as AddNotificationsReducerDetail).notifications !== undefined;

export const UINotificationReducer = (
  state: UINotification[] = [],
  action: AddNotificationsReducerDetail | ClearNotificationsDetail | undefined,
): UINotification[] => {
  if (isAddNotificationsDetail(action)) {
    let ns = Array.isArray(action.notifications) ? action.notifications : [];
    if (action.opts.behavior === "append") {
      if (action.opts.ignoreIfDuplicate === true) {
        // Only add the notification to state if it is not a duplicate.
        ns = filter(
          ns,
          (n: UINotification) =>
            filter(state, (nstate: UINotification) => notificationsAreEqual(nstate, n)).length ===
            0,
        );
      }
      return [...state, ...ns];
    } else {
      return ns;
    }
  } else {
    if (action === undefined) {
      return [];
    }
    const ids = Array.isArray(action) ? action : [action];
    return filter(state, (n: UINotification) => !includes(ids, n.id));
  }
};
