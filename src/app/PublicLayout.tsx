import { redirect } from "next/navigation";

import * as api from "application/api";
import * as errors from "application/errors";
import { logger } from "internal";

export type PublicLayoutProps = {
  readonly children: JSX.Element;
};

export const PublicLayout = async ({ children }: PublicLayoutProps): Promise<JSX.Element> => {
  const response = await api.validateAuthToken();
  if (response.error) {
    if (
      errors.isApiGlobalError(response.error) &&
      response.error.code === errors.ApiErrorCodes.ACCOUNT_NOT_AUTHENTICATED
    ) {
      return children;
    }
    logger.requestError(
      response.error,
      "There was an error validating the user's authentication token.  The user will not be " +
        "redirected into the application.",
    );
    return children;
  }
  /* TODO: Plugins identification process.
     TODO: Sentry identification of user. */
  return redirect("/dashboard");
};
