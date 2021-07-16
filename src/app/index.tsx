import { Suspense } from "react";
import { Router, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { createBrowserHistory } from "history";
import "style/index.scss";

import { ApplicationSpinner } from "components";
import { ReduxRoute } from "components/routes";
import { lazyWithRetry } from "lib/operational";

const Landing = lazyWithRetry(() => import("./Landing"));
const Application = lazyWithRetry(() => import("./Application"));

const history = createBrowserHistory();

let prevPath: string | null = null;

if (process.env.NODE_ENV !== "development") {
  Sentry.init({
    dsn: "https://c27df092747b4aae964b2ff6f07c3497@o591585.ingest.sentry.io/5740401",
    environment: process.env.NODE_ENV,
    // By default Sentry SDKs normalize any context to a depth of 3, which in the case of sending
    // Redux state you probably will want to increase that.
    normalizeDepth: 10,
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV5Instrumentation(history)
      })
    ],
    tracesSampleRate: 1.0
  });
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
