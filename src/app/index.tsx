import React, { Suspense } from "react";
import { Router, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import * as Sentry from "@sentry/react";
import { createBrowserHistory } from "history";
import "style/index.scss";

import { ApplicationSpinner } from "components";
import { ReduxRoute } from "components/routes";
import { componentLoader } from "lib/operational";

const Landing = React.lazy(() => componentLoader(() => import("./Landing")));
const Application = React.lazy(() => componentLoader(() => import("./Application")));

const history = createBrowserHistory();

let prevPath: string | null = null;

Sentry.init({
  dsn: "https://c27df092747b4aae964b2ff6f07c3497@o591585.ingest.sentry.io/5740401",
  environment: process.env.NODE_ENV
});

if (process.env.NODE_ENV !== "development") {
  // Listen and notify Segment of client-side page updates.
  history.listen(location => {
    if (location.pathname !== prevPath) {
      prevPath = location.pathname;
      window.analytics.page();
    }
  });
}

function App(): JSX.Element {
  return (
    <Router history={history}>
      <ToastContainer />
      <div className={"root"}>
        <div id={"application-spinner-container"}></div>
        <Suspense fallback={<ApplicationSpinner visible={true} />}>
          <Switch>
            <Route path={["/login", "/signup"]} component={Landing} />
            <ReduxRoute path={["/"]} component={Application} />
          </Switch>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
