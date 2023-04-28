import { redirect } from "next/navigation";

import * as api from "application/api";
import * as errors from "application/errors";
import { logger } from "internal";

export type AuthenticatedLayoutProps = {
  readonly children: JSX.Element;
};

const AuthenticatedLayout = async ({ children }: { children: React.ReactNode }) => {
  const response = await api.validateAuthToken();
  if (response.error) {
    if (
      errors.isApiGlobalError(response.error) &&
      response.error.code === errors.ApiErrorCodes.ACCOUNT_NOT_AUTHENTICATED
    ) {
      return redirect("/login");
    }
    logger.requestError(
      response.error,
      "There was an error validating the user's authentication token.  The user will be " +
        "redirected to the login page.",
    );
    return redirect("/login");
  }
  logger.warn({ user: response.response });
  return children;
};

export default AuthenticatedLayout;
