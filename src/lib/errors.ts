import { isNil } from "lodash";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";

interface SilentFailProps {
  readonly error?: Error | string | object;
  readonly message?: string;
  readonly dispatchToSentry?: boolean;
  readonly notifyUser?: boolean;
}

export const silentFail = (params: SilentFailProps) => {
  const notifyUser = params.notifyUser === undefined ? true : params.notifyUser;
  const dispatchToSentry = params.dispatchToSentry === undefined ? true : params.dispatchToSentry;

  const errorToString = (e: Error | string | object) => {
    return e instanceof Error ? String(e) : typeof e === "string" ? e : JSON.stringify(e);
  };

  const dispatch = (error: Error | string | object) => {
    if (dispatchToSentry === true && process.env.NODE_ENV === "production") {
      error instanceof Error ? Sentry.captureException(error) : Sentry.captureMessage(errorToString(error));
    }
  };

  const notify = (message: string) => {
    if (notifyUser === true) {
      toast.error(message);
    }
  };

  if (!isNil(params.error)) {
    /* eslint-disable-next-line no-console */
    console.warn(params.error);
    if (typeof params.error === "string" || typeof params.message === "string") {
      notify(typeof params.message === "string" ? params.message : errorToString(params.error));
    }
    dispatch(params.error);
  } else if (!isNil(params.message)) {
    /* eslint-disable-next-line no-console */
    console.error(params.message);
    notify(params.message);
    dispatch(params.message);
  }
};
