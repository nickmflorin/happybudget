import React, { Suspense } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "style/index.scss";

import { SuspenseFallback } from "components/display";

const Landing = React.lazy(() => import("../scenes/Landing"));
const Application = React.lazy(() => import("../scenes/Application"));

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <ToastContainer />
      <div className={"root"}>
        <Suspense fallback={<SuspenseFallback />}>
          <Switch>
            <Route path={["/login", "/signup"]} component={Landing} />
            <Route path={["/"]} component={Application} />
          </Switch>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
