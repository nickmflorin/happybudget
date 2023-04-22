import { useRouter } from "next/router";
import React, { ReactNode, useEffect, useState, useMemo } from "react";

import * as Sentry from "@sentry/browser";
import { Provider } from "react-redux";
import { Store } from "redux";

import { api, store, plugins, errors } from "application";
import { logger } from "internal";
import { model, parsers } from "lib";
import { ScreenLoading, ConnectedAppLoading } from "components/loading";

const validateAuthToken = async (
  forceReloadFromStripe: boolean,
): Promise<model.User | null | errors.HttpError> => {
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
  type: model.ApiModelType,
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
  readonly instanceType: model.ApiModelType;
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

const propsArePublic = (props: StoreConfigProps): props is PublicStoreConfigProps =>
  (props as PublicStoreConfigProps).isPublic === true;

const handleUser = (user: model.User) => {
  Sentry.setUser({ email: user.email, id: String(user.id) });
  plugins.identify(user);
};

type RedirectPath = "/login" | "/404";

const _StoreConfig = (props: StoreConfigProps & { readonly children: ReactNode }): JSX.Element => {
  const [reduxStore, setReduxStore] = useState<
    Store<store.ApplicationStore, store.Action> | undefined
  >(undefined);
  const router = useRouter();

  const instanceId = (props as PublicStoreConfigProps).instanceId;
  const instanceIdParam = (props as PublicStoreConfigProps).instanceIdParam;
  const instanceType = (props as PublicStoreConfigProps).instanceType;
  const publicTokenId = (props as PublicStoreConfigProps).publicTokenId;

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
        const configuredStore = store.configureStore({ user, tokenId: null });
        handleUser(user);
        setReduxStore(configuredStore);
      }
    },
    [handleAuthenticationError, router],
  );

  useEffect(() => {
    if (!propsArePublic(props)) {
      setupUserStore(true);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- The typeguard only needs the 'isPublic' property. */
  }, [props.isPublic, setupUserStore]);

  useEffect(() => {
    if (propsArePublic(props)) {
      if (props.instanceIdParam === undefined && props.instanceId === undefined) {
        throw new Error("Either the 'instanceId' or 'instanceIdParam' props must be provied.");
      }
      const tokenId =
        props.publicTokenId ||
        (typeof router.query.tokenId === "string" ? router.query.tokenId : undefined);
      let instanceId: number | null = props.instanceId === undefined ? null : props.instanceId;
      if (instanceId === null && typeof router.query.instanceId === "string") {
        instanceId = parsers.parseInteger(router.query.instanceId);
      }
      if (tokenId === undefined || instanceId === null) {
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
          Promise<model.User | null | errors.HttpError>,
        ] = [validatePublicToken(tokenId, instanceId, props.instanceType), validateAuthToken(true)];
        Promise.all(promises).then(
          ([privateToken, user]: [
            string | null | errors.HttpError,
            model.User | null | errors.HttpError,
          ]) => {
            const isDefinedValue = <T extends string | model.User>(
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
                const configuredStore = store.configureStore({ tokenId: privateToken, user });
                handleUser(user);
                setReduxStore(configuredStore);
              } else {
                if (user instanceof Error) {
                  handleAuthenticationError(user);
                }
                const configuredStore = store.configureStore({ tokenId: privateToken, user: null });
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
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- The typeguard only needs the 'isPublic' property. */
  }, [
    handleAuthenticationError,
    handlePublicTokenError,
    router,
    props.isPublic,
    setupUserStore,
    props.isPublic,
    instanceId,
    instanceIdParam,
    instanceType,
    publicTokenId,
  ]);

  if (reduxStore === undefined) {
    return <ScreenLoading />;
  } else {
    return (
      <Provider store={reduxStore}>
        <React.Fragment>
          <ConnectedAppLoading />
          {props.children}
        </React.Fragment>
      </Provider>
    );
  }
};

export const StoreConfig = React.memo(_StoreConfig);
