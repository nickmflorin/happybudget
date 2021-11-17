import { Suspense } from "react";
import { Router, Switch, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { History } from "history";
import "style/index.scss";

import { ApplicationSpinner } from "components";
import { AuthenticatedReduxRoute, UnauthenticatedReduxRoute } from "components/routes";

import * as config from "config";

const Landing = config.lazyWithRetry(() => import("./Landing"));
const Application = config.lazyWithRetry(() => import("./Application"));
const EmailVerification = config.lazyWithRetry(() => import("./Landing/EmailVerification"));
const PasswordRecovery = config.lazyWithRetry(() => import("./Landing/PasswordRecovery"));

interface AppProps {
  readonly history: History;
}

function App(props: AppProps): JSX.Element {
  return (
    <Router history={props.history}>
      <ToastContainer />
      <div className={"root"}>
        <div id={"application-spinner-container"}></div>
        <Suspense fallback={<ApplicationSpinner visible={true} />}>
          <Switch>
            <Route exact path={"/verify"} component={EmailVerification} />
            <Route exact path={"/recovery"} component={PasswordRecovery} />
            <UnauthenticatedReduxRoute
              path={["/login", "/signup", "/reset-password", "/recover-password"]}
              component={Landing}
            />
            <AuthenticatedReduxRoute path={["/"]} component={Application} />
          </Switch>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
