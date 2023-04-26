import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";

import * as Sentry from "@sentry/browser";
import { Store } from "redux";

import * as api from "application/api";
import * as errors from "application/errors";
import * as plugins from "application/plugins";
import { configureStore } from "application/store/configureStore";
import * as store from "application/store/types";
import { logger } from "internal";
import { type ApiModelType } from "lib/model/types";
import { type User } from "lib/model/user";
import * as parsers from "lib/util/parsers";

const TEMPORARY_HACK = true;

const validateAuthToken = async (
  forceReloadFromStripe: boolean,
): Promise<User | null | errors.HttpError> => {
  if (TEMPORARY_HACK) {
    return {
      first_name: "Nick",
      last_name: "Florin",
      id: 1,
      full_name: "Nick Florin",
      email: "nickmflorin@gmail.com",
      profile_image: null,
      is_first_time: false,
      last_login: "2020-01-01",
      date_joined: "2020-01-01",
      is_active: true,
      is_superuser: true,
      timezone: "",
      address: "",
      position: "",
      company: "",
      phone_number: 1924,
      product_id: "standard",
      billing_status: "active",
      is_staff: true,
      metrics: {
        num_archived_budgets: 1,
        num_budgets: 1,
        num_collaborating_budgets: 1,
        num_templates: 1,
      },
    };
  }
  const response = await api.validateAuthToken({ force_reload_from_stripe: forceReloadFromStripe });
  if (response.error) {
    /* If the token authentication fails because the user is not authenticated, return null so a
       redirect can occur. */
    if (
      errors.isApiGlobalError(response.error) &&
      response.error.code === errors.ApiErrorCodes.ACCOUNT_NOT_AUTHENTICATED
    ) {
      return null;
    }
    return response.error;
  }
  return response.response;
};

const validatePublicToken = async (
  token: string,
  id: number,
  type: ApiModelType,
): Promise<string | null | errors.HttpError> => {
  const response = await api.validatePublicToken({ token, instance: { id, type } });
  if (response.error) {
    /* If the token authentication fails because the user is not authenticated, return null so a
       redirect can occur. */
    if (
      errors.isApiGlobalError(response.error) &&
      response.error.code === errors.ApiErrorCodes.ACCOUNT_NOT_AUTHENTICATED
    ) {
      return null;
    }
    return response.error;
  }
  return response.response.token_id;
};

export type AuthenticatedStoreConfigProps = {
  readonly isPublic: false;
};

export type PublicStoreConfigProps = {
  readonly instanceType: ApiModelType;
  /* The instance ID associated with the public token can either be determined via the
     `instanceIdParam` that it is associated with in the URL PATH params or directly, via passing it
     in via the `instanceId` prop. */
  readonly instanceIdParam?: string;
  readonly instanceId?: number;
  // The token ID can be passed in directly, if we already have access to it.
  readonly publicTokenId?: string;
  readonly isPublic: true;
};

export type StoreConfigProps = AuthenticatedStoreConfigProps | PublicStoreConfigProps;

const handleUser = (user: User) => {
  Sentry.setUser({ email: user.email, id: String(user.id) });
  plugins.identify(user);
};

type RedirectPath = "/login" | "/404";

export const useStore = (
  props: StoreConfigProps,
): Store<store.ApplicationStore, store.Action> | null => {
  const [reduxStore, setReduxStore] = useState<Store<store.ApplicationStore, store.Action> | null>(
    null,
  );
  const router = useRouter();

  const propsInstanceId = (props as PublicStoreConfigProps).instanceId;
  const propsInstanceIdParam = (props as PublicStoreConfigProps).instanceIdParam;
  const propsInstanceType = (props as PublicStoreConfigProps).instanceType;
  const propsPublicTokenId = (props as PublicStoreConfigProps).publicTokenId;

  const handleAuthenticationError = useMemo(
    () => (e: errors.HttpError) => {
      /* At this point, the error is not expected because the not authenticated error was already
         caught and handled. */
      logger.requestError(
        e,
        "There was an error validating the user's authentication token.  The user will be " +
          "redirected to the login page.",
      );
      router.push("/login");
    },
    [router],
  );

  const handlePublicTokenError = useMemo(
    () => (e: errors.HttpError) => {
      /* At this point, the error is not expected because the not authenticated error was already
         caught and handled. */
      logger.requestError(
        e,
        "There was an error validating the public token.  The user will be redirected to " +
          "the login page.",
      );
      router.push("/login");
    },
    [router],
  );

  const setupUserStore = useMemo(
    () => async (forceReloadFromStripe: boolean, redirectOnSuccess?: RedirectPath) => {
      const user = await validateAuthToken(forceReloadFromStripe);
      if (user === null) {
        router.push("/login");
      } else if (user instanceof Error) {
        handleAuthenticationError(user);
      } else if (redirectOnSuccess !== undefined) {
        router.push(redirectOnSuccess);
      } else {
        const configuredStore = configureStore({ user, tokenId: null });
        handleUser(user);
        setReduxStore(configuredStore);
      }
    },
    [handleAuthenticationError, router],
  );

  const tokenId = useMemo<string | null>(
    () =>
      propsPublicTokenId ||
      (typeof router.query.tokenId === "string" ? router.query.tokenId : null),
    [propsPublicTokenId, router],
  );

  const instanceId = useMemo<number | null>(() => {
    const instanceId: number | null = propsInstanceId === undefined ? null : propsInstanceId;
    if (instanceId === null && typeof router.query.instanceId === "string") {
      return parsers.parseInteger(router.query.instanceId);
    }
    return instanceId;
  }, [propsInstanceId, router]);

  useEffect(() => {
    if (!props.isPublic) {
      setupUserStore(true);
    }
  }, [props.isPublic, setupUserStore]);

  useEffect(() => {
    if (props.isPublic) {
      if (propsInstanceId === undefined && propsInstanceIdParam === undefined) {
        throw new Error("Either the 'instanceId' or 'instanceIdParam' props must be provied.");
      } else if (tokenId === null || instanceId === null) {
        /* In the case that the user has an active session but visited an invalid public route, we
           want to redirect them to the 404 page, not the home page. */
        setupUserStore(false, "/404");
      } else {
        /* When configuring the store with a public configuration, the User is allowed to be null -
           but if the User is logged in, the User should be configured in the store even if we are
           configuring the store as public.

           This means we have to allow the auth token validation to fail and simply return a null
           user. */
        const promises: [
          Promise<string | null | errors.HttpError>,
          Promise<User | null | errors.HttpError>,
        ] = [validatePublicToken(tokenId, instanceId, propsInstanceType), validateAuthToken(true)];
        Promise.all(promises).then(
          ([privateToken, user]: [
            string | null | errors.HttpError,
            User | null | errors.HttpError,
          ]) => {
            const isDefinedValue = <T extends string | User>(
              value: T | null | errors.HttpError,
            ): value is T => value !== null && !(value instanceof Error);
            if (privateToken === null) {
              /* If the public token validation failed, but the user is logged in, we should treat
                   that as a 404 instead of redirecting them back to the home page. */
              if (isDefinedValue(user)) {
                router.push("/404");
              } else {
                if (user instanceof Error) {
                  handleAuthenticationError(user);
                }
                router.push("/login");
              }
            } else if (isDefinedValue(privateToken)) {
              if (isDefinedValue(user)) {
                const configuredStore = configureStore({ tokenId: privateToken, user });
                handleUser(user);
                setReduxStore(configuredStore);
              } else {
                if (user instanceof Error) {
                  handleAuthenticationError(user);
                }
                const configuredStore = configureStore({ tokenId: privateToken, user: null });
                setReduxStore(configuredStore);
              }
            } else {
              handlePublicTokenError(privateToken);
              if (user instanceof Error) {
                handleAuthenticationError(user);
              }
              router.push("/login");
            }
          },
        );
      }
    }
  }, [
    handleAuthenticationError,
    handlePublicTokenError,
    setupUserStore,
    router,
    props.isPublic,
    instanceId,
    tokenId,
    propsInstanceIdParam,
    propsInstanceType,
    propsInstanceId,
  ]);

  return reduxStore;
};
