import { Route, Switch } from "react-router-dom";

import { Logo } from "components/svgs";
import * as config from "config";

import "./Landing.scss";

const Login = config.lazyWithRetry(() => import("./Login"));
const Signup = config.lazyWithRetry(() => import("./Signup"));

const Landing = (): JSX.Element => {
  return (
    <div className={"landing-page"}>
      <div className={"landing-page-left"}>
        <Switch>
          <Route exact path={"/login"} component={Login} />
          <Route exact path={"/signup"} component={Signup} />
        </Switch>
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
