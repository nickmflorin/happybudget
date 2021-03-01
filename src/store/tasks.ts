import { toast } from "react-toastify";
import { ClientError, NetworkError } from "api";

/**
 * A utility method to be used from within sagas to provide common logic that
 * gets executed when an HTTP error is encountered.
 *
 * @param e        The Error that was caught during a request.
 * @param message  The default message to display.
 */
export const handleRequestError = (e: Error, message = "") => {
  // TODO: Improve this - this most likely can be it's own saga (maybe even at the
  // global application level) that dispatches error messages to a queue.
  if (e instanceof ClientError) {
    /* eslint-disable no-console */
    console.error(e);
    const outputMessage = message === "" ? "There was a problem with your request." : message;
    toast.error(outputMessage);
  } else if (e instanceof NetworkError) {
    toast.error("There was a problem communicating with the server.");
  } else {
    throw e;
  }
};
