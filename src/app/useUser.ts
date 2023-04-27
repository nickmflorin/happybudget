import { redirect } from "next/navigation";

import * as api from "application/api";
import * as errors from "application/errors";
import { logger } from "internal";
import { user } from "lib/model";

export type AuthenticatedLayoutProps = {
  readonly children: JSX.Element;
};

export const useUser = async (): Promise<user.User | null> => {
  const response = await api.validateAuthToken();
  console.log(response);
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
  return response.response;
};
