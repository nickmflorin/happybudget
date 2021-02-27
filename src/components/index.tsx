import React, { Suspense } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { QueryParamProvider } from "use-query-params";
import { CookiesProvider } from "react-cookie";
import { CssBaseline } from "@material-ui/core";
import "style/index.scss";

import { SuspenseFallback } from "components/display";

const Landing = React.lazy(() => import("./Landing"));
const Application = React.lazy(() => import("./Application"));

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <ToastContainer />
      <CssBaseline>
        <CookiesProvider>
          <QueryParamProvider ReactRouterRoute={Route}>
            <div className={"root"}>
              <Suspense fallback={<SuspenseFallback />}>
                <Switch>
                  <Route path={["/reset", "/signup", "/changepassword", "/login", "/register"]} component={Landing} />
                  <Route path={["/"]} component={Application} />
                </Switch>
              </Suspense>
            </div>
          </QueryParamProvider>
        </CookiesProvider>
      </CssBaseline>
    </BrowserRouter>
  );
}

export default App;
