import React, { Suspense } from "react";
import { Router, Switch, Route } from "react-router-dom";
import { History } from "history";
import "style/index.scss";

import * as config from "config";

import { ApplicationSpinner } from "components";
import { ReduxRoute, NotFoundRoute, LandingRoute, ConfigRoute } from "components/routes";

const PublicApplication = config.lazyWithRetry(() => import("./PublicApplication"));
const Application = config.lazyWithRetry(() => import("./Application"));
const Landing = config.lazyWithRetry(() => import("./Landing"));
const EmailVerification = config.lazyWithRetry(() => import("./Landing/EmailVerification"));
const PasswordRecovery = config.lazyWithRetry(() => import("./Landing/PasswordRecovery"));

type AppProps = {
  readonly history: History;
};

const App = (props: AppProps): JSX.Element => (
  <Router history={props.history}>
    <div className={"root"}>
      <div id={"application-spinner-container"}></div>
      <Suspense fallback={<ApplicationSpinner visible={true} />}>
        <Switch>
          <ConfigRoute
            exact
            path={"/verify"}
            component={EmailVerification}
            enabled={config.env.EMAIL_ENABLED && config.env.EMAIL_VERIFICATION_ENABLED}
          />
          <ConfigRoute exact path={"/recovery"} component={PasswordRecovery} enabled={config.env.EMAIL_ENABLED} />
          <LandingRoute
            path={
              config.env.EMAIL_ENABLED
                ? ["/login", "/signup", "/reset-password", "/recover-password"]
                : ["/login", "/signup"]
            }
            component={Landing}
          />
          <Route path={"/pub/:tokenId"} component={PublicApplication} />
          <ReduxRoute config={{ isPublic: false }} path={["/"]} component={Application} />
          <NotFoundRoute auto={false} />
        </Switch>
      </Suspense>
    </div>
  </Router>
);

export default React.memo(App);
