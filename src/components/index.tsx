import React, { Suspense } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "style/index.scss";

import { SuspenseFallback } from "components/display";

const Landing = React.lazy(() => import("./Landing"));
const Application = React.lazy(() => import("./Application"));

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <div className={"root"}>
        <Suspense fallback={<SuspenseFallback />}>
          <Switch>
            <Route path={["/reset", "/signup", "/changepassword", "/login", "/register"]} component={Landing} />
            <Route path={["/"]} component={Application} />
          </Switch>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
