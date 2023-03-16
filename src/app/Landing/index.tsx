import React from "react";

import { Switch, Route } from "react-router-dom";

import * as config from "config";
import { Icon } from "components";
import { ConfigRoute } from "components/routes";
import { Logo } from "components/svgs";

const Login = config.lazyWithRetry(() => import("./Login"));
const Signup = config.lazyWithRetry(() => import("./Signup"));
const ResetPassword = config.lazyWithRetry(() => import("./ResetPassword"));
const RecoverPassword = config.lazyWithRetry(() => import("./RecoverPassword"));

const Landing = (): JSX.Element => (
  <div className="landing-page">
    <div className="landing-page-left">
      <div className="logo-container">
        <Logo color="green" />
      </div>
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={Signup} />
        <ConfigRoute
          exact
          path="/reset-password"
          component={ResetPassword}
          enabled={config.env.EMAIL_ENABLED}
        />
        <ConfigRoute
          exact
          path="/recover-password"
          component={RecoverPassword}
          enabled={config.env.EMAIL_ENABLED}
        />
      </Switch>
      <div className="copyright">
        <div className="icon-wrapper">
          <Icon icon="copyright" weight="regular" />
        </div>
        <div className="copyright-text">2022 Nick Florin</div>
      </div>
    </div>
    <div className="landing-page-right">
      <div className="logo-container">
        <Logo color="white" />
      </div>
    </div>
  </div>
);

export default React.memo(Landing);
