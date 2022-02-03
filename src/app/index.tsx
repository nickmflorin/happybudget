import React, { Suspense } from "react";
import { Router, Switch, Route } from "react-router-dom";
import { History } from "history";
import "style/index.scss";

import { ApplicationSpinner } from "components";
import { ReduxRoute, NotFoundRoute } from "components/routes";

import * as config from "config";

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
          <Route exact path={"/verify"} component={EmailVerification} />
          <Route exact path={"/recovery"} component={PasswordRecovery} />
          <Route path={["/login", "/signup", "/reset-password", "/recover-password"]} component={Landing} />
          <Route path={"/pub/:tokenId"} component={PublicApplication} />
          <ReduxRoute config={{ isPublic: false }} path={["/"]} component={Application} />
          <NotFoundRoute auto={false} />
        </Switch>
      </Suspense>
    </div>
  </Router>
);

export default React.memo(App);
