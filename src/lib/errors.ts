import { isNil } from "lodash";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";

interface SilentFailProps {
  readonly error?: Error | string;
  readonly message?: string;
  readonly dispatchToSentry?: boolean;
  readonly notifyUser?: boolean;
}

export const silentFail = (params: SilentFailProps) => {
  const notifyUser = params.notifyUser === undefined ? true : params.notifyUser;
  const dispatchToSentry = params.dispatchToSentry === undefined ? true : params.dispatchToSentry;

  const dispatch = (error: Error | string) => {
    if (dispatchToSentry === true) {
      if (typeof error === "string") {
        Sentry.captureMessage(error);
      } else {
        Sentry.captureException(error);
      }
    }
  };

  const notify = (message: string) => {
    if (notifyUser === true) {
      toast.error(message);
    }
  };

  if (!isNil(params.error)) {
    /* eslint-disable no-console */
    console.error(params.error);
    if (typeof params.error === "string" || typeof params.message === "string") {
      notify(typeof params.message === "string" ? params.message : String(params.error));
    }
    dispatch(params.error);
  } else if (!isNil(params.message)) {
    console.error(params.message);
    notify(typeof params.message);
    dispatch(params.message);
  }
};
