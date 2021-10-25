import { Route } from "react-router-dom";

import { NotFoundRedirectSwitch } from "components/routes";
import { Logo } from "components/svgs";
import * as config from "config";

import "./index.scss";

const Login = config.lazyWithRetry(() => import("./Login"));
const Signup = config.lazyWithRetry(() => import("./Signup"));
const ResetPassword = config.lazyWithRetry(() => import("./ResetPassword"));
const RecoverPassword = config.lazyWithRetry(() => import("./RecoverPassword"));

const Landing = (): JSX.Element => {
  return (
    <div className={"landing-page"}>
      <div className={"landing-page-left"}>
        <div className={"logo-container"}>
          <Logo color={"green"} />
        </div>
        <NotFoundRedirectSwitch>
          <Route exact path={"/login"} component={Login} />
          <Route exact path={"/signup"} component={Signup} />
          <Route exact path={"/reset-password"} component={ResetPassword} />
          <Route exact path={"/recover-password"} component={RecoverPassword} />
        </NotFoundRedirectSwitch>
      </div>
      <div className={"landing-page-right"}>
        <div className={"logo-container"}>
          <Logo color={"white"} />
        </div>
      </div>
    </div>
  );
};

export default Landing;
