import React, { ReactNode, useEffect, useState, useMemo } from "react";
import { Store } from "redux";
import { Provider } from "react-redux";
import { Redirect, useParams, useLocation } from "react-router-dom";
import { ConnectedRouter } from "connected-react-router";
import * as Sentry from "@sentry/browser";
import axios, { CancelToken } from "axios";
import { isNil } from "lodash";

import * as api from "api";
import { notifications, users } from "lib";
import { ApplicationSpinner, ConnectedApplicationSpinner } from "components";
import { configure, history } from "store";

type UrlParams = Record<string, string> & { tokenId: string };

const parseParam = (param: keyof UrlParams, params: UrlParams): string | null =>
  !isNil(params[param]) && params[param].trim() !== "" ? params[param].trim() : null;

const parseIdParam = (param: keyof UrlParams, params: UrlParams): number | null => {
  const v = parseParam(param, params);
  if (isNil(v) || isNaN(parseInt(v))) {
    return null;
  }
  return parseInt(v);
};

/* Wrap the validateAuthToken service such that failed token validation simply
   results in a null User. */
const validateAuthToken = (forceReloadFromStripe: boolean, cancelToken: CancelToken): Promise<Model.User | null> =>
  new Promise<Model.User | null>((resolve, reject) => {
    api
      .validateAuthToken({ force_reload_from_stripe: forceReloadFromStripe }, { cancelToken })
      .then((response: Model.User) => resolve(response))
      .catch((e: Error) => {
        if (e instanceof api.ClientError && !isNil(e.authenticationError)) {
          resolve(null);
        } else {
          reject(e);
        }
      });
  });

/* Wrap the validatePublicToken service such that failed token validation simply
   results in a null token ID. */
const validatePublicToken = (
  token: string,
  id: number,
  type: Model.HttpModelType,
  cancelToken: CancelToken
): Promise<string | null> =>
  new Promise<string | null>((resolve, reject) => {
    api
      .validatePublicToken({ token, instance: { id, type } }, { cancelToken })
      .then((response: { token_id: string }) => {
        resolve(response.token_id);
      })
      .catch((e: Error) => {
        if (e instanceof api.ClientError && !isNil(e.authenticationError)) {
          resolve(null);
        } else {
          reject(e);
        }
      });
  });

export type WrapInAuthenticatedStoreProps = {
  readonly isPublic: false;
};

export type WrapInPublicStoreProps = {
  readonly instanceType: Model.HttpModelType;
  /* The instance ID associated with the public token can either be determined
     via the `instanceIdParam` that it is associated with in the URL PATH params
     or directly, via passing it in via the `instanceId` prop. */
  readonly instanceIdParam?: string;
  readonly instanceId?: number;
  /* The token ID can be passed in directly, if we already have access to it. */
  readonly publicTokenId?: string;
  readonly isPublic: true;
};

export type WrapInStoreProps = WrapInPublicStoreProps | WrapInAuthenticatedStoreProps;

const propsArePublic = (props: WrapInStoreProps): props is WrapInPublicStoreProps =>
  (props as WrapInPublicStoreProps).isPublic === true;

const handleUser = (user: Model.User) => {
  Sentry.setUser({ email: user.email, id: String(user.id) });
  users.plugins.identify(user);
};

type RedirectPath = "/login" | "/404";

const WrapInStore = (props: WrapInStoreProps & { readonly children: ReactNode }): JSX.Element => {
  const [redirect, setRedirect] = useState<RedirectPath | null>(null);
  const [reduxStore, setReduxStore] = useState<Store<Application.Store, Redux.Action> | undefined>(undefined);
  const [newCancelToken] = api.useCancelToken();
  const urlParams = useParams<UrlParams>();

  /* There are cases, mostly login cases, where we do not need to revalidate
     the user because we already have access to the validated user before we
     redirect into the app */
  const location = useLocation<{ readonly validatedUser?: Model.User | undefined | null } | undefined>();

  const validatedUser = useMemo(() => location.state?.validatedUser || null, [location.state?.validatedUser]);

  const removeValidatedUser = useMemo(
    () => () => {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { state, ...statelessLocation } = location;
      history.replace(statelessLocation);
    },
    []
  );

  const handleError = useMemo(
    () => (e: Error) => {
      /* At this point, since we simply resolve with null values in the case
         that the token validation was not successful, any other error (outside
         of a cancelled request) is unexpected. */
      if (!axios.isCancel(e)) {
        notifications.requestError(e);
      }
      setRedirect("/login");
    },
    []
  );

  const setupUserStore = useMemo(
    () => (forceReloadFromStripe: boolean, cancelToken?: CancelToken, redirectOnSuccess?: RedirectPath) => {
      if (validatedUser === null) {
        validateAuthToken(forceReloadFromStripe, cancelToken || newCancelToken())
          .then((user: Model.User | null) => {
            if (user !== null) {
              if (!isNil(redirectOnSuccess)) {
                setRedirect(redirectOnSuccess);
              } else {
                const store = configure({ user, tokenId: null });
                handleUser(user);
                setReduxStore(store);
              }
            } else {
              setRedirect("/login");
            }
          })
          .catch(handleError);
      } else {
        const store = configure({ user: validatedUser, tokenId: null });
        handleUser(validatedUser);
        setReduxStore(store);
        removeValidatedUser();
      }
    },
    [handleError, validatedUser]
  );

  useEffect(() => {
    if (!propsArePublic(props)) {
      setupUserStore(true);
    }
  }, [props.isPublic]);

  useEffect(() => {
    if (propsArePublic(props)) {
      const cancelToken = newCancelToken();
      const tokenId = props.publicTokenId || parseParam("tokenId", urlParams);
      if (isNil(props.instanceIdParam) && isNil(props.instanceId)) {
        throw new Error("Either the 'instanceId' or 'instanceIdParam' props must be provied.");
      }
      const instanceId = props.instanceId || parseIdParam(props.instanceIdParam as string, urlParams);

      if (isNil(tokenId) || isNil(instanceId)) {
        /* In the case that the user has an active session but visited an invalid
           public route, we want to redirect them to the 404 page, not the home
           page. */
        setupUserStore(false, cancelToken, "/404");
      } else {
        /* When configuring the store with a public configuration, the User is
					 allowed to be null - but if the User is logged in, the User should be
					 configured in the store even if we are configuring the store as public.
					 This means we have to allow the auth token validation to fail and
					 simply return a null user.
					 */
        const promises: [Promise<string | null>, Promise<Model.User | null>] = [
          validatePublicToken(tokenId, instanceId, props.instanceType, cancelToken),
          validateAuthToken(true, cancelToken)
        ];
        Promise.all(promises)
          .then(([privateToken, user]: [string | null, Model.User | null]) => {
            if (privateToken !== null) {
              const store = configure({ tokenId: privateToken, user });
              if (user !== null) {
                handleUser(user);
              }
              setReduxStore(store);
              /* If the public token validation failed, but the user is logged
                 in, we should treat that as a 404 instead of redirecting them
								 back to the home page. */
            } else if (user !== null) {
              setRedirect("/404");
            } else {
              setRedirect("/login");
            }
          })
          .catch(handleError);
      }
    }
  }, [
    props.isPublic,
    (props as WrapInPublicStoreProps).instanceId,
    (props as WrapInPublicStoreProps).instanceIdParam,
    (props as WrapInPublicStoreProps).instanceType,
    (props as WrapInPublicStoreProps).publicTokenId
  ]);

  if (redirect !== null) {
    return <Redirect to={redirect} />;
  } else if (isNil(reduxStore)) {
    return <ApplicationSpinner visible={true} />;
  } else {
    return (
      <Provider store={reduxStore}>
        <React.Fragment>
          <ConnectedApplicationSpinner />
          <ConnectedRouter history={history}>{props.children}</ConnectedRouter>
        </React.Fragment>
      </Provider>
    );
  }
};

export default React.memo(WrapInStore);
