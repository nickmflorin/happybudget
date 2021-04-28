import React, { Suspense } from "react";
import { Router, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { createBrowserHistory } from "history";
import "style/index.scss";

import { ApplicationSpinner } from "components";
import { ReduxRoute } from "components/routes";
import { componentLoader } from "lib/operational";

const Landing = React.lazy(() => componentLoader(() => import("./Landing")));
const Application = React.lazy(() => componentLoader(() => import("./Application")));

const history = createBrowserHistory();

let prevPath: string | null = null;

// Listen and notify Segment of client-side page updates.
history.listen(location => {
  if (location.pathname !== prevPath) {
    prevPath = location.pathname;
    window.analytics.page();
  }
});

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
